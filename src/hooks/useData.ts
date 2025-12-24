import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Stats {
  id: string;
  total_subscribers: number;
  total_alerts: number;
  tier1_alerts: number;
  tier2_alerts: number;
  tier3_alerts: number;
  win_rate: number;
  updated_at: string;
}

export interface Alert {
  id: string;
  token: string;
  tier: number;
  market_cap: string | null;
  contract: string;
  created_at: string;
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async (): Promise<Stats | null> => {
      const { data, error } = await supabase
        .from("stats")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching stats:", error);
        throw error;
      }

      return data;
    },
  });
}

export function useAlerts(limit?: number) {
  return useQuery({
    queryKey: ["alerts", limit],
    queryFn: async (): Promise<Alert[]> => {
      let query = supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching alerts:", error);
        throw error;
      }

      return data || [];
    },
  });
}
