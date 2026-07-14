-- ============================================================
-- Actualización de Precios — Catálogo Eléctrico
-- Fuente: Edwin Quintero, Julio 2026 (COP)
-- ============================================================
-- Estrategia: UPDATE con pattern-matching + INSERT para nuevos
-- Los nombres se actualizan a la nomenclatura exacta de Edwin
-- ============================================================

-- 1. BREAKERS ENCHUFABLES 1P
UPDATE insumos SET descripcion = 'Breaker Enchufable Monofásico 1P - 15A (Tipo QD)', precio_unitario = 18500 WHERE descripcion LIKE 'Breaker Enchufable 1P - 15A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Monofásico 1P - 20A (Tipo QD)', precio_unitario = 18500 WHERE descripcion LIKE 'Breaker Enchufable 1P - 20A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Monofásico 1P - 30A (Tipo QD)', precio_unitario = 18500 WHERE descripcion LIKE 'Breaker Enchufable 1P - 30A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Monofásico 1P - 40A (Tipo QD)', precio_unitario = 29500 WHERE descripcion LIKE 'Breaker Enchufable 1P - 40A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Monofásico 1P - 50A (Tipo QD)', precio_unitario = 29500 WHERE descripcion LIKE 'Breaker Enchufable 1P - 50A%' AND tipo = 'material';

-- 2. BREAKERS ENCHUFABLES 2P
UPDATE insumos SET descripcion = 'Breaker Enchufable Bifásico 2P - 20A (Tipo QD)', precio_unitario = 58000 WHERE descripcion LIKE 'Breaker Enchufable 2P - 20A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Bifásico 2P - 30A (Tipo QD)', precio_unitario = 58000 WHERE descripcion LIKE 'Breaker Enchufable 2P - 30A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Bifásico 2P - 40A (Tipo QD)', precio_unitario = 58000 WHERE descripcion LIKE 'Breaker Enchufable 2P - 40A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Bifásico 2P - 50A (Tipo QD)', precio_unitario = 58000 WHERE descripcion LIKE 'Breaker Enchufable 2P - 50A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Bifásico 2P - 60A (Tipo QD)', precio_unitario = 74000 WHERE descripcion LIKE 'Breaker Enchufable 2P - 60A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Bifásico 2P - 70A (Tipo QD)', precio_unitario = 74000 WHERE descripcion LIKE 'Breaker Enchufable 2P - 70A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Bifásico 2P - 80A (Tipo QD)', precio_unitario = 74000 WHERE descripcion LIKE 'Breaker Enchufable 2P - 80A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Bifásico 2P - 100A (Tipo QD)', precio_unitario = 98000 WHERE descripcion LIKE 'Breaker Enchufable 2P - 100A%' AND tipo = 'material';

-- 3. BREAKERS ENCHUFABLES 3P
UPDATE insumos SET descripcion = 'Breaker Enchufable Trifásico 3P - 20A (Tipo QD)', precio_unitario = 120000 WHERE descripcion LIKE 'Breaker Enchufable 3P - 20A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Trifásico 3P - 30A (Tipo QD)', precio_unitario = 120000 WHERE descripcion LIKE 'Breaker Enchufable 3P - 30A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Trifásico 3P - 40A (Tipo QD)', precio_unitario = 120000 WHERE descripcion LIKE 'Breaker Enchufable 3P - 40A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Trifásico 3P - 50A (Tipo QD)', precio_unitario = 120000 WHERE descripcion LIKE 'Breaker Enchufable 3P - 50A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Trifásico 3P - 60A (Tipo QD)', precio_unitario = 155000 WHERE descripcion LIKE 'Breaker Enchufable 3P - 60A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Trifásico 3P - 70A (Tipo QD)', precio_unitario = 155000 WHERE descripcion LIKE 'Breaker Enchufable 3P - 70A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Trifásico 3P - 80A (Tipo QD)', precio_unitario = 155000 WHERE descripcion LIKE 'Breaker Enchufable 3P - 80A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Enchufable Trifásico 3P - 100A (Tipo QD)', precio_unitario = 195000 WHERE descripcion LIKE 'Breaker Enchufable 3P - 100A%' AND tipo = 'material';

