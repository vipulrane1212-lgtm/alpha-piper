import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_BASE_URL = Deno.env.get('SOLBOY_API_URL') || 'http://localhost:5000';
const SOLANATRACKER_API_KEY = Deno.env.get('SOLANATRACKER_API_KEY');

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

// Fetch peak mcap from Solana Tracker OHLCV API
async function fetchPeakMcap(contract: string, alertTimestamp: string, entryMcapNum: number): Promise<{ peak_mcap: string; peak_x: string } | null> {
  if (!SOLANATRACKER_API_KEY) {
    console.log('[SolanaTracker] No API key configured');
    return null;
  }

  try {
    // Convert alert timestamp to unix seconds
    const alertTime = Math.floor(new Date(alertTimestamp).getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    
    // Fetch hourly OHLCV data with marketCap enabled
    const url = `https://data.solanatracker.io/chart/${contract}?type=1h&time_from=${alertTime}&time_to=${now}&marketCap=true&removeOutliers=true`;
    
    console.log(`[SolanaTracker] Fetching OHLCV for ${contract.substring(0, 8)}...`);
    
    const response = await fetch(url, {
      headers: {
        'x-api-key': SOLANATRACKER_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`[SolanaTracker] Failed for ${contract.substring(0, 8)}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const candles = data.oclhv || data.ohlcv || [];
    
    if (!candles || candles.length === 0) {
      console.log(`[SolanaTracker] No candle data for ${contract.substring(0, 8)}`);
      return null;
    }

    // Find the maximum "high" value (peak mcap)
    let peakMcap = 0;
    for (const candle of candles) {
      if (candle.high && candle.high > peakMcap) {
        peakMcap = candle.high;
      }
    }

    if (peakMcap === 0) {
      return null;
    }

    // Calculate multiplier (peak / entry)
    const multiplier = entryMcapNum > 0 ? peakMcap / entryMcapNum : 0;
    
    console.log(`[SolanaTracker] ${contract.substring(0, 8)}: peak=${formatMcap(peakMcap)}, entry=${formatMcap(entryMcapNum)}, multiplier=${multiplier.toFixed(2)}x`);

    return {
      peak_mcap: formatMcap(peakMcap),
      peak_x: multiplier >= 1 ? `${multiplier.toFixed(1)}x` : `${multiplier.toFixed(2)}x`,
    };
  } catch (error) {
    console.log(`[SolanaTracker] Error for ${contract.substring(0, 8)}:`, error);
    return null;
  }
}

// Sequential processing with delay to respect free tier rate limits
async function enrichWithPeakData(alerts: any[]): Promise<any[]> {
  // Process one at a time with delay for free tier (very conservative)
  const DELAY_MS = 500; // 500ms between requests to stay well under rate limit
  const enrichedAlerts: any[] = [];

  for (let i = 0; i < alerts.length; i++) {
    const alert = alerts[i];
    const entryMcapNum = alert.currentMcap || parseMcap(alert.entry_mcap) || 0;
    
    if (entryMcapNum === 0) {
      enrichedAlerts.push({ ...alert, peak_mcap: 'N/A', peak_x: '—' });
      continue;
    }

    const peakData = await fetchPeakMcap(alert.contract, alert.timestamp, entryMcapNum);
    
    enrichedAlerts.push({
      ...alert,
      peak_mcap: peakData?.peak_mcap || 'N/A',
      peak_x: peakData?.peak_x || '—',
    });

    // Add delay between requests (except for last one)
    if (i < alerts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  return enrichedAlerts;
}

async function enrichWithDexScreener(alerts: any[]): Promise<any[]> {
  const enrichedAlerts = await Promise.all(
    alerts.map(async (alert) => {
      // Format entry mcap from API (currentMcap field is actually entry mcap)
      const entryMcap = alert.currentMcap ? formatMcap(alert.currentMcap) : 'N/A';
      
      try {
        const dexRes = await fetch(
          `https://api.dexscreener.com/tokens/v1/solana/${alert.contract}`,
          { headers: { 'Accept': 'application/json' } }
        );
        
        if (!dexRes.ok) {
          console.log(`[DexScreener] Failed for ${alert.contract}: ${dexRes.status}`);
          return {
            ...alert,
            entry_mcap: entryMcap,
            market_cap: 'N/A',
          };
        }
        
        const dexData = await dexRes.json();
        const pairs = Array.isArray(dexData) ? dexData : dexData.pairs;
        const pair = pairs?.[0];
        
        if (pair?.marketCap) {
          return {
            ...alert,
            entry_mcap: entryMcap,
            market_cap: formatMcap(pair.marketCap),
          };
        }
        
        return {
          ...alert,
          entry_mcap: entryMcap,
          market_cap: 'N/A',
        };
      } catch (error) {
        console.log(`[DexScreener] Error for ${alert.contract}:`, error);
        return {
          ...alert,
          entry_mcap: entryMcap,
          market_cap: 'N/A',
        };
      }
    })
  );
  
  return enrichedAlerts;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    
    console.log(`[solboy-api] Request for endpoint: ${endpoint}`);
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

    // Handle API being offline - return empty data instead of error
    if (!response.ok) {
      console.warn(`[solboy-api] API unavailable (${response.status}), returning empty data`);
      
      // Return appropriate empty response based on endpoint
      if (endpoint === 'stats') {
        return new Response(JSON.stringify({
          totalSubscribers: 0,
          totalAlerts: 0,
          tier1Alerts: 0,
          tier2Alerts: 0,
          tier3Alerts: 0,
          winRate: 0,
          lastUpdated: new Date().toISOString(),
          apiOffline: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (endpoint === 'alerts') {
        return new Response(JSON.stringify({ 
          alerts: [], 
          apiOffline: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ data: [], apiOffline: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let data = await response.json();
    
    // Enrich alerts with DexScreener market cap data and peak multiplier
    if (endpoint === 'alerts' && data.alerts && Array.isArray(data.alerts)) {
      console.log(`[solboy-api] Enriching ${data.alerts.length} alerts with DexScreener data`);
      data.alerts = await enrichWithDexScreener(data.alerts);
      
      // Now enrich with peak data from Solana Tracker
      if (SOLANATRACKER_API_KEY) {
        console.log(`[solboy-api] Enriching ${data.alerts.length} alerts with peak multiplier data`);
        data.alerts = await enrichWithPeakData(data.alerts);
      }
    }
    
    console.log(`[solboy-api] Success, returning data`);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('[solboy-api] API connection error, returning empty data:', errorMessage);
    
    // Return empty data on connection errors too
    return new Response(JSON.stringify({ 
      alerts: [], 
      apiOffline: true,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
