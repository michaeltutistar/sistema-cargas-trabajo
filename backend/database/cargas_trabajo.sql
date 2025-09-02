-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 14, 2025 at 06:58 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cargas_trabajo`
--

-- --------------------------------------------------------

--
-- Table structure for table `actividades`
--

CREATE TABLE `actividades` (
  `id` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `proceso_id` int(11) DEFAULT NULL,
  `activa` tinyint(4) DEFAULT 1,
  `orden` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `actividades`
--

INSERT INTO `actividades` (`id`, `nombre`, `descripcion`, `proceso_id`, `activa`, `orden`) VALUES
(1, 'Planificación', 'Actividad de planificación estratégica', 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `dependencias`
--

CREATE TABLE `dependencias` (
  `id` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activa` tinyint(4) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dependencias`
--

INSERT INTO `dependencias` (`id`, `nombre`, `descripcion`, `activa`, `fecha_creacion`) VALUES
(1, 'Dirección General', 'Dependencia principal', 1, '2025-08-13 23:53:04');

-- --------------------------------------------------------

--
-- Table structure for table `empleos`
--

CREATE TABLE `empleos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `nombre` text NOT NULL,
  `nivel_jerarquico` varchar(50) DEFAULT NULL,
  `denominacion` text DEFAULT NULL,
  `grado` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `empleos`
--

INSERT INTO `empleos` (`id`, `codigo`, `nombre`, `nivel_jerarquico`, `denominacion`, `grado`, `activo`) VALUES
(1, 'DIR-001', 'Director General', 'DIRECTIVO', 'Director General', 24, 1),
(2, 'PRO-001', 'Profesional Especializado', 'PROFESIONAL', 'Profesional Especializado', 16, 1),
(3, 'TEC-001', 'Técnico Especializado', 'TECNICO', 'Técnico Especializado', 10, 1),
(4, 'ASI-001', 'Asistente Administrativo', 'ASISTENCIAL', 'Asistente Administrativo', 6, 1),
(5, 'CON-001', 'Contratista', 'CONTRATISTA', 'Contratista', 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `procedimientos`
--

CREATE TABLE `procedimientos` (
  `id` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `actividad_id` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT 1,
  `nivel_jerarquico` varchar(50) DEFAULT NULL,
  `orden` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `procedimientos`
--

INSERT INTO `procedimientos` (`id`, `nombre`, `descripcion`, `actividad_id`, `activo`, `nivel_jerarquico`, `orden`) VALUES
(1, 'Elaboración del Plan Estratégico', 'Procedimiento para elaborar el plan estratégico', 1, 1, 'PROFESIONAL', 1);

-- --------------------------------------------------------

--
-- Table structure for table `procesos`
--

CREATE TABLE `procesos` (
  `id` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `dependencia_id` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT 1,
  `orden` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `procesos`
--

INSERT INTO `procesos` (`id`, `nombre`, `descripcion`, `dependencia_id`, `activo`, `orden`) VALUES
(1, 'Proceso Estratégico', 'Proceso de planificación estratégica', 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `tiempos_procedimientos`
--

CREATE TABLE `tiempos_procedimientos` (
  `id` int(11) NOT NULL,
  `procedimiento_id` int(11) NOT NULL,
  `empleo_id` int(11) NOT NULL,
  `tiempo_horas` decimal(10,2) NOT NULL,
  `frecuencia_mensual` int(11) NOT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` varchar(36) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `rol` varchar(20) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `password`, `nombre`, `apellido`, `rol`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
('1', 'admin@admin.com', '$2b$12$AwB/wei9P9BkFTIYLYkLo.H5WqoB0CgYdjvmrIfsWbdWDWcaUmmJW', 'Admin', 'Sistema', 'admin', 1, '2025-07-23 10:30:06', '2025-07-23 10:30:06'),
('3b3a50f4-f5da-4de8-a800-859ceae8d9d6', 'admin@cargas-trabajo.gov.co', '$2a$10$Yx/wi3w589Rm8WtV7U2gVumFXEkvQnyMA4eVDHwmQRAn9IueJvM.O', 'Administrador', 'Sistema', 'admin', 1, '2025-08-14 04:01:44', '2025-08-14 04:01:44'),
('4997cd3c-2cdb-4597-b3a7-3401a3f6587f', 'analista@cargas-trabajo.gov.co', '$2a$10$wJCnBPzt6gxBMBZGHN.NlOwERjUrYhP3rGw3hnDtzfofblYFuk9ba', 'María', 'Rodríguez', 'usuario', 1, '2025-08-14 04:01:44', '2025-08-14 04:01:44'),
('d06759d7-7417-428f-8a02-0819b9567284', 'consultor@cargas-trabajo.gov.co', '$2a$10$lP1R1YVn8b9MwIvYjNAplukOP1L4ZJjfORb.EcjvLfMz.yf5JpAKm', 'Juan', 'García', 'consulta', 1, '2025-08-14 04:01:45', '2025-08-14 04:01:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `actividades`
--
ALTER TABLE `actividades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proceso_id` (`proceso_id`);

--
-- Indexes for table `dependencias`
--
ALTER TABLE `dependencias`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `empleos`
--
ALTER TABLE `empleos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `procedimientos`
--
ALTER TABLE `procedimientos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `actividad_id` (`actividad_id`);

--
-- Indexes for table `procesos`
--
ALTER TABLE `procesos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dependencia_id` (`dependencia_id`);

--
-- Indexes for table `tiempos_procedimientos`
--
ALTER TABLE `tiempos_procedimientos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `procedimiento_id` (`procedimiento_id`),
  ADD KEY `empleo_id` (`empleo_id`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `actividades`
--
ALTER TABLE `actividades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `dependencias`
--
ALTER TABLE `dependencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `empleos`
--
ALTER TABLE `empleos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `procedimientos`
--
ALTER TABLE `procedimientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `procesos`
--
ALTER TABLE `procesos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tiempos_procedimientos`
--
ALTER TABLE `tiempos_procedimientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `actividades`
--
ALTER TABLE `actividades`
  ADD CONSTRAINT `actividades_ibfk_1` FOREIGN KEY (`proceso_id`) REFERENCES `procesos` (`id`);

--
-- Constraints for table `procedimientos`
--
ALTER TABLE `procedimientos`
  ADD CONSTRAINT `procedimientos_ibfk_1` FOREIGN KEY (`actividad_id`) REFERENCES `actividades` (`id`);

--
-- Constraints for table `procesos`
--
ALTER TABLE `procesos`
  ADD CONSTRAINT `procesos_ibfk_1` FOREIGN KEY (`dependencia_id`) REFERENCES `dependencias` (`id`);

--
-- Constraints for table `tiempos_procedimientos`
--
ALTER TABLE `tiempos_procedimientos`
  ADD CONSTRAINT `tiempos_procedimientos_ibfk_1` FOREIGN KEY (`procedimiento_id`) REFERENCES `procedimientos` (`id`),
  ADD CONSTRAINT `tiempos_procedimientos_ibfk_2` FOREIGN KEY (`empleo_id`) REFERENCES `empleos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
