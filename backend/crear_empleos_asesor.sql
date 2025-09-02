-- Crear empleos con nivel ASESOR
USE cargas_trabajo;

-- 1. Verificar estructura de la tabla empleos
DESCRIBE empleos;

-- 2. Verificar si ya existen empleos ASESOR
SELECT 
    id, nombre, codigo, nivel_jerarquico, activo
FROM empleos 
WHERE nivel_jerarquico = 'ASESOR' 
  AND activo = 1;

-- 3. Insertar empleos ASESOR (versión 1 - con fechas)
INSERT INTO empleos (nombre, codigo, nivel_jerarquico, activo, fecha_creacion, fecha_actualizacion) VALUES
('Asesor Jurídico', 'ASJ001', 'ASESOR', 1, NOW(), NOW()),
('Asesor Financiero', 'ASF001', 'ASESOR', 1, NOW(), NOW()),
('Asesor de Comunicaciones', 'ASC001', 'ASESOR', 1, NOW(), NOW()),
('Asesor de Recursos Humanos', 'ASRH001', 'ASESOR', 1, NOW(), NOW());

-- 4. Si el comando anterior falla, usar esta versión sin fechas
-- INSERT INTO empleos (nombre, codigo, nivel_jerarquico, activo) VALUES
-- ('Asesor Jurídico', 'ASJ001', 'ASESOR', 1),
-- ('Asesor Financiero', 'ASF001', 'ASESOR', 1),
-- ('Asesor de Comunicaciones', 'ASC001', 'ASESOR', 1),
-- ('Asesor de Recursos Humanos', 'ASRH001', 'ASESOR', 1);

-- 5. Verificar que se insertaron correctamente
SELECT 
    id, nombre, codigo, nivel_jerarquico, activo
FROM empleos 
WHERE nivel_jerarquico = 'ASESOR' 
  AND activo = 1
ORDER BY nombre; 