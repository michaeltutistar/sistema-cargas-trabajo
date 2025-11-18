-- Script para agregar nuevos empleos DIRECTIVO desde el PDF "NIVEL DIRECTIVO.pdf"
-- Fecha: 2025-11-18
-- Formato: id, codigo, nombre, nivel_jerarquico, denominacion, grado, activo, fecha_creacion, fecha_actualizacion

-- IMPORTANTE: Antes de ejecutar, verificar el último ID de empleo:
-- SELECT MAX(id) FROM empleos;
-- Ajustar los IDs en este script si es necesario (comienzan desde 161)

-- Verificar si hay códigos duplicados antes de insertar
-- SELECT codigo, COUNT(*) as cantidad, GROUP_CONCAT(denominacion) as denominaciones
-- FROM empleos 
-- WHERE codigo IN ('0157', '0023', '0004', '0160', '0085', '0100', '0086', '0186', '0010', '0131', '0095', '0116', '0136', '0105', '0180', '0141', '0128', '0087', '0042', '0090', '0015', '0153', '0138', '0137', '0005', '0074', '0088', '0151', '0052', '0045', '0161', '0185', '0035', '0037', '0008', '0150', '0025', '0190', '0040', '0044', '0030', '0110', '0108', '0020', '0171', '0065', '0060')
-- GROUP BY codigo 
-- HAVING COUNT(*) > 0;

-- Insertar nuevos empleos DIRECTIVO
-- Nota: Los IDs comienzan desde 161, pero DEBEN ajustarse según el último ID en la base de datos
-- Si hay duplicados de código o ID, se omitirán usando INSERT IGNORE
-- IMPORTANTE: Verificar primero el último ID con: SELECT MAX(id) FROM empleos;

