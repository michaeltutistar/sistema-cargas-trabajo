-- Eliminar tiempos existentes que están causando conflictos
USE cargas_trabajo;

-- Verificar antes de eliminar
SELECT 
    tp.id,
    tp.procedimiento_id,
    tp.empleo_id,
    tp.usuario_id,
    tp.estructura_id,
    p.nombre as procedimiento_nombre,
    e.nombre as empleo_nombre
FROM tiempos_procedimientos tp
INNER JOIN procedimientos p ON tp.procedimiento_id = p.id
INNER JOIN empleos e ON tp.empleo_id = e.id
WHERE tp.usuario_id = '1' 
  AND tp.procedimiento_id = '42'
  AND tp.estructura_id = '69b7e584-39d9-45a0-8de4-62daffb20466'
  AND tp.activo = 1;

-- Eliminar los registros conflictivos (soft delete)
UPDATE tiempos_procedimientos 
SET activo = 0, 
    fecha_actualizacion = NOW() 
WHERE usuario_id = '1' 
  AND procedimiento_id = '42'
  AND estructura_id = '69b7e584-39d9-45a0-8de4-62daffb20466'
  AND activo = 1;

-- Verificar que se eliminaron
SELECT 
    tp.id,
    tp.procedimiento_id,
    tp.empleo_id,
    tp.usuario_id,
    tp.estructura_id,
    tp.activo
FROM tiempos_procedimientos tp
WHERE tp.usuario_id = '1' 
  AND tp.procedimiento_id = '42'
  AND tp.estructura_id = '69b7e584-39d9-45a0-8de4-62daffb20466'; 