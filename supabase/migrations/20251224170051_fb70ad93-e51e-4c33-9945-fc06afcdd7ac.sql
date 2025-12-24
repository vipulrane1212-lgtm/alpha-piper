-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL,
  tier INTEGER NOT NULL CHECK (tier >= 1 AND tier <= 3),
  market_cap TEXT,
  contract TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stats table for tracking overall statistics
CREATE TABLE public.stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_subscribers INTEGER NOT NULL DEFAULT 0,
  total_alerts INTEGER NOT NULL DEFAULT 0,
  tier1_alerts INTEGER NOT NULL DEFAULT 0,
  tier2_alerts INTEGER NOT NULL DEFAULT 0,
  tier3_alerts INTEGER NOT NULL DEFAULT 0,
  win_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (this is a public marketing site)
CREATE POLICY "Anyone can view alerts" 
ON public.alerts 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view stats" 
ON public.stats 
FOR SELECT 
USING (true);

-- Insert initial stats row
INSERT INTO public.stats (total_subscribers, total_alerts, tier1_alerts, tier2_alerts, tier3_alerts, win_rate)
VALUES (1250, 3420, 890, 1520, 1010, 68.5);

-- Insert some sample alerts
INSERT INTO public.alerts (token, tier, market_cap, contract) VALUES
('DOGE420', 1, '$75K', '7xKXmNp9sWeTHd3mP9'),
('MOONCAT', 2, '$120K', '9aRTxQw5sZpNq2'),
('SOLAPE', 1, '$45K', '4dFGhJk8sLnMq1'),
('PEPEKING', 3, '$200K', '2bNMqRs6pR4tKw'),
('BONKINU', 2, '$85K', '5cDEvFg9qS3wXy'),
('MEMESOL', 1, '$60K', '8fGHiJk2rT6vZa');