-- Script para verificar la estructura actual de la tabla tiempos_procedimientos

-- 1. Verificar la estructura actual de la tabla
DESCRIBE tiempos_procedimientos;

-- 2. Verificar si existe la columna activo
SHOW COLUMNS FROM tiempos_procedimientos LIKE 'activo';

-- 3. Verificar si existe la columna tiempo_horas
SHOW COLUMNS FROM tiempos_procedimientos LIKE 'tiempo_horas';

-- 4. Verificar si existe la columna tiempo_estandar
SHOW COLUMNS FROM tiempos_procedimientos LIKE 'tiempo_estandar';

-- 5. Mostrar todas las columnas de la tabla
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'tiempos_procedimientos'
ORDER BY ORDINAL_POSITION;

-- 6. Verificar si hay datos en la tabla
SELECT COUNT(*) as total_registros FROM tiempos_procedimientos;

-- 7. Mostrar algunos registros de ejemplo
SELECT * FROM tiempos_procedimientos LIMIT 3; 