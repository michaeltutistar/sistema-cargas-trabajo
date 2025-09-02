-- Script simplificado para modificar la estructura de tiempos_procedimientos
-- Ejecutar paso a paso para evitar errores

-- PASO 1: Verificar estructura actual
DESCRIBE tiempos_procedimientos;

-- PASO 2: Agregar columna activo si no existe
ALTER TABLE `tiempos_procedimientos` 
ADD COLUMN `activo` tinyint(1) DEFAULT 1 COMMENT 'Indica si el registro está activo';

-- PASO 3: Verificar si existe tiempo_horas
SHOW COLUMNS FROM tiempos_procedimientos LIKE 'tiempo_horas';

-- PASO 4: Si existe tiempo_horas, renombrarlo a tiempo_estandar
-- (Ejecutar solo si el paso 3 muestra que existe)
ALTER TABLE `tiempos_procedimientos` 
CHANGE COLUMN `tiempo_horas` `tiempo_estandar` decimal(10,2) NOT NULL COMMENT 'Tiempo estándar por procedimiento en horas';

-- PASO 5: Si no existe tiempo_estandar, crearlo
-- (Ejecutar solo si el paso 4 no se ejecutó)
ALTER TABLE `tiempos_procedimientos` 
ADD COLUMN `tiempo_estandar` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Tiempo estándar por procedimiento en horas';

-- PASO 6: Agregar columnas para horas hombre por niveles
ALTER TABLE `tiempos_procedimientos` 
ADD COLUMN `horas_directivo` decimal(10,2) DEFAULT 0.00 COMMENT 'Horas hombre para nivel Directivo';

ALTER TABLE `tiempos_procedimientos` 
ADD COLUMN `horas_asesor` decimal(10,2) DEFAULT 0.00 COMMENT 'Horas hombre para nivel Asesor';

ALTER TABLE `tiempos_procedimientos` 
ADD COLUMN `horas_profesional` decimal(10,2) DEFAULT 0.00 COMMENT 'Horas hombre para nivel Profesional';

ALTER TABLE `tiempos_procedimientos` 
ADD COLUMN `horas_tecnico` decimal(10,2) DEFAULT 0.00 COMMENT 'Horas hombre para nivel Técnico';

ALTER TABLE `tiempos_procedimientos` 
ADD COLUMN `horas_asistencial` decimal(10,2) DEFAULT 0.00 COMMENT 'Horas hombre para nivel Asistencial';

-- PASO 7: Agregar índices
ALTER TABLE `tiempos_procedimientos` 
ADD INDEX `idx_horas_directivo` (`horas_directivo`);

ALTER TABLE `tiempos_procedimientos` 
ADD INDEX `idx_horas_asesor` (`horas_asesor`);

ALTER TABLE `tiempos_procedimientos` 
ADD INDEX `idx_horas_profesional` (`horas_profesional`);

ALTER TABLE `tiempos_procedimientos` 
ADD INDEX `idx_horas_tecnico` (`horas_tecnico`);

ALTER TABLE `tiempos_procedimientos` 
ADD INDEX `idx_horas_asistencial` (`horas_asistencial`);

-- PASO 8: Verificar estructura final
DESCRIBE tiempos_procedimientos;

-- PASO 9: Crear vista para totales por niveles
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

-- PASO 10: Verificar que la vista se creó correctamente
SHOW TABLES LIKE 'v_%'; 