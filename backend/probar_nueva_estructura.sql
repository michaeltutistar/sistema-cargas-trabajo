-- Script para probar la nueva estructura con datos de ejemplo

-- 1. Verificar que las columnas existen
DESCRIBE tiempos_procedimientos;

-- 2. Insertar un tiempo de prueba con la nueva estructura
INSERT INTO tiempos_procedimientos (
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
    observaciones,
    activo
) VALUES (
    1, -- procedimiento_id
    2, -- empleo_id
    '3b3a50f4-f5da-4de8-a800-859ceae8d9d6', -- usuario_id (admin)
    'f98fbd33-66cb-419d-b478-1d3dcc03356b', -- estructura_id
    5.0, -- frecuencia_mensual
    34.2, -- tiempo_estandar
    0.0, -- horas_directivo
    17.12, -- horas_asesor
    1.78, -- horas_profesional
    0.0, -- horas_tecnico
    0.0, -- horas_asistencial
    'Tiempo de prueba con nueva estructura',
    1 -- activo
);

-- 3. Verificar que se insertó correctamente
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
    observaciones,
    activo
FROM tiempos_procedimientos 
WHERE observaciones LIKE '%prueba%'
ORDER BY id DESC
LIMIT 1;

-- 4. Probar la vista de totales por niveles
SELECT * FROM v_totales_por_niveles;

-- 5. Verificar totales por niveles con datos reales
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
WHERE activo = 1

ORDER BY 
    CASE nivel_jerarquico
        WHEN 'DIRECTIVO' THEN 1
        WHEN 'ASESOR' THEN 2
        WHEN 'PROFESIONAL' THEN 3
        WHEN 'TECNICO' THEN 4
        WHEN 'ASISTENCIAL' THEN 5
    END; 