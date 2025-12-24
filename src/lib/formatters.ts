import { formatDistanceToNow } from "date-fns";

export function formatTimeAgo(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

export function formatMarketCap(value: string | null): string {
  return value || "N/A";
}

export function truncateContract(contract: string, length: number = 8): string {
  if (contract.length <= length * 2) return contract;
  return `${contract.slice(0, length)}...${contract.slice(-4)}`;
}
