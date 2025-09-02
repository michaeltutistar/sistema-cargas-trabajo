-- Verificar tiempos existentes para el usuario 1 y la estructura específica
USE cargas_trabajo;

-- Verificar tiempos existentes para el usuario 1
SELECT 
    tp.id,
    tp.procedimiento_id,
    tp.empleo_id,
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
    tp.fecha_creacion,
    p.nombre as procedimiento_nombre,
    e.nombre as empleo_nombre,
    a.id as actividad_id,
    a.nombre as actividad_nombre
FROM tiempos_procedimientos tp
INNER JOIN procedimientos p ON tp.procedimiento_id = p.id
INNER JOIN empleos e ON tp.empleo_id = e.id
INNER JOIN actividades a ON p.actividad_id = a.id
WHERE tp.usuario_id = '1' 
  AND tp.activo = 1
ORDER BY tp.fecha_creacion DESC;

-- Verificar específicamente para la estructura 69b7e584-39d9-45a0-8de4-62daffb20466
SELECT 
    tp.id,
    tp.procedimiento_id,
    tp.empleo_id,
    tp.usuario_id,
    tp.estructura_id,
    p.nombre as procedimiento_nombre,
    e.nombre as empleo_nombre,
    a.id as actividad_id,
    a.nombre as actividad_nombre
FROM tiempos_procedimientos tp
INNER JOIN procedimientos p ON tp.procedimiento_id = p.id
INNER JOIN empleos e ON tp.empleo_id = e.id
INNER JOIN actividades a ON p.actividad_id = a.id
WHERE tp.usuario_id = '1' 
  AND tp.estructura_id = '69b7e584-39d9-45a0-8de4-62daffb20466'
  AND tp.activo = 1
ORDER BY tp.fecha_creacion DESC;

-- Verificar para el procedimiento 42 específicamente
SELECT 
    tp.id,
    tp.procedimiento_id,
    tp.empleo_id,
    tp.usuario_id,
    tp.estructura_id,
    p.nombre as procedimiento_nombre,
    e.nombre as empleo_nombre,
    a.id as actividad_id,
    a.nombre as actividad_nombre
FROM tiempos_procedimientos tp
INNER JOIN procedimientos p ON tp.procedimiento_id = p.id
INNER JOIN empleos e ON tp.empleo_id = e.id
INNER JOIN actividades a ON p.actividad_id = a.id
WHERE tp.procedimiento_id = '42'
  AND tp.usuario_id = '1'
  AND tp.activo = 1
ORDER BY tp.fecha_creacion DESC; 