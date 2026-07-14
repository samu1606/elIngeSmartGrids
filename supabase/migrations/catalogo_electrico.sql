-- ============================================================
-- Migración: Catálogo de Materiales de Ingeniería Eléctrica
-- ElectriPro / elIngeSmartGrids
-- ============================================================
-- 1. Añade columna categoria y un constraint único en descripcion
-- 2. Inserta (upsert) el catálogo completo con precio_unitario = 0
-- ⚠️  El precio_unitario no se sobreescribe en redeploys (DO NOTHING
--    en los campos de precio; solo se actualizan metadatos).
-- ============================================================

-- Fase 1: Schema (si no existen)
ALTER TABLE insumos ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);
ALTER TABLE insumos ADD COLUMN IF NOT EXISTS descripcion_tecnica TEXT;

-- Unique constraint para upsert por nombre
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'insumos_descripcion_tipo_key' AND conrelid = 'insumos'::regclass
  ) THEN
    ALTER TABLE insumos ADD CONSTRAINT insumos_descripcion_tipo_key UNIQUE (descripcion, tipo);
  END IF;
END $$;


-- ============================================================
-- Fase 2: UPSERT del catálogo completo
-- ============================================================

-- >>> 1. BREAKERS ENCHUFABLES 1P <<<
INSERT INTO insumos (descripcion, unidad, tipo, categoria, descripcion_tecnica, precio_unitario)
VALUES
  ('Breaker Enchufable 1P - 15A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (monofásico, 1 polo, 120V/240V). Diseñado para la protección contra sobrecargas y cortocircuitos en circuitos ramales de alumbrado, tomacorrientes generales y cargas menores en tableros residenciales y comerciales.', 0),
  ('Breaker Enchufable 1P - 20A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (monofásico, 1 polo, 120V/240V). Diseñado para la protección contra sobrecargas y cortocircuitos en circuitos ramales de alumbrado, tomacorrientes generales y cargas menores en tableros residenciales y comerciales.', 0),
  ('Breaker Enchufable 1P - 30A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (monofásico, 1 polo, 120V/240V). Diseñado para la protección contra sobrecargas y cortocircuitos en circuitos ramales de alumbrado, tomacorrientes generales y cargas menores en tableros residenciales y comerciales.', 0),
  ('Breaker Enchufable 1P - 40A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (monofásico, 1 polo, 120V/240V). Diseñado para la protección contra sobrecargas y cortocircuitos en circuitos ramales de alumbrado, tomacorrientes generales y cargas menores en tableros residenciales y comerciales.', 0),
  ('Breaker Enchufable 1P - 50A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (monofásico, 1 polo, 120V/240V). Diseñado para la protección contra sobrecargas y cortocircuitos en circuitos ramales de alumbrado, tomacorrientes generales y cargas menores en tableros residenciales y comerciales.', 0)
ON CONFLICT (descripcion, tipo) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  unidad = EXCLUDED.unidad,
  descripcion_tecnica = EXCLUDED.descripcion_tecnica;


-- >>> 2. BREAKERS ENCHUFABLES 2P <<<
INSERT INTO insumos (descripcion, unidad, tipo, categoria, descripcion_tecnica, precio_unitario)
VALUES
  ('Breaker Enchufable 2P - 20A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (bifásico, 2 polos, 240V). Utilizado para la protección de circuitos de fuerza bifásicos como calentadores de agua, unidades de aire acondicionado, cocinas eléctricas y subalimentadores de tableros secundarios.', 0),
  ('Breaker Enchufable 2P - 30A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (bifásico, 2 polos, 240V). Utilizado para la protección de circuitos de fuerza bifásicos como calentadores de agua, unidades de aire acondicionado, cocinas eléctricas y subalimentadores de tableros secundarios.', 0),
  ('Breaker Enchufable 2P - 40A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (bifásico, 2 polos, 240V). Utilizado para la protección de circuitos de fuerza bifásicos como calentadores de agua, unidades de aire acondicionado, cocinas eléctricas y subalimentadores de tableros secundarios.', 0),
  ('Breaker Enchufable 2P - 50A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (bifásico, 2 polos, 240V). Utilizado para la protección de circuitos de fuerza bifásicos como calentadores de agua, unidades de aire acondicionado, cocinas eléctricas y subalimentadores de tableros secundarios.', 0),
  ('Breaker Enchufable 2P - 60A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (bifásico, 2 polos, 240V). Utilizado para la protección de circuitos de fuerza bifásicos como calentadores de agua, unidades de aire acondicionado, cocinas eléctricas y subalimentadores de tableros secundarios.', 0),
  ('Breaker Enchufable 2P - 70A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (bifásico, 2 polos, 240V). Utilizado para la protección de circuitos de fuerza bifásicos como calentadores de agua, unidades de aire acondicionado, cocinas eléctricas y subalimentadores de tableros secundarios.', 0),
  ('Breaker Enchufable 2P - 80A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (bifásico, 2 polos, 240V). Utilizado para la protección de circuitos de fuerza bifásicos como calentadores de agua, unidades de aire acondicionado, cocinas eléctricas y subalimentadores de tableros secundarios.', 0),
  ('Breaker Enchufable 2P - 100A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (bifásico, 2 polos, 240V). Utilizado para la protección de circuitos de fuerza bifásicos como calentadores de agua, unidades de aire acondicionado, cocinas eléctricas y subalimentadores de tableros secundarios.', 0)
