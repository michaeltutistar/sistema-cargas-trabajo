-- Script para agregar nuevos empleos ASISTENCIAL desde el PDF "NIVEL ASISTENCIAL.pdf"
-- Fecha: 2025-11-18
-- Formato: id, codigo, nombre, nivel_jerarquico, denominacion, grado, activo, fecha_creacion, fecha_actualizacion

-- IMPORTANTE: Antes de ejecutar, verificar el último ID de empleo:
-- SELECT MAX(id) FROM empleos;
-- Ajustar los IDs en este script si es necesario (comienzan desde 274, después de los TÉCNICO)

-- Verificar si hay códigos duplicados antes de insertar
-- SELECT codigo, COUNT(*) as cantidad, GROUP_CONCAT(denominacion) as denominaciones
-- FROM empleos 
-- WHERE codigo IN ('4002', '4006', '4008', '4026', '4028', '4032', '4034', '4036', '4038', '4044', '4048', '4056', '4064', '4069', '4078', '4097', '4103', '4112', '4114', '4123', '4128', '4137', '4152', '4158', '4167', '4169', '4173', '4178', '4182', '4210', '4212', '4215', '4220', '4222', '4225')
-- GROUP BY codigo 
-- HAVING COUNT(*) > 0;

-- Insertar nuevos empleos ASISTENCIAL
-- Nota: Los IDs comienzan desde 274, pero DEBEN ajustarse según el último ID en la base de datos
-- Si hay duplicados de código o ID, se omitirán usando INSERT IGNORE
-- IMPORTANTE: Verificar primero el último ID con: SELECT MAX(id) FROM empleos;
-- El grado para ASISTENCIAL es 4 según los empleos existentes
-- Nota: "Auxiliar Area Salud" no tiene código en el PDF, se omite o se puede agregar con código NULL

INSERT IGNORE INTO `empleos` (`id`, `codigo`, `nombre`, `nivel_jerarquico`, `denominacion`, `grado`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(274, '4002', '', 'ASISTENCIAL', 'Adjunto Jefe', 4, 1, NOW(), NOW()),
(275, '4006', '', 'ASISTENCIAL', 'Adjunto Intendente', 4, 1, NOW(), NOW()),
(276, '4008', '', 'ASISTENCIAL', 'Adjunto Mayor', 4, 1, NOW(), NOW()),
(277, '4026', '', 'ASISTENCIAL', 'Adjunto Especial', 4, 1, NOW(), NOW()),
(278, '4028', '', 'ASISTENCIAL', 'Adjunto Primero', 4, 1, NOW(), NOW()),
(279, '4032', '', 'ASISTENCIAL', 'Adjunto Segundo', 4, 1, NOW(), NOW()),
(280, '4034', '', 'ASISTENCIAL', 'Adjunto Tercero', 4, 1, NOW(), NOW()),
(281, '4036', '', 'ASISTENCIAL', 'Adjunto Cuarto', 4, 1, NOW(), NOW()),
(282, '4038', '', 'ASISTENCIAL', 'Adjunto Quinto', 4, 1, NOW(), NOW()),
(283, '4044', '', 'ASISTENCIAL', 'Auxiliar Administrativo', 4, 1, NOW(), NOW()),
(284, '4048', '', 'ASISTENCIAL', 'Auxiliar Bilingüe', 4, 1, NOW(), NOW()),
(285, '4056', '', 'ASISTENCIAL', 'Auxiliar de Servicios Asistenciales', 4, 1, NOW(), NOW()),
(286, '4064', '', 'ASISTENCIAL', 'Auxiliar de Servicios Generales', 4, 1, NOW(), NOW()),
(287, '4069', '', 'ASISTENCIAL', 'Ayudante', 4, 1, NOW(), NOW()),
(288, '4078', '', 'ASISTENCIAL', 'Capitán de Prisiones', 4, 1, NOW(), NOW()),
(289, '4097', '', 'ASISTENCIAL', 'Celador', 4, 1, NOW(), NOW()),
(290, '4103', '', 'ASISTENCIAL', 'Conductor Mecánico', 4, 1, NOW(), NOW()),
(291, '4112', '', 'ASISTENCIAL', 'Distinguido', 4, 1, NOW(), NOW()),
(292, '4114', '', 'ASISTENCIAL', 'Dragoneante', 4, 1, NOW(), NOW()),
(293, '4123', '', 'ASISTENCIAL', 'Ecónomo', 4, 1, NOW(), NOW()),
(294, '4128', '', 'ASISTENCIAL', 'Enfermero Auxiliar', 4, 1, NOW(), NOW()),
(295, '4137', '', 'ASISTENCIAL', 'Inspector', 4, 1, NOW(), NOW()),
(296, '4152', '', 'ASISTENCIAL', 'Inspector Jefe', 4, 1, NOW(), NOW()),
(297, '4158', '', 'ASISTENCIAL', 'Mayor de Prisiones', 4, 1, NOW(), NOW()),
(298, '4167', '', 'ASISTENCIAL', 'Operario', 4, 1, NOW(), NOW()),
(299, '4169', '', 'ASISTENCIAL', 'Operario Calificado', 4, 1, NOW(), NOW()),
(300, '4173', '', 'ASISTENCIAL', 'Pagador', 4, 1, NOW(), NOW()),
(301, '4178', '', 'ASISTENCIAL', 'Secretario', 4, 1, NOW(), NOW()),
(302, '4182', '', 'ASISTENCIAL', 'Secretario Bilingüe', 4, 1, NOW(), NOW()),
(303, '4210', '', 'ASISTENCIAL', 'Secretario Ejecutivo', 4, 1, NOW(), NOW()),
(304, '4212', '', 'ASISTENCIAL', 'Secretario Ejecutivo del Despacho del Ministro o de Director de Departamento Administrativo', 4, 1, NOW(), NOW()),
(305, '4215', '', 'ASISTENCIAL', 'Secretario Ejecutivo del Delegado del Viceministro o de Subdirector de Departamento Administrativo', 4, 1, NOW(), NOW()),
(306, '4220', '', 'ASISTENCIAL', 'Supervisor', 4, 1, NOW(), NOW()),
(307, '4222', '', 'ASISTENCIAL', 'Teniente de Prisiones', 4, 1, NOW(), NOW()),
(308, '4225', '', 'ASISTENCIAL', 'Tesorero', 4, 1, NOW(), NOW());

-- Verificar que se insertaron correctamente
-- SELECT COUNT(*) as total_asistenciales FROM empleos WHERE nivel_jerarquico = 'ASISTENCIAL';
-- SELECT * FROM empleos WHERE nivel_jerarquico = 'ASISTENCIAL' ORDER BY codigo;

