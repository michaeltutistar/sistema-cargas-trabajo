-- Verificar empleos con nivel ASESOR
USE cargas_trabajo;

-- 1. Verificar todos los niveles jerárquicos disponibles
SELECT DISTINCT nivel_jerarquico 
FROM empleos 
WHERE activo = 1 
ORDER BY 
    CASE nivel_jerarquico
        WHEN 'DIRECTIVO' THEN 1
        WHEN 'ASESOR' THEN 2
        WHEN 'PROFESIONAL' THEN 3
        WHEN 'TECNICO' THEN 4
        WHEN 'ASISTENCIAL' THEN 5
        WHEN 'CONTRATISTA' THEN 6
        ELSE 7
    END;

-- 2. Verificar empleos específicamente con nivel ASESOR
SELECT 
    id,
    nombre,
    codigo,
    nivel_jerarquico,
    activo,
    fecha_creacion
FROM empleos 
WHERE nivel_jerarquico = 'ASESOR' 
  AND activo = 1
ORDER BY nombre;

-- 3. Contar empleos por nivel jerárquico
SELECT 
    nivel_jerarquico,
    COUNT(*) as total_empleos
FROM empleos 
WHERE activo = 1
GROUP BY nivel_jerarquico
ORDER BY 
    CASE nivel_jerarquico
        WHEN 'DIRECTIVO' THEN 1
        WHEN 'ASESOR' THEN 2
        WHEN 'PROFESIONAL' THEN 3
        WHEN 'TECNICO' THEN 4
        WHEN 'ASISTENCIAL' THEN 5
        WHEN 'CONTRATISTA' THEN 6
        ELSE 7
    END;

-- 4. Si no hay empleos ASESOR, crear algunos de ejemplo
-- (Descomenta estas líneas si necesitas crear empleos ASESOR)

/*
INSERT INTO empleos (nombre, codigo, nivel_jerarquico, activo, fecha_creacion, fecha_actualizacion) VALUES
('Asesor Jurídico', 'ASJ001', 'ASESOR', 1, NOW(), NOW()),
('Asesor Financiero', 'ASF001', 'ASESOR', 1, NOW(), NOW()),
('Asesor de Comunicaciones', 'ASC001', 'ASESOR', 1, NOW(), NOW()),
('Asesor de Recursos Humanos', 'ASRH001', 'ASESOR', 1, NOW(), NOW());
*/ 