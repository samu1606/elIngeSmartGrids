-- ============================================================
-- Motor de APUs (Análisis de Precios Unitarios)
-- ElectriPro / elIngeSmartGrids
-- ============================================================

-- 1. TABLA: Insumos (materiales, equipos, transporte, mano de obra)
-- ============================================================
CREATE TABLE IF NOT EXISTS insumos (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  descripcion   TEXT NOT NULL,
  unidad        VARCHAR(50) NOT NULL,              -- ej: m, kg, und, hora, gal, viaje
  tipo          VARCHAR(50) NOT NULL CHECK (tipo IN ('equipo', 'material', 'transporte', 'mano_obra')),
  precio_unitario DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda rápida por tipo + descripción
CREATE INDEX IF NOT EXISTS idx_insumos_tipo ON insumos (tipo);
CREATE INDEX IF NOT EXISTS idx_insumos_descripcion ON insumos USING gin (to_tsvector('spanish', descripcion));

-- RLS: lectura pública para auth users, escritura solo authenticated
ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insumos: lectura usuarios autenticados"
  ON insumos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Insumos: inserción usuarios autenticados"
  ON insumos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Insumos: actualización usuarios autenticados"
  ON insumos FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Insumos: eliminación usuarios autenticados"
  ON insumos FOR DELETE
  USING (auth.role() = 'authenticated');

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_insumos
  BEFORE UPDATE ON insumos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 2. TABLA: APUs (Análisis de Precios Unitarios)
-- ============================================================
CREATE TABLE IF NOT EXISTS apus (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  codigo        VARCHAR(50) NOT NULL UNIQUE,        -- ej: APU-001, APU-INST-RESID
  descripcion   TEXT NOT NULL,
  unidad        VARCHAR(50) NOT NULL,               -- ej: und, m, m², ml, punto
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apus_codigo ON apus (codigo);
CREATE INDEX IF NOT EXISTS idx_apus_descripcion ON apus USING gin (to_tsvector('spanish', descripcion));

ALTER TABLE apus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "APUs: lectura usuarios autenticados"
  ON apus FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "APUs: inserción usuarios autenticados"
  ON apus FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "APUs: actualización usuarios autenticados"
  ON apus FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "APUs: eliminación usuarios autenticados"
  ON apus FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE TRIGGER set_timestamp_apus
  BEFORE UPDATE ON apus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 3. TABLA: Detalle_APU (relación APU ↔ Insumos con rendimiento)
-- ============================================================
CREATE TABLE IF NOT EXISTS detalle_apu (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  apu_id              BIGINT NOT NULL REFERENCES apus(id) ON DELETE CASCADE,
  insumo_id           BIGINT NOT NULL REFERENCES insumos(id) ON DELETE RESTRICT,
  cantidad_rendimiento DECIMAL(15,6) NOT NULL DEFAULT 1,  -- cuántas unidades del insumo se necesitan por unidad de APU
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  -- Un mismo insumo no debe aparecer duplicado en un mismo APU
  UNIQUE (apu_id, insumo_id)
);

CREATE INDEX IF NOT EXISTS idx_detalle_apu_apu_id ON detalle_apu (apu_id);
CREATE INDEX IF NOT EXISTS idx_detalle_apu_insumo_id ON detalle_apu (insumo_id);

ALTER TABLE detalle_apu ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Detalle_APU: lectura usuarios autenticados"
  ON detalle_apu FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Detalle_APU: inserción usuarios autenticados"
  ON detalle_apu FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Detalle_APU: actualización usuarios autenticados"
  ON detalle_apu FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Detalle_APU: eliminación usuarios autenticados"
  ON detalle_apu FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE TRIGGER set_timestamp_detalle_apu
  BEFORE UPDATE ON detalle_apu
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- VISTA: Resumen de APU con costo total calculado
-- ============================================================
CREATE OR REPLACE VIEW apu_costo_total AS
SELECT
  a.id AS apu_id,
  a.codigo,
  a.descripcion,
  a.unidad,
  COUNT(da.id) AS total_insumos,
  COALESCE(SUM(da.cantidad_rendimiento * i.precio_unitario), 0) AS costo_total
FROM apus a
LEFT JOIN detalle_apu da ON da.apu_id = a.id
LEFT JOIN insumos i ON i.id = da.insumo_id
GROUP BY a.id, a.codigo, a.descripcion, a.unidad;


-- ============================================================
-- DATOS SEMILLA: Insumos comunes en instalaciones eléctricas
-- ============================================================
INSERT INTO insumos (descripcion, unidad, tipo, precio_unitario) VALUES
  -- Materiales
  ('Cable THHN/THWN 12 AWG', 'm', 'material', 3500),
  ('Cable THHN/THWN 10 AWG', 'm', 'material', 5200),
  ('Cable THHN/THWN 8 AWG', 'm', 'material', 8500),
  ('Tubo conduit EMT 3/4"', 'm', 'material', 12000),
  ('Tubo conduit EMT 1"', 'm', 'material', 16500),
  ('Caja rectangular 2x4', 'und', 'material', 4500),
  ('Tomacorriente doble polarizado 15A', 'und', 'material', 8500),
  ('Interruptor sencillo 15A', 'und', 'material', 7200),
  ('Breaker enchufable 1x15A', 'und', 'material', 18500),
  ('Breaker enchufable 1x20A', 'und', 'material', 19500),
  ('Tablero distribución 12 circuitos', 'und', 'material', 185000),
  ('Tablero distribución 24 circuitos', 'und', 'material', 320000),
  ('Cinta aislante 3M 33+', 'und', 'material', 12500),
  ('Conector EMT 3/4"', 'und', 'material', 1800),
  ('Conector EMT 1"', 'und', 'material', 2500),
  ('Varilla copperweld 5/8"x2.40m', 'und', 'material', 65000),
  ('Cable desnudo cobre #6 AWG', 'm', 'material', 7800),
  ('Gabinete para medidor monofásico', 'und', 'material', 95000),
  ('Tubo PVC conduit 1"', 'm', 'material', 8500),
  ('Curva PVC 1"', 'und', 'material', 6500),
  -- Equipos
  ('Taladro percutor 1/2"', 'día', 'equipo', 45000),
  ('Dobladora conduit manual 3/4"', 'día', 'equipo', 25000),
  ('Multímetro digital', 'día', 'equipo', 15000),
  ('Andamio certificado (alquiler)', 'día', 'equipo', 35000),
  ('Escalera fibra de vidrio 10\'', 'día', 'equipo', 18000),
  -- Transporte
  ('Transporte de materiales (urbano)', 'viaje', 'transporte', 45000),
  ('Flete intermunicipal', 'km', 'transporte', 2800),
  -- Mano de obra
  ('Técnico electricista certificado', 'hora', 'mano_obra', 22000),
  ('Ayudante técnico', 'hora', 'mano_obra', 14000),
  ('Ingeniero electricista (supervisión)', 'hora', 'mano_obra', 45000)
ON CONFLICT DO NOTHING;


-- ============================================================
-- DATOS SEMILLA: APUs de ejemplo para instalaciones eléctricas
-- ============================================================
INSERT INTO apus (codigo, descripcion, unidad) VALUES
  ('APU-INST-001', 'Instalación de tomacorriente doble polarizado 15A (incluye cableado)', 'und'),
  ('APU-INST-002', 'Instalación de punto de iluminación con interruptor sencillo', 'punto'),
  ('APU-INST-003', 'Instalación tablero de distribución 12 circuitos', 'und'),
  ('APU-INST-004', 'Instalación sistema de puesta a tierra (varilla + cable)', 'und'),
  ('APU-INST-005', 'Tendido de tubería conduit EMT 3/4" por placa (incluye conectores)', 'm'),
  ('APU-INST-006', 'Instalación de acometida monofásica con medidor', 'und')
ON CONFLICT (codigo) DO NOTHING;


-- ============================================================
-- DATOS SEMILLA: Detalle de APU (relaciones con rendimientos)
-- ============================================================
-- APU-001: Tomacorriente doble
INSERT INTO detalle_apu (apu_id, insumo_id, cantidad_rendimiento)
SELECT a.id, i.id, cant FROM apus a CROSS JOIN LATERAL (
  VALUES
    ('Cable THHN/THWN 12 AWG'::text, 6.0),        -- 6m de cable por tomacorriente
    ('Caja rectangular 2x4'::text, 1.0),
    ('Tomacorriente doble polarizado 15A'::text, 1.0),
    ('Cinta aislante 3M 33+'::text, 0.05),         -- 5% de rollo
    ('Técnico electricista certificado'::text, 0.75), -- 45 min
    ('Ayudante técnico'::text, 0.5)                 -- 30 min
) AS t(insumo_desc, cant)
JOIN insumos i ON i.descripcion = t.insumo_desc
WHERE a.codigo = 'APU-INST-001'
ON CONFLICT (apu_id, insumo_id) DO NOTHING;

-- APU-002: Punto de iluminación + interruptor
INSERT INTO detalle_apu (apu_id, insumo_id, cantidad_rendimiento)
SELECT a.id, i.id, cant FROM apus a CROSS JOIN LATERAL (
  VALUES
    ('Cable THHN/THWN 12 AWG'::text, 8.0),         -- alimentación + retorno + neutro
    ('Caja rectangular 2x4'::text, 2.0),
    ('Interruptor sencillo 15A'::text, 1.0),
    ('Cinta aislante 3M 33+'::text, 0.05),
    ('Técnico electricista certificado'::text, 1.0),
    ('Ayudante técnico'::text, 0.75)
) AS t(insumo_desc, cant)
JOIN insumos i ON i.descripcion = t.insumo_desc
WHERE a.codigo = 'APU-INST-002'
ON CONFLICT (apu_id, insumo_id) DO NOTHING;

-- APU-003: Tablero 12 circuitos
INSERT INTO detalle_apu (apu_id, insumo_id, cantidad_rendimiento)
SELECT a.id, i.id, cant FROM apus a CROSS JOIN LATERAL (
  VALUES
    ('Tablero distribución 12 circuitos'::text, 1.0),
    ('Breaker enchufable 1x15A'::text, 4.0),
    ('Breaker enchufable 1x20A'::text, 2.0),
    ('Cable THHN/THWN 8 AWG'::text, 3.0),
    ('Cinta aislante 3M 33+'::text, 0.1),
    ('Técnico electricista certificado'::text, 3.0),
    ('Ayudante técnico'::text, 2.0),
    ('Ingeniero electricista (supervisión)'::text, 0.5)
) AS t(insumo_desc, cant)
JOIN insumos i ON i.descripcion = t.insumo_desc
WHERE a.codigo = 'APU-INST-003'
ON CONFLICT (apu_id, insumo_id) DO NOTHING;

-- APU-004: Puesta a tierra
INSERT INTO detalle_apu (apu_id, insumo_id, cantidad_rendimiento)
SELECT a.id, i.id, cant FROM apus a CROSS JOIN LATERAL (
  VALUES
    ('Varilla copperweld 5/8"x2.40m'::text, 1.0),
    ('Cable desnudo cobre #6 AWG'::text, 5.0),
    ('Técnico electricista certificado'::text, 2.0),
    ('Ayudante técnico'::text, 1.0)
) AS t(insumo_desc, cant)
JOIN insumos i ON i.descripcion = t.insumo_desc
WHERE a.codigo = 'APU-INST-004'
ON CONFLICT (apu_id, insumo_id) DO NOTHING;

-- APU-005: Tubería EMT 3/4" por metro
INSERT INTO detalle_apu (apu_id, insumo_id, cantidad_rendimiento)
SELECT a.id, i.id, cant FROM apus a CROSS JOIN LATERAL (
  VALUES
    ('Tubo conduit EMT 3/4"'::text, 1.0),
    ('Conector EMT 3/4"'::text, 0.333),            -- 1 conector cada 3m
    ('Técnico electricista certificado'::text, 0.3),
    ('Ayudante técnico'::text, 0.2)
) AS t(insumo_desc, cant)
JOIN insumos i ON i.descripcion = t.insumo_desc
WHERE a.codigo = 'APU-INST-005'
ON CONFLICT (apu_id, insumo_id) DO NOTHING;

-- APU-006: Acometida monofásica con medidor
INSERT INTO detalle_apu (apu_id, insumo_id, cantidad_rendimiento)
SELECT a.id, i.id, cant FROM apus a CROSS JOIN LATERAL (
  VALUES
    ('Gabinete para medidor monofásico'::text, 1.0),
    ('Cable THHN/THWN 8 AWG'::text, 8.0),
    ('Tubo conduit EMT 1"'::text, 2.0),
    ('Conector EMT 1"'::text, 1.0),
    ('Breaker enchufable 1x20A'::text, 1.0),
    ('Cinta aislante 3M 33+'::text, 0.1),
    ('Técnico electricista certificado'::text, 2.5),
    ('Ayudante técnico'::text, 2.0),
    ('Ingeniero electricista (supervisión)'::text, 0.5),
    ('Transporte de materiales (urbano)'::text, 1.0)
) AS t(insumo_desc, cant)
JOIN insumos i ON i.descripcion = t.insumo_desc
WHERE a.codigo = 'APU-INST-006'
ON CONFLICT (apu_id, insumo_id) DO NOTHING;
