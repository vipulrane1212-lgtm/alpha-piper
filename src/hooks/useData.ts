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

export function useAlerts(limit?: number, tier?: number) {
  return useQuery({
    queryKey: ["alerts", limit, tier],
    queryFn: async (): Promise<Alert[]> => {
      let url = `${SUPABASE_URL}/functions/v1/solboy-api?endpoint=alerts`;
      if (limit) url += `&limit=${limit}`;
      if (tier) url += `&tier=${tier}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        console.error("Error fetching alerts:", response.statusText);
        throw new Error(response.statusText);
      }

      const data = await response.json();
      const alerts = data.alerts || [];
      
      // Debug logging (only in development)
      if (process.env.NODE_ENV === 'development' && alerts.length > 0) {
        console.log('[useAlerts] First alert from API:', alerts[0]);
        console.log('[useAlerts] matchedSignals:', alerts[0].matchedSignals);
      }
      
      return alerts;
    },
    refetchInterval: false, // No auto-refresh - keep initial display static
  });
}
