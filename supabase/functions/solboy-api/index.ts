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
  // Solana addresses are 32-44 base58 characters
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

// Fetch token security from BirdEye (risk data + top holders %)
async function fetchBirdeyeSecurity(contract: string): Promise<{
  top10_holders: number;
  risk_score: number;
  risk_level: string;
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
    const url = `https://public-api.birdeye.so/defi/token_security?address=${contract}`;
    
    console.log(`[BirdEye] Fetching security for ${contract.substring(0, 8)}...`);
    
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': BIRDEYE_API_KEY,
        'x-chain': 'solana',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.log(`[BirdEye] Rate limited for ${contract.substring(0, 8)}`);
      } else {
        console.log(`[BirdEye] Security failed for ${contract.substring(0, 8)}: ${response.status}`);
      }
      return null;
    }

    const data = await response.json();
    const security = data?.data;

    if (!security) {
      console.log(`[BirdEye] No security data for ${contract.substring(0, 8)}`);
      return null;
    }

    // Top 10 holder percentage
    const top10Holders = security.top10HolderPercent 
      ? Math.round(security.top10HolderPercent * 100) 
      : (security.top10_holder_percent ? Math.round(security.top10_holder_percent) : 0);

    // Risk score calculation based on security flags
    let riskScore = 0;
    if (security.isHoneypot || security.honeypot) riskScore += 5;
    if (security.isFakeToken || security.fakeToken) riskScore += 4;
    if (security.freezeAuthority) riskScore += 3;
    if (security.mintAuthority) riskScore += 2;
    if (!security.isOwnershipRenounced && security.ownerAddress) riskScore += 1;
    if (top10Holders > 50) riskScore += 2;
    else if (top10Holders > 30) riskScore += 1;
    
    riskScore = Math.min(riskScore, 10);

    let riskLevel = 'low';
    if (riskScore >= 7) riskLevel = 'high';
    else if (riskScore >= 4) riskLevel = 'medium';

    console.log(`[BirdEye] ${contract.substring(0, 8)}: top10=${top10Holders}%, risk=${riskScore} (${riskLevel})`);

    return {
      top10_holders: top10Holders,
      risk_score: riskScore,
      risk_level: riskLevel,
    };
  } catch (error) {
    console.log(`[BirdEye] Security error for ${contract.substring(0, 8)}:`, error);
    return null;
  }
}

// Fetch price history from BirdEye to calculate Peak X since alert timestamp
async function fetchBirdeyePeakX(contract: string, entryMcap: number, alertTimestamp: string): Promise<{
  peak_mcap: string;
  peak_x: string;
  raw_peak: number;
} | null> {
  if (!BIRDEYE_API_KEY) return null;

  if (!isValidSolanaAddress(contract)) {
    console.log(`[BirdEye] Skipping price history for invalid address: ${contract.substring(0, 8)}...`);
    return null;
  }

  try {
    // Convert timestamp to unix seconds
    const alertTime = new Date(alertTimestamp).getTime() / 1000;
    const now = Math.floor(Date.now() / 1000);
    
    // Use 1h candles to reduce data points
    const url = `https://public-api.birdeye.so/defi/ohlcv?address=${contract}&type=1H&time_from=${Math.floor(alertTime)}&time_to=${now}`;
    
    console.log(`[BirdEye] Fetching price history for ${contract.substring(0, 8)}...`);
    
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': BIRDEYE_API_KEY,
        'x-chain': 'solana',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.log(`[BirdEye] Price rate limited for ${contract.substring(0, 8)}`);
      } else {
        console.log(`[BirdEye] Price failed for ${contract.substring(0, 8)}: ${response.status}`);
      }
      return null;
    }

    const data = await response.json();
    const items = data?.data?.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log(`[BirdEye] No price data for ${contract.substring(0, 8)}`);
      return null;
    }

    // Find the highest high price
    let peakPrice = 0;
    for (const candle of items) {
      const high = candle.h || candle.high || 0;
      if (high > peakPrice) {
        peakPrice = high;
      }
    }

    if (peakPrice === 0 || entryMcap === 0) {
      return null;
    }

    // Get current price to estimate supply, then calculate peak mcap
    // For simplicity, use the ratio of peak price to entry price
    const currentItem = items[items.length - 1];
    const currentPrice = currentItem?.c || currentItem?.close || peakPrice;
    
    // Peak X = peak_price / entry_price (approximation)
    // We need to get entry price from entry mcap
    // entry_price ≈ entry_mcap / supply
    // peak_mcap = peak_price * supply = entry_mcap * (peak_price / entry_price)
    
    // Simpler approach: If we have mcap data, use that
    // Otherwise, approximate using price ratios
    const multiplier = entryMcap > 0 ? (peakPrice / currentPrice) : 1;
    const peakMcap = entryMcap * multiplier;
    const peakX = multiplier >= 1 ? `${multiplier.toFixed(1)}x` : `${multiplier.toFixed(2)}x`;

    console.log(`[BirdEye] ${contract.substring(0, 8)}: Peak X=${peakX} (peak_price=${peakPrice.toFixed(8)})`);

    return {
      peak_mcap: formatMcap(peakMcap),
      peak_x: peakX,
      raw_peak: peakMcap,
    };
  } catch (error) {
    console.log(`[BirdEye] Price history error for ${contract.substring(0, 8)}:`, error);
    return null;
  }
}

