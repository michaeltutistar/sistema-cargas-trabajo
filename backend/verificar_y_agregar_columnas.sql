-- Script para verificar qué columnas existen y agregar las que faltan

-- 1. Verificar estructura actual completa
DESCRIBE tiempos_procedimientos;

-- 2. Verificar específicamente las columnas de horas hombre
SHOW COLUMNS FROM tiempos_procedimientos LIKE 'horas_%';

-- 3. Verificar si existe tiempo_estandar
SHOW COLUMNS FROM tiempos_procedimientos LIKE 'tiempo_estandar';

-- 4. Verificar si existe activo
SHOW COLUMNS FROM tiempos_procedimientos LIKE 'activo';

-- 5. Mostrar todas las columnas de la tabla
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'tiempos_procedimientos'
ORDER BY ORDINAL_POSITION;

-- 6. Agregar columnas que faltan (ejecutar solo si no existen)
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

-- 7. Verificar que las columnas se agregaron correctamente
SHOW COLUMNS FROM tiempos_procedimientos LIKE 'horas_%';

-- 8. Ahora crear la vista
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

-- 9. Verificar que la vista se creó correctamente
SHOW TABLES LIKE 'v_%';

-- 10. Probar la vista
SELECT * FROM v_totales_por_niveles; 