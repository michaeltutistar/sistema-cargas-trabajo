-- Script para verificar que todos los cambios se aplicaron correctamente

-- 1. Verificar estructura final de la tabla
DESCRIBE tiempos_procedimientos;

-- 2. Verificar que todas las columnas nuevas existen
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT, 
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'tiempos_procedimientos'
AND COLUMN_NAME IN ('activo', 'tiempo_estandar', 'horas_directivo', 'horas_asesor', 'horas_profesional', 'horas_tecnico', 'horas_asistencial')
ORDER BY COLUMN_NAME;

-- 3. Verificar que los índices se crearon
SHOW INDEX FROM tiempos_procedimientos 
WHERE Key_name LIKE 'idx_horas_%';

-- 4. Verificar que la vista se creó
SHOW TABLES LIKE 'v_%';

-- 5. Probar la vista de totales por niveles
SELECT * FROM v_totales_por_niveles;

-- 6. Verificar datos existentes
SELECT 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN activo = 1 THEN 1 END) as registros_activos,
    COUNT(CASE WHEN tiempo_estandar > 0 THEN 1 END) as con_tiempo_estandar,
    COUNT(CASE WHEN horas_directivo > 0 THEN 1 END) as con_horas_directivo,
    COUNT(CASE WHEN horas_asesor > 0 THEN 1 END) as con_horas_asesor,
    COUNT(CASE WHEN horas_profesional > 0 THEN 1 END) as con_horas_profesional,
    COUNT(CASE WHEN horas_tecnico > 0 THEN 1 END) as con_horas_tecnico,
    COUNT(CASE WHEN horas_asistencial > 0 THEN 1 END) as con_horas_asistencial
FROM tiempos_procedimientos;

-- 7. Mostrar algunos registros de ejemplo
SELECT 
    id,
    procedimiento_id,
    empleo_id,
    frecuencia_mensual,
    tiempo_estandar,
    horas_directivo,
    horas_asesor,
    horas_profesional,
    horas_tecnico,
    horas_asistencial,
    activo
FROM tiempos_procedimientos 
LIMIT 5; 