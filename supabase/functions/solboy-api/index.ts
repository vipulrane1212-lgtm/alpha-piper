import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const rawApiBaseUrl = Deno.env.get('SOLBOY_API_URL') || 'http://localhost:5000';
const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');
const BIRDEYE_API_KEY = Deno.env.get('BIRDEYE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Validate Solana address (base58, 32-44 chars)
function isValidSolanaAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}

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

// Parse mcap string back to number
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

// Check cache for Peak data
async function getCachedPeakData(contract: string): Promise<{ peak_mcap: string; peak_x: string } | null> {
  try {
    const { data, error } = await supabase
      .from('peak_cache')
      .select('peak_mcap, peak_x')
      .eq('contract', contract)
      .maybeSingle();
    
    if (error || !data) return null;
    
    return {
      peak_mcap: data.peak_mcap ? formatMcap(Number(data.peak_mcap)) : 'N/A',
      peak_x: data.peak_x || '—',
    };
  } catch {
    return null;
  }
}

// Save Peak data to cache
async function cachePeakData(contract: string, entryMcap: number, peakMcap: number, peakX: string, alertTimestamp: string): Promise<void> {
  try {
    await supabase
      .from('peak_cache')
      .upsert({
        contract,
        entry_mcap: entryMcap,
        peak_mcap: peakMcap,
        peak_x: peakX,
        alert_timestamp: alertTimestamp,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'contract' });
  } catch (error) {
    console.log(`[Cache] Failed to save Peak for ${contract.substring(0, 8)}:`, error);
  }
}

