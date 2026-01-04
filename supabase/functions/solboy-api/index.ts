import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const rawApiBaseUrl = Deno.env.get('SOLBOY_API_URL') || 'https://my-project-production-3d70.up.railway.app';
// Validate that the secret is not a placeholder value
const API_BASE_URL = (rawApiBaseUrl && !rawApiBaseUrl.includes('my-secret') && rawApiBaseUrl.startsWith('http'))
  ? rawApiBaseUrl.replace(/\/+$/, '')
  : 'https://my-project-production-3d70.up.railway.app';

if (rawApiBaseUrl && rawApiBaseUrl.includes('my-secret')) {
  console.warn('[solboy-api] WARNING: SOLBOY_API_URL secret appears to be a placeholder. Using fallback URL.');
}

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
    // Use the correct DexScreener endpoint for token pairs
    const dexRes = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${contract}`,
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!dexRes.ok) {
      console.log(`[DexScreener] Failed for ${contract.substring(0, 8)}... status: ${dexRes.status}`);
      return null;
    }
    
    const dexData = await dexRes.json();
    const pairs = dexData?.pairs;
    
    if (pairs && pairs.length > 0) {
      // Get the pair with highest liquidity
      const pair = pairs[0];
      const mcap = pair?.marketCap || pair?.fdv;
      
      if (mcap && mcap > 0) {
        console.log(`[DexScreener] Got mcap for ${contract.substring(0, 8)}...: ${mcap}`);
        return { 
          market_cap: formatMcap(mcap),
          raw_mcap: mcap,
        };
      }
    }
    
    console.log(`[DexScreener] No mcap data for ${contract.substring(0, 8)}...`);
    return null;
  } catch (err) {
    console.log(`[DexScreener] Error for ${contract.substring(0, 8)}...: ${err}`);
    return null;
  }
}

// Enrich alerts with Current Mcap from DexScreener (parallel requests)
async function enrichAlerts(alerts: any[]): Promise<any[]> {
  // Fetch all DexScreener data in parallel for speed
  const validContracts = alerts
    .filter(a => isValidSolanaAddress(a.contract))
    .map(a => a.contract);
  
  console.log(`[Enrich] Fetching mcap for ${validContracts.length} valid contracts in parallel`);
  
  // Create a map of contract -> mcap data
  const mcapPromises = validContracts.map(async (contract) => {
    const data = await fetchCurrentMcap(contract);
    return { contract, data };
  });
  
  const mcapResults = await Promise.all(mcapPromises);
  const mcapMap = new Map<string, { market_cap: string; raw_mcap: number }>();
  
  for (const result of mcapResults) {
    if (result.data) {
      mcapMap.set(result.contract, result.data);
    }
  }
  
  console.log(`[Enrich] Got mcap for ${mcapMap.size}/${validContracts.length} contracts`);

  // Now enrich all alerts using the pre-fetched data
  const enrichedAlerts = alerts.map(alert => {
    // Entry mcap comes from API's entryMc field (MCAP when alert was triggered)
    const entryMcapNum = alert.entryMc || 0;
    const entryMcapDisplay = entryMcapNum > 0 ? formatMcap(entryMcapNum) : 'N/A';
    
    // Current mcap from API's currentMcap field (MCAP shown in Telegram post)
    const apiCurrentMcap = alert.currentMcap || 0;
    const apiCurrentMcapDisplay = apiCurrentMcap > 0 ? formatMcap(apiCurrentMcap) : 'N/A';
    
    // Live current mcap from DexScreener (for refresh button)
    const mcapData = mcapMap.get(alert.contract);
    const liveCurrentMcap = mcapData?.market_cap || null;

    // Explicitly preserve matchedSignals (handle both camelCase and snake_case)
    // Also check for array-like strings or other formats
    let matchedSignals: string[] = [];
    if (Array.isArray(alert.matchedSignals)) {
      matchedSignals = alert.matchedSignals;
    } else if (Array.isArray(alert.matched_signals)) {
      matchedSignals = alert.matched_signals;
    } else if (typeof alert.matchedSignals === 'string') {
      // Handle string format (comma-separated)
      matchedSignals = alert.matchedSignals.split(',').map(s => s.trim()).filter(s => s.length > 0);
    } else if (typeof alert.matched_signals === 'string') {
      matchedSignals = alert.matched_signals.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }

    return {
      ...alert,
      // Explicitly preserve matchedSignals to ensure it's not lost
      matchedSignals: matchedSignals,
      matched_signals: matchedSignals, // Also keep snake_case version for compatibility
      // Explicitly preserve callers and subs from API
      callers: alert.callers ?? 0,
      subs: alert.subs ?? 0,
      // Keep original API fields
      entryMc: entryMcapNum,
      entry_mcap: entryMcapDisplay,
      // currentMcap from API (Telegram post value)
      currentMcapDisplay: apiCurrentMcapDisplay,
      // Live market cap from DexScreener (for real-time updates)
      market_cap: liveCurrentMcap || apiCurrentMcapDisplay,
    };
  });

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
    let dedupeParam: string | null = null;
    
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
        dedupeParam = url.searchParams.get('dedupe');
        apiUrl = `${API_BASE_URL}/api/alerts/recent?limit=${limit}`;
        if (tier) apiUrl += `&tier=${tier}`;
        if (dedupeParam !== null) apiUrl += `&dedupe=${dedupeParam}`;
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
    
    // Override subscriber count to 3126 for stats endpoint
    if (endpoint === 'stats' && data) {
      data.totalSubscribers = 3126;
      console.log(`[solboy-api] Overriding totalSubscribers to 3126`);
    }
    
    if (endpoint === 'alerts' && data.alerts && Array.isArray(data.alerts)) {
      // Log matchedSignals, callers, and subs before processing to debug
      if (data.alerts.length > 0) {
        const sampleAlert = data.alerts[0];
        console.log(`[solboy-api] Sample alert matchedSignals (before):`, sampleAlert.matchedSignals);
        console.log(`[solboy-api] Sample alert callers (before):`, sampleAlert.callers);
        console.log(`[solboy-api] Sample alert subs (before):`, sampleAlert.subs);
        console.log(`[solboy-api] Sample alert keys:`, Object.keys(sampleAlert));
      }
      
      // Only deduplicate if API didn't already do it (when dedupe=false or not specified and API doesn't dedupe)
      // The API's dedupe parameter defaults to true, so we only do our own deduplication as a safety net
      // Our deduplication is by contract+tier, which is more specific than the API's token-based deduplication
      const shouldDedupe = dedupeParam === null || dedupeParam === 'true';
      if (shouldDedupe) {
        // API should have already deduplicated, but do our own as safety net
        const beforeCount = data.alerts.length;
        data.alerts = deduplicateAlerts(data.alerts);
        if (data.alerts.length < beforeCount) {
          console.log(`[solboy-api] Additional deduplication: ${beforeCount} -> ${data.alerts.length} alerts`);
        }
      }
      
      console.log(`[solboy-api] Enriching ${data.alerts.length} alerts`);
      
      // Enrich with Current Mcap from DexScreener (preserves all original fields including matchedSignals)
      data.alerts = await enrichAlerts(data.alerts);
      
      // Verify matchedSignals are preserved after enrichment
      if (data.alerts.length > 0) {
        const sampleAfter = data.alerts[0];
        console.log(`[solboy-api] After enrichment matchedSignals:`, sampleAfter.matchedSignals);
        console.log(`[solboy-api] After enrichment matched_signals:`, sampleAfter.matched_signals);
        
        // Check if any alerts lost their signals
        const alertsWithSignals = data.alerts.filter(a => (a.matchedSignals && a.matchedSignals.length > 0) || (a.matched_signals && a.matched_signals.length > 0));
        console.log(`[solboy-api] Alerts with signals: ${alertsWithSignals.length}/${data.alerts.length}`);
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
