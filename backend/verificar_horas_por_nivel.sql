-- Verificar que las horas por nivel se están guardando correctamente
USE cargas_trabajo;

-- 1. Verificar la estructura de la tabla con las columnas de horas
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'cargas_trabajo' 
  AND TABLE_NAME = 'tiempos_procedimientos'
  AND COLUMN_NAME LIKE 'horas_%'
ORDER BY ORDINAL_POSITION;

-- 2. Verificar tiempos existentes del usuario 1 con detalles de empleo
SELECT 
    tp.id,
    tp.procedimiento_id,
    p.nombre as procedimiento_nombre,
    tp.empleo_id,
    e.nombre as empleo_nombre,
    e.nivel_jerarquico,
    tp.usuario_id,
    tp.estructura_id,
    tp.frecuencia_mensual,
    tp.tiempo_estandar,
    tp.horas_directivo,
    tp.horas_asesor,
    tp.horas_profesional,
    tp.horas_tecnico,
    tp.horas_asistencial,
    tp.activo,
    tp.fecha_creacion
FROM tiempos_procedimientos tp
INNER JOIN procedimientos p ON tp.procedimiento_id = p.id
INNER JOIN empleos e ON tp.empleo_id = e.id
WHERE tp.usuario_id = '1' 
  AND tp.activo = 1
ORDER BY tp.fecha_creacion DESC;

-- 3. Verificar totales por nivel jerárquico
SELECT 
    'DIRECTIVO' as nivel_jerarquico,
    SUM(tp.horas_directivo) as total_horas
FROM tiempos_procedimientos tp
WHERE tp.usuario_id = '1' AND tp.activo = 1

UNION ALL

SELECT 
    'ASESOR' as nivel_jerarquico,
    SUM(tp.horas_asesor) as total_horas
FROM tiempos_procedimientos tp
WHERE tp.usuario_id = '1' AND tp.activo = 1

UNION ALL

SELECT 
    'PROFESIONAL' as nivel_jerarquico,
    SUM(tp.horas_profesional) as total_horas
FROM tiempos_procedimientos tp
WHERE tp.usuario_id = '1' AND tp.activo = 1

UNION ALL

SELECT 
    'TECNICO' as nivel_jerarquico,
    SUM(tp.horas_tecnico) as total_horas
FROM tiempos_procedimientos tp
WHERE tp.usuario_id = '1' AND tp.activo = 1

UNION ALL

SELECT 
    'ASISTENCIAL' as nivel_jerarquico,
    SUM(tp.horas_asistencial) as total_horas
FROM tiempos_procedimientos tp
WHERE tp.usuario_id = '1' AND tp.activo = 1

ORDER BY 
    CASE nivel_jerarquico
        WHEN 'DIRECTIVO' THEN 1
        WHEN 'ASESOR' THEN 2
        WHEN 'PROFESIONAL' THEN 3
        WHEN 'TECNICO' THEN 4
        WHEN 'ASISTENCIAL' THEN 5
    END;

-- 4. Verificar que cada tiempo tiene horas solo en el nivel correspondiente al empleo
SELECT 
    tp.id,
    p.nombre as procedimiento_nombre,
    e.nombre as empleo_nombre,
    e.nivel_jerarquico,
    tp.horas_directivo,
    tp.horas_asesor,
    tp.horas_profesional,
    tp.horas_tecnico,
    tp.horas_asistencial,
    CASE 
        WHEN e.nivel_jerarquico = 'DIRECTIVO' AND tp.horas_directivo > 0 THEN 'CORRECTO'
        WHEN e.nivel_jerarquico = 'ASESOR' AND tp.horas_asesor > 0 THEN 'CORRECTO'
        WHEN e.nivel_jerarquico = 'PROFESIONAL' AND tp.horas_profesional > 0 THEN 'CORRECTO'
        WHEN e.nivel_jerarquico = 'TECNICO' AND tp.horas_tecnico > 0 THEN 'CORRECTO'
        WHEN e.nivel_jerarquico = 'ASISTENCIAL' AND tp.horas_asistencial > 0 THEN 'CORRECTO'
        WHEN e.nivel_jerarquico = 'CONTRATISTA' AND tp.horas_asistencial > 0 THEN 'CORRECTO'
        ELSE 'INCORRECTO'
    END as estado_asignacion
FROM tiempos_procedimientos tp
INNER JOIN procedimientos p ON tp.procedimiento_id = p.id
INNER JOIN empleos e ON tp.empleo_id = e.id
WHERE tp.usuario_id = '1' 
  AND tp.activo = 1
ORDER BY tp.fecha_creacion DESC; 