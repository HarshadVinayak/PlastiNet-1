-- Add location columns to activities for regional impact tracking
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS pincode TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create an index for faster regional aggregation
CREATE INDEX IF NOT EXISTS idx_activities_district ON public.activities(district);
CREATE INDEX IF NOT EXISTS idx_activities_pincode ON public.activities(pincode);