ON CONFLICT (descripcion, tipo) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  unidad = EXCLUDED.unidad,
  descripcion_tecnica = EXCLUDED.descripcion_tecnica;


-- >>> 3. BREAKERS ENCHUFABLES 3P <<<
INSERT INTO insumos (descripcion, unidad, tipo, categoria, descripcion_tecnica, precio_unitario)
VALUES
  ('Breaker Enchufable 3P - 20A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (trifásico, 3 polos, 208V/240V). Diseñado para circuitos de fuerza trifásicos, motores eléctricos industriales, maquinaria pesada y tableros generales de distribución de pequeña escala.', 0),
  ('Breaker Enchufable 3P - 30A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (trifásico, 3 polos, 208V/240V). Diseñado para circuitos de fuerza trifásicos, motores eléctricos industriales, maquinaria pesada y tableros generales de distribución de pequeña escala.', 0),
  ('Breaker Enchufable 3P - 40A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (trifásico, 3 polos, 208V/240V). Diseñado para circuitos de fuerza trifásicos, motores eléctricos industriales, maquinaria pesada y tableros generales de distribución de pequeña escala.', 0),
  ('Breaker Enchufable 3P - 50A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (trifásico, 3 polos, 208V/240V). Diseñado para circuitos de fuerza trifásicos, motores eléctricos industriales, maquinaria pesada y tableros generales de distribución de pequeña escala.', 0),
  ('Breaker Enchufable 3P - 60A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (trifásico, 3 polos, 208V/240V). Diseñado para circuitos de fuerza trifásicos, motores eléctricos industriales, maquinaria pesada y tableros generales de distribución de pequeña escala.', 0),
  ('Breaker Enchufable 3P - 70A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (trifásico, 3 polos, 208V/240V). Diseñado para circuitos de fuerza trifásicos, motores eléctricos industriales, maquinaria pesada y tableros generales de distribución de pequeña escala.', 0),
  ('Breaker Enchufable 3P - 80A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (trifásico, 3 polos, 208V/240V). Diseñado para circuitos de fuerza trifásicos, motores eléctricos industriales, maquinaria pesada y tableros generales de distribución de pequeña escala.', 0),
  ('Breaker Enchufable 3P - 100A', 'und', 'material', 'Breakers Enchufables',
   'Interruptor termomagnético de incrustar tipo enchufable (trifásico, 3 polos, 208V/240V). Diseñado para circuitos de fuerza trifásicos, motores eléctricos industriales, maquinaria pesada y tableros generales de distribución de pequeña escala.', 0)
ON CONFLICT (descripcion, tipo) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  unidad = EXCLUDED.unidad,
  descripcion_tecnica = EXCLUDED.descripcion_tecnica;


-- >>> 4. BREAKERS INDUSTRIALES TOTALIZADORES MCCB 3P <<<
INSERT INTO insumos (descripcion, unidad, tipo, categoria, descripcion_tecnica, precio_unitario)
VALUES
  ('Breaker MCCB Industrial 3P - 100A', 'und', 'material', 'Breakers Industriales MCCB',
   'Interruptor automático industrial totalizador en caja moldeada (3 polos, 600V). Con unidad de disparo térmico y magnético para la protección general de acometidas eléctricas de media y gran escala, tableros generales de distribución (TGD) y subestaciones.', 0),
  ('Breaker MCCB Industrial 3P - 125A', 'und', 'material', 'Breakers Industriales MCCB',
   'Interruptor automático industrial totalizador en caja moldeada (3 polos, 600V). Con unidad de disparo térmico y magnético para la protección general de acometidas eléctricas de media y gran escala, tableros generales de distribución (TGD) y subestaciones.', 0),
  ('Breaker MCCB Industrial 3P - 150A', 'und', 'material', 'Breakers Industriales MCCB',
   'Interruptor automático industrial totalizador en caja moldeada (3 polos, 600V). Con unidad de disparo térmico y magnético para la protección general de acometidas eléctricas de media y gran escala, tableros generales de distribución (TGD) y subestaciones.', 0),
  ('Breaker MCCB Industrial 3P - 175A', 'und', 'material', 'Breakers Industriales MCCB',
   'Interruptor automático industrial totalizador en caja moldeada (3 polos, 600V). Con unidad de disparo térmico y magnético para la protección general de acometidas eléctricas de media y gran escala, tableros generales de distribución (TGD) y subestaciones.', 0),
  ('Breaker MCCB Industrial 3P - 200A', 'und', 'material', 'Breakers Industriales MCCB',
   'Interruptor automático industrial totalizador en caja moldeada (3 polos, 600V). Con unidad de disparo térmico y magnético para la protección general de acometidas eléctricas de media y gran escala, tableros generales de distribución (TGD) y subestaciones.', 0),
  ('Breaker MCCB Industrial 3P - 250A', 'und', 'material', 'Breakers Industriales MCCB',
   'Interruptor automático industrial totalizador en caja moldeada (3 polos, 600V). Con unidad de disparo térmico y magnético para la protección general de acometidas eléctricas de media y gran escala, tableros generales de distribución (TGD) y subestaciones.', 0)
