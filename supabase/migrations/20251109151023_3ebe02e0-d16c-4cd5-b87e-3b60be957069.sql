-- Create update_updated_at function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  supplier_id TEXT UNIQUE NOT NULL,
  url_pattern TEXT NOT NULL,
  
  -- Login configuration
  login_url TEXT,
  username_field_selector TEXT,
  password_field_selector TEXT,
  username_value TEXT,
  password_value TEXT,
  user_agent TEXT,
  session_cookie TEXT,
  auto_login_enabled BOOLEAN DEFAULT true,
  use_session_cookies BOOLEAN DEFAULT false,
  
  -- Product selectors (stored as JSONB for flexibility)
  product_selectors JSONB DEFAULT '{}'::jsonb,
  
  -- Testing
  test_url TEXT,
  css_selector_product_link TEXT,
  
  -- Metadata
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view suppliers
CREATE POLICY "Authenticated users can view suppliers"
ON public.suppliers
FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert suppliers
CREATE POLICY "Admins can insert suppliers"
ON public.suppliers
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update suppliers
CREATE POLICY "Admins can update suppliers"
ON public.suppliers
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete suppliers
CREATE POLICY "Admins can delete suppliers"
ON public.suppliers
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster lookups
CREATE INDEX idx_suppliers_supplier_id ON public.suppliers(supplier_id);
CREATE INDEX idx_suppliers_active ON public.suppliers(active);

-- Create updated_at trigger
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();