-- 4. BREAKERS INDUSTRIALES MCCB 3P
UPDATE insumos SET descripcion = 'Breaker Totalizador de Caja Moldeada (MCCB) 3P - 100A', precio_unitario = 380000 WHERE descripcion LIKE 'Breaker MCCB Industrial 3P - 100A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Totalizador de Caja Moldeada (MCCB) 3P - 125A', precio_unitario = 420000 WHERE descripcion LIKE 'Breaker MCCB Industrial 3P - 125A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Totalizador de Caja Moldeada (MCCB) 3P - 150A', precio_unitario = 480000 WHERE descripcion LIKE 'Breaker MCCB Industrial 3P - 150A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Totalizador de Caja Moldeada (MCCB) 3P - 175A', precio_unitario = 550000 WHERE descripcion LIKE 'Breaker MCCB Industrial 3P - 175A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Totalizador de Caja Moldeada (MCCB) 3P - 200A', precio_unitario = 620000 WHERE descripcion LIKE 'Breaker MCCB Industrial 3P - 200A%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Breaker Totalizador de Caja Moldeada (MCCB) 3P - 250A', precio_unitario = 780000 WHERE descripcion LIKE 'Breaker MCCB Industrial 3P - 250A%' AND tipo = 'material';

-- 5. CAJAS METÁLICAS
UPDATE insumos SET descripcion = 'Caja Metálica Galvanizada 2" x 4" (Tipo Pesada)', precio_unitario = 4500   WHERE descripcion LIKE 'Caja Metálica Galvanizada 2x4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Caja Metálica Galvanizada 4" x 4" (Tipo Pesada)', precio_unitario = 6500   WHERE descripcion LIKE 'Caja Metálica Galvanizada 4x4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Caja Metálica Galvanizada Octogonal',               precio_unitario = 5500   WHERE descripcion LIKE 'Caja Metálica Galvanizada Oct%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Caja de Paso Metálica 10x10 cm (Doble Fondo)',      precio_unitario = 18000  WHERE descripcion LIKE 'Caja de Paso Metálica 10x10%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Caja de Paso Metálica 15x15x10 cm (Doble Fondo)',   precio_unitario = 28000  WHERE descripcion LIKE 'Caja de Paso Metálica 15x15%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Caja de Paso Metálica 20x20x10 cm (Doble Fondo)',   precio_unitario = 38000  WHERE descripcion LIKE 'Caja de Paso Metálica 20x20%' AND tipo = 'material';

-- 6. CAJAS PLÁSTICAS
UPDATE insumos SET descripcion = 'Caja Plástica PVC 2" x 4"',                        precio_unitario = 2200   WHERE descripcion LIKE 'Caja Plástica PVC 2x4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Caja Plástica PVC 4" x 4"',                        precio_unitario = 3500   WHERE descripcion LIKE 'Caja Plástica PVC 4x4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Caja de Paso Plástica PVC 10x10x8 cm',             precio_unitario = 12000  WHERE descripcion LIKE 'Caja de Paso Plástica PVC 10x10%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Caja de Paso Plástica PVC 15x15x10 cm',            precio_unitario = 19000  WHERE descripcion LIKE 'Caja de Paso Plástica PVC 15x15%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Caja Hermética Plástica con Empaque IP65 (Intemperie)', precio_unitario = 45000 WHERE descripcion LIKE 'Caja Hermética Plástica IP65%' AND tipo = 'material';

-- 7. TUBERÍA CONDUIT PVC
UPDATE insumos SET descripcion = 'Tubería Conduit PVC - 1/2"',   precio_unitario = 6800  WHERE descripcion LIKE 'Tubería Conduit PVC 1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Tubería Conduit PVC - 3/4"',   precio_unitario = 9200  WHERE descripcion LIKE 'Tubería Conduit PVC 3/4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Tubería Conduit PVC - 1"',     precio_unitario = 13800 WHERE descripcion LIKE 'Tubería Conduit PVC 1 %' AND descripcion NOT LIKE '%1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Tubería Conduit PVC - 1-1/2"', precio_unitario = 23000 WHERE descripcion LIKE 'Tubería Conduit PVC 1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Tubería Conduit PVC - 2"',     precio_unitario = 32500 WHERE descripcion LIKE 'Tubería Conduit PVC 2 %' AND tipo = 'material';

