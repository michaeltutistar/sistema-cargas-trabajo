-- Script para agregar nuevos empleos ASESOR desde el PDF "NIVEL ASESOR.pdf"
-- Fecha: 2025-11-18
-- Formato: id, codigo, nombre, nivel_jerarquico, denominacion, grado, activo, fecha_creacion, fecha_actualizacion

-- IMPORTANTE: Antes de ejecutar, verificar el último ID de empleo:
-- SELECT MAX(id) FROM empleos;
-- Ajustar los IDs en este script si es necesario (comienzan desde 208, después de los DIRECTIVO)

-- Verificar si hay códigos duplicados antes de insertar
-- SELECT codigo, COUNT(*) as cantidad, GROUP_CONCAT(denominacion) as denominaciones
-- FROM empleos 
-- WHERE codigo IN ('1020', '1045', '1050', '1060')
-- GROUP BY codigo 
-- HAVING COUNT(*) > 0;

-- Insertar nuevos empleos ASESOR
-- Nota: Los IDs comienzan desde 208, pero DEBEN ajustarse según el último ID en la base de datos
-- Si hay duplicados de código o ID, se omitirán usando INSERT IGNORE
-- IMPORTANTE: Verificar primero el último ID con: SELECT MAX(id) FROM empleos;
-- El grado para ASESOR es 15 según los empleos existentes

INSERT IGNORE INTO `empleos` (`id`, `codigo`, `nombre`, `nivel_jerarquico`, `denominacion`, `grado`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(208, '1020', '', 'ASESOR', 'Asesor', 15, 1, NOW(), NOW()),
(209, '1045', '', 'ASESOR', 'Jefe de Oficina Asesora de Comunicaciones o de Prensa o de Jurídica o de Planeación', 15, 1, NOW(), NOW()),
(210, '1050', '', 'ASESOR', 'Agregado para Asuntos Aéreos', 15, 1, NOW(), NOW()),
(211, '1060', '', 'ASESOR', 'Asesor Comercial', 15, 1, NOW(), NOW());

-- Verificar que se insertaron correctamente
-- SELECT COUNT(*) as total_asesores FROM empleos WHERE nivel_jerarquico = 'ASESOR';
-- SELECT * FROM empleos WHERE nivel_jerarquico = 'ASESOR' ORDER BY codigo;