ON CONFLICT (descripcion, tipo) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  unidad = EXCLUDED.unidad,
  descripcion_tecnica = EXCLUDED.descripcion_tecnica;


-- >>> 5. CAJAS METÁLICAS <<<
INSERT INTO insumos (descripcion, unidad, tipo, categoria, descripcion_tecnica, precio_unitario)
VALUES
  ('Caja Metálica Galvanizada 2x4 Tipo Pesada', 'und', 'material', 'Cajas Metálicas',
   'Caja rectangular de lámina de acero galvanizado pesado con perforaciones removibles (knockouts). Ideal para incrustar interruptores, tomacorrientes y salidas de señalización en muros.', 0),
  ('Caja Metálica Galvanizada 4x4 Tipo Pesada', 'und', 'material', 'Cajas Metálicas',
   'Caja cuadrada de lámina de acero galvanizado pesado. Utilizada para salidas de fuerza, empalmes intermedios de cableado y montaje de plafones o luminarias de pared.', 0),
  ('Caja Metálica Galvanizada Octogonal', 'und', 'material', 'Cajas Metálicas',
   'Caja octogonal de lámina de acero galvanizado pesado. Diseñada específicamente para salidas de iluminación en losas de concreto o cielorrasos y soporte físico de luminarias.', 0),
  ('Caja de Paso Metálica 10x10 cm Doble Fondo', 'und', 'material', 'Cajas Metálicas de Paso',
   'Caja de paso fabricada en lámina metálica de alta resistencia con doble fondo de protección y tapa con tornillos. Diseñada para alojar empalmes, borneras o derivaciones eléctricas en interiores.', 0),
  ('Caja de Paso Metálica 15x15x10 cm Doble Fondo', 'und', 'material', 'Cajas Metálicas de Paso',
   'Caja metálica de paso sobredimensionada con sistema de doble fondo. Utilizada en instalaciones comerciales e industriales para la organización física de alimentadores y derivaciones múltiples.', 0),
  ('Caja de Paso Metálica 20x20x10 cm Doble Fondo', 'und', 'material', 'Cajas Metálicas de Paso',
   'Caja metálica de paso sobredimensionada con sistema de doble fondo. Utilizada en instalaciones comerciales e industriales para la organización física de alimentadores y derivaciones múltiples.', 0)
ON CONFLICT (descripcion, tipo) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  unidad = EXCLUDED.unidad,
  descripcion_tecnica = EXCLUDED.descripcion_tecnica;


-- >>> 6. CAJAS PLÁSTICAS <<<
INSERT INTO insumos (descripcion, unidad, tipo, categoria, descripcion_tecnica, precio_unitario)
VALUES
  ('Caja Plástica PVC 2x4', 'und', 'material', 'Cajas Plásticas',
   'Caja rectangular fabricada en PVC de alta resistencia al impacto y autoextinguible. Utilizada para el montaje de aparatos eléctricos (tomas e interruptores) embebidos en mampostería o tabiquería liviana (Drywall).', 0),
  ('Caja Plástica PVC 4x4', 'und', 'material', 'Cajas Plásticas',
   'Caja cuadrada fabricada en plástico PVC autoextinguible. Diseñada para empalmes de cables y derivaciones conduit en redes de distribución embebidas.', 0),
  ('Caja de Paso Plástica PVC 10x10x8 cm', 'und', 'material', 'Cajas Plásticas de Paso',
   'Caja de paso plástica de empotrar o sobreponer. Ideal para derivaciones de baja tensión en ambientes húmedos o expuestos a corrosión química ligera.', 0),
  ('Caja de Paso Plástica PVC 15x15x10 cm', 'und', 'material', 'Cajas Plásticas de Paso',
   'Caja de paso plástica de empotrar o sobreponer. Ideal para derivaciones de baja tensión en ambientes húmedos o expuestos a corrosión química ligera.', 0),
  ('Caja Hermética Plástica IP65 Intemperie', 'und', 'material', 'Cajas Plásticas Herméticas',
   'Caja hermética fabricada en policarbonato o ABS de alta resistencia con empaque de caucho y tornillos de ajuste rápido. Clasificación IP65 para protección total contra polvo y chorros de agua a presión en exteriores o zonas de lavado.', 0)