// Enrich alerts with BirdEye data
async function enrichWithBirdeye(alerts: any[]): Promise<any[]> {
  const DELAY_MS = 400; // Free tier friendly
  const MAX_SECURITY_FETCHES = 8; // Limit API calls
  const MAX_PRICE_FETCHES = 3;

  const enrichedAlerts: any[] = [];
  let securityFetchCount = 0;
  let priceFetchCount = 0;

  for (let i = 0; i < alerts.length; i++) {
    const alert = alerts[i];
    const entryMcapNum = alert.currentMcap || parseMcap(alert.entry_mcap) || 0;

    // Defaults
    let securityData = { top10_holders: 0, risk_score: 0, risk_level: 'unknown' };
    let peakData = { peak_mcap: 'N/A', peak_x: '—' };

    // Check if contract is valid before calling APIs
    const isValidContract = isValidSolanaAddress(alert.contract);

    // BirdEye Security (top10 holders + risk)
    if (BIRDEYE_API_KEY && securityFetchCount < MAX_SECURITY_FETCHES && isValidContract) {
      const fetchedSecurity = await fetchBirdeyeSecurity(alert.contract);
      if (fetchedSecurity) {
        securityData = fetchedSecurity;
      }
      securityFetchCount++;
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }

    // Peak X from BirdEye price history (limited and cached)
    if (entryMcapNum > 0 && priceFetchCount < MAX_PRICE_FETCHES && isValidContract) {
      const cached = await getCachedPeakData(alert.contract);
      if (cached) {
        peakData = cached;
      } else if (alert.timestamp) {
        const fetchedPeak = await fetchBirdeyePeakX(alert.contract, entryMcapNum, alert.timestamp);
        if (fetchedPeak) {
          peakData = { peak_mcap: fetchedPeak.peak_mcap, peak_x: fetchedPeak.peak_x };
          await cachePeakData(alert.contract, entryMcapNum, fetchedPeak.raw_peak, fetchedPeak.peak_x, alert.timestamp);
        }
        priceFetchCount++;
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    }

    enrichedAlerts.push({
      ...alert,
      peak_mcap: peakData.peak_mcap,
      peak_x: peakData.peak_x,
      // Rename to ath_x for UI compatibility
      ath_mcap: peakData.peak_mcap,
      ath_x: peakData.peak_x,
      risk_score: securityData.risk_score,
      risk_level: securityData.risk_level,
      top10_holders: securityData.top10_holders,
    });
  }

  console.log(
    `[BirdEye] Enriched ${enrichedAlerts.length} alerts | security_fetches=${securityFetchCount} | price_fetches=${priceFetchCount}`
  );

  return enrichedAlerts;
}

// Enrich single token (for per-alert refresh)
async function enrichSingleToken(contract: string, alertTimestamp?: string, entryMcap?: number): Promise<{
  top10_holders: number;
  risk_score: number;
  risk_level: string;
  peak_x: string;
  peak_mcap: string;
  market_cap: string;
}> {
  const result = {
    top10_holders: 0,
    risk_score: 0,
    risk_level: 'unknown',
    peak_x: '—',
    peak_mcap: 'N/A',
    market_cap: 'N/A',
  };

  if (!isValidSolanaAddress(contract)) {
    console.log(`[BirdEye] Skipping invalid contract for enrichment: ${contract.substring(0, 8)}...`);
    return result;
  }

  // Fetch security data
  const securityData = await fetchBirdeyeSecurity(contract);
  if (securityData) {
    result.top10_holders = securityData.top10_holders;
    result.risk_score = securityData.risk_score;
    result.risk_level = securityData.risk_level;
  }

  // Fetch current market cap from DexScreener
  try {
    const dexRes = await fetch(
      `https://api.dexscreener.com/tokens/v1/solana/${contract}`,
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (dexRes.ok) {
      const dexData = await dexRes.json();
      const pairs = Array.isArray(dexData) ? dexData : dexData.pairs;
      const pair = pairs?.[0];
      
      if (pair?.marketCap) {
        result.market_cap = formatMcap(pair.marketCap);
      }
    }
  } catch (e) {
    console.log(`[DexScreener] Error for ${contract.substring(0, 8)}:`, e);
  }

  // Fetch peak X if we have timestamp and entry mcap
  if (alertTimestamp && entryMcap && entryMcap > 0) {
    const peakData = await fetchBirdeyePeakX(contract, entryMcap, alertTimestamp);
    if (peakData) {
      result.peak_x = peakData.peak_x;
      result.peak_mcap = peakData.peak_mcap;
      // Update cache
      await cachePeakData(contract, entryMcap, peakData.raw_peak, peakData.peak_x, alertTimestamp);
    }
  }

  return result;
}

async function enrichWithDexScreener(alerts: any[]): Promise<any[]> {
  const enrichedAlerts = await Promise.all(
    alerts.map(async (alert) => {
      const entryMcap = alert.currentMcap ? formatMcap(alert.currentMcap) : 'N/A';
      
      if (!isValidSolanaAddress(alert.contract)) {
        return { ...alert, entry_mcap: entryMcap, market_cap: 'N/A' };
      }
      
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
    console.log(`[solboy-api] Deduplicated ${alerts.length} -> ${deduplicated.length} alerts`);
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
      data.alerts = await enrichWithDexScreener(data.alerts);
      
      // Use BirdEye for security + peak data
      if (BIRDEYE_API_KEY) {
        data.alerts = await enrichWithBirdeye(data.alerts);
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
