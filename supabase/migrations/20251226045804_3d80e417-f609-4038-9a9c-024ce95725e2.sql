-- Create a cache table for peak multiplier data
CREATE TABLE public.peak_cache (
  contract TEXT PRIMARY KEY,
  entry_mcap NUMERIC,
  peak_mcap NUMERIC,
  peak_x TEXT,
  alert_timestamp TIMESTAMPTZ,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (public read for display, service role for updates)
ALTER TABLE public.peak_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cached peak data
CREATE POLICY "Anyone can read peak cache" 
ON public.peak_cache 
FOR SELECT 
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_peak_cache_updated ON public.peak_cache(last_updated);