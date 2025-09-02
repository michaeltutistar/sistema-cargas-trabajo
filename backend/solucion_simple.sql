-- Script simple para agregar las columnas faltantes
-- No requiere acceso a information_schema

-- 1. Verificar estructura actual
DESCRIBE tiempos_procedimientos;

-- 2. Agregar columnas de horas hombre (ignorar errores si ya existen)
-- Agregar horas_directivo
ALTER TABLE `tiempos_procedimientos` 
ADD COLUMN `horas_directivo` decimal(10,2) DEFAULT 0.00 COMMENT 'Horas hombre para nivel Directivo';

-- Agregar horas_asesor
ALTER TABLE `tiempos_procedimientos` 
ADD COLUMN `horas_asesor` decimal(10,2) DEFAULT 0.00 COMMENT 'Horas hombre para nivel Asesor';

-- Agregar horas_profesional
ALTER TABLE `tiempos_procedimientos` 
ADD COLUMN `horas_profesional` decimal(10,2) DEFAULT 0.00 COMMENT 'Horas hombre para nivel Profesional';

-- Agregar horas_tecnico
ALTER TABLE `tiempos_procedimientos` 
ADD COLUMN `horas_tecnico` decimal(10,2) DEFAULT 0.00 COMMENT 'Horas hombre para nivel Técnico';

-- Agregar horas_asistencial
ALTER TABLE `tiempos_procedimientos` 
ADD COLUMN `horas_asistencial` decimal(10,2) DEFAULT 0.00 COMMENT 'Horas hombre para nivel Asistencial';

-- 3. Verificar que las columnas se agregaron
DESCRIBE tiempos_procedimientos;

-- 4. Crear la vista
DROP VIEW IF EXISTS `v_totales_por_niveles`;
CREATE VIEW `v_totales_por_niveles` AS
SELECT 
    'DIRECTIVO' as nivel_jerarquico,
    SUM(horas_directivo) as total_horas
FROM tiempos_procedimientos 
WHERE activo = 1

UNION ALL

SELECT 
    'ASESOR' as nivel_jerarquico,
    SUM(horas_asesor) as total_horas
FROM tiempos_procedimientos 
WHERE activo = 1

UNION ALL

SELECT 
    'PROFESIONAL' as nivel_jerarquico,
    SUM(horas_profesional) as total_horas
FROM tiempos_procedimientos 
WHERE activo = 1

UNION ALL

SELECT 
    'TECNICO' as nivel_jerarquico,
    SUM(horas_tecnico) as total_horas
FROM tiempos_procedimientos 
WHERE activo = 1

UNION ALL

SELECT 
    'ASISTENCIAL' as nivel_jerarquico,
    SUM(horas_asistencial) as total_horas
FROM tiempos_procedimientos 
WHERE activo = 1;

-- 5. Verificar que la vista se creó
SHOW TABLES LIKE 'v_%';

-- 6. Probar la vista
SELECT * FROM v_totales_por_niveles; 