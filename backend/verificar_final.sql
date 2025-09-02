-- Script para verificar que todo esté funcionando correctamente

-- 1. Verificar estructura final
DESCRIBE tiempos_procedimientos;

-- 2. Verificar que las columnas de horas hombre existen
SHOW COLUMNS FROM tiempos_procedimientos LIKE 'horas_%';

-- 3. Verificar que la vista existe
SHOW TABLES LIKE 'v_%';

-- 4. Probar la vista de totales por niveles
SELECT * FROM v_totales_por_niveles;

-- 5. Verificar datos existentes
SELECT 
    COUNT(*) as total_registros,
    COUNT(CASE WHEN activo = 1 THEN 1 END) as registros_activos,
    COUNT(CASE WHEN tiempo_estandar > 0 THEN 1 END) as con_tiempo_estandar,
    COUNT(CASE WHEN horas_directivo > 0 OR horas_asesor > 0 OR horas_profesional > 0 OR horas_tecnico > 0 OR horas_asistencial > 0 THEN 1 END) as con_horas_hombre
FROM tiempos_procedimientos;

-- 6. Mostrar algunos registros de ejemplo
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

-- 7. Verificar que hay datos en la tabla empleos
SELECT COUNT(*) as total_empleos FROM empleos;

-- 8. Verificar que hay datos en la tabla procedimientos
SELECT COUNT(*) as total_procedimientos FROM procedimientos; 