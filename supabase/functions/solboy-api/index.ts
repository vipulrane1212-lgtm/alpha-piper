import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_BASE_URL = Deno.env.get('SOLBOY_API_URL') || 'http://localhost:5000';
const SOLANATRACKER_API_KEY = Deno.env.get('SOLANATRACKER_API_KEY');
const HELIUS_API_KEY = Deno.env.get('HELIUS_API_KEY');
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

// Fetch top 10 holder concentration using Helius DAS getTokenAccounts
async function fetchTop10HoldersHelius(contract: string): Promise<number | null> {
  if (!HELIUS_API_KEY) return null;

  try {
    const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    
    // Use DAS getTokenAccounts which works better for new tokens
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '1',
        method: 'getTokenAccounts',
        params: {
          mint: contract,
          limit: 100, // Get top 100 holders
        },
      }),
    });

    if (!response.ok) {
      console.log(`[Helius] getTokenAccounts failed for ${contract.substring(0, 8)}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Check for RPC errors
    if (data.error) {
      console.log(`[Helius] RPC error for ${contract.substring(0, 8)}: ${JSON.stringify(data.error)}`);
      return null;
    }

    const tokenAccounts = data?.result?.token_accounts;

    if (!tokenAccounts || !Array.isArray(tokenAccounts) || tokenAccounts.length === 0) {
      console.log(`[Helius] No token accounts for ${contract.substring(0, 8)} (result: ${JSON.stringify(data?.result || {}).substring(0, 100)})`);
      return null;
    }

    // Sort by amount descending
    const sorted = [...tokenAccounts].sort((a, b) => (b.amount || 0) - (a.amount || 0));

    // Calculate total supply from all accounts
    let totalSupply = 0;
    for (const acc of sorted) {
      totalSupply += acc.amount || 0;
    }

    if (totalSupply === 0) {
      console.log(`[Helius] Zero total supply for ${contract.substring(0, 8)}`);
      return null;
    }

    // Calculate top 10 concentration
    const top10 = sorted.slice(0, 10);
    let top10Amount = 0;
    for (const acc of top10) {
      top10Amount += acc.amount || 0;
    }

    const top10Percent = (top10Amount / totalSupply) * 100;
    console.log(`[Helius] ${contract.substring(0, 8)}: top10=${top10Percent.toFixed(1)}% (${sorted.length} holders)`);

    return Math.round(top10Percent);
  } catch (error) {
    console.log(`[Helius] Error for ${contract.substring(0, 8)}:`, error);
    return null;
  }
}

// Fetch token risk data from Solana Tracker (risk score only, no holder data)
async function fetchTokenRiskSolanaTracker(contract: string): Promise<{ risk_score: number; risk_level: string } | null> {
  if (!SOLANATRACKER_API_KEY) return null;

  try {
    const url = `https://data.solanatracker.io/tokens/${contract}`;

    const response = await fetch(url, {
      headers: {
        'x-api-key': SOLANATRACKER_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.log(`[SolanaTracker] Risk rate-limited for ${contract.substring(0, 8)} (429)`);
      } else {
        console.log(`[SolanaTracker] Risk failed for ${contract.substring(0, 8)}: ${response.status}`);
      }
      return null;
    }

    const data = await response.json();

    // --- Risk score/level
    const apiScoreRaw = data?.risk?.score ?? data?.risk_score ?? data?.risk?.risk_score;
    const apiScore = typeof apiScoreRaw === 'number' ? apiScoreRaw : Number(apiScoreRaw);

    let riskScore: number;
    let riskLevel: string;

    if (Number.isFinite(apiScore)) {
      riskScore = Math.max(0, Math.min(10, Math.round(apiScore)));
    } else if (data?.risk) {
      const risk = data.risk;
      let score = 0;
      if (risk.freezeAuthority) score += 3;
      if (risk.mintAuthority) score += 2;
      if (risk.rugged) score += 5;
      const sniperAdj = risk.sniperCount ? Math.min(risk.sniperCount / 10, 2) : 0;
      const insiderAdj = risk.insiderPercentage ? Math.min(risk.insiderPercentage / 20, 2) : 0;
      score += sniperAdj + insiderAdj;
      riskScore = Math.min(Math.round(score), 10);
    } else {
      return null;
    }

    riskLevel = data?.risk?.level ?? data?.risk_level ?? '';
    if (!riskLevel) {
      if (riskScore >= 7) riskLevel = 'high';
      else if (riskScore >= 4) riskLevel = 'medium';
      else riskLevel = 'low';
    }

    console.log(`[SolanaTracker] ${contract.substring(0, 8)}: risk=${riskScore} (${riskLevel})`);

    return { risk_score: riskScore, risk_level: riskLevel };
  } catch (error) {
    console.log(`[SolanaTracker] Risk error for ${contract.substring(0, 8)}:`, error);
    return null;
  }
}

// Enrich alerts with ATH and Risk data (free-tier friendly limits)
async function enrichWithSolanaTracker(alerts: any[]): Promise<any[]> {
  const DELAY_MS = 650; // free tier-friendly
  const MAX_ATH_FETCHES = 2; // ATH endpoint 404/429 often for fresh tokens
  const MAX_RISK_FETCHES = 5; // risk endpoint also rate-limits

  const enrichedAlerts: any[] = [];
  let athFetchCount = 0;
  let riskFetchCount = 0;

  for (let i = 0; i < alerts.length; i++) {
    const alert = alerts[i];
    const entryMcapNum = alert.currentMcap || parseMcap(alert.entry_mcap) || 0;

    // Defaults (UI will render "—" when unknown)
    let athData = { ath_mcap: 'N/A', ath_x: '—' };
    let riskData = { risk_score: 0, risk_level: 'unknown' };
    let top10Holders = 0;

    // Helius: Top 10 holders (more reliable than SolanaTracker)
    if (HELIUS_API_KEY && riskFetchCount < MAX_RISK_FETCHES) {
      const heliusTop10 = await fetchTop10HoldersHelius(alert.contract);
      if (heliusTop10 !== null) {
        top10Holders = heliusTop10;
      }
      await new Promise((resolve) => setTimeout(resolve, 200)); // small delay
    }

    // SolanaTracker: Risk score only (limited)
    if (riskFetchCount < MAX_RISK_FETCHES) {
      const fetchedRisk = await fetchTokenRiskSolanaTracker(alert.contract);
      if (fetchedRisk) {
        riskData = fetchedRisk;
      }
      riskFetchCount++;
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }

    // ATH (limited and cached)
    if (entryMcapNum > 0 && athFetchCount < MAX_ATH_FETCHES) {
      const cached = await getCachedATHData(alert.contract);
      if (cached) {
        athData = cached;
      } else {
        const fetchedATH = await fetchATH(alert.contract, entryMcapNum);
        if (fetchedATH) {
          athData = { ath_mcap: fetchedATH.ath_mcap, ath_x: fetchedATH.ath_x };
          await cacheATHData(alert.contract, entryMcapNum, fetchedATH.raw_ath, fetchedATH.ath_x, alert.timestamp);
        }
        athFetchCount++;
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    enrichedAlerts.push({
      ...alert,
      ath_mcap: athData.ath_mcap,
      ath_x: athData.ath_x,
      risk_score: riskData.risk_score,
      risk_level: riskData.risk_level,
      top10_holders: top10Holders,
    });
  }

  console.log(
    `[SolanaTracker] Enriched ${enrichedAlerts.length} alerts | risk_fetches=${riskFetchCount} | ath_fetches=${athFetchCount}`
  );

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

    // Handle single-token enrichment endpoint (for per-alert refresh)
    if (endpoint === 'enrich-token') {
      const contract = url.searchParams.get('contract');
      if (!contract) {
        return new Response(JSON.stringify({ error: 'Missing contract parameter' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`[solboy-api] Enriching single token: ${contract.substring(0, 8)}...`);

      // Fetch all data for this single token
      const top10 = await fetchTop10HoldersHelius(contract);
      const riskData = await fetchTokenRiskSolanaTracker(contract);

      const result = {
        contract,
        top10_holders: top10 ?? 0,
        risk_score: riskData?.risk_score ?? 0,
        risk_level: riskData?.risk_level ?? 'unknown',
      };

      console.log(`[solboy-api] Single token result: ${JSON.stringify(result)}`);

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
