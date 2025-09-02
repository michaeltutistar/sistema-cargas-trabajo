-- Verificar la estructura actual de la tabla tiempos_procedimientos
USE cargas_trabajo;

-- Mostrar la estructura completa de la tabla
DESCRIBE tiempos_procedimientos;

-- Mostrar las columnas que existen
SHOW COLUMNS FROM tiempos_procedimientos;

-- Verificar si existen las columnas de tiempo
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'cargas_trabajo' 
  AND TABLE_NAME = 'tiempos_procedimientos'
ORDER BY ORDINAL_POSITION;

-- Verificar algunos registros de ejemplo
SELECT 
    id,
    procedimiento_id,
    empleo_id,
    usuario_id,
    estructura_id,
    frecuencia_mensual,
    tiempo_estandar,
    horas_directivo,
    horas_asesor,
    horas_profesional,
    horas_tecnico,
    horas_asistencial,
    activo,
    fecha_creacion
FROM tiempos_procedimientos 
WHERE usuario_id = '1' 
LIMIT 3; 