INSERT IGNORE INTO `empleos` (`id`, `codigo`, `nombre`, `nivel_jerarquico`, `denominacion`, `grado`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(161, '0157', '', 'DIRECTIVO', 'Comisionado Nacional del Servicio Civil', NULL, 1, NOW(), NOW()),
(162, '0023', '', 'DIRECTIVO', 'Consejero Comercial', NULL, 1, NOW(), NOW()),
(163, '0004', '', 'DIRECTIVO', 'Contador General de la Nación', NULL, 1, NOW(), NOW()),
(164, '0160', '', 'DIRECTIVO', 'Decano de Institución Universitaria de Escuela Tecnológica o de Institución Tecnológica', NULL, 1, NOW(), NOW()),
(165, '0085', '', 'DIRECTIVO', 'Decano de Universidad o de Escuela Superior', NULL, 1, NOW(), NOW()),
(166, '0100', '', 'DIRECTIVO', 'Director Administrativo y/o Financiero o Técnico u Operativo', NULL, 1, NOW(), NOW()),
(167, '0086', '', 'DIRECTIVO', 'Director de Academia Diplomática', NULL, 1, NOW(), NOW()),
(168, '0186', '', 'DIRECTIVO', 'Director de Centro de Atención Ambulatoria', NULL, 1, NOW(), NOW()),
(169, '0010', '', 'DIRECTIVO', 'Director de Departamento Administrativo', NULL, 1, NOW(), NOW()),
(170, '0131', '', 'DIRECTIVO', 'Director de centro de Carrera o Jefe de Departamento de Institución Universitaria, o de Escuela Tecnológica de Institución Tecnológica', NULL, 1, NOW(), NOW()),
(171, '0095', '', 'DIRECTIVO', 'Director de Escuela o de Instituto, o de Centro o Jefe de Departamento de Universidad', NULL, 1, NOW(), NOW()),
(172, '0116', '', 'DIRECTIVO', 'Director de Fábrica', NULL, 1, NOW(), NOW()),
(173, '0136', '', 'DIRECTIVO', 'Director de Museo o de Teatro o de Coro o Cultural', NULL, 1, NOW(), NOW()),
(174, '0105', '', 'DIRECTIVO', 'Director de Superintendencia', NULL, 1, NOW(), NOW()),
(175, '0180', '', 'DIRECTIVO', 'Director de Unidad Hospitalaria', NULL, 1, NOW(), NOW()),
(176, '0141', '', 'DIRECTIVO', 'Director de Unidad de Institución Técnica Profesional', NULL, 1, NOW(), NOW()),
(177, '0128', '', 'DIRECTIVO', 'Director de Unidad Tecnológica o de Unidad Académica', NULL, 1, NOW(), NOW()),
(178, '0087', '', 'DIRECTIVO', 'Director General de Protocolo', NULL, 1, NOW(), NOW()),
(179, '0042', '', 'DIRECTIVO', 'Director o Gerente Territorial o Regional o Seccional', NULL, 1, NOW(), NOW()),
(180, '0090', '', 'DIRECTIVO', 'Experto de Comisión Reguladora', NULL, 1, NOW(), NOW()),
(181, '0015', '', 'DIRECTIVO', 'Gerente, Presidente o Director General o Nacional de Entidad Descentralizada o de Unidad Administrativa Especial', NULL, 1, NOW(), NOW()),
(182, '0153', '', 'DIRECTIVO', 'Gestor en Ciencia y Tecnología', NULL, 1, NOW(), NOW()),
(183, '0138', '', 'DIRECTIVO', 'Intendente', NULL, 1, NOW(), NOW()),
(184, '0137', '', 'DIRECTIVO', 'Jefe de Oficina', NULL, 1, NOW(), NOW()),
(185, '0005', '', 'DIRECTIVO', 'Ministro', NULL, 1, NOW(), NOW()),
(186, '0074', '', 'DIRECTIVO', 'Ministro Plenipotenciario', NULL, 1, NOW(), NOW()),
(187, '0088', '', 'DIRECTIVO', 'Negociador Internacional', NULL, 1, NOW(), NOW()),
(188, '0151', '', 'DIRECTIVO', 'Rector de Institución Técnica Profesional', NULL, 1, NOW(), NOW()),
(189, '0052', '', 'DIRECTIVO', 'Rector de Institución Universitaria o de escuela Tecnológica o de Institución Tecnológica', NULL, 1, NOW(), NOW()),
(190, '0045', '', 'DIRECTIVO', 'Rector de Universidad', NULL, 1, NOW(), NOW()),
(191, '0161', '', 'DIRECTIVO', 'Secretario General de Institución Técnica Profesional', NULL, 1, NOW(), NOW()),
(192, '0185', '', 'DIRECTIVO', 'Secretario General de Institución Universitaria o de Escuela Tecnológica o de Institución Tecnológica', NULL, 1, NOW(), NOW()),
(193, '0035', '', 'DIRECTIVO', 'Secretario General de Ministerio o de Departamento Administrativo', NULL, 1, NOW(), NOW()),
(194, '0037', '', 'DIRECTIVO', 'Secretario General de Unidad Administrativa Especial o de Superintendencia o de Entidad Descentralizada', NULL, 1, NOW(), NOW()),
(195, '0008', '', 'DIRECTIVO', 'Subcontador General de la Nación', NULL, 1, NOW(), NOW()),
(196, '0150', '', 'DIRECTIVO', 'Subdirector Administrativo y/o Financiero o Técnico u Operativo', NULL, 1, NOW(), NOW()),
(197, '0025', '', 'DIRECTIVO', 'Subdirector de Departamento Administrativo', NULL, 1, NOW(), NOW()),
(198, '0190', '', 'DIRECTIVO', 'Subdirector de Unidad Hospitalaria', NULL, 1, NOW(), NOW()),
(199, '0040', '', 'DIRECTIVO', 'Subgerente, Vicepresidente o Subdirector General o Nacional de Entidad Descentralizada o de Unidad Administrativa Especial', NULL, 1, NOW(), NOW()),
(200, '0044', '', 'DIRECTIVO', 'Subsecretario de Relaciones Exteriores', NULL, 1, NOW(), NOW()),
(201, '0030', '', 'DIRECTIVO', 'Superintendente', NULL, 1, NOW(), NOW()),
(202, '0110', '', 'DIRECTIVO', 'Superintendente Delegado', NULL, 1, NOW(), NOW()),
(203, '0108', '', 'DIRECTIVO', 'Superintendente Delegado Adjunto', NULL, 1, NOW(), NOW()),
(204, '0020', '', 'DIRECTIVO', 'Viceministro', NULL, 1, NOW(), NOW()),
(205, '0171', '', 'DIRECTIVO', 'Vicerrector de Institución Técnica Profesional', NULL, 1, NOW(), NOW()),
(206, '0065', '', 'DIRECTIVO', 'Vicerrector o Director Administrativo de Institución Universitaria o de Escuela Tecnológica o de Institución Tecnológica', NULL, 1, NOW(), NOW()),
(207, '0060', '', 'DIRECTIVO', 'Vicerrector o Director Administrativo de Universidad', NULL, 1, NOW(), NOW());

-- Verificar que se insertaron correctamente
-- SELECT COUNT(*) as total_directivos FROM empleos WHERE nivel_jerarquico = 'DIRECTIVO';
-- SELECT * FROM empleos WHERE nivel_jerarquico = 'DIRECTIVO' ORDER BY codigo;