-- 8. TUBERÍA CONDUIT PVC SCH 40
UPDATE insumos SET descripcion = 'Tubería Conduit PVC Schedule 40 (SCH 40) - 1/2"',   precio_unitario = 11500 WHERE descripcion LIKE 'Tubería Conduit PVC SCH 40 1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Tubería Conduit PVC Schedule 40 (SCH 40) - 3/4"',   precio_unitario = 15800 WHERE descripcion LIKE 'Tubería Conduit PVC SCH 40 3/4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Tubería Conduit PVC Schedule 40 (SCH 40) - 1"',     precio_unitario = 23500 WHERE descripcion LIKE 'Tubería Conduit PVC SCH 40 1 %' AND descripcion NOT LIKE '%1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Tubería Conduit PVC Schedule 40 (SCH 40) - 1-1/2"', precio_unitario = 39000 WHERE descripcion LIKE 'Tubería Conduit PVC SCH 40 1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Tubería Conduit PVC Schedule 40 (SCH 40) - 2"',     precio_unitario = 54000 WHERE descripcion LIKE 'Tubería Conduit PVC SCH 40 2 %' AND tipo = 'material';

-- 9. TUBERÍA CONDUIT EMT
UPDATE insumos SET descripcion = 'Tubería Conduit EMT (Metálica Liviana) - 1/2"',   precio_unitario = 15800 WHERE descripcion LIKE 'Tubería Conduit EMT 1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Tubería Conduit EMT (Metálica Liviana) - 3/4"',   precio_unitario = 21500 WHERE descripcion LIKE 'Tubería Conduit EMT 3/4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Tubería Conduit EMT (Metálica Liviana) - 1"',     precio_unitario = 31000 WHERE descripcion LIKE 'Tubería Conduit EMT 1 %' AND descripcion NOT LIKE '%1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Tubería Conduit EMT (Metálica Liviana) - 1-1/2"', precio_unitario = 52000 WHERE descripcion LIKE 'Tubería Conduit EMT 1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Tubería Conduit EMT (Metálica Liviana) - 2"',     precio_unitario = 69000 WHERE descripcion LIKE 'Tubería Conduit EMT 2 %' AND tipo = 'material';

-- 10. TUBERÍA CONDUIT IMC
UPDATE insumos SET descripcion = 'Tubería Conduit IMC (Metálica Pesada / Roscada) - 1/2"',   precio_unitario = 52000  WHERE descripcion LIKE 'Tubería Conduit IMC 1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Tubería Conduit IMC (Metálica Pesada / Roscada) - 3/4"',   precio_unitario = 68000  WHERE descripcion LIKE 'Tubería Conduit IMC 3/4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Tubería Conduit IMC (Metálica Pesada / Roscada) - 1"',     precio_unitario = 95000  WHERE descripcion LIKE 'Tubería Conduit IMC 1 %' AND descripcion NOT LIKE '%1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Tubería Conduit IMC (Metálica Pesada / Roscada) - 1-1/2"', precio_unitario = 148000 WHERE descripcion LIKE 'Tubería Conduit IMC 1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Tubería Conduit IMC (Metálica Pesada / Roscada) - 2"',     precio_unitario = 192000 WHERE descripcion LIKE 'Tubería Conduit IMC 2 %' AND tipo = 'material';

-- 11. ACCESORIOS PVC: Adaptador Terminal, Unión, Curva
UPDATE insumos SET descripcion = 'Adaptador Terminal PVC Macho - 1/2"',   precio_unitario = 600  WHERE descripcion LIKE 'Adaptador Terminal PVC Macho 1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Adaptador Terminal PVC Macho - 3/4"',   precio_unitario = 900  WHERE descripcion LIKE 'Adaptador Terminal PVC Macho 3/4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Adaptador Terminal PVC Macho - 1"',     precio_unitario = 1600 WHERE descripcion LIKE 'Adaptador Terminal PVC Macho 1 %' AND descripcion NOT LIKE '%1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Adaptador Terminal PVC Macho - 1-1/2"', precio_unitario = 3200 WHERE descripcion LIKE 'Adaptador Terminal PVC Macho 1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Adaptador Terminal PVC Macho - 2"',     precio_unitario = 5400 WHERE descripcion LIKE 'Adaptador Terminal PVC Macho 2 %' AND tipo = 'material';

