-- =============================================================================
-- Migración: Tabla de Suscripciones + Pagos
-- Ejecutar en Supabase SQL Editor
-- =============================================================================

-- Tabla de suscripciones (conecta con Wompi)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'pro',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, failed, cancelled, expired
  reference TEXT NOT NULL UNIQUE,
  wompi_transaction_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'COP',
  payment_method_type TEXT,
  payment_method_name TEXT,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancel_requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas comunes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_reference ON subscriptions(reference);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- RLS: solo el dueño ve sus suscripciones
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (user_id = auth.uid());

-- Función para verificar si un usuario tiene plan activo
CREATE OR REPLACE FUNCTION has_active_plan(user_uuid UUID, required_plan TEXT DEFAULT 'pro')
RETURNS BOOLEAN AS $$
DECLARE
  active_plan TEXT;
BEGIN
  SELECT plan INTO active_plan
  FROM subscriptions
  WHERE user_id = user_uuid
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at DESC
  LIMIT 1;

  IF active_plan IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 'empresarial' incluye todo lo de 'pro'
  IF required_plan = 'pro' AND active_plan IN ('pro', 'empresarial') THEN
    RETURN TRUE;
  END IF;

  RETURN active_plan = required_plan;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
