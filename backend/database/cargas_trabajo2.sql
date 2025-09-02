-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 26, 2025 at 11:19 PM
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
  `activa` int(11) DEFAULT 1,
  `orden` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dependencias`
--

CREATE TABLE `dependencias` (
  `id` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activa` int(11) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `empleos`
--

CREATE TABLE `empleos` (
  `id` int(11) NOT NULL,
  `codigo` text DEFAULT NULL,
  `nombre` text NOT NULL,
  `nivel_jerarquico` text DEFAULT NULL,
  `denominacion` text DEFAULT NULL,
  `activo` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `procedimientos`
--

CREATE TABLE `procedimientos` (
  `id` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `actividad_id` int(11) DEFAULT NULL,
  `activo` int(11) DEFAULT 1,
  `nivel_jerarquico` varchar(50) DEFAULT NULL,
  `orden` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `procesos`
--

CREATE TABLE `procesos` (
  `id` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `dependencia_id` int(11) DEFAULT NULL,
  `activo` int(11) DEFAULT 1,
  `orden` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tiempos_procedimientos`
--

CREATE TABLE `tiempos_procedimientos` (
  `id` int(11) NOT NULL,
  `procedimiento_id` int(11) DEFAULT NULL,
  `empleo_id` int(11) DEFAULT NULL,
  `frecuencia_mensual` int(11) DEFAULT NULL,
  `tiempo_minimo` double DEFAULT NULL,
  `tiempo_promedio` double DEFAULT NULL,
  `tiempo_maximo` double DEFAULT NULL,
  `carga_total` double DEFAULT 0,
  `activo` int(11) DEFAULT 1,
  `fecha_actualizacion` text DEFAULT NULL
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
('1', 'admin@admin.com', '$2b$12$AwB/wei9P9BkFTIYLYkLo.H5WqoB0CgYdjvmrIfsWbdWDWcaUmmJW', 'Admin', 'Sistema', 'admin', 1, '2025-07-23 10:30:06', '2025-07-23 10:30:06');

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
