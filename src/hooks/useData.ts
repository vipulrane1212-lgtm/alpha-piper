import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
}

export interface Alert {
  id: string;
  token: string;
  tier: number;
  level: string;
  timestamp: string;
  contract: string;
  score: number;
  liquidity: number;
  callers: number;
  subs: number;
  matchedSignals: string[];
  tags: string[];
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async (): Promise<Stats | null> => {
      const { data, error } = await supabase.functions.invoke("solboy-api", {
        body: null,
        method: "GET",
      });

      // Parse endpoint from URL workaround - use fetch directly
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/solboy-api?endpoint=stats`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Error fetching stats:", response.statusText);
        throw new Error(response.statusText);
      }

      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useAlerts(limit?: number, tier?: number) {
  return useQuery({
    queryKey: ["alerts", limit, tier],
    queryFn: async (): Promise<Alert[]> => {
      let url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/solboy-api?endpoint=alerts`;
      if (limit) url += `&limit=${limit}`;
      if (tier) url += `&tier=${tier}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Error fetching alerts:", response.statusText);
        throw new Error(response.statusText);
      }

      const data = await response.json();
      return data.alerts || [];
    },
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
  });
}
