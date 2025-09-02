-- Script para migrar datos existentes a la nueva estructura

-- 1. Verificar estado antes de la migración
SELECT 
    'Antes de migración' as estado,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN tiempo_estandar > 0 THEN 1 END) as con_tiempo_estandar,
    COUNT(CASE WHEN horas_directivo > 0 OR horas_asesor > 0 OR horas_profesional > 0 OR horas_tecnico > 0 OR horas_asistencial > 0 THEN 1 END) as con_horas_hombre
FROM tiempos_procedimientos;

-- 2. Actualizar registros existentes para calcular las horas hombre
-- Basándose en el empleo_id de cada registro, distribuir las horas hombre
UPDATE tiempos_procedimientos t
INNER JOIN empleos e ON t.empleo_id = e.id
SET 
    t.horas_directivo = CASE WHEN e.nivel_jerarquico = 'DIRECTIVO' THEN t.tiempo_estandar * t.frecuencia_mensual ELSE 0 END,
    t.horas_asesor = CASE WHEN e.nivel_jerarquico = 'ASESOR' THEN t.tiempo_estandar * t.frecuencia_mensual ELSE 0 END,
    t.horas_profesional = CASE WHEN e.nivel_jerarquico = 'PROFESIONAL' THEN t.tiempo_estandar * t.frecuencia_mensual ELSE 0 END,
    t.horas_tecnico = CASE WHEN e.nivel_jerarquico = 'TECNICO' THEN t.tiempo_estandar * t.frecuencia_mensual ELSE 0 END,
    t.horas_asistencial = CASE WHEN e.nivel_jerarquico = 'ASISTENCIAL' THEN t.tiempo_estandar * t.frecuencia_mensual ELSE 0 END
WHERE t.activo = 1;

-- 3. Verificar estado después de la migración
SELECT 
    'Después de migración' as estado,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN tiempo_estandar > 0 THEN 1 END) as con_tiempo_estandar,
    COUNT(CASE WHEN horas_directivo > 0 OR horas_asesor > 0 OR horas_profesional > 0 OR horas_tecnico > 0 OR horas_asistencial > 0 THEN 1 END) as con_horas_hombre
FROM tiempos_procedimientos;

-- 4. Mostrar ejemplo de registros migrados
SELECT 
    t.id,
    p.nombre as procedimiento_nombre,
    e.nombre as empleo_denominacion,
    e.nivel_jerarquico,
    t.frecuencia_mensual,
    t.tiempo_estandar,
    t.horas_directivo,
    t.horas_asesor,
    t.horas_profesional,
    t.horas_tecnico,
    t.horas_asistencial,
    (t.horas_directivo + t.horas_asesor + t.horas_profesional + t.horas_tecnico + t.horas_asistencial) as total_horas_hombre
FROM tiempos_procedimientos t
INNER JOIN procedimientos p ON t.procedimiento_id = p.id
INNER JOIN empleos e ON t.empleo_id = e.id
WHERE t.activo = 1
ORDER BY t.id
LIMIT 10;

-- 5. Verificar totales por niveles de empleo
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

-- 6. Verificar que la vista funciona correctamente
SELECT * FROM v_totales_por_niveles; 