ON CONFLICT (descripcion, tipo) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  unidad = EXCLUDED.unidad,
  descripcion_tecnica = EXCLUDED.descripcion_tecnica;


-- >>> 7. TUBERÍA CONDUIT PVC <<<
INSERT INTO insumos (descripcion, unidad, tipo, categoria, descripcion_tecnica, precio_unitario)
VALUES
  ('Tubería Conduit PVC 1/2 pulg', 'tubo_3m', 'material', 'Tubería Conduit PVC',
   'Tubo rígido de PVC liso autoextinguible para canalizaciones eléctricas. Adecuado para instalaciones embebidas en losas de concreto, muros de mampostería o tabiquería seca.', 0),
  ('Tubería Conduit PVC 3/4 pulg', 'tubo_3m', 'material', 'Tubería Conduit PVC',
   'Tubo rígido de PVC liso autoextinguible para canalizaciones eléctricas. Adecuado para instalaciones embebidas en losas de concreto, muros de mampostería o tabiquería seca.', 0),
  ('Tubería Conduit PVC 1 pulg', 'tubo_3m', 'material', 'Tubería Conduit PVC',
   'Tubo rígido de PVC liso autoextinguible para canalizaciones eléctricas. Adecuado para instalaciones embebidas en losas de concreto, muros de mampostería o tabiquería seca.', 0),
  ('Tubería Conduit PVC 1-1/2 pulg', 'tubo_3m', 'material', 'Tubería Conduit PVC',
   'Tubo rígido de PVC liso autoextinguible para canalizaciones eléctricas. Adecuado para instalaciones embebidas en losas de concreto, muros de mampostería o tabiquería seca.', 0),
  ('Tubería Conduit PVC 2 pulg', 'tubo_3m', 'material', 'Tubería Conduit PVC',
   'Tubo rígido de PVC liso autoextinguible para canalizaciones eléctricas. Adecuado para instalaciones embebidas en losas de concreto, muros de mampostería o tabiquería seca.', 0)
ON CONFLICT (descripcion, tipo) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  unidad = EXCLUDED.unidad,
  descripcion_tecnica = EXCLUDED.descripcion_tecnica;


-- >>> 8. TUBERÍA CONDUIT PVC SCH 40 <<<
INSERT INTO insumos (descripcion, unidad, tipo, categoria, descripcion_tecnica, precio_unitario)
VALUES
  ('Tubería Conduit PVC SCH 40 1/2 pulg', 'tubo_3m', 'material', 'Tubería Conduit PVC SCH 40',
   'Tubo rígido de PVC de pared gruesa (Cédula 40). Diseñado para soportar esfuerzos mecánicos severos, ideal para canalizaciones enterradas directamente, transiciones de piso a pared y áreas expuestas a impactos físicos.', 0),
  ('Tubería Conduit PVC SCH 40 3/4 pulg', 'tubo_3m', 'material', 'Tubería Conduit PVC SCH 40',
   'Tubo rígido de PVC de pared gruesa (Cédula 40). Diseñado para soportar esfuerzos mecánicos severos, ideal para canalizaciones enterradas directamente, transiciones de piso a pared y áreas expuestas a impactos físicos.', 0),
  ('Tubería Conduit PVC SCH 40 1 pulg', 'tubo_3m', 'material', 'Tubería Conduit PVC SCH 40',
   'Tubo rígido de PVC de pared gruesa (Cédula 40). Diseñado para soportar esfuerzos mecánicos severos, ideal para canalizaciones enterradas directamente, transiciones de piso a pared y áreas expuestas a impactos físicos.', 0),
  ('Tubería Conduit PVC SCH 40 1-1/2 pulg', 'tubo_3m', 'material', 'Tubería Conduit PVC SCH 40',
   'Tubo rígido de PVC de pared gruesa (Cédula 40). Diseñado para soportar esfuerzos mecánicos severos, ideal para canalizaciones enterradas directamente, transiciones de piso a pared y áreas expuestas a impactos físicos.', 0),
  ('Tubería Conduit PVC SCH 40 2 pulg', 'tubo_3m', 'material', 'Tubería Conduit PVC SCH 40',
   'Tubo rígido de PVC de pared gruesa (Cédula 40). Diseñado para soportar esfuerzos mecánicos severos, ideal para canalizaciones enterradas directamente, transiciones de piso a pared y áreas expuestas a impactos físicos.', 0)
ON CONFLICT (descripcion, tipo) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  unidad = EXCLUDED.unidad,
  descripcion_tecnica = EXCLUDED.descripcion_tecnica;


