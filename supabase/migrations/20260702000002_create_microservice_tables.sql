-- Migration: Create tables for quote-service and marketplace-service
-- Date: 2026-07-02
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- or via: supabase db push

-- ============================================================================
-- TECHNICIANS (marketplace-service)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    specialty TEXT NOT NULL,
    hourly_rate NUMERIC DEFAULT 0,
    experience_years INT DEFAULT 0,
    availability_status TEXT DEFAULT 'available',
    rating NUMERIC DEFAULT 0,
    total_jobs INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- CERTIFICATIONS (marketplace-service)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    number TEXT,
    country_code TEXT DEFAULT 'MX',
    document_url TEXT,
    status TEXT DEFAULT 'pending',
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- MATERIALS (quote-service)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    brand TEXT,
    model TEXT,
    specs JSONB DEFAULT '{}'::jsonb,
    unit TEXT DEFAULT 'unit',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SUPPLIERS (quote-service)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    country_code TEXT DEFAULT 'MX',
    ships_international BOOLEAN DEFAULT false,
    rating NUMERIC DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- JOBS (marketplace-service)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    technician_id UUID REFERENCES public.technicians(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT DEFAULT 'open',
    budget_min NUMERIC DEFAULT 0,
    budget_max NUMERIC DEFAULT 0,
    lat NUMERIC,
    lng NUMERIC,
    address TEXT,
    scheduled_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- QUOTES (quote-service)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    technician_id UUID REFERENCES public.technicians(id) ON DELETE SET NULL,
    total_amount NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    items JSONB DEFAULT '[]'::jsonb,
    pdf_url TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SUPPLIER QUOTES (quote-service)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.supplier_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    material_id UUID REFERENCES public.materials(id) ON DELETE SET NULL,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    stock_available INT DEFAULT 0,
    delivery_days INT DEFAULT 7,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- REVIEWS (marketplace-service)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "technicians_read" ON public.technicians FOR SELECT USING (true);
CREATE POLICY "certifications_read" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "materials_read" ON public.materials FOR SELECT USING (true);
CREATE POLICY "suppliers_read" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "jobs_read" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "quotes_read" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "supplier_quotes_read" ON public.supplier_quotes FOR SELECT USING (true);
CREATE POLICY "reviews_read" ON public.reviews FOR SELECT USING (true);

-- Authenticated insert/update/delete policies
CREATE POLICY "technicians_write" ON public.technicians
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "certifications_write" ON public.certifications
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "materials_write" ON public.materials
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "suppliers_write" ON public.suppliers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "jobs_write" ON public.jobs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "quotes_write" ON public.quotes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "supplier_quotes_write" ON public.supplier_quotes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "reviews_write" ON public.reviews
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_technicians_specialty ON public.technicians(specialty);
CREATE INDEX IF NOT EXISTS idx_technicians_rating ON public.technicians(rating DESC);
CREATE INDEX IF NOT EXISTS idx_technicians_verified ON public.technicians(is_verified);
CREATE INDEX IF NOT EXISTS idx_certifications_technician ON public.certifications(technician_id);
CREATE INDEX IF NOT EXISTS idx_materials_category ON public.materials(category);
CREATE INDEX IF NOT EXISTS idx_suppliers_verified ON public.suppliers(is_verified);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category);
CREATE INDEX IF NOT EXISTS idx_quotes_job ON public.quotes(job_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_quote ON public.supplier_quotes(quote_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_supplier ON public.supplier_quotes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_reviews_job ON public.reviews(job_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id);

-- ============================================================================
-- REALTIME (optional - enable for real-time updates)
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.technicians;
ALTER PUBLICATION supabase_realtime ADD TABLE public.certifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.materials;
ALTER PUBLICATION supabase_realtime ADD TABLE public.suppliers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.supplier_quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;