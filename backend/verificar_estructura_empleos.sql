-- Verificar la estructura de la tabla empleos
USE cargas_trabajo;

-- 1. Mostrar la estructura completa de la tabla empleos
DESCRIBE empleos;

-- 2. Mostrar las columnas que existen
SHOW COLUMNS FROM empleos;

-- 3. Verificar si existen las columnas de fecha
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'cargas_trabajo' 
  AND TABLE_NAME = 'empleos'
ORDER BY ORDINAL_POSITION;

-- 4. Verificar algunos empleos existentes
SELECT 
    id,
    nombre,
    codigo,
    nivel_jerarquico,
    activo
FROM empleos 
WHERE activo = 1
LIMIT 5; 