-- >>> 9. TUBERÍA CONDUIT EMT <<<
INSERT INTO insumos (descripcion, unidad, tipo, categoria, descripcion_tecnica, precio_unitario)
VALUES
  ('Tubería Conduit EMT 1/2 pulg', 'tubo_3m', 'material', 'Tubería Conduit EMT',
   'Tubo de acero galvanizado liviano (Electrical Metallic Tubing) de pared delgada para interiores. Ideal para cableados a la vista o falsos techos en proyectos comerciales e industriales.', 0),
  ('Tubería Conduit EMT 3/4 pulg', 'tubo_3m', 'material', 'Tubería Conduit EMT',
   'Tubo de acero galvanizado liviano (Electrical Metallic Tubing) de pared delgada para interiores. Ideal para cableados a la vista o falsos techos en proyectos comerciales e industriales.', 0),
  ('Tubería Conduit EMT 1 pulg', 'tubo_3m', 'material', 'Tubería Conduit EMT',
   'Tubo de acero galvanizado liviano (Electrical Metallic Tubing) de pared delgada para interiores. Ideal para cableados a la vista o falsos techos en proyectos comerciales e industriales.', 0),
  ('Tubería Conduit EMT 1-1/2 pulg', 'tubo_3m', 'material', 'Tubería Conduit EMT',
   'Tubo de acero galvanizado liviano (Electrical Metallic Tubing) de pared delgada para interiores. Ideal para cableados a la vista o falsos techos en proyectos comerciales e industriales.', 0),
  ('Tubería Conduit EMT 2 pulg', 'tubo_3m', 'material', 'Tubería Conduit EMT',
   'Tubo de acero galvanizado liviano (Electrical Metallic Tubing) de pared delgada para interiores. Ideal para cableados a la vista o falsos techos en proyectos comerciales e industriales.', 0)
ON CONFLICT (descripcion, tipo) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  unidad = EXCLUDED.unidad,
  descripcion_tecnica = EXCLUDED.descripcion_tecnica;


-- >>> 10. TUBERÍA CONDUIT IMC <<<
INSERT INTO insumos (descripcion, unidad, tipo, categoria, descripcion_tecnica, precio_unitario)
VALUES
  ('Tubería Conduit IMC 1/2 pulg', 'tubo_3m', 'material', 'Tubería Conduit IMC',
   'Tubo de acero galvanizado pesado roscado (Intermediate Metal Conduit). Diseñado para máxima protección mecánica en áreas clasificadas con riesgo de explosión, intemperie severa o acometidas principales de potencia.', 0),
  ('Tubería Conduit IMC 3/4 pulg', 'tubo_3m', 'material', 'Tubería Conduit IMC',
   'Tubo de acero galvanizado pesado roscado (Intermediate Metal Conduit). Diseñado para máxima protección mecánica en áreas clasificadas con riesgo de explosión, intemperie severa o acometidas principales de potencia.', 0),
  ('Tubería Conduit IMC 1 pulg', 'tubo_3m', 'material', 'Tubería Conduit IMC',
   'Tubo de acero galvanizado pesado roscado (Intermediate Metal Conduit). Diseñado para máxima protección mecánica en áreas clasificadas con riesgo de explosión, intemperie severa o acometidas principales de potencia.', 0),
  ('Tubería Conduit IMC 1-1/2 pulg', 'tubo_3m', 'material', 'Tubería Conduit IMC',
   'Tubo de acero galvanizado pesado roscado (Intermediate Metal Conduit). Diseñado para máxima protección mecánica en áreas clasificadas con riesgo de explosión, intemperie severa o acometidas principales de potencia.', 0),
  ('Tubería Conduit IMC 2 pulg', 'tubo_3m', 'material', 'Tubería Conduit IMC',
   'Tubo de acero galvanizado pesado roscado (Intermediate Metal Conduit). Diseñado para máxima protección mecánica en áreas clasificadas con riesgo de explosión, intemperie severa o acometidas principales de potencia.', 0)
ON CONFLICT (descripcion, tipo) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  unidad = EXCLUDED.unidad,
  descripcion_tecnica = EXCLUDED.descripcion_tecnica;


