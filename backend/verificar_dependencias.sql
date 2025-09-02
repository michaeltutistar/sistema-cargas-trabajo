-- Verificar estructura de la tabla dependencias
DESCRIBE dependencias;

-- Verificar datos de dependencias
SELECT * FROM dependencias LIMIT 5;

-- Verificar elementos de estructura que son dependencias
SELECT 
  ee.id as elemento_id,
  ee.estructura_id,
  ee.tipo,
  ee.elemento_id as dependencia_id,
  d.nombre as dependencia_nombre
FROM elementos_estructura ee
INNER JOIN dependencias d ON ee.elemento_id = d.id
WHERE ee.tipo = 'dependencia' AND ee.activo = 1
LIMIT 10; 