// Fetch price history from BirdEye to find Peak X since alert timestamp
// Uses /defi/history_price endpoint with type=15m intervals
async function fetchBirdeyePeakX(contract: string, entryMcap: number, alertTimestamp: string): Promise<{
  peak_x: string;
  peak_mcap: number;
} | null> {
  if (!BIRDEYE_API_KEY) {
    console.log('[BirdEye] No API key configured');
    return null;
  }

  if (!isValidSolanaAddress(contract)) {
    console.log(`[BirdEye] Skipping invalid address: ${contract.substring(0, 8)}...`);
    return null;
  }

  try {
    // Convert timestamp to unix seconds
    const alertTime = Math.floor(new Date(alertTimestamp).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    
    // BirdEye history_price endpoint - gets price points over time
    const url = `https://public-api.birdeye.so/defi/history_price?address=${contract}&address_type=token&type=15m&time_from=${alertTime}&time_to=${now}`;
    
    console.log(`[BirdEye] Fetching price history for ${contract.substring(0, 8)}...`);
    
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': BIRDEYE_API_KEY,
        'x-chain': 'solana',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[BirdEye] Price history failed for ${contract.substring(0, 8)}: ${response.status} - ${errorText.substring(0, 50)}`);
      return null;
    }

    const data = await response.json();
    const items = data?.data?.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log(`[BirdEye] No price data for ${contract.substring(0, 8)}`);
      return null;
    }

    // Find the peak (highest) price in the period
    let peakPrice = 0;
    let entryPrice = items[0]?.value || 0;

    for (const item of items) {
      const price = item.value || 0;
      if (price > peakPrice) {
        peakPrice = price;
      }
    }

    if (peakPrice === 0 || entryPrice === 0) {
      return null;
    }

    // Peak X = peak_price / entry_price
    const multiplier = peakPrice / entryPrice;
    const peakX = multiplier >= 1 ? `${multiplier.toFixed(1)}x` : `${multiplier.toFixed(2)}x`;
    const peakMcap = entryMcap * multiplier;

    console.log(`[BirdEye] ${contract.substring(0, 8)}: Peak X = ${peakX}`);

    return { peak_x: peakX, peak_mcap: peakMcap };
  } catch (error) {
    console.log(`[BirdEye] Price error for ${contract.substring(0, 8)}:`, error);
    return null;
  }
}

// Calculate P/L % from entry mcap to current mcap
function calculatePL(entryMcap: number, currentMcap: number): string {
  if (!entryMcap || entryMcap === 0 || !currentMcap) return '—';
  const pl = ((currentMcap - entryMcap) / entryMcap) * 100;
  const sign = pl >= 0 ? '+' : '';
  return `${sign}${pl.toFixed(0)}%`;
}

// Fetch current market cap from DexScreener
async function fetchCurrentMcap(contract: string): Promise<{ market_cap: string; raw_mcap: number } | null> {
  if (!isValidSolanaAddress(contract)) {
    return null;
  }

  try {
    const dexRes = await fetch(
      `https://api.dexscreener.com/tokens/v1/solana/${contract}`,
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!dexRes.ok) {
      return null;
    }
    
    const dexData = await dexRes.json();
    const pairs = Array.isArray(dexData) ? dexData : dexData.pairs;
    const pair = pairs?.[0];
    
    if (pair?.marketCap) {
      return { 
        market_cap: formatMcap(pair.marketCap),
        raw_mcap: pair.marketCap,
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

// Enrich alerts with Peak X (from BirdEye) + Current Mcap (from DexScreener)
// Limited to first few alerts to respect rate limits
async function enrichAlerts(alerts: any[]): Promise<any[]> {
  const DELAY_MS = 500; // Free tier friendly delay
  const MAX_PEAK_FETCHES = 4; // Only enrich first 4 alerts with Peak X
  
  const enrichedAlerts: any[] = [];
  let peakFetchCount = 0;

  for (let i = 0; i < alerts.length; i++) {
    const alert = alerts[i];
    const entryMcapNum = alert.currentMcap || parseMcap(alert.entry_mcap) || 0;
    const isValidContract = isValidSolanaAddress(alert.contract);

    // Defaults
    let peakX = '—';
    let peakMcap = 'N/A';
    let currentMcap = alert.market_cap || 'N/A';

    // Fetch current mcap from DexScreener (for all valid contracts)
    if (isValidContract) {
      const mcapData = await fetchCurrentMcap(alert.contract);
      if (mcapData) {
        currentMcap = mcapData.market_cap;
      }
    }

    // Fetch Peak X from BirdEye (limited to first few alerts)
    if (isValidContract && entryMcapNum > 0 && peakFetchCount < MAX_PEAK_FETCHES && alert.timestamp) {
      // Check cache first
      const cached = await getCachedPeakData(alert.contract);
      if (cached) {
        peakX = cached.peak_x;
        peakMcap = cached.peak_mcap;
        console.log(`[Cache] Using cached Peak X for ${alert.contract.substring(0, 8)}: ${peakX}`);
      } else {
        // Fetch from BirdEye
        const peakData = await fetchBirdeyePeakX(alert.contract, entryMcapNum, alert.timestamp);
        if (peakData) {
          peakX = peakData.peak_x;
          peakMcap = formatMcap(peakData.peak_mcap);
          // Cache it
          await cachePeakData(alert.contract, entryMcapNum, peakData.peak_mcap, peakData.peak_x, alert.timestamp);
        }
        peakFetchCount++;
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    enrichedAlerts.push({
      ...alert,
      entry_mcap: entryMcapNum > 0 ? formatMcap(entryMcapNum) : 'N/A',
      market_cap: currentMcap,
      peak_x: peakX,
      ath_x: peakX, // Alias for UI compatibility
      peak_mcap: peakMcap,
      ath_mcap: peakMcap,
      // Clear out risk/holder fields since we're not using them
      risk_score: 0,
      risk_level: 'unknown',
      top10_holders: 0,
    });
  }

  console.log(`[Enrich] Completed ${enrichedAlerts.length} alerts | peak_fetches=${peakFetchCount}`);

  return enrichedAlerts;
}

// Enrich single token (for per-alert refresh button)
async function enrichSingleToken(contract: string, alertTimestamp?: string, entryMcap?: number): Promise<{
  peak_x: string;
  peak_mcap: string;
  market_cap: string;
}> {
  const result = {
    peak_x: '—',
    peak_mcap: 'N/A',
    market_cap: 'N/A',
  };

  if (!isValidSolanaAddress(contract)) {
    console.log(`[Enrich] Skipping invalid contract: ${contract.substring(0, 8)}...`);
    return result;
  }

  // Fetch current market cap from DexScreener
  const mcapData = await fetchCurrentMcap(contract);
  if (mcapData) {
    result.market_cap = mcapData.market_cap;
  }

  // Fetch Peak X if we have timestamp and entry mcap
  if (alertTimestamp && entryMcap && entryMcap > 0) {
    const peakData = await fetchBirdeyePeakX(contract, entryMcap, alertTimestamp);
    if (peakData) {
      result.peak_x = peakData.peak_x;
      result.peak_mcap = formatMcap(peakData.peak_mcap);
      // Update cache
      await cachePeakData(contract, entryMcap, peakData.peak_mcap, peakData.peak_x, alertTimestamp);
    }
  }

  return result;
}

// Deduplicate alerts: keep first occurrence per contract+tier
function deduplicateAlerts(alerts: any[]): any[] {
  const seen = new Set<string>();
  const deduplicated: any[] = [];
  
  for (const alert of alerts) {
    const key = `${alert.contract}_${alert.tier}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(alert);
    }
  }
  
  if (deduplicated.length < alerts.length) {
    console.log(`[Dedup] ${alerts.length} -> ${deduplicated.length} alerts`);
  }
  
  return deduplicated;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    
    console.log(`[solboy-api] Request for endpoint: ${endpoint}`);

    // Handle single-token enrichment endpoint (for per-alert refresh)
    if (endpoint === 'enrich-token') {
      const contract = url.searchParams.get('contract');
      const timestamp = url.searchParams.get('timestamp');
      const entryMcapParam = url.searchParams.get('entry_mcap');
      
      if (!contract) {
        return new Response(JSON.stringify({ error: 'Missing contract parameter' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`[solboy-api] Enriching single token: ${contract.substring(0, 8)}...`);

      const entryMcap = entryMcapParam ? parseMcap(entryMcapParam) || 0 : 0;
      const result = await enrichSingleToken(contract, timestamp || undefined, entryMcap);

      console.log(`[solboy-api] Single token result: ${JSON.stringify(result)}`);

      return new Response(JSON.stringify({ contract, ...result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[solboy-api] Using API base: ${API_BASE_URL}`);

    let apiUrl: string;
    
    switch (endpoint) {
      case 'health':
        apiUrl = `${API_BASE_URL}/api/health`;
        break;
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
      // Deduplicate first
      data.alerts = deduplicateAlerts(data.alerts);
      
      console.log(`[solboy-api] Enriching ${data.alerts.length} alerts`);
      
      // Enrich with Peak X (BirdEye) + Current Mcap (DexScreener)
      data.alerts = await enrichAlerts(data.alerts);
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