-- >>> 11. ACCESORIOS PVC <<<
INSERT INTO insumos (descripcion, unidad, tipo, categoria, descripcion_tecnica, precio_unitario)
VALUES
  ('Adaptador Terminal PVC Macho 1/2 pulg', 'und', 'material', 'Accesorios PVC',
   'Conector macho de PVC de pegar con rosca NPT. Utilizado para fijar de manera segura la tubería conduit de PVC a cajas de paso metálicas o plásticas mediante contratuerca.', 0),
  ('Adaptador Terminal PVC Macho 3/4 pulg', 'und', 'material', 'Accesorios PVC',
   'Conector macho de PVC de pegar con rosca NPT. Utilizado para fijar de manera segura la tubería conduit de PVC a cajas de paso metálicas o plásticas mediante contratuerca.', 0),
  ('Adaptador Terminal PVC Macho 1 pulg', 'und', 'material', 'Accesorios PVC',
   'Conector macho de PVC de pegar con rosca NPT. Utilizado para fijar de manera segura la tubería conduit de PVC a cajas de paso metálicas o plásticas mediante contratuerca.', 0),
  ('Adaptador Terminal PVC Macho 1-1/2 pulg', 'und', 'material', 'Accesorios PVC',
   'Conector macho de PVC de pegar con rosca NPT. Utilizado para fijar de manera segura la tubería conduit de PVC a cajas de paso metálicas o plásticas mediante contratuerca.', 0),
  ('Adaptador Terminal PVC Macho 2 pulg', 'und', 'material', 'Accesorios PVC',
   'Conector macho de PVC de pegar con rosca NPT. Utilizado para fijar de manera segura la tubería conduit de PVC a cajas de paso metálicas o plásticas mediante contratuerca.', 0),
  ('Unión PVC Tipo Presión 1/2 pulg', 'und', 'material', 'Accesorios PVC',
   'Acople liso de PVC para unión rápida por cementado de dos tramos rectos de tubería conduit PVC.', 0),
  ('Unión PVC Tipo Presión 3/4 pulg', 'und', 'material', 'Accesorios PVC',
   'Acople liso de PVC para unión rápida por cementado de dos tramos rectos de tubería conduit PVC.', 0),
  ('Unión PVC Tipo Presión 1 pulg', 'und', 'material', 'Accesorios PVC',
   'Acople liso de PVC para unión rápida por cementado de dos tramos rectos de tubería conduit PVC.', 0),
  ('Unión PVC Tipo Presión 1-1/2 pulg', 'und', 'material', 'Accesorios PVC',
   'Acople liso de PVC para unión rápida por cementado de dos tramos rectos de tubería conduit PVC.', 0),
  ('Unión PVC Tipo Presión 2 pulg', 'und', 'material', 'Accesorios PVC',
   'Acople liso de PVC para unión rápida por cementado de dos tramos rectos de tubería conduit PVC.', 0),
  ('Curva PVC 90° 1/2 pulg', 'und', 'material', 'Accesorios PVC',
   'Codo curvo a 90 grados de PVC de fábrica con campana para pegar. Facilita los cambios de dirección en tramos de canalización sin estrangular los cables.', 0),
  ('Curva PVC 90° 3/4 pulg', 'und', 'material', 'Accesorios PVC',
   'Codo curvo a 90 grados de PVC de fábrica con campana para pegar. Facilita los cambios de dirección en tramos de canalización sin estrangular los cables.', 0),
  ('Curva PVC 90° 1 pulg', 'und', 'material', 'Accesorios PVC',
   'Codo curvo a 90 grados de PVC de fábrica con campana para pegar. Facilita los cambios de dirección en tramos de canalización sin estrangular los cables.', 0),
  ('Curva PVC 90° 1-1/2 pulg', 'und', 'material', 'Accesorios PVC',
   'Codo curvo a 90 grados de PVC de fábrica con campana para pegar. Facilita los cambios de dirección en tramos de canalización sin estrangular los cables.', 0),
  ('Curva PVC 90° 2 pulg', 'und', 'material', 'Accesorios PVC',
   'Codo curvo a 90 grados de PVC de fábrica con campana para pegar. Facilita los cambios de dirección en tramos de canalización sin estrangular los cables.', 0)
ON CONFLICT (descripcion, tipo) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  unidad = EXCLUDED.unidad,
  descripcion_tecnica = EXCLUDED.descripcion_tecnica;


