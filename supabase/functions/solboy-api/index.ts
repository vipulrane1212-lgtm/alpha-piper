import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const rawApiBaseUrl = Deno.env.get('SOLBOY_API_URL') || 'http://localhost:5000';
const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');

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

// Enrich alerts with Current Mcap from DexScreener
async function enrichAlerts(alerts: any[]): Promise<any[]> {
  const enrichedAlerts: any[] = [];

  for (let i = 0; i < alerts.length; i++) {
    const alert = alerts[i];
    const entryMcapNum = alert.currentMcap || parseMcap(alert.entry_mcap) || 0;
    const isValidContract = isValidSolanaAddress(alert.contract);

    // Format entry mcap for display
    let entryMcapDisplay = entryMcapNum > 0 ? formatMcap(entryMcapNum) : (alert.entry_mcap || 'N/A');
    
    // Current mcap from DexScreener
    let currentMcap = alert.market_cap || 'N/A';
    let currentMcapRaw = 0;

    // Fetch current mcap from DexScreener (for all valid contracts)
    if (isValidContract) {
      const mcapData = await fetchCurrentMcap(alert.contract);
      if (mcapData) {
        currentMcap = mcapData.market_cap;
        currentMcapRaw = mcapData.raw_mcap;
      }
    }

    enrichedAlerts.push({
      ...alert,
      entry_mcap: entryMcapDisplay,
      market_cap: currentMcap,
      currentMcap: currentMcapRaw || entryMcapNum,
    });
  }

  console.log(`[Enrich] Completed ${enrichedAlerts.length} alerts`);

  return enrichedAlerts;
}

// Enrich single token (for per-alert refresh button)
async function enrichSingleToken(contract: string): Promise<{
  market_cap: string;
}> {
  const result = {
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
      
      if (!contract) {
        return new Response(JSON.stringify({ error: 'Missing contract parameter' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`[solboy-api] Enriching single token: ${contract.substring(0, 8)}...`);

      const result = await enrichSingleToken(contract);

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
      
      // Enrich with Current Mcap from DexScreener
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
