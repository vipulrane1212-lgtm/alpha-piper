import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_BASE_URL = Deno.env.get('SOLBOY_API_URL') || 'http://localhost:5000';

// Fetch market cap from DexScreener API
async function enrichWithDexScreener(alerts: any[]): Promise<any[]> {
  const enrichedAlerts = await Promise.all(
    alerts.map(async (alert) => {
      try {
        const dexRes = await fetch(
          `https://api.dexscreener.com/tokens/v1/solana/${alert.contract}`,
          { headers: { 'Accept': 'application/json' } }
        );
        
        if (!dexRes.ok) {
          console.log(`[DexScreener] Failed for ${alert.contract}: ${dexRes.status}`);
          return alert;
        }
        
        const dexData = await dexRes.json();
        const pairs = Array.isArray(dexData) ? dexData : dexData.pairs;
        const pair = pairs?.[0];
        
        if (pair?.marketCap) {
          const mcap = pair.marketCap;
          let formattedMcap: string;
          
          if (mcap >= 1_000_000) {
            formattedMcap = `$${(mcap / 1_000_000).toFixed(2)}M`;
          } else if (mcap >= 1_000) {
            formattedMcap = `$${(mcap / 1_000).toFixed(1)}K`;
          } else {
            formattedMcap = `$${mcap.toFixed(0)}`;
          }
          
          return {
            ...alert,
            market_cap: formattedMcap,
          };
        }
        
        return alert;
      } catch (error) {
        console.log(`[DexScreener] Error for ${alert.contract}:`, error);
        return alert;
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
    
    // Enrich alerts with DexScreener market cap data
    if (endpoint === 'alerts' && data.alerts && Array.isArray(data.alerts)) {
      console.log(`[solboy-api] Enriching ${data.alerts.length} alerts with DexScreener data`);
      data.alerts = await enrichWithDexScreener(data.alerts);
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