-- >>> 12. ACCESORIOS EMT <<<
INSERT INTO insumos (descripcion, unidad, tipo, categoria, descripcion_tecnica, precio_unitario)
VALUES
  ('Conector EMT a Caja 1/2 pulg', 'und', 'material', 'Accesorios EMT',
   'Conector metálico de zinc o acero para tubería EMT. Asegura la unión firme de la tubería metálica a las cajas de paso, garantizando continuidad eléctrica de masa (puesta a tierra).', 0),
  ('Conector EMT a Caja 3/4 pulg', 'und', 'material', 'Accesorios EMT',
   'Conector metálico de zinc o acero para tubería EMT. Asegura la unión firme de la tubería metálica a las cajas de paso, garantizando continuidad eléctrica de masa (puesta a tierra).', 0),
  ('Conector EMT a Caja 1 pulg', 'und', 'material', 'Accesorios EMT',
   'Conector metálico de zinc o acero para tubería EMT. Asegura la unión firme de la tubería metálica a las cajas de paso, garantizando continuidad eléctrica de masa (puesta a tierra).', 0),
  ('Conector EMT a Caja 1-1/2 pulg', 'und', 'material', 'Accesorios EMT',
   'Conector metálico de zinc o acero para tubería EMT. Asegura la unión firme de la tubería metálica a las cajas de paso, garantizando continuidad eléctrica de masa (puesta a tierra).', 0),
  ('Conector EMT a Caja 2 pulg', 'und', 'material', 'Accesorios EMT',
   'Conector metálico de zinc o acero para tubería EMT. Asegura la unión firme de la tubería metálica a las cajas de paso, garantizando continuidad eléctrica de masa (puesta a tierra).', 0),
  ('Unión EMT 1/2 pulg', 'und', 'material', 'Accesorios EMT',
   'Cople metálico con tornillos de fijación o tuercas de compresión para conectar dos tramos de tubería EMT a tope de forma alineada.', 0),
  ('Unión EMT 3/4 pulg', 'und', 'material', 'Accesorios EMT',
   'Cople metálico con tornillos de fijación o tuercas de compresión para conectar dos tramos de tubería EMT a tope de forma alineada.', 0),
  ('Unión EMT 1 pulg', 'und', 'material', 'Accesorios EMT',
   'Cople metálico con tornillos de fijación o tuercas de compresión para conectar dos tramos de tubería EMT a tope de forma alineada.', 0),
  ('Unión EMT 1-1/2 pulg', 'und', 'material', 'Accesorios EMT',
   'Cople metálico con tornillos de fijación o tuercas de compresión para conectar dos tramos de tubería EMT a tope de forma alineada.', 0),
  ('Unión EMT 2 pulg', 'und', 'material', 'Accesorios EMT',
   'Cople metálico con tornillos de fijación o tuercas de compresión para conectar dos tramos de tubería EMT a tope de forma alineada.', 0),
  ('Curva EMT 90° 1/2 pulg', 'und', 'material', 'Accesorios EMT',
   'Curva metálica prefabricada de acero galvanizado a 90 grados para tubería EMT.', 0),
  ('Curva EMT 90° 3/4 pulg', 'und', 'material', 'Accesorios EMT',
   'Curva metálica prefabricada de acero galvanizado a 90 grados para tubería EMT.', 0),
  ('Curva EMT 90° 1 pulg', 'und', 'material', 'Accesorios EMT',
   'Curva metálica prefabricada de acero galvanizado a 90 grados para tubería EMT.', 0),
  ('Curva EMT 90° 1-1/2 pulg', 'und', 'material', 'Accesorios EMT',
   'Curva metálica prefabricada de acero galvanizado a 90 grados para tubería EMT.', 0),
  ('Curva EMT 90° 2 pulg', 'und', 'material', 'Accesorios EMT',
   'Curva metálica prefabricada de acero galvanizado a 90 grados para tubería EMT.', 0)
ON CONFLICT (descripcion, tipo) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  unidad = EXCLUDED.unidad,
  descripcion_tecnica = EXCLUDED.descripcion_tecnica;


-- >>> 13. ACCESORIOS IMC <<<
INSERT INTO insumos (descripcion, unidad, tipo, categoria, descripcion_tecnica, precio_unitario)
VALUES
  ('Unión IMC Roscada 1/2 pulg', 'und', 'material', 'Accesorios IMC',
   'Cople metálico roscado interiormente en ambos extremos para conectar a rosca dos tramos de tubería pesada IMC de forma hermética.', 0),
  ('Unión IMC Roscada 3/4 pulg', 'und', 'material', 'Accesorios IMC',
   'Cople metálico roscado interiormente en ambos extremos para conectar a rosca dos tramos de tubería pesada IMC de forma hermética.', 0),
  ('Unión IMC Roscada 1 pulg', 'und', 'material', 'Accesorios IMC',
   'Cople metálico roscado interiormente en ambos extremos para conectar a rosca dos tramos de tubería pesada IMC de forma hermética.', 0),
  ('Unión IMC Roscada 1-1/2 pulg', 'und', 'material', 'Accesorios IMC',
   'Cople metálico roscado interiormente en ambos extremos para conectar a rosca dos tramos de tubería pesada IMC de forma hermética.', 0),
  ('Unión IMC Roscada 2 pulg', 'und', 'material', 'Accesorios IMC',
   'Cople metálico roscado interiormente en ambos extremos para conectar a rosca dos tramos de tubería pesada IMC de forma hermética.', 0),
  ('Curva IMC 90° Roscada 1/2 pulg', 'und', 'material', 'Accesorios IMC',
   'Codo metálico rígido roscado de fábrica a 90 grados para desvíos de tubería IMC pesada.', 0),
  ('Curva IMC 90° Roscada 3/4 pulg', 'und', 'material', 'Accesorios IMC',
   'Codo metálico rígido roscado de fábrica a 90 grados para desvíos de tubería IMC pesada.', 0),
  ('Curva IMC 90° Roscada 1 pulg', 'und', 'material', 'Accesorios IMC',
   'Codo metálico rígido roscado de fábrica a 90 grados para desvíos de tubería IMC pesada.', 0),
  ('Curva IMC 90° Roscada 1-1/2 pulg', 'und', 'material', 'Accesorios IMC',
   'Codo metálico rígido roscado de fábrica a 90 grados para desvíos de tubería IMC pesada.', 0),
  ('Curva IMC 90° Roscada 2 pulg', 'und', 'material', 'Accesorios IMC',
   'Codo metálico rígido roscado de fábrica a 90 grados para desvíos de tubería IMC pesada.', 0),
  ('Boquilla de Alivio IMC Bushing 1/2 pulg', 'und', 'material', 'Accesorios IMC',
   'Accesorio roscado metálico o plástico para el borde de la tubería IMC al entrar a la caja. Evita cortes o abrasiones mecánicas en la chaqueta de los conductores durante el jalado del cable.', 0),
  ('Boquilla de Alivio IMC Bushing 3/4 pulg', 'und', 'material', 'Accesorios IMC',
   'Accesorio roscado metálico o plástico para el borde de la tubería IMC al entrar a la caja. Evita cortes o abrasiones mecánicas en la chaqueta de los conductores durante el jalado del cable.', 0),
  ('Boquilla de Alivio IMC Bushing 1 pulg', 'und', 'material', 'Accesorios IMC',
   'Accesorio roscado metálico o plástico para el borde de la tubería IMC al entrar a la caja. Evita cortes o abrasiones mecánicas en la chaqueta de los conductores durante el jalado del cable.', 0),
  ('Boquilla de Alivio IMC Bushing 1-1/2 pulg', 'und', 'material', 'Accesorios IMC',
   'Accesorio roscado metálico o plástico para el borde de la tubería IMC al entrar a la caja. Evita cortes o abrasiones mecánicas en la chaqueta de los conductores durante el jalado del cable.', 0),
  ('Boquilla de Alivio IMC Bushing 2 pulg', 'und', 'material', 'Accesorios IMC',
   'Accesorio roscado metálico o plástico para el borde de la tubería IMC al entrar a la caja. Evita cortes o abrasiones mecánicas en la chaqueta de los conductores durante el jalado del cable.', 0)
