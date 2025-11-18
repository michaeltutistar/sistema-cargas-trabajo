-- Script para agregar nuevos empleos TÉCNICO desde el PDF "NIVEL TECNICO.pdf"
-- Fecha: 2025-11-18
-- Formato: id, codigo, nombre, nivel_jerarquico, denominacion, grado, activo, fecha_creacion, fecha_actualizacion

-- IMPORTANTE: Antes de ejecutar, verificar el último ID de empleo:
-- SELECT MAX(id) FROM empleos;
-- Ajustar los IDs en este script si es necesario (comienzan desde 250, después de los PROFESIONAL)

-- Verificar si hay códigos duplicados antes de insertar
-- SELECT codigo, COUNT(*) as cantidad, GROUP_CONCAT(denominacion) as denominaciones
-- FROM empleos 
-- WHERE codigo IN ('3003', '3038', '3046', '3054', '3066', '3074', '3078', '3080', '3084', '3092', '3094', '3070', '3102', '3105', '3110', '3116', '3118', '3100', '3124', '3234', '3128', '3132', '3136', '3142')
-- GROUP BY codigo 
-- HAVING COUNT(*) > 0;

-- Insertar nuevos empleos TÉCNICO
-- Nota: Los IDs comienzan desde 250, pero DEBEN ajustarse según el último ID en la base de datos
-- Si hay duplicados de código o ID, se omitirán usando INSERT IGNORE
-- IMPORTANTE: Verificar primero el último ID con: SELECT MAX(id) FROM empleos;
-- El grado para TÉCNICO es 8 según los empleos existentes

INSERT IGNORE INTO `empleos` (`id`, `codigo`, `nombre`, `nivel_jerarquico`, `denominacion`, `grado`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(250, '3003', '', 'TECNICO', 'Analista de Sistemas', 8, 1, NOW(), NOW()),
(251, '3038', '', 'TECNICO', 'Auxiliar de Escena', 8, 1, NOW(), NOW()),
(252, '3046', '', 'TECNICO', 'Auxiliar de Pronóstico', 8, 1, NOW(), NOW()),
(253, '3054', '', 'TECNICO', 'Auxiliar de Técnico', 8, 1, NOW(), NOW()),
(254, '3066', '', 'TECNICO', 'Dactiloscopista', 8, 1, NOW(), NOW()),
(255, '3074', '', 'TECNICO', 'Especialista Primero', 8, 1, NOW(), NOW()),
(256, '3078', '', 'TECNICO', 'Especialista Segundo', 8, 1, NOW(), NOW()),
(257, '3080', '', 'TECNICO', 'Especialista Tercero', 8, 1, NOW(), NOW()),
(258, '3084', '', 'TECNICO', 'Especialista cuarto', 8, 1, NOW(), NOW()),
(259, '3092', '', 'TECNICO', 'Especialista Quinto', 8, 1, NOW(), NOW()),
(260, '3094', '', 'TECNICO', 'Especialista Sexto', 8, 1, NOW(), NOW()),
(261, '3070', '', 'TECNICO', 'Instructor', 8, 1, NOW(), NOW()),
(262, '3102', '', 'TECNICO', 'Instrumentador Quirúrgico', 8, 1, NOW(), NOW()),
(263, '3105', '', 'TECNICO', 'Observador de Superficie', 8, 1, NOW(), NOW()),
(264, '3110', '', 'TECNICO', 'Oficial de Catastro', 8, 1, NOW(), NOW()),
(265, '3116', '', 'TECNICO', 'Pronosticador', 8, 1, NOW(), NOW()),
(266, '3118', '', 'TECNICO', 'Radiosondista', 8, 1, NOW(), NOW()),
(267, '3100', '', 'TECNICO', 'Técnico', 8, 1, NOW(), NOW()),
(268, '3124', '', 'TECNICO', 'Técnico Administrativo', 8, 1, NOW(), NOW()),
(269, '3234', '', 'TECNICO', 'Técnico Area Salud', 8, 1, NOW(), NOW()),
(270, '3128', '', 'TECNICO', 'Técnico de Servicios Asistenciales', 8, 1, NOW(), NOW()),
(271, '3132', '', 'TECNICO', 'Técnico Operativo', 8, 1, NOW(), NOW()),
(272, '3136', '', 'TECNICO', 'Topógrafo', 8, 1, NOW(), NOW()),
(273, '3142', '', 'TECNICO', 'Topógrafo Tecnólogo', 8, 1, NOW(), NOW());

-- Verificar que se insertaron correctamente
-- SELECT COUNT(*) as total_tecnicos FROM empleos WHERE nivel_jerarquico = 'TECNICO';
-- SELECT * FROM empleos WHERE nivel_jerarquico = 'TECNICO' ORDER BY codigo;

