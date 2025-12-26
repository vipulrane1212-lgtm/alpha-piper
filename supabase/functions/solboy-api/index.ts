import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_BASE_URL = Deno.env.get('SOLBOY_API_URL') || 'http://localhost:5000';
const SOLANATRACKER_API_KEY = Deno.env.get('SOLANATRACKER_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create Supabase client with service role for cache operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Format mcap number to readable string
function formatMcap(mcap: number): string {
  if (mcap >= 1_000_000) {
    return `$${(mcap / 1_000_000).toFixed(2)}M`;
  } else if (mcap >= 1_000) {
    return `$${(mcap / 1_000).toFixed(1)}K`;
  } else {
    return `$${mcap.toFixed(0)}`;
  }
}

// Parse mcap string back to number (e.g., "$143.5K" -> 143500)
function parseMcap(str: string): number | null {
  if (!str || str === 'N/A') return null;
  const match = str.match(/\$?([\d.]+)([KMB]?)/i);
  if (!match) return null;
  let value = parseFloat(match[1]);
  const suffix = match[2].toUpperCase();
  if (suffix === 'K') value *= 1000;
  else if (suffix === 'M') value *= 1000000;
  else if (suffix === 'B') value *= 1000000000;
  return value;
}

// Check cache for ATH data (repurposed peak_cache table)
async function getCachedATHData(contract: string): Promise<{ ath_mcap: string; ath_x: string } | null> {
  try {
    const { data, error } = await supabase
      .from('peak_cache')
      .select('peak_mcap, peak_x')
      .eq('contract', contract)
      .maybeSingle();
    
    if (error || !data) return null;
    
    return {
      ath_mcap: data.peak_mcap ? formatMcap(Number(data.peak_mcap)) : 'N/A',
      ath_x: data.peak_x || '—',
    };
  } catch {
    return null;
  }
}

// Save ATH data to cache
async function cacheATHData(contract: string, entryMcap: number, athMcap: number, athX: string, alertTimestamp: string): Promise<void> {
  try {
    await supabase
      .from('peak_cache')
      .upsert({
        contract,
        entry_mcap: entryMcap,
        peak_mcap: athMcap,
        peak_x: athX,
        alert_timestamp: alertTimestamp,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'contract' });
  } catch (error) {
    console.log(`[Cache] Failed to save ATH for ${contract.substring(0, 8)}:`, error);
  }
}

// Fetch ATH (All-Time High) from Solana Tracker
async function fetchATH(contract: string, entryMcapNum: number): Promise<{ ath_mcap: string; ath_x: string; raw_ath: number } | null> {
  if (!SOLANATRACKER_API_KEY) {
    console.log('[SolanaTracker] No API key configured');
    return null;
  }

  try {
    const url = `https://data.solanatracker.io/tokens/${contract}/ath`;
    
    console.log(`[SolanaTracker] Fetching ATH for ${contract.substring(0, 8)}...`);
    
    const response = await fetch(url, {
      headers: {
        'x-api-key': SOLANATRACKER_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`[SolanaTracker] ATH failed for ${contract.substring(0, 8)}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const athMcap = data.highest_market_cap;
    
    if (!athMcap || athMcap === 0) {
      console.log(`[SolanaTracker] No ATH data for ${contract.substring(0, 8)}`);
      return null;
    }

    // Calculate multiplier (ATH / entry)
    const multiplier = entryMcapNum > 0 ? athMcap / entryMcapNum : 0;
    const athX = multiplier >= 1 ? `${multiplier.toFixed(1)}x` : `${multiplier.toFixed(2)}x`;
    
    console.log(`[SolanaTracker] ${contract.substring(0, 8)}: ATH=${formatMcap(athMcap)}, entry=${formatMcap(entryMcapNum)}, multiplier=${athX}`);

    return {
      ath_mcap: formatMcap(athMcap),
      ath_x: athX,
      raw_ath: athMcap,
    };
  } catch (error) {
    console.log(`[SolanaTracker] ATH error for ${contract.substring(0, 8)}:`, error);
    return null;
  }
}

// Fetch token risk data from Solana Tracker
async function fetchTokenRisk(contract: string): Promise<{ risk_score: number; risk_level: string; top10_holders: number } | null> {
  if (!SOLANATRACKER_API_KEY) {
    return null;
  }

  try {
    const url = `https://data.solanatracker.io/tokens/${contract}`;
    
    const response = await fetch(url, {
      headers: {
        'x-api-key': SOLANATRACKER_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const risk = data.risk;
    
    if (!risk) {
      return null;
    }

    // Calculate risk score (0-10) based on risk factors
    let riskScore = 0;
    if (risk.freezeAuthority) riskScore += 3;
    if (risk.mintAuthority) riskScore += 2;
    if (risk.rugged) riskScore += 5;
    
    // Adjust based on known factors
    const sniperPercent = risk.sniperCount ? Math.min(risk.sniperCount / 10, 2) : 0;
    const insiderPercent = risk.insiderPercentage ? Math.min(risk.insiderPercentage / 20, 2) : 0;
    riskScore += sniperPercent + insiderPercent;
    
    riskScore = Math.min(Math.round(riskScore), 10);
    
    // Determine risk level
    let riskLevel = 'low';
    if (riskScore >= 7) riskLevel = 'high';
    else if (riskScore >= 4) riskLevel = 'medium';

    // Get top 10 holder concentration
    const top10Holders = data.top10HoldingPercent || 0;

    console.log(`[SolanaTracker] ${contract.substring(0, 8)}: risk=${riskScore} (${riskLevel}), top10=${top10Holders}%`);

    return {
      risk_score: riskScore,
      risk_level: riskLevel,
      top10_holders: Math.round(top10Holders),
    };
  } catch (error) {
    console.log(`[SolanaTracker] Risk error for ${contract.substring(0, 8)}:`, error);
    return null;
  }
}

// Enrich alerts with ATH and Risk data
async function enrichWithSolanaTracker(alerts: any[]): Promise<any[]> {
  const DELAY_MS = 400; // Delay between API requests
  const enrichedAlerts: any[] = [];

  for (let i = 0; i < alerts.length; i++) {
    const alert = alerts[i];
    const entryMcapNum = alert.currentMcap || parseMcap(alert.entry_mcap) || 0;
    
    let athData = { ath_mcap: 'N/A', ath_x: '—' };
    let riskData = { risk_score: 0, risk_level: 'unknown', top10_holders: 0 };

    if (entryMcapNum > 0) {
      // Check cache first for ATH
      const cached = await getCachedATHData(alert.contract);
      if (cached) {
        console.log(`[Cache] ATH hit for ${alert.contract.substring(0, 8)}`);
        athData = cached;
      } else {
        // Fetch ATH from API
        const fetchedATH = await fetchATH(alert.contract, entryMcapNum);
        if (fetchedATH) {
          athData = { ath_mcap: fetchedATH.ath_mcap, ath_x: fetchedATH.ath_x };
          // Cache the result
          await cacheATHData(alert.contract, entryMcapNum, fetchedATH.raw_ath, fetchedATH.ath_x, alert.timestamp);
        }
        // Add delay between API requests
        if (i < alerts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
        }
      }
    }

    // Fetch risk data (not cached, relatively quick)
    const fetchedRisk = await fetchTokenRisk(alert.contract);
    if (fetchedRisk) {
      riskData = fetchedRisk;
    }
    
    // Add delay after risk fetch
    if (i < alerts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }

    enrichedAlerts.push({
      ...alert,
      ath_mcap: athData.ath_mcap,
      ath_x: athData.ath_x,
      risk_score: riskData.risk_score,
      risk_level: riskData.risk_level,
      top10_holders: riskData.top10_holders,
    });
  }

  return enrichedAlerts;
}

// Backfill endpoint - processes a few alerts at a time (for ATH data)
async function handleBackfill(limit: number = 5): Promise<{ processed: number; updated: number; errors: number }> {
  console.log(`[Backfill] Starting backfill for ${limit} alerts`);
  
  // Fetch alerts from the API
  const response = await fetch(`${API_BASE_URL}/api/alerts/recent?limit=100`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch alerts for backfill');
  }

  const data = await response.json();
  const alerts = data.alerts || [];
  
  // Filter alerts that don't have cached ATH data
  const uncachedAlerts: any[] = [];
  for (const alert of alerts) {
    const cached = await getCachedATHData(alert.contract);
    if (!cached) {
      uncachedAlerts.push(alert);
    }
    if (uncachedAlerts.length >= limit) break;
  }

  console.log(`[Backfill] Found ${uncachedAlerts.length} uncached alerts to process`);

  let updated = 0;
  let errors = 0;
  const DELAY_MS = 1000; // 1 second between requests for backfill

  for (let i = 0; i < uncachedAlerts.length; i++) {
    const alert = uncachedAlerts[i];
    const entryMcapNum = alert.currentMcap || parseMcap(alert.market_cap) || 0;
    
    if (entryMcapNum === 0) {
      errors++;
      continue;
    }

    const athData = await fetchATH(alert.contract, entryMcapNum);
    
    if (athData) {
      await cacheATHData(alert.contract, entryMcapNum, athData.raw_ath, athData.ath_x, alert.timestamp);
      updated++;
      console.log(`[Backfill] Updated ${alert.token} (${alert.contract.substring(0, 8)}): ATH ${athData.ath_x}`);
    } else {
      errors++;
    }

    // Delay between requests
    if (i < uncachedAlerts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  return { processed: uncachedAlerts.length, updated, errors };
}

async function enrichWithDexScreener(alerts: any[]): Promise<any[]> {
  const enrichedAlerts = await Promise.all(
    alerts.map(async (alert) => {
      const entryMcap = alert.currentMcap ? formatMcap(alert.currentMcap) : 'N/A';
      
      try {
        const dexRes = await fetch(
          `https://api.dexscreener.com/tokens/v1/solana/${alert.contract}`,
          { headers: { 'Accept': 'application/json' } }
        );
        
        if (!dexRes.ok) {
          return { ...alert, entry_mcap: entryMcap, market_cap: 'N/A' };
        }
        
        const dexData = await dexRes.json();
        const pairs = Array.isArray(dexData) ? dexData : dexData.pairs;
        const pair = pairs?.[0];
        
        if (pair?.marketCap) {
          return { ...alert, entry_mcap: entryMcap, market_cap: formatMcap(pair.marketCap) };
        }
        
        return { ...alert, entry_mcap: entryMcap, market_cap: 'N/A' };
      } catch {
        return { ...alert, entry_mcap: entryMcap, market_cap: 'N/A' };
      }
    })
  );
  
  return enrichedAlerts;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    
    console.log(`[solboy-api] Request for endpoint: ${endpoint}`);

    // Handle backfill endpoint
    if (endpoint === 'backfill') {
      const limit = parseInt(url.searchParams.get('limit') || '5');
      const result = await handleBackfill(limit);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[solboy-api] Using API base: ${API_BASE_URL}`);

    let apiUrl: string;
    
    switch (endpoint) {
      case 'stats':
        apiUrl = `${API_BASE_URL}/api/stats`;
        break;
      case 'alerts':
        const limit = url.searchParams.get('limit') || '20';
        const tier = url.searchParams.get('tier');
        apiUrl = `${API_BASE_URL}/api/alerts/recent?limit=${limit}`;
        if (tier) apiUrl += `&tier=${tier}`;
        break;
      case 'daily':
        const days = url.searchParams.get('days') || '7';
        apiUrl = `${API_BASE_URL}/api/alerts/stats/daily?days=${days}`;
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    console.log(`[solboy-api] Fetching: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.warn(`[solboy-api] API unavailable (${response.status}), returning empty data`);
      
      if (endpoint === 'stats') {
        return new Response(JSON.stringify({
          totalSubscribers: 0, totalAlerts: 0, tier1Alerts: 0, tier2Alerts: 0, tier3Alerts: 0,
          winRate: 0, lastUpdated: new Date().toISOString(), apiOffline: true
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      
      if (endpoint === 'alerts') {
        return new Response(JSON.stringify({ alerts: [], apiOffline: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ data: [], apiOffline: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let data = await response.json();
    
    if (endpoint === 'alerts' && data.alerts && Array.isArray(data.alerts)) {
      console.log(`[solboy-api] Enriching ${data.alerts.length} alerts`);
      data.alerts = await enrichWithDexScreener(data.alerts);
      
      if (SOLANATRACKER_API_KEY) {
        data.alerts = await enrichWithSolanaTracker(data.alerts);
      }
    }
    
    console.log(`[solboy-api] Success, returning data`);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('[solboy-api] API connection error:', errorMessage);
    
    return new Response(JSON.stringify({ alerts: [], apiOffline: true, error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