UPDATE insumos SET descripcion = 'Unión PVC Tipo Presión - 1/2"',   precio_unitario = 600  WHERE descripcion LIKE 'Unión PVC Tipo Presión 1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Unión PVC Tipo Presión - 3/4"',   precio_unitario = 900  WHERE descripcion LIKE 'Unión PVC Tipo Presión 3/4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Unión PVC Tipo Presión - 1"',     precio_unitario = 1600 WHERE descripcion LIKE 'Unión PVC Tipo Presión 1 %' AND descripcion NOT LIKE '%1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Unión PVC Tipo Presión - 1-1/2"', precio_unitario = 3200 WHERE descripcion LIKE 'Unión PVC Tipo Presión 1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Unión PVC Tipo Presión - 2"',     precio_unitario = 5400 WHERE descripcion LIKE 'Unión PVC Tipo Presión 2 %' AND tipo = 'material';

UPDATE insumos SET descripcion = 'Curva PVC 90° - 1/2"',   precio_unitario = 1200  WHERE descripcion LIKE 'Curva PVC 90° 1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Curva PVC 90° - 3/4"',   precio_unitario = 1800  WHERE descripcion LIKE 'Curva PVC 90° 3/4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Curva PVC 90° - 1"',     precio_unitario = 3200  WHERE descripcion LIKE 'Curva PVC 90° 1 %' AND descripcion NOT LIKE '%1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Curva PVC 90° - 1-1/2"', precio_unitario = 6400  WHERE descripcion LIKE 'Curva PVC 90° 1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Curva PVC 90° - 2"',     precio_unitario = 10800 WHERE descripcion LIKE 'Curva PVC 90° 2 %' AND tipo = 'material';

-- 12. ACCESORIOS EMT: Conector, Unión, Curva
UPDATE insumos SET descripcion = 'Conector EMT a Caja (Tornillo o Compresión) - 1/2"',   precio_unitario = 1800  WHERE descripcion LIKE 'Conector EMT a Caja 1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Conector EMT a Caja (Tornillo o Compresión) - 3/4"',   precio_unitario = 2500  WHERE descripcion LIKE 'Conector EMT a Caja 3/4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Conector EMT a Caja (Tornillo o Compresión) - 1"',     precio_unitario = 4200  WHERE descripcion LIKE 'Conector EMT a Caja 1 %' AND descripcion NOT LIKE '%1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Conector EMT a Caja (Tornillo o Compresión) - 1-1/2"', precio_unitario = 8500  WHERE descripcion LIKE 'Conector EMT a Caja 1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Conector EMT a Caja (Tornillo o Compresión) - 2"',     precio_unitario = 12800 WHERE descripcion LIKE 'Conector EMT a Caja 2 %' AND tipo = 'material';

UPDATE insumos SET descripcion = 'Unión EMT (Tornillo o Compresión) - 1/2"',   precio_unitario = 1800  WHERE descripcion LIKE 'Unión EMT 1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Unión EMT (Tornillo o Compresión) - 3/4"',   precio_unitario = 2500  WHERE descripcion LIKE 'Unión EMT 3/4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Unión EMT (Tornillo o Compresión) - 1"',     precio_unitario = 4200  WHERE descripcion LIKE 'Unión EMT 1 %' AND descripcion NOT LIKE '%1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Unión EMT (Tornillo o Compresión) - 1-1/2"', precio_unitario = 8500  WHERE descripcion LIKE 'Unión EMT 1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Unión EMT (Tornillo o Compresión) - 2"',     precio_unitario = 12800 WHERE descripcion LIKE 'Unión EMT 2 %' AND tipo = 'material';

UPDATE insumos SET descripcion = 'Curva EMT 90° - 1/2"',   precio_unitario = 3600  WHERE descripcion LIKE 'Curva EMT 90° 1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Curva EMT 90° - 3/4"',   precio_unitario = 5000  WHERE descripcion LIKE 'Curva EMT 90° 3/4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Curva EMT 90° - 1"',     precio_unitario = 8400  WHERE descripcion LIKE 'Curva EMT 90° 1 %' AND descripcion NOT LIKE '%1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Curva EMT 90° - 1-1/2"', precio_unitario = 17000 WHERE descripcion LIKE 'Curva EMT 90° 1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Curva EMT 90° - 2"',     precio_unitario = 25600 WHERE descripcion LIKE 'Curva EMT 90° 2 %' AND tipo = 'material';

