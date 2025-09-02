-- Script para modificar la estructura de tiempos_procedimientos
-- Cambiar de tiempo_horas a tiempo_estandar y agregar columnas para horas hombre por niveles

-- 0. Verificar y agregar columna activo si no existe
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tiempos_procedimientos' 
     AND COLUMN_NAME = 'activo') = 0,
    'ALTER TABLE `tiempos_procedimientos` ADD COLUMN `activo` tinyint(1) DEFAULT 1 COMMENT "Indica si el registro está activo"',
    'SELECT "Columna activo ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 1. Verificar si existe tiempo_horas antes de renombrar
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tiempos_procedimientos' 
     AND COLUMN_NAME = 'tiempo_horas') > 0,
    'ALTER TABLE `tiempos_procedimientos` CHANGE COLUMN `tiempo_horas` `tiempo_estandar` decimal(10,2) NOT NULL COMMENT "Tiempo estándar por procedimiento en horas"',
    'SELECT "Columna tiempo_horas no existe, se creará tiempo_estandar" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Si tiempo_horas no existía, crear tiempo_estandar
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tiempos_procedimientos' 
     AND COLUMN_NAME = 'tiempo_estandar') = 0,
    'ALTER TABLE `tiempos_procedimientos` ADD COLUMN `tiempo_estandar` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT "Tiempo estándar por procedimiento en horas"',
    'SELECT "Columna tiempo_estandar ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Agregar columnas para horas hombre por niveles de empleo (solo si no existen)
-- Verificar y agregar horas_directivo
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tiempos_procedimientos' 
     AND COLUMN_NAME = 'horas_directivo') = 0,
    'ALTER TABLE `tiempos_procedimientos` ADD COLUMN `horas_directivo` decimal(10,2) DEFAULT 0.00 COMMENT "Horas hombre para nivel Directivo"',
    'SELECT "Columna horas_directivo ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar horas_asesor
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tiempos_procedimientos' 
     AND COLUMN_NAME = 'horas_asesor') = 0,
    'ALTER TABLE `tiempos_procedimientos` ADD COLUMN `horas_asesor` decimal(10,2) DEFAULT 0.00 COMMENT "Horas hombre para nivel Asesor"',
    'SELECT "Columna horas_asesor ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar horas_profesional
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tiempos_procedimientos' 
     AND COLUMN_NAME = 'horas_profesional') = 0,
    'ALTER TABLE `tiempos_procedimientos` ADD COLUMN `horas_profesional` decimal(10,2) DEFAULT 0.00 COMMENT "Horas hombre para nivel Profesional"',
    'SELECT "Columna horas_profesional ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar horas_tecnico
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tiempos_procedimientos' 
     AND COLUMN_NAME = 'horas_tecnico') = 0,
    'ALTER TABLE `tiempos_procedimientos` ADD COLUMN `horas_tecnico` decimal(10,2) DEFAULT 0.00 COMMENT "Horas hombre para nivel Técnico"',
    'SELECT "Columna horas_tecnico ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar horas_asistencial
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tiempos_procedimientos' 
     AND COLUMN_NAME = 'horas_asistencial') = 0,
    'ALTER TABLE `tiempos_procedimientos` ADD COLUMN `horas_asistencial` decimal(10,2) DEFAULT 0.00 COMMENT "Horas hombre para nivel Asistencial"',
    'SELECT "Columna horas_asistencial ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Agregar índices para mejorar el rendimiento de consultas por niveles (solo si no existen)
-- Verificar y agregar índice para horas_directivo
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tiempos_procedimientos' 
     AND INDEX_NAME = 'idx_horas_directivo') = 0,
    'ALTER TABLE `tiempos_procedimientos` ADD INDEX `idx_horas_directivo` (`horas_directivo`)',
    'SELECT "Índice idx_horas_directivo ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar índice para horas_asesor
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tiempos_procedimientos' 
     AND INDEX_NAME = 'idx_horas_asesor') = 0,
    'ALTER TABLE `tiempos_procedimientos` ADD INDEX `idx_horas_asesor` (`horas_asesor`)',
    'SELECT "Índice idx_horas_asesor ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar índice para horas_profesional
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tiempos_procedimientos' 
     AND INDEX_NAME = 'idx_horas_profesional') = 0,
    'ALTER TABLE `tiempos_procedimientos` ADD INDEX `idx_horas_profesional` (`horas_profesional`)',
    'SELECT "Índice idx_horas_profesional ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar índice para horas_tecnico
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tiempos_procedimientos' 
     AND INDEX_NAME = 'idx_horas_tecnico') = 0,
    'ALTER TABLE `tiempos_procedimientos` ADD INDEX `idx_horas_tecnico` (`horas_tecnico`)',
    'SELECT "Índice idx_horas_tecnico ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar índice para horas_asistencial
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'tiempos_procedimientos' 
     AND INDEX_NAME = 'idx_horas_asistencial') = 0,
    'ALTER TABLE `tiempos_procedimientos` ADD INDEX `idx_horas_asistencial` (`horas_asistencial`)',
    'SELECT "Índice idx_horas_asistencial ya existe" as mensaje'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Actualizar registros existentes para calcular las horas hombre
-- Esto se hará automáticamente en el código TypeScript

-- 5. Verificar la estructura final
DESCRIBE `tiempos_procedimientos`;

-- 6. Mostrar los índices de la tabla
SHOW INDEX FROM `tiempos_procedimientos`;

-- 7. Crear vista para totales por niveles de empleo
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

-- 8. Crear vista para resumen completo con jerarquía
DROP VIEW IF EXISTS `v_resumen_completo_tiempos`;
CREATE VIEW `v_resumen_completo_tiempos` AS
SELECT 
    t.id,
    t.procedimiento_id,
    t.empleo_id,
    t.usuario_id,
    t.estructura_id,
    t.frecuencia_mensual,
    t.tiempo_estandar,
    t.horas_directivo,
    t.horas_asesor,
    t.horas_profesional,
    t.horas_tecnico,
    t.horas_asistencial,
    t.observaciones,
    t.activo,
    t.fecha_creacion,
    t.fecha_actualizacion,
    -- Información del procedimiento
    p.nombre as procedimiento_nombre,
    p.nivel_jerarquico as procedimiento_nivel,
    -- Información del empleo
    e.nombre as empleo_denominacion,
    e.nivel_jerarquico as empleo_nivel,
    -- Información de la actividad
    a.nombre as actividad_nombre,
    a.codigo as actividad_codigo,
    -- Información del proceso
    pr.nombre as proceso_nombre,
    pr.codigo as proceso_codigo,
    -- Información de la dependencia
    d.nombre as dependencia_nombre,
    d.codigo as dependencia_codigo
FROM tiempos_procedimientos t
INNER JOIN procedimientos p ON t.procedimiento_id = p.id
INNER JOIN empleos e ON t.empleo_id = e.id
INNER JOIN actividades a ON p.actividad_id = a.id
INNER JOIN procesos pr ON a.proceso_id = pr.id
INNER JOIN dependencias d ON pr.dependencia_id = d.id
WHERE t.activo = 1;

-- Verificar las vistas creadas
SHOW TABLES LIKE 'v_%'; 