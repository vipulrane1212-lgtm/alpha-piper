/**
 * Signal name normalization and mapping
 * Handles inconsistent signal names from the API and maps them to display-friendly names
 */

// Signal name mapping: internal names -> display names
const SIGNAL_NAME_MAP: Record<string, string> = {
  // Internal names
  "glydo": "Glydo",
  "smart_money": "Smart Money",
  "sol_sb1": "Birdeye",
  "sol_sb_mb": "Birdeye",
  "kolscope": "KOLscope",
  "whalebuy": "Whalebuy",
  "large_buy": "Large Buy",
  "momentum_tracker": "Momentum",
  "solana_early_trending": "Early Trending",
  "spydefi": "SpyDefi",
  "pfbf_volume": "Volume",
  "volume": "Volume",
  
  // Display names from diagnostic report (already formatted, keep as-is)
  "Early trending": "Early Trending",
  "Early Trending": "Early Trending",
  "PFBF volume alert": "Volume",
  "Whale buy": "Whalebuy",
  "Whale Buy": "Whalebuy",
  "Momentum spike": "Momentum",
  "Momentum": "Momentum",
  
  // Handle variations with amounts
  "Large buy": "Large Buy",
  "Large Buy": "Large Buy",
};

/**
 * Normalize a single signal name to a display-friendly format
 */
export function normalizeSignalName(signal: string): string | null {
  if (!signal || typeof signal !== 'string') {
    return null;
  }

  // Trim whitespace
  signal = signal.trim();
  
  // Return null for empty strings
  if (signal.length === 0) {
    return null;
  }

  // Check if it's already in the map
  if (SIGNAL_NAME_MAP[signal]) {
    return SIGNAL_NAME_MAP[signal];
  }

  // Handle "Large buy: X SOL" format - extract just "Large Buy"
  if (signal.toLowerCase().startsWith('large buy')) {
    return "Large Buy";
  }

  // Handle "Large buy: X Sol" format (case variations)
  if (signal.toLowerCase().match(/^large buy:\s*\d+\.?\d*\s*sol/i)) {
    return "Large Buy";
  }
  
  // Handle "Early trending" variations
  if (signal.toLowerCase().includes('early trending') || signal.toLowerCase().includes('early trend')) {
    return "Early Trending";
  }
  
  // Handle "PFBF volume" variations
  if (signal.toLowerCase().includes('pfbf') || signal.toLowerCase().includes('volume alert')) {
    return "Volume";
  }
  
  // Handle "Momentum spike" variations
  if (signal.toLowerCase().includes('momentum')) {
    return "Momentum";
  }
  
  // Handle "Whale buy" variations
  if (signal.toLowerCase().includes('whale buy') || signal.toLowerCase().includes('whalebuy')) {
    return "Whalebuy";
  }

  // Handle other patterns with amounts
  if (signal.includes(':')) {
    const baseName = signal.split(':')[0].trim();
    if (SIGNAL_NAME_MAP[baseName]) {
      return SIGNAL_NAME_MAP[baseName];
    }
    // Capitalize first letter of each word
    return baseName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Convert snake_case to Title Case
  if (signal.includes('_')) {
    return signal
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Capitalize first letter of each word
  return signal
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Normalize and deduplicate an array of signal names
 */
export function normalizeSignals(signals: string[] | null | undefined): string[] {
  if (!signals || !Array.isArray(signals)) {
    return [];
  }

  // Normalize each signal
  const normalized = signals
    .map(signal => normalizeSignalName(signal))
    .filter((signal): signal is string => signal !== null && signal.length > 0); // Remove null and empty strings

  // Deduplicate while preserving order
  const seen = new Set<string>();
  const unique: string[] = [];
  
  for (const signal of normalized) {
    if (!seen.has(signal)) {
      seen.add(signal);
      unique.push(signal);
    }
  }

  return unique;
}