-- 13. ACCESORIOS IMC: Unión, Curva, Bushing
UPDATE insumos SET descripcion = 'Unión IMC Roscada - 1/2"',   precio_unitario = 4500  WHERE descripcion LIKE 'Unión IMC Roscada 1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Unión IMC Roscada - 3/4"',   precio_unitario = 6200  WHERE descripcion LIKE 'Unión IMC Roscada 3/4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Unión IMC Roscada - 1"',     precio_unitario = 9800  WHERE descripcion LIKE 'Unión IMC Roscada 1 %' AND descripcion NOT LIKE '%1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Unión IMC Roscada - 1-1/2"', precio_unitario = 18500 WHERE descripcion LIKE 'Unión IMC Roscada 1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Unión IMC Roscada - 2"',     precio_unitario = 27000 WHERE descripcion LIKE 'Unión IMC Roscada 2 %' AND tipo = 'material';

UPDATE insumos SET descripcion = 'Curva IMC 90° Roscada - 1/2"',   precio_unitario = 9000  WHERE descripcion LIKE 'Curva IMC 90° Roscada 1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Curva IMC 90° Roscada - 3/4"',   precio_unitario = 12400 WHERE descripcion LIKE 'Curva IMC 90° Roscada 3/4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Curva IMC 90° Roscada - 1"',     precio_unitario = 19600 WHERE descripcion LIKE 'Curva IMC 90° Roscada 1 %' AND descripcion NOT LIKE '%1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Curva IMC 90° Roscada - 1-1/2"', precio_unitario = 37000 WHERE descripcion LIKE 'Curva IMC 90° Roscada 1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Curva IMC 90° Roscada - 2"',     precio_unitario = 54000 WHERE descripcion LIKE 'Curva IMC 90° Roscada 2 %' AND tipo = 'material';

UPDATE insumos SET descripcion = 'Boquilla de Alivio IMC (Bushing) - 1/2"',   precio_unitario = 4500  WHERE descripcion LIKE 'Boquilla de Alivio IMC Bushing 1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Boquilla de Alivio IMC (Bushing) - 3/4"',   precio_unitario = 6200  WHERE descripcion LIKE 'Boquilla de Alivio IMC Bushing 3/4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Boquilla de Alivio IMC (Bushing) - 1"',     precio_unitario = 9800  WHERE descripcion LIKE 'Boquilla de Alivio IMC Bushing 1 %' AND descripcion NOT LIKE '%1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Boquilla de Alivio IMC (Bushing) - 1-1/2"', precio_unitario = 18500 WHERE descripcion LIKE 'Boquilla de Alivio IMC Bushing 1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Boquilla de Alivio IMC (Bushing) - 2"',     precio_unitario = 27000 WHERE descripcion LIKE 'Boquilla de Alivio IMC Bushing 2 %' AND tipo = 'material';

-- 14. FIJACIÓN Y CONSUMIBLES
UPDATE insumos SET descripcion = 'Soldadura Líquida para PVC - 1/4 Galón',                  precio_unitario = 95000 WHERE descripcion LIKE 'Soldadura Líquida para PVC%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Abrazadera Ajustable Tipo Cremallera (Sin Fin)',          precio_unitario = 2500  WHERE descripcion LIKE 'Abrazadera Ajustable%' AND tipo = 'material';

UPDATE insumos SET descripcion = 'Abrazadera Doble Ala para Tubería - 1/2"',   precio_unitario = 800  WHERE descripcion LIKE 'Abrazadera Doble Ala 1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Abrazadera Doble Ala para Tubería - 3/4"',   precio_unitario = 1000 WHERE descripcion LIKE 'Abrazadera Doble Ala 3/4%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Abrazadera Doble Ala para Tubería - 1"',     precio_unitario = 1400 WHERE descripcion LIKE 'Abrazadera Doble Ala 1 %' AND descripcion NOT LIKE '%1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Abrazadera Doble Ala para Tubería - 1-1/2"', precio_unitario = 2200 WHERE descripcion LIKE 'Abrazadera Doble Ala 1-1/2%' AND tipo = 'material';
UPDATE insumos SET descripcion = 'Abrazadera Doble Ala para Tubería - 2"',     precio_unitario = 3000 WHERE descripcion LIKE 'Abrazadera Doble Ala 2 %' AND tipo = 'material';

-- VERIFICACIÓN
SELECT categoria, COUNT(*) AS items,
  COUNT(*) FILTER (WHERE precio_unitario > 0) AS con_precio,
  MIN(precio_unitario)::int AS precio_min,
  MAX(precio_unitario)::int AS precio_max
FROM insumos WHERE tipo = 'material' AND categoria IS NOT NULL
GROUP BY categoria ORDER BY categoria;
