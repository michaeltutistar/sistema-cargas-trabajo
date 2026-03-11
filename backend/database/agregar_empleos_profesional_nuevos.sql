-- Script para agregar nuevos empleos PROFESIONAL desde el PDF "NIVEL PROFESIONAL.pdf"
-- Fecha: 2025-11-18
-- Formato: id, codigo, nombre, nivel_jerarquico, denominacion, grado, activo, fecha_creacion, fecha_actualizacion

-- IMPORTANTE: Antes de ejecutar, verificar el último ID de empleo:
-- SELECT MAX(id) FROM empleos;
-- Ajustar los IDs en este script si es necesario (comienzan desde 212, después de los ASESOR)

-- Verificar si hay códigos duplicados antes de insertar
-- SELECT codigo, COUNT(*) as cantidad, GROUP_CONCAT(denominacion) as denominaciones
-- FROM empleos 
-- WHERE codigo IN ('2024', '2001', '2132', '2133', '2002', '2125', '2137', '2012', '2014', '2018', '2003', '2004', '2085', '2120', '2142', '2087', '2123', '2052', '2053', '2009', '2007', '2112', '2165', '2028', '2033', '2044', '2048', '2152', '2168', '2173', '2184', '2094', '2186', '2102', '2103', '2114', '2147', '2116')
-- GROUP BY codigo 
-- HAVING COUNT(*) > 0;

-- Insertar nuevos empleos PROFESIONAL
-- Nota: Los IDs comienzan desde 212, pero DEBEN ajustarse según el último ID en la base de datos
-- Si hay duplicados de código o ID, se omitirán usando INSERT IGNORE
-- IMPORTANTE: Verificar primero el último ID con: SELECT MAX(id) FROM empleos;
-- El grado para PROFESIONAL es 12 según los empleos existentes

INSERT IGNORE INTO `empleos` (`id`, `codigo`, `nombre`, `nivel_jerarquico`, `denominacion`, `grado`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(212, '2024', '', 'PROFESIONAL', 'Administrador de Parques Nacionales', 12, 1, NOW(), NOW()),
(213, '2001', '', 'PROFESIONAL', 'Capellán', 12, 1, NOW(), NOW()),
(214, '2132', '', 'PROFESIONAL', 'Comandante Superior de Prisiones', 12, 1, NOW(), NOW()),
(215, '2133', '', 'PROFESIONAL', 'Consejero de Relaciones Exteriores', 12, 1, NOW(), NOW()),
(216, '2002', '', 'PROFESIONAL', 'Copiloto de Aviación', 12, 1, NOW(), NOW()),
(217, '2125', '', 'PROFESIONAL', 'Defensor de Familia', 12, 1, NOW(), NOW()),
(218, '2137', '', 'PROFESIONAL', 'Director de Establecimiento Carcelario', 12, 1, NOW(), NOW()),
(219, '2012', '', 'PROFESIONAL', 'Especialista Asesor Primero', 12, 1, NOW(), NOW()),
(220, '2014', '', 'PROFESIONAL', 'Especialista Asesor Segundo', 12, 1, NOW(), NOW()),
(221, '2018', '', 'PROFESIONAL', 'Especialista Jefe', 12, 1, NOW(), NOW()),
(222, '2003', '', 'PROFESIONAL', 'Inspector de Trabajo y Seguridad Social', 12, 1, NOW(), NOW()),
(223, '2004', '', 'PROFESIONAL', 'Inspector de Trabajo y Seguridad Social Especializado', 12, 1, NOW(), NOW()),
(224, '2085', '', 'PROFESIONAL', 'Médico', 12, 1, NOW(), NOW()),
(225, '2120', '', 'PROFESIONAL', 'Médico Especialista', 12, 1, NOW(), NOW()),
(226, '2142', '', 'PROFESIONAL', 'Ministro Consejero', 12, 1, NOW(), NOW()),
(227, '2087', '', 'PROFESIONAL', 'Odontólogo', 12, 1, NOW(), NOW()),
(228, '2123', '', 'PROFESIONAL', 'Odontólogo Especialista', 12, 1, NOW(), NOW()),
(229, '2052', '', 'PROFESIONAL', 'Oficial Logístico', 12, 1, NOW(), NOW()),
(230, '2053', '', 'PROFESIONAL', 'Oficial de Tratamiento Penitenciario', 12, 1, NOW(), NOW()),
(231, '2009', '', 'PROFESIONAL', 'Pastor u Orientador Espiritual', 12, 1, NOW(), NOW()),
(232, '2007', '', 'PROFESIONAL', 'Piloto de Aviación', 12, 1, NOW(), NOW()),
(233, '2112', '', 'PROFESIONAL', 'Primer Secretario de Relaciones Exteriores', 12, 1, NOW(), NOW()),
(234, '2165', '', 'PROFESIONAL', 'Profesional de Gestión Institucional', 12, 1, NOW(), NOW()),
(235, '2028', '', 'PROFESIONAL', 'Profesional Especializado', 12, 1, NOW(), NOW()),
(236, '2033', '', 'PROFESIONAL', 'Profesional Especializado Area de Salud', 12, 1, NOW(), NOW()),
(237, '2044', '', 'PROFESIONAL', 'Profesional Universitario', 12, 1, NOW(), NOW()),
(238, '2048', '', 'PROFESIONAL', 'Profesional Universitario Area de Salud', 12, 1, NOW(), NOW()),
(239, '2152', '', 'PROFESIONAL', 'Registrador Delegado', 12, 1, NOW(), NOW()),
(240, '2168', '', 'PROFESIONAL', 'Registrador Principal', 12, 1, NOW(), NOW()),
(241, '2173', '', 'PROFESIONAL', 'Registrador Seccional', 12, 1, NOW(), NOW()),
(242, '2184', '', 'PROFESIONAL', 'Representante del Ministerio de Educación ante Entidad Territorial', 12, 1, NOW(), NOW()),
(243, '2094', '', 'PROFESIONAL', 'Restaurador o Museólogo o Curador', 12, 1, NOW(), NOW()),
(244, '2186', '', 'PROFESIONAL', 'Secretario de Facultad', 12, 1, NOW(), NOW()),
(245, '2102', '', 'PROFESIONAL', 'Secretario Comercial I', 12, 1, NOW(), NOW()),
(246, '2103', '', 'PROFESIONAL', 'Secretario Comercial II', 12, 1, NOW(), NOW()),
(247, '2114', '', 'PROFESIONAL', 'Segundo Secretario de Relaciones Exteriores', 12, 1, NOW(), NOW()),
(248, '2147', '', 'PROFESIONAL', 'Subdirector de Establecimiento Carcelario', 12, 1, NOW(), NOW()),
(249, '2116', '', 'PROFESIONAL', 'Tercer Secretario de Relaciones Exteriores', 12, 1, NOW(), NOW());

-- Verificar que se insertaron correctamente
-- SELECT COUNT(*) as total_profesionales FROM empleos WHERE nivel_jerarquico = 'PROFESIONAL';
-- SELECT * FROM empleos WHERE nivel_jerarquico = 'PROFESIONAL' ORDER BY codigo;


