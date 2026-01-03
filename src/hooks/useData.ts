import { useQuery } from "@tanstack/react-query";

export interface Stats {
  totalSubscribers: number;
  userSubscribers: number;
  groupSubscribers: number;
  totalAlerts: number;
  tier1Alerts: number;
  tier2Alerts: number;
  tier3Alerts: number;
  winRate: number;
  recentAlerts24h: number;
  recentAlerts7d: number;
  truePositives: number;
  falsePositives: number;
  lastUpdated: string;
  apiOffline?: boolean;
}

export interface Alert {
  id: string;
  token: string;
  tier: number;
  level: string;
  timestamp: string;
  contract: string;
  score: number;
  entry_mcap: string; // Formatted entry mcap display (fallback)
  entryMc: number | null; // Entry mcap from Telegram post
  callers: number;
  subs: number;
  matchedSignals: string[];
  tags: string[];
  hotlist: string; // "Yes" or "No"
  description: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uzalzrrvwrxhszznlcgy.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6YWx6cnJ2d3J4aHN6em5sY2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NzA3MTMsImV4cCI6MjA3OTA0NjcxM30.CVozu1QqVifg4UCaFqodtqgw1A8rA99cDbCaOW8wUJE';

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async (): Promise<Stats | null> => {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/solboy-api?endpoint=stats`,
        {
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Error fetching stats:", response.statusText);
        throw new Error(response.statusText);
      }

      return response.json();
    },
    refetchInterval: 30000,
  });
}

// LocalStorage cache helpers
const CACHE_KEY = 'solboy_alerts_cache';
const CACHE_TIMESTAMP_KEY = 'solboy_alerts_cache_timestamp';
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

interface CachedAlerts {
  alerts: Alert[];
  timestamp: number;
}

function getCachedAlerts(): Alert[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cached || !timestamp) return null;
    
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > CACHE_MAX_AGE) {
      // Cache expired, clear it
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      return null;
    }
    
    const data: CachedAlerts = JSON.parse(cached);
    console.log(`[useAlerts] Using cached alerts (${data.alerts.length} alerts, ${Math.round(age / 1000 / 60)} minutes old)`);
    return data.alerts;
  } catch (error) {
    console.warn('[useAlerts] Error reading cache:', error);
    return null;
  }
}

function saveAlertsToCache(alerts: Alert[]): void {
  try {
    const cacheData: CachedAlerts = {
      alerts,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));
    console.log(`[useAlerts] Saved ${alerts.length} alerts to cache`);
  } catch (error) {
    console.warn('[useAlerts] Error saving cache:', error);
  }
}

function mergeAlerts(newAlerts: Alert[], cachedAlerts: Alert[]): Alert[] {
  // Create a map of cached alerts by contract+tier for quick lookup
  const cachedMap = new Map<string, Alert>();
  cachedAlerts.forEach(alert => {
    const key = `${alert.contract}_${alert.tier}`;
    cachedMap.set(key, alert);
  });
  
  // Create a map of new alerts
  const newMap = new Map<string, Alert>();
  newAlerts.forEach(alert => {
    const key = `${alert.contract}_${alert.tier}`;
    newMap.set(key, alert);
  });
  
  // Merge: prefer new alerts, but keep cached ones that aren't in new data
  const merged: Alert[] = [];
  const seen = new Set<string>();
  
  // Add all new alerts first (they're more recent)
  newAlerts.forEach(alert => {
    const key = `${alert.contract}_${alert.tier}`;
    if (!seen.has(key)) {
      merged.push(alert);
      seen.add(key);
    }
  });
  
  // Add cached alerts that aren't in new data (preserve old alerts)
  cachedAlerts.forEach(alert => {
    const key = `${alert.contract}_${alert.tier}`;
    if (!seen.has(key)) {
      merged.push(alert);
      seen.add(key);
    }
  });
  
  // Sort by timestamp (most recent first)
  merged.sort((a, b) => {
    const timeA = new Date(a.timestamp || 0).getTime();
    const timeB = new Date(b.timestamp || 0).getTime();
    return timeB - timeA;
  });
  
  console.log(`[useAlerts] Merged ${newAlerts.length} new + ${cachedAlerts.length} cached = ${merged.length} total alerts`);
  return merged;
}

export function useAlerts(limit?: number, tier?: number) {
  return useQuery({
    queryKey: ["alerts", limit, tier],
    queryFn: async (): Promise<Alert[]> => {
      let url = `${SUPABASE_URL}/functions/v1/solboy-api?endpoint=alerts`;
      if (limit) url += `&limit=${limit}`;
      if (tier) url += `&tier=${tier}`;

      // Get cached alerts as fallback
      const cachedAlerts = getCachedAlerts();

      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });

        if (!response.ok) {
          console.warn("Error fetching alerts:", response.statusText);
          // If we have cached alerts, use them as fallback
          if (cachedAlerts && cachedAlerts.length > 0) {
            console.log(`[useAlerts] API failed, using ${cachedAlerts.length} cached alerts as fallback`);
            // Update cache timestamp to keep it fresh
            saveAlertsToCache(cachedAlerts);
            return cachedAlerts;
          }
          throw new Error(response.statusText);
        }

        const data = await response.json();
        const alerts = data.alerts || [];
        
        // Check if API is offline
        if (data.apiOffline && cachedAlerts && cachedAlerts.length > 0) {
          console.log(`[useAlerts] API offline, using ${cachedAlerts.length} cached alerts`);
          // Update cache timestamp to keep it fresh
          saveAlertsToCache(cachedAlerts);
          return cachedAlerts;
        }
        
        // Production-safe debug logging - always log to help diagnose
        if (alerts.length > 0) {
          const firstAlert = alerts[0];
          console.log('[useAlerts] API Response received:', {
            totalAlerts: alerts.length,
            firstAlertToken: firstAlert.token,
            firstAlertMatchedSignals: firstAlert.matchedSignals,
            firstAlertMatched_signals: firstAlert.matched_signals,
            firstAlertKeys: Object.keys(firstAlert),
            hasSignals: !!(firstAlert.matchedSignals?.length || firstAlert.matched_signals?.length)
          });
          
          // Count alerts with signals
          const alertsWithSignals = alerts.filter(a => 
            (a.matchedSignals && a.matchedSignals.length > 0) || 
            (a.matched_signals && a.matched_signals.length > 0)
          );
          console.log(`[useAlerts] Alerts with signals: ${alertsWithSignals.length}/${alerts.length}`);
          
          // ALWAYS merge with cached alerts to preserve old ones that were displayed before
          let finalAlerts = alerts;
          if (cachedAlerts && cachedAlerts.length > 0) {
            console.log(`[useAlerts] Merging ${alerts.length} new alerts with ${cachedAlerts.length} cached alerts`);
            finalAlerts = mergeAlerts(alerts, cachedAlerts);
            console.log(`[useAlerts] Result: ${finalAlerts.length} total alerts (${alerts.length} new + ${cachedAlerts.length - alerts.filter(a => cachedAlerts.some(c => c.contract === a.contract && c.tier === a.tier)).length} old preserved)`);
          }
          
          // ALWAYS save to cache - this ensures whatever is displayed is saved
          saveAlertsToCache(finalAlerts);
          
          return finalAlerts;
        } else {
          console.warn('[useAlerts] No alerts received from API');
          // If API returned empty but we have cache, use cache and save it
          if (cachedAlerts && cachedAlerts.length > 0) {
            console.log(`[useAlerts] API returned empty, using ${cachedAlerts.length} cached alerts`);
            // Update cache timestamp to keep it fresh
            saveAlertsToCache(cachedAlerts);
            return cachedAlerts;
          }
        }
        
        // If we get here, API returned empty and no cache - save empty array to prevent issues
        saveAlertsToCache([]);
        return alerts;
      } catch (error) {
        console.error('[useAlerts] Fetch error:', error);
        // If we have cached alerts, use them as fallback
        if (cachedAlerts && cachedAlerts.length > 0) {
          console.log(`[useAlerts] Fetch failed, using ${cachedAlerts.length} cached alerts as fallback`);
          // Update cache timestamp to keep it fresh even when API fails
          saveAlertsToCache(cachedAlerts);
          return cachedAlerts;
        }
        throw error;
      }
    },
    refetchInterval: false, // No auto-refresh - keep initial display static
  });
}