ON CONFLICT (descripcion, tipo) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  unidad = EXCLUDED.unidad,
  descripcion_tecnica = EXCLUDED.descripcion_tecnica;


-- >>> 14. FIJACIÓN Y CONSUMIBLES <<<
INSERT INTO insumos (descripcion, unidad, tipo, categoria, descripcion_tecnica, precio_unitario)
VALUES
  ('Soldadura Líquida para PVC 1/4 Galón', 'gl', 'material', 'Fijación y Consumibles',
   'Cemento solvente de viscosidad media y curado rápido para tuberías y accesorios de PVC rígido. Garantiza un sellado hermético e inamovible frente a vibraciones y humedad.', 0),
  ('Abrazadera Ajustable Tipo Cremallera Sin Fin', 'und', 'material', 'Fijación y Consumibles',
   'Abrazadera metálica de acero inoxidable con tornillo de ajuste sin fin. Ideal para la sujeción de tuberías conduit pesadas, mangueras flexibles o fijaciones especiales a postes y perfiles metálicos.', 0),
  ('Abrazadera Doble Ala 1/2 pulg', 'und', 'material', 'Fijación y Consumibles',
   'Abrazadera metálica de dos pestañas (orejas) fabricada en acero galvanizado. Diseñada para la fijación rígida de tuberías conduit (PVC, EMT u otros) contra vigas, columnas o superficies de mampostería mediante chazos y tornillos.', 0),
  ('Abrazadera Doble Ala 3/4 pulg', 'und', 'material', 'Fijación y Consumibles',
   'Abrazadera metálica de dos pestañas (orejas) fabricada en acero galvanizado. Diseñada para la fijación rígida de tuberías conduit (PVC, EMT u otros) contra vigas, columnas o superficies de mampostería mediante chazos y tornillos.', 0),
  ('Abrazadera Doble Ala 1 pulg', 'und', 'material', 'Fijación y Consumibles',
   'Abrazadera metálica de dos pestañas (orejas) fabricada en acero galvanizado. Diseñada para la fijación rígida de tuberías conduit (PVC, EMT u otros) contra vigas, columnas o superficies de mampostería mediante chazos y tornillos.', 0),
  ('Abrazadera Doble Ala 1-1/2 pulg', 'und', 'material', 'Fijación y Consumibles',
   'Abrazadera metálica de dos pestañas (orejas) fabricada en acero galvanizado. Diseñada para la fijación rígida de tuberías conduit (PVC, EMT u otros) contra vigas, columnas o superficies de mampostería mediante chazos y tornillos.', 0),
  ('Abrazadera Doble Ala 2 pulg', 'und', 'material', 'Fijación y Consumibles',
   'Abrazadera metálica de dos pestañas (orejas) fabricada en acero galvanizado. Diseñada para la fijación rígida de tuberías conduit (PVC, EMT u otros) contra vigas, columnas o superficies de mampostería mediante chazos y tornillos.', 0)
ON CONFLICT (descripcion, tipo) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  unidad = EXCLUDED.unidad,
  descripcion_tecnica = EXCLUDED.descripcion_tecnica;


-- ============================================================
-- Fase 3: Verificación
-- ============================================================
SELECT categoria, COUNT(*) AS total FROM insumos GROUP BY categoria ORDER BY categoria;
