-- ============================================================
-- Tabla: saved_calculations
-- Guarda cálculos de la calculadora vinculados a proyectos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    input_data JSONB NOT NULL DEFAULT '{}',
    result_data JSONB NOT NULL DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_saved_calc_project ON public.saved_calculations(project_id);
CREATE INDEX IF NOT EXISTS idx_saved_calc_user ON public.saved_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_calc_type ON public.saved_calculations(type);

-- RLS
ALTER TABLE public.saved_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_saved_calculations" ON public.saved_calculations
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Realtime (opcional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_calculations;
