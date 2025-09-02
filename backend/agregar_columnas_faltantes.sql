-- Agregar las columnas de tiempo que faltan en la tabla tiempos_procedimientos
USE cargas_trabajo;

-- Verificar si las columnas existen antes de agregarlas
SELECT 
    COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'cargas_trabajo' 
  AND TABLE_NAME = 'tiempos_procedimientos'
  AND COLUMN_NAME IN ('tiempo_minimo', 'tiempo_promedio', 'tiempo_maximo');

-- Agregar las columnas si no existen
ALTER TABLE tiempos_procedimientos 
ADD COLUMN IF NOT EXISTS tiempo_minimo DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Tiempo mínimo en horas';

ALTER TABLE tiempos_procedimientos 
ADD COLUMN IF NOT EXISTS tiempo_promedio DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Tiempo promedio en horas';

ALTER TABLE tiempos_procedimientos 
ADD COLUMN IF NOT EXISTS tiempo_maximo DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Tiempo máximo en horas';

-- Verificar que se agregaron correctamente
DESCRIBE tiempos_procedimientos;

-- Mostrar las columnas de tiempo específicamente
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'cargas_trabajo' 
  AND TABLE_NAME = 'tiempos_procedimientos'
  AND COLUMN_NAME IN ('tiempo_minimo', 'tiempo_promedio', 'tiempo_maximo', 'tiempo_estandar')
ORDER BY ORDINAL_POSITION; 