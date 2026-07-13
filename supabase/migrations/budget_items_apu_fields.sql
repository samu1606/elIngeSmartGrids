-- ============================================================
-- Añadir columnas APU a budget_items
-- ElectriPro / elIngeSmartGrids
-- ============================================================

ALTER TABLE IF EXISTS budget_items
  ADD COLUMN IF NOT EXISTS apu_materiales DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS apu_mano_obra DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS apu_equipo DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS apu_transporte DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS apu_indirectos DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_from_apu BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tipo_item VARCHAR(50);
