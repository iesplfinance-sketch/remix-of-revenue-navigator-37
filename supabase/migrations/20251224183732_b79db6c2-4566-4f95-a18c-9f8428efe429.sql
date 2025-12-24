-- Create table to store simulation states
CREATE TABLE public.simulation_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  campuses JSONB NOT NULL,
  hostels JSONB NOT NULL,
  global_settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.simulation_states ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read saved simulations (public access)
CREATE POLICY "Anyone can view saved simulations"
ON public.simulation_states
FOR SELECT
USING (true);

-- Allow anyone to create simulations (public access for now)
CREATE POLICY "Anyone can create simulations"
ON public.simulation_states
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update simulations (public access for now)
CREATE POLICY "Anyone can update simulations"
ON public.simulation_states
FOR UPDATE
USING (true);

-- Allow anyone to delete simulations (public access for now)
CREATE POLICY "Anyone can delete simulations"
ON public.simulation_states
FOR DELETE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_simulation_states_updated_at
BEFORE UPDATE ON public.simulation_states
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();