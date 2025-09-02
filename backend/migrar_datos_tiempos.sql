-- Script para migrar datos existentes a la nueva estructura de tiempos_procedimientos
-- Este script debe ejecutarse después de aplicar modificar_estructura_tiempos.sql

-- 1. Actualizar registros existentes para calcular las horas hombre por niveles
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

-- 2. Verificar la migración
SELECT 
    COUNT(*) as total_registros,
    SUM(horas_directivo) as total_horas_directivo,
    SUM(horas_asesor) as total_horas_asesor,
    SUM(horas_profesional) as total_horas_profesional,
    SUM(horas_tecnico) as total_horas_tecnico,
    SUM(horas_asistencial) as total_horas_asistencial,
    SUM(horas_directivo + horas_asesor + horas_profesional + horas_tecnico + horas_asistencial) as total_horas_totales
FROM tiempos_procedimientos 
WHERE activo = 1;

-- 3. Mostrar ejemplo de registros migrados
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
    t.horas_asistencial
FROM tiempos_procedimientos t
INNER JOIN procedimientos p ON t.procedimiento_id = p.id
INNER JOIN empleos e ON t.empleo_id = e.id
WHERE t.activo = 1
ORDER BY t.id
LIMIT 10;

-- 4. Verificar totales por niveles de empleo
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