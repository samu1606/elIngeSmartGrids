-- Migration: Create marketplace and quote service tables
-- Run this in Supabase Dashboard → SQL Editor
-- Date: 2026-07-02

-- ============================================
-- Servicio #2: Presupuesto + Cotización
-- ============================================

-- Materiales (catálogo global)
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    specs JSONB DEFAULT '{}',
    unit VARCHAR(20) DEFAULT 'unidad',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proveedores
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    company_name VARCHAR(255) NOT NULL,
    country_code VARCHAR(3) DEFAULT 'CO',
    ships_international BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cotizaciones de proveedores
CREATE TABLE IF NOT EXISTS public.supplier_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
    unit_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    stock_available INT DEFAULT 0,
    delivery_days INT DEFAULT 14,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Servicio #3: Marketplace de Técnicos
-- ============================================

-- Técnicos
CREATE TABLE IF NOT EXISTS public.technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    specialty VARCHAR(100),
    hourly_rate DECIMAL(10,2),
    experience_years INT,
    availability_status VARCHAR(20) DEFAULT 'available',
    rating DECIMAL(3,2) DEFAULT 0,
    total_jobs INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificaciones
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    number VARCHAR(100),
    country_code VARCHAR(3) DEFAULT 'CO',
    document_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trabajos/Solicitudes
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    technician_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'open',
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    lat DECIMAL(10,7),
    lng DECIMAL(10,7),
    address TEXT,
    scheduled_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Presupuestos (cotizaciones a clientes)
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    items JSONB DEFAULT '[]',
    pdf_url TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reseñas
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL,
    reviewee_id UUID NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Índices
-- ============================================
CREATE INDEX IF NOT EXISTS idx_technicians_user_id ON public.technicians(user_id);
CREATE INDEX IF NOT EXISTS idx_technicians_specialty ON public.technicians(specialty);
CREATE INDEX IF NOT EXISTS idx_certifications_technician_id ON public.certifications(technician_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_technician_id ON public.jobs(technician_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_quotes_job_id ON public.quotes(job_id);
CREATE INDEX IF NOT EXISTS idx_quotes_technician_id ON public.quotes(technician_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_quote_id ON public.supplier_quotes(quote_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_supplier_id ON public.supplier_quotes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_materials_category ON public.materials(category);
CREATE INDEX IF NOT EXISTS idx_reviews_job_id ON public.reviews(job_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id);

-- ============================================
-- RLS Policies (Row Level Security)
-- ============================================
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read technicians
CREATE POLICY "Anyone can view technicians" ON public.technicians FOR SELECT USING (true);
CREATE POLICY "Users can manage own technician profile" ON public.technicians FOR ALL USING (auth.uid() = user_id OR auth.uid() = verified_by);

-- Certifications
CREATE POLICY "Anyone can view certifications" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "Technicians can manage own certifications" ON public.certifications FOR ALL USING (
    EXISTS (SELECT 1 FROM public.technicians t WHERE t.id = technician_id AND t.user_id = auth.uid())
    OR verified_by = auth.uid()
);

-- Jobs
CREATE POLICY "Anyone can view jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Users can create own jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = technician_id);

-- Quotes
CREATE POLICY "Anyone can view quotes" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "Technicians can manage own quotes" ON public.quotes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.technicians t WHERE t.id = technician_id AND t.user_id = auth.uid())
);

-- Materials
CREATE POLICY "Anyone can view materials" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Authenticated can create materials" ON public.materials FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Suppliers
CREATE POLICY "Anyone can view suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Users can manage own supplier profile" ON public.suppliers FOR ALL USING (auth.uid() = user_id);

-- Reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);