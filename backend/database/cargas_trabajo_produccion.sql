-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 02, 2025 at 07:11 PM
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
CREATE DATABASE IF NOT EXISTS `cargas_trabajo` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `cargas_trabajo`;

-- --------------------------------------------------------

--
-- Table structure for table `actividades`
--

DROP TABLE IF EXISTS `actividades`;
CREATE TABLE `actividades` (
  `id` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `proceso_id` int(11) DEFAULT NULL,
  `procedimiento_id` int(11) DEFAULT NULL,
  `activa` tinyint(4) DEFAULT 1,
  `orden` int(11) DEFAULT 0,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `actividades`
--

INSERT INTO `actividades` (`id`, `nombre`, `descripcion`, `proceso_id`, `procedimiento_id`, `activa`, `orden`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Planificación', 'Actividad de planificación estratégica', 1, NULL, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(2, 'Análisis del Entorno', 'Análisis del entorno interno y externo', 1, NULL, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(3, 'Definición de Objetivos', 'Definición de objetivos estratégicos', 1, NULL, 1, 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(4, 'Auditorías Internas', 'Realización de auditorías internas de calidad', 2, NULL, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(5, 'Mejora Continua', 'Implementación de mejoras continuas', 2, NULL, 1, 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(6, 'Publicación de Vacantes', 'Publicación y difusión de vacantes', 3, NULL, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(7, 'Evaluación de Candidatos', 'Evaluación y selección de candidatos', 3, NULL, 1, 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(8, 'Capacitación', 'Organización de programas de capacitación', 4, NULL, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(9, 'Evaluación de Desempeño', 'Evaluación del desempeño del personal', 4, NULL, 1, 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(10, 'Registro Contable', 'Registro de transacciones contables', 5, NULL, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(11, 'Cierre Mensual', 'Cierre contable mensual', 5, NULL, 1, 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(12, 'Elaboración de Presupuesto', 'Elaboración del presupuesto anual', 6, NULL, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(13, 'Control Presupuestario', 'Control y seguimiento presupuestario', 6, NULL, 1, 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(14, 'Análisis de Requerimientos', 'Análisis de requerimientos del sistema', 7, NULL, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(15, 'Desarrollo de Código', 'Desarrollo y programación de código', 7, NULL, 1, 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(16, 'Atención de Tickets', 'Atención de tickets de soporte técnico', 8, NULL, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(17, 'Mantenimiento Preventivo', 'Mantenimiento preventivo de sistemas', 8, NULL, 1, 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(18, 'actividad1', NULL, 10, NULL, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(19, 'actividad2', NULL, 10, NULL, 1, 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(20, 'actividad1', NULL, 11, NULL, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(21, 'actividad1', NULL, 12, NULL, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(22, 'actividad1', NULL, NULL, 36, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(23, 'actividad2', NULL, NULL, 37, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(24, 'actividad1', NULL, NULL, 38, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(25, 'actividad1', NULL, NULL, 39, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(26, 'actividad1', NULL, NULL, 40, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(27, 'actividad22', NULL, NULL, 42, 1, 1, '2025-08-25 11:56:02', '2025-08-25 16:57:12'),
(28, 'actividad10', NULL, NULL, 43, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(29, 'actividad20', NULL, NULL, 44, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(30, 'nomina', NULL, NULL, 45, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(31, 'actividad8', NULL, NULL, 46, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(32, 'diligenciar la matriz', NULL, NULL, 47, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(33, 'revision recrusos', NULL, NULL, 47, 1, 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(34, 'cronograma de novedades', NULL, NULL, 47, 1, 3, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(35, 'solicitud cdp', NULL, NULL, 47, 1, 4, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(36, 'actividad1', NULL, NULL, 48, 1, 1, '2025-08-25 15:31:20', '2025-08-25 15:31:20'),
(37, 'actividad1', NULL, NULL, 49, 1, 1, '2025-08-25 16:59:14', '2025-08-25 16:59:14'),
(38, 'actividad1', NULL, NULL, 50, 1, 1, '2025-09-02 11:49:57', '2025-09-02 11:49:57');

-- --------------------------------------------------------

--
-- Table structure for table `dependencias`
--

DROP TABLE IF EXISTS `dependencias`;
CREATE TABLE `dependencias` (
  `id` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activa` tinyint(4) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dependencias`
--

INSERT INTO `dependencias` (`id`, `nombre`, `descripcion`, `activa`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Dirección General', 'Dependencia principal', 1, '2025-08-13 23:53:04', '2025-08-25 11:52:38'),
(2, 'Dirección General', 'Dirección General de la organización', 1, '2025-08-14 01:20:44', '2025-08-25 11:52:38'),
(3, 'Recursos Humanos', 'Departamento de Recursos Humanos', 1, '2025-08-14 01:20:44', '2025-08-25 11:52:38'),
(4, 'Finanzas', 'Departamento de Finanzas y Contabilidad', 1, '2025-08-14 01:20:44', '2025-08-25 11:52:38'),
(5, 'Tecnología', 'Departamento de Tecnología e Informática', 1, '2025-08-14 01:20:44', '2025-08-25 11:52:38'),
(6, 'Tecnologias', NULL, 1, '2025-08-20 01:16:00', '2025-08-25 11:52:38'),
(7, 'Cartera', NULL, 1, '2025-08-20 01:16:52', '2025-08-25 11:52:38'),
(8, 'Direccion', NULL, 1, '2025-08-20 01:21:31', '2025-08-25 11:52:38'),
(9, 'dependencia2', NULL, 1, '2025-08-19 20:39:19', '2025-08-25 11:52:38'),
(10, 'RRHH', NULL, 1, '2025-08-19 21:16:16', '2025-08-25 11:52:38'),
(11, 'Direccion', NULL, 1, '2025-08-19 21:24:27', '2025-08-25 11:52:38'),
(12, 'Dependencia2', NULL, 1, '2025-08-19 22:09:24', '2025-08-25 11:52:38'),
(13, 'Direccion', NULL, 1, '2025-08-20 00:06:59', '2025-08-25 11:52:38'),
(14, 'Dependencia2', NULL, 1, '2025-08-20 01:25:56', '2025-08-25 11:52:38'),
(15, 'Dependencia1', NULL, 1, '2025-08-20 12:00:33', '2025-08-25 11:52:38'),
(16, 'Dependencia1', NULL, 1, '2025-08-20 12:12:44', '2025-08-25 11:52:38'),
(17, 'Dependencia22', NULL, 1, '2025-08-21 21:32:29', '2025-08-25 16:53:30'),
(18, 'secretaria', NULL, 1, '2025-08-23 15:52:32', '2025-08-25 11:52:38'),
(19, 'contabilidad', NULL, 1, '2025-08-23 16:24:50', '2025-08-25 11:52:38'),
(20, 'Secretari General', NULL, 1, '2025-08-24 10:32:45', '2025-08-25 11:52:38'),
(21, 'Subdirección Administrativa', NULL, 1, '2025-08-24 10:33:45', '2025-08-25 11:52:38'),
(22, 'Subdirección Financiera', NULL, 1, '2025-08-24 10:35:36', '2025-08-25 11:52:38'),
(23, 'Direccion general', NULL, 1, '2025-08-25 15:22:40', '2025-08-25 15:22:40'),
(24, 'secretaria general', NULL, 1, '2025-08-25 16:58:45', '2025-09-02 00:31:30'),
(25, 'Sistemas', NULL, 1, '2025-09-02 11:49:09', '2025-09-02 11:49:09');

-- --------------------------------------------------------

--
-- Table structure for table `elementos_estructura`
--

DROP TABLE IF EXISTS `elementos_estructura`;
CREATE TABLE `elementos_estructura` (
  `id` varchar(36) NOT NULL,
  `estructura_id` varchar(36) NOT NULL,
  `tipo` enum('dependencia','proceso','actividad','procedimiento','nivel_empleo','empleo') NOT NULL,
  `elemento_id` varchar(255) NOT NULL,
  `padre_id` varchar(36) DEFAULT NULL,
  `orden` int(11) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `elementos_estructura`
--

INSERT INTO `elementos_estructura` (`id`, `estructura_id`, `tipo`, `elemento_id`, `padre_id`, `orden`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
('002e3d13-ae62-4280-bce1-c340e5a90be6', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'actividad', '28', '6dd9c2f1-2741-44d1-ab19-3f880ab3f254', 1, 1, '2025-08-23 20:53:22', '2025-08-23 20:53:22'),
('011cdb9a-fcea-4295-8ee9-f0f3e74b3fc3', '13f455ee-4e8d-4b1d-bba8-20c32a79c86a', 'dependencia', '11', NULL, 1, 1, '2025-08-20 02:24:27', '2025-08-20 02:24:27'),
('0360a0e0-e37f-4ca6-b074-6a7afb00e147', '3cafb80e-73a7-4dd7-ba36-a6fe6be26bfe', 'actividad', '19', '79c03057-26b6-40d5-a2a1-3ec7ec3ceb53', 2, 1, '2025-08-20 01:55:57', '2025-08-20 01:55:57'),
('09afa89a-9bcd-4895-b7b6-a4d395a2c253', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'proceso', '22', 'a09de5ed-f57f-4696-8c06-f38eded82205', 2, 1, '2025-08-23 21:39:47', '2025-08-23 21:39:47'),
('09bee060-577e-4ea5-b0f6-e62dcbc710af', 'f98fbd33-66cb-419d-b478-1d3dcc03356b', 'actividad', '24', '282d2fde-66a1-40af-838d-c1bfcf60d126', 1, 1, '2025-08-20 14:41:13', '2025-08-20 14:41:13'),
('0b6b7a6f-68a7-4f33-9eb9-fb56d76c737b', '6f36c61a-b3e6-406f-96a9-658f4416b83a', 'actividad', '38', '6494fcd8-3b1c-49c4-acb6-f63e9a8dca14', 1, 1, '2025-09-02 16:49:57', '2025-09-02 16:49:57'),
('0ec06524-7c56-4b1c-ba1e-15f0fb8a77d5', '6f36c61a-b3e6-406f-96a9-658f4416b83a', 'procedimiento', '49', '93e66b11-4382-4ce9-9fee-1dc6886aac82', 1, 1, '2025-08-25 21:59:04', '2025-08-25 21:59:04'),
('1406038d-3492-4532-bb7a-368e07763566', '6f36c61a-b3e6-406f-96a9-658f4416b83a', 'dependencia', '25', NULL, 1, 1, '2025-09-02 16:49:09', '2025-09-02 16:49:09'),
('1af6d179-46b3-4a67-8342-894703f2975b', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'procedimiento', '37', 'b7978a97-b3cc-4302-9bb3-a4d418fd3024', 1, 1, '2025-08-20 06:26:20', '2025-08-20 06:26:20'),
('20571600-a887-4db3-a8f2-838b13d80384', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'procedimiento', '44', 'a6b8292f-1eb4-449d-b26c-3d8fd94f52fc', 1, 1, '2025-08-23 21:03:25', '2025-08-23 21:03:25'),
('217179d5-9002-404d-a1cf-8ae301d12541', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'dependencia', '19', NULL, 1, 1, '2025-08-23 21:24:50', '2025-08-23 21:24:50'),
('2203ef0a-856e-4b89-a497-8097b7ea2295', '69b7e584-39d9-45a0-8de4-62daffb20466', 'actividad', '26', '33af23cf-01e7-4b43-9f64-1852af86533e', 1, 1, '2025-08-20 17:13:11', '2025-08-20 17:13:11'),
('282d2fde-66a1-40af-838d-c1bfcf60d126', 'f98fbd33-66cb-419d-b478-1d3dcc03356b', 'procedimiento', '38', '3a6593e8-ad9b-4f39-a9a8-7b954193555c', 1, 1, '2025-08-20 14:41:04', '2025-08-20 14:41:04'),
('2aa355f3-cb6c-43fd-98bb-e110304bc684', '6f36c61a-b3e6-406f-96a9-658f4416b83a', 'actividad', '36', 'a5f24d19-33c1-4042-803d-c32b14277214', 1, 1, '2025-08-25 20:31:20', '2025-08-25 20:31:20'),
('30f91cd0-7958-48e8-b1cf-7c37edacaa6d', '69b7e584-39d9-45a0-8de4-62daffb20466', 'dependencia', '21', NULL, 3, 1, '2025-08-24 15:33:45', '2025-08-24 15:33:45'),
('31f09f73-2fc9-41f7-8bb2-39a8c1c558a2', '69b7e584-39d9-45a0-8de4-62daffb20466', 'proceso', '18', 'ae3f0935-f745-45d8-822e-e54fa45e570c', 1, 1, '2025-08-22 02:32:39', '2025-08-22 02:32:39'),
('33af23cf-01e7-4b43-9f64-1852af86533e', '69b7e584-39d9-45a0-8de4-62daffb20466', 'procedimiento', '40', 'c387eaa5-e48b-4c14-996a-5dc005ee5874', 1, 1, '2025-08-20 17:13:02', '2025-08-20 17:13:02'),
('3a6593e8-ad9b-4f39-a9a8-7b954193555c', 'f98fbd33-66cb-419d-b478-1d3dcc03356b', 'proceso', '14', 'aef601f4-0919-49e3-8d0a-01f1275977ee', 1, 1, '2025-08-20 14:40:54', '2025-08-20 14:40:54'),
('3ebc4b64-303a-45af-aa80-73a5b80bbff4', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'actividad', '22', '56d58bdf-cfd4-4640-a014-bb2552ab2bc8', 1, 1, '2025-08-20 05:24:15', '2025-08-20 05:24:15'),
('3ed29851-8dee-4e61-ad9b-38d28dbfd15f', '3cafb80e-73a7-4dd7-ba36-a6fe6be26bfe', 'dependencia', '8', NULL, 1, 1, '2025-08-20 01:21:31', '2025-08-20 01:21:31'),
('406c4614-1877-4f22-97a9-217796bfc0be', '6f36c61a-b3e6-406f-96a9-658f4416b83a', 'proceso', '25', '471decd8-93a1-4e25-91b0-190ec94c5d9e', 1, 1, '2025-08-25 20:22:51', '2025-08-25 20:22:51'),
('40799e47-03e6-45ff-bfd3-923ec2bd26ae', '69b7e584-39d9-45a0-8de4-62daffb20466', 'procedimiento', '41', '4285bd18-87b7-4ae7-aa5d-5ac8fb450b55', 2, 1, '2025-08-21 22:35:55', '2025-08-21 22:35:55'),
('41278c0c-0306-4ff3-a7a8-b00feb0cb220', '3cafb80e-73a7-4dd7-ba36-a6fe6be26bfe', 'dependencia', '12', NULL, 1, 1, '2025-08-20 03:09:24', '2025-08-20 03:09:24'),
('4285bd18-87b7-4ae7-aa5d-5ac8fb450b55', '69b7e584-39d9-45a0-8de4-62daffb20466', 'proceso', '17', '767bec94-aaa1-48fd-a4f8-fe3da6495534', 2, 1, '2025-08-21 22:35:39', '2025-08-21 22:35:39'),
('471decd8-93a1-4e25-91b0-190ec94c5d9e', '6f36c61a-b3e6-406f-96a9-658f4416b83a', 'dependencia', '23', NULL, 1, 1, '2025-08-25 20:22:40', '2025-08-25 20:22:40'),
('513bc59b-763e-4244-935d-8a099ee48bfd', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'proceso', '21', '217179d5-9002-404d-a1cf-8ae301d12541', 1, 1, '2025-08-23 21:25:06', '2025-08-23 21:25:06'),
('56d58bdf-cfd4-4640-a014-bb2552ab2bc8', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'procedimiento', '36', 'b6853ac3-b8d8-42a5-ab33-3c6292cf21a0', 1, 1, '2025-08-20 05:18:44', '2025-08-20 05:18:44'),
('5bcd9348-d44a-49c5-b456-19d87e8cd584', '49448107-a45f-4f81-8dd4-613d0cb78c06', 'actividad', '25', '872267c5-d1b7-46d8-920c-bfaba5bad2e7', 1, 1, '2025-08-20 17:00:58', '2025-08-20 17:00:58'),
('5bf66058-efd1-44b1-969f-dab3096eafd7', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'actividad', '23', '1af6d179-46b3-4a67-8342-894703f2975b', 1, 1, '2025-08-20 06:26:31', '2025-08-20 06:26:31'),
('611ce25e-044d-4fbf-9f10-c2e8756265e4', '49448107-a45f-4f81-8dd4-613d0cb78c06', 'dependencia', '15', NULL, 1, 1, '2025-08-20 17:00:33', '2025-08-20 17:00:33'),
('6494fcd8-3b1c-49c4-acb6-f63e9a8dca14', '6f36c61a-b3e6-406f-96a9-658f4416b83a', 'procedimiento', '50', '85e2a0ff-c005-41fe-99fd-240202513280', 1, 1, '2025-09-02 16:49:47', '2025-09-02 16:49:47'),
('67d305c8-9f62-4433-afc3-cd9cb5664b24', '69b7e584-39d9-45a0-8de4-62daffb20466', 'actividad', '27', '9c57bfd3-95d4-4c28-b2d7-d89115d250b4', 1, 1, '2025-08-22 02:33:00', '2025-08-22 02:33:00'),
('6a5648da-528e-42bb-8b13-5a520b427ac6', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'procedimiento', '45', '513bc59b-763e-4244-935d-8a099ee48bfd', 1, 1, '2025-08-23 21:25:20', '2025-08-23 21:25:20'),
('6dd9c2f1-2741-44d1-ab19-3f880ab3f254', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'procedimiento', '43', '86f69198-6c07-4efe-8e3e-5ff239e1bb2b', 1, 1, '2025-08-23 20:53:00', '2025-08-23 20:53:00'),
('6e0d0d31-24c7-40f9-800a-fafbdafcfb53', 'f98fbd33-66cb-419d-b478-1d3dcc03356b', 'proceso', '01', NULL, 1, 1, '2025-08-20 00:45:16', '2025-08-20 00:45:16'),
('7588d164-50f5-4a81-a8a3-2cfed8368348', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'actividad', '29', '20571600-a887-4db3-a8f2-838b13d80384', 1, 1, '2025-08-23 21:03:36', '2025-08-23 21:03:36'),
('767bec94-aaa1-48fd-a4f8-fe3da6495534', '69b7e584-39d9-45a0-8de4-62daffb20466', 'dependencia', '16', NULL, 1, 1, '2025-08-20 17:12:44', '2025-08-20 17:12:44'),
('782a7605-83a0-42cd-8ac0-052d6c7054b8', '69b7e584-39d9-45a0-8de4-62daffb20466', 'proceso', '23', '30f91cd0-7958-48e8-b1cf-7c37edacaa6d', 1, 1, '2025-08-24 15:36:09', '2025-08-24 15:36:09'),
('7950b53d-05b3-4119-b2b0-454261cf101b', '6f36c61a-b3e6-406f-96a9-658f4416b83a', 'actividad', '37', '0ec06524-7c56-4b1c-ba1e-15f0fb8a77d5', 1, 1, '2025-08-25 21:59:14', '2025-08-25 21:59:14'),
('79c03057-26b6-40d5-a2a1-3ec7ec3ceb53', '3cafb80e-73a7-4dd7-ba36-a6fe6be26bfe', 'proceso', '10', '3ed29851-8dee-4e61-ad9b-38d28dbfd15f', 1, 1, '2025-08-20 01:33:27', '2025-08-20 01:33:27'),
('7fae1a17-7b59-45e6-b909-ed927b97b4bb', '69b7e584-39d9-45a0-8de4-62daffb20466', 'actividad', '35', 'c4ef7406-b5b1-4b1d-a8a4-863c42439bc0', 4, 1, '2025-08-24 15:43:07', '2025-08-24 15:43:07'),
('85e2a0ff-c005-41fe-99fd-240202513280', '6f36c61a-b3e6-406f-96a9-658f4416b83a', 'proceso', '27', '1406038d-3492-4532-bb7a-368e07763566', 1, 1, '2025-09-02 16:49:37', '2025-09-02 16:49:37'),
('863282f3-3485-41e2-b854-0c91cfc18fa9', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'actividad', '21', 'b6853ac3-b8d8-42a5-ab33-3c6292cf21a0', 1, 0, '2025-08-20 05:11:44', '2025-08-20 05:16:41'),
('86f69198-6c07-4efe-8e3e-5ff239e1bb2b', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'proceso', '19', 'a09de5ed-f57f-4696-8c06-f38eded82205', 1, 1, '2025-08-23 20:52:47', '2025-08-23 20:52:47'),
('872267c5-d1b7-46d8-920c-bfaba5bad2e7', '49448107-a45f-4f81-8dd4-613d0cb78c06', 'procedimiento', '39', '9bbcbf66-97c3-46d8-873e-7e51010adea6', 1, 1, '2025-08-20 17:00:50', '2025-08-20 17:00:50'),
('8f23ce5b-3aa7-4511-b06d-83e07e2439b5', '69b7e584-39d9-45a0-8de4-62daffb20466', 'actividad', '33', 'c4ef7406-b5b1-4b1d-a8a4-863c42439bc0', 2, 1, '2025-08-24 15:42:18', '2025-08-24 15:42:18'),
('93e66b11-4382-4ce9-9fee-1dc6886aac82', '6f36c61a-b3e6-406f-96a9-658f4416b83a', 'proceso', '26', 'a443bd5e-a54d-4983-8a7f-aa59b4d87d1b', 1, 1, '2025-08-25 21:58:54', '2025-08-25 21:58:54'),
('9b33b3fe-9e72-48c9-a8a0-927444892615', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'actividad', '31', 'dd6b52d1-682d-49f4-b62b-f2c050f8fe4c', 1, 1, '2025-08-23 21:40:13', '2025-08-23 21:40:13'),
('9bbcbf66-97c3-46d8-873e-7e51010adea6', '49448107-a45f-4f81-8dd4-613d0cb78c06', 'proceso', '15', '611ce25e-044d-4fbf-9f10-c2e8756265e4', 1, 1, '2025-08-20 17:00:41', '2025-08-20 17:00:41'),
('9c57bfd3-95d4-4c28-b2d7-d89115d250b4', '69b7e584-39d9-45a0-8de4-62daffb20466', 'procedimiento', '42', '31f09f73-2fc9-41f7-8bb2-39a8c1c558a2', 1, 1, '2025-08-22 02:32:49', '2025-08-22 02:32:49'),
('a09de5ed-f57f-4696-8c06-f38eded82205', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'dependencia', '18', NULL, 1, 1, '2025-08-23 20:52:32', '2025-08-23 20:52:32'),
('a0facb88-23ed-43b1-9168-133ea69e3086', '13f455ee-4e8d-4b1d-bba8-20c32a79c86a', 'dependencia', '10', NULL, 1, 1, '2025-08-20 02:16:16', '2025-08-20 02:16:16'),
('a2dca1a5-00ce-4e53-9872-f130a4bae622', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'dependencia', '14', NULL, 1, 1, '2025-08-20 06:25:56', '2025-08-20 06:25:56'),
('a443bd5e-a54d-4983-8a7f-aa59b4d87d1b', '6f36c61a-b3e6-406f-96a9-658f4416b83a', 'dependencia', '24', NULL, 1, 1, '2025-08-25 21:58:45', '2025-08-25 21:58:45'),
('a5f24d19-33c1-4042-803d-c32b14277214', '6f36c61a-b3e6-406f-96a9-658f4416b83a', 'procedimiento', '48', '406c4614-1877-4f22-97a9-217796bfc0be', 1, 1, '2025-08-25 20:23:01', '2025-08-25 20:23:01'),
('a6b8292f-1eb4-449d-b26c-3d8fd94f52fc', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'proceso', '20', 'a09de5ed-f57f-4696-8c06-f38eded82205', 1, 1, '2025-08-23 21:03:13', '2025-08-23 21:03:13'),
('ab849b79-f4d1-481f-966f-0b08df842bec', '13f455ee-4e8d-4b1d-bba8-20c32a79c86a', 'procedimiento', '35', 'bc93ccc5-2f08-4f23-9354-e683f2f84eaa', 1, 1, '2025-08-20 02:24:58', '2025-08-20 02:24:58'),
('ae3f0935-f745-45d8-822e-e54fa45e570c', '69b7e584-39d9-45a0-8de4-62daffb20466', 'dependencia', '17', NULL, 1, 1, '2025-08-22 02:32:29', '2025-08-22 02:32:29'),
('aef601f4-0919-49e3-8d0a-01f1275977ee', 'f98fbd33-66cb-419d-b478-1d3dcc03356b', 'dependencia', '01', NULL, 1, 1, '2025-08-20 00:44:34', '2025-08-20 00:44:34'),
('b0aa9105-8e31-4519-8f15-2f0e19958b35', '69b7e584-39d9-45a0-8de4-62daffb20466', 'actividad', '32', 'c4ef7406-b5b1-4b1d-a8a4-863c42439bc0', 1, 1, '2025-08-24 15:42:01', '2025-08-24 15:42:01'),
('b6853ac3-b8d8-42a5-ab33-3c6292cf21a0', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'proceso', '12', 'faeff1cb-1bea-4a0f-becf-76323425c6f9', 1, 1, '2025-08-20 05:11:23', '2025-08-20 05:11:23'),
('b7978a97-b3cc-4302-9bb3-a4d418fd3024', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'proceso', '13', 'a2dca1a5-00ce-4e53-9872-f130a4bae622', 1, 1, '2025-08-20 06:26:07', '2025-08-20 06:26:07'),
('bc93ccc5-2f08-4f23-9354-e683f2f84eaa', '13f455ee-4e8d-4b1d-bba8-20c32a79c86a', 'actividad', '20', 'f2e97798-cff1-4093-895a-d88c818f1f0c', 1, 1, '2025-08-20 02:24:50', '2025-08-20 02:24:50'),
('bf47b4db-4f1b-4373-b2f4-23df2df60f0c', '69b7e584-39d9-45a0-8de4-62daffb20466', 'actividad', '34', 'c4ef7406-b5b1-4b1d-a8a4-863c42439bc0', 3, 1, '2025-08-24 15:42:46', '2025-08-24 15:42:46'),
('c387eaa5-e48b-4c14-996a-5dc005ee5874', '69b7e584-39d9-45a0-8de4-62daffb20466', 'proceso', '16', '767bec94-aaa1-48fd-a4f8-fe3da6495534', 1, 1, '2025-08-20 17:12:54', '2025-08-20 17:12:54'),
('c4ef7406-b5b1-4b1d-a8a4-863c42439bc0', '69b7e584-39d9-45a0-8de4-62daffb20466', 'procedimiento', '47', '782a7605-83a0-42cd-8ac0-052d6c7054b8', 1, 1, '2025-08-24 15:37:22', '2025-08-24 15:37:22'),
('c82c5a52-1e80-4902-aa35-f30ddafb40ec', '69b7e584-39d9-45a0-8de4-62daffb20466', 'dependencia', '22', NULL, 1, 1, '2025-08-24 15:35:36', '2025-08-24 15:35:36'),
('d0d770a9-e19f-4d98-ae67-b3628bc1204a', '69b7e584-39d9-45a0-8de4-62daffb20466', 'dependencia', '20', NULL, 1, 1, '2025-08-24 15:32:46', '2025-08-24 15:32:46'),
('d6130322-a540-4916-a59b-c6f7db0eb819', '69b7e584-39d9-45a0-8de4-62daffb20466', 'proceso', '24', '30f91cd0-7958-48e8-b1cf-7c37edacaa6d', 1, 1, '2025-08-24 15:36:40', '2025-08-24 15:36:40'),
('dd6b52d1-682d-49f4-b62b-f2c050f8fe4c', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'procedimiento', '46', '09afa89a-9bcd-4895-b7b6-a4d395a2c253', 1, 1, '2025-08-23 21:39:59', '2025-08-23 21:39:59'),
('ea4f9169-96fb-4665-a251-2d8102707e28', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'actividad', '30', '6a5648da-528e-42bb-8b13-5a520b427ac6', 1, 1, '2025-08-23 21:25:34', '2025-08-23 21:25:34'),
('f2e97798-cff1-4093-895a-d88c818f1f0c', '13f455ee-4e8d-4b1d-bba8-20c32a79c86a', 'proceso', '11', '011cdb9a-fcea-4295-8ee9-f0f3e74b3fc3', 1, 1, '2025-08-20 02:24:41', '2025-08-20 02:24:41'),
('f52a8edf-3fdf-4d5c-8595-86deedf98d80', '3cafb80e-73a7-4dd7-ba36-a6fe6be26bfe', 'dependencia', '9', NULL, 1, 1, '2025-08-20 01:39:19', '2025-08-20 01:39:19'),
('fad78800-d918-4c4f-873f-4d5cac58b113', '3cafb80e-73a7-4dd7-ba36-a6fe6be26bfe', 'procedimiento', '34', '0360a0e0-e37f-4ca6-b074-6a7afb00e147', 1, 1, '2025-08-20 02:04:54', '2025-08-20 02:04:54'),
('faeff1cb-1bea-4a0f-becf-76323425c6f9', 'c520d45b-ee60-46c7-b46e-d2867d670bdb', 'dependencia', '13', NULL, 1, 1, '2025-08-20 05:06:59', '2025-08-20 05:06:59');

-- --------------------------------------------------------

--
-- Table structure for table `empleos`
--

DROP TABLE IF EXISTS `empleos`;
CREATE TABLE `empleos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `nombre` text NOT NULL,
  `nivel_jerarquico` varchar(50) DEFAULT NULL,
  `denominacion` text DEFAULT NULL,
  `grado` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `empleos`
--

INSERT INTO `empleos` (`id`, `codigo`, `nombre`, `nivel_jerarquico`, `denominacion`, `grado`, `activo`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(20, '005', '', 'DIRECTIVO', 'Alcalde', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(21, '030', '', 'DIRECTIVO', 'Alcalde Local', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(22, '032', '', 'DIRECTIVO', 'Consejero de Justicia', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(23, '036', '', 'DIRECTIVO', 'Auditor Fiscal de Contraloría', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(24, '010', '', 'DIRECTIVO', 'Contralor', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(25, '035', '', 'DIRECTIVO', 'Contralor Auxiliar', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(26, '003', '', 'DIRECTIVO', 'Decano de Escuela o Institución Tecnológica', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(27, '007', '', 'DIRECTIVO', 'Decano de Institución Universitaria', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(28, '008', '', 'DIRECTIVO', 'Decano de Universidad', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(29, '009', '', 'DIRECTIVO', 'Director Administrativo o Financiero o Técnico u Operativo', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(30, '060', '', 'DIRECTIVO', 'Director de Area Metropolitana', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(31, '055', '', 'DIRECTIVO', 'Director de Departamento Administrativo', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(32, '028', '', 'DIRECTIVO', 'Director de Escuela o de Instituto o de Centro de Universidad', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(33, '065', '', 'DIRECTIVO', 'Director de Hospital', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(34, '016', '', 'DIRECTIVO', 'Director Ejecutivo de Asociación de Municipios', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(35, '050', '', 'DIRECTIVO', 'Director o Gerente General de Entidad Descentralizada', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(36, '080', '', 'DIRECTIVO', 'Director Local de Salud', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(37, '024', '', 'DIRECTIVO', 'Director o Gerente Regional o Provincial', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(38, '039', '', 'DIRECTIVO', 'Gerente', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(39, '085', '', 'DIRECTIVO', 'Gerente Empresa Social del Estado', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(40, '001', '', 'DIRECTIVO', 'Gobernador', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(41, '027', '', 'DIRECTIVO', 'Jefe de Departamento de Universidad', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(42, '006', '', 'DIRECTIVO', 'Jefe de Oficina', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(43, '015', '', 'DIRECTIVO', 'Personero', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(44, '017', '', 'DIRECTIVO', 'Personero Auxiliar', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(45, '040', '', 'DIRECTIVO', 'Personero Delegado', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(46, '043', '', 'DIRECTIVO', 'Personero Local de Bogotá', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(47, '071', '', 'DIRECTIVO', 'Presidente Consejo de Justicia', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(48, '042', '', 'DIRECTIVO', 'Rector de Institución Técnica Profesional', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(49, '048', '', 'DIRECTIVO', 'Rector de Institución Universitaria o de Escuela o de Institución Tecnológica', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(50, '067', '', 'DIRECTIVO', 'Rector de Universidad', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(51, '020', '', 'DIRECTIVO', 'Secretario de Despacho', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(52, '054', '', 'DIRECTIVO', 'Secretario General de Entidad Descentralizada', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(53, '058', '', 'DIRECTIVO', 'Secretario General de Institución Técnica Profesional', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(54, '064', '', 'DIRECTIVO', 'Secretario General de Institución Universitaria', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(55, '052', '', 'DIRECTIVO', 'Secretario General de Universidad', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(56, '066', '', 'DIRECTIVO', 'Secretario General de Escuela o de Institución Tecnológica', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(57, '073', '', 'DIRECTIVO', 'Secretario General de Organismo de Control', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(58, '097', '', 'DIRECTIVO', 'Secretario Seccional o Local de Salud', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(59, '025', '', 'DIRECTIVO', 'Subcontralor', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(60, '070', '', 'DIRECTIVO', 'Subdirector', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(61, '068', '', 'DIRECTIVO', 'Subdirector Administrativo o Financiero o Técnico u Operativo', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(62, '072', '', 'DIRECTIVO', 'Subdirector Científico', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(63, '074', '', 'DIRECTIVO', 'Subdirector de Área Metropolitana', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(64, '076', '', 'DIRECTIVO', 'Subdirector de Departamento Administrativo', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(65, '078', '', 'DIRECTIVO', 'Subdirector Ejecutivo de Asociación de Municipios', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(66, '084', '', 'DIRECTIVO', 'Subdirector o Subgerente General de Entidad Descentralizada', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(67, '090', '', 'DIRECTIVO', 'Subgerente', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(68, '045', '', 'DIRECTIVO', 'Subsecretario de Despacho', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(69, '091', '', 'DIRECTIVO', 'Tesorero Distrital', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(70, '094', '', 'DIRECTIVO', 'Veedor Distrital', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(71, '095', '', 'DIRECTIVO', 'Viceveedor Distrital', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(72, '099', '', 'DIRECTIVO', 'Veedor Distrital Delegado', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(73, '096', '', 'DIRECTIVO', 'Vicerrector de Institución Técnica Profesional', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(74, '098', '', 'DIRECTIVO', 'Vicerrector de Institución Universitaria', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(75, '057', '', 'DIRECTIVO', 'Vicerrector de Escuela Tecnológica o de Institución Tecnológica', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(76, '077', '', 'DIRECTIVO', 'Vicerrector de Universidad', NULL, 1, '2025-08-25 15:17:55', '2025-08-25 15:17:55'),
(77, '105', '', 'ASESOR', 'Asesor', 15, 1, '2025-08-25 15:42:48', '2025-08-25 15:42:48'),
(78, '115', '', 'ASESOR', 'Jefe de Oficina Asesora de Jurídica o de Planeación o de Prensa o de Comunicaciones', 15, 1, '2025-08-25 15:42:48', '2025-08-25 15:42:48'),
(79, '201', '', 'PROFESIONAL', 'Tesorero General', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(80, '202', '', 'PROFESIONAL', 'Comisario de Familia', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(81, '203', '', 'PROFESIONAL', 'Comandante de Bomberos', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(82, '204', '', 'PROFESIONAL', 'Copiloto de Aviación', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(83, '206', '', 'PROFESIONAL', 'Líder de Programa', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(84, '208', '', 'PROFESIONAL', 'Líder de Proyecto', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(85, '209', '', 'PROFESIONAL', 'Maestro en Artes', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(86, '211', '', 'PROFESIONAL', 'Médico General', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(87, '213', '', 'PROFESIONAL', 'Médico Especialista', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(88, '214', '', 'PROFESIONAL', 'Odontólogo', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(89, '215', '', 'PROFESIONAL', 'Almacenista General', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(90, '216', '', 'PROFESIONAL', 'Odontólogo Especialista', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(91, '217', '', 'PROFESIONAL', 'Profesional Servicio Social Obligatorio', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(92, '219', '', 'PROFESIONAL', 'Profesional Universitario', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(93, '221', '', 'PROFESIONAL', 'Músico de Orquesta', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(94, '222', '', 'PROFESIONAL', 'Profesional Especializado', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(95, '227', '', 'PROFESIONAL', 'Corregidor', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(96, '231', '', 'PROFESIONAL', 'Músico de Banda', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(97, '232', '', 'PROFESIONAL', 'Director de Centro de Institución Técnica Profesional', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(98, '233', '', 'PROFESIONAL', 'Inspector de Policía Urbano Categoría Especial y 1ª Categoría', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(99, '234', '', 'PROFESIONAL', 'Inspector de Policía Urbano 2ª Categoría', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(100, '235', '', 'PROFESIONAL', 'Director de Centro de Institución Universitaria', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(101, '236', '', 'PROFESIONAL', 'Director de Centro de Escuela Tecnológica', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(102, '237', '', 'PROFESIONAL', 'Profesional Universitario Área Salud', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(103, '242', '', 'PROFESIONAL', 'Profesional Especializado Área Salud', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(104, '243', '', 'PROFESIONAL', 'Enfermero', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(105, '244', '', 'PROFESIONAL', 'Enfermero Especialista', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(106, '260', '', 'PROFESIONAL', 'Director de Cárcel', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(107, '265', '', 'PROFESIONAL', 'Director de Banda', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(108, '270', '', 'PROFESIONAL', 'Director de Orquesta', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(109, '275', '', 'PROFESIONAL', 'Piloto de Aviación', 12, 1, '2025-08-25 15:45:51', '2025-08-25 15:45:51'),
(110, '303', '', 'TECNICO', 'Inspector de Policía 3ª a 6ª Categoría', 8, 1, '2025-08-25 15:48:27', '2025-08-25 15:48:27'),
(111, '306', '', 'TECNICO', 'Inspector de Policía Rural', 8, 1, '2025-08-25 15:48:27', '2025-08-25 15:48:27'),
(112, '312', '', 'TECNICO', 'Inspector de Tránsito y Transporte', 8, 1, '2025-08-25 15:48:27', '2025-08-25 15:48:27'),
(113, '313', '', 'TECNICO', 'Instructor', 8, 1, '2025-08-25 15:48:27', '2025-08-25 15:48:27'),
(114, '314', '', 'TECNICO', 'Técnico Operativo', 8, 1, '2025-08-25 15:48:27', '2025-08-25 15:48:27'),
(115, '323', '', 'TECNICO', 'Técnico Área Salud', 8, 1, '2025-08-25 15:48:27', '2025-08-25 15:48:27'),
(116, '335', '', 'TECNICO', 'Auxiliar de Vuelo', 8, 1, '2025-08-25 15:48:27', '2025-08-25 15:48:27'),
(117, '336', '', 'TECNICO', 'Subcomandante de Bomberos', 8, 1, '2025-08-25 15:48:27', '2025-08-25 15:48:27'),
(118, '367', '', 'TECNICO', 'Técnico Administrativo', 8, 1, '2025-08-25 15:48:27', '2025-08-25 15:48:27'),
(119, '403', '', 'ASISTENCIAL', 'Agente de Tránsito', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(120, '407', '', 'ASISTENCIAL', 'Auxiliar Administrativo', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(121, '411', '', 'ASISTENCIAL', 'Capitán de Bomberos', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(122, '412', '', 'ASISTENCIAL', 'Auxiliar Área Salud', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(123, '413', '', 'ASISTENCIAL', 'Cabo de Bomberos', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(124, '416', '', 'ASISTENCIAL', 'Inspector', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(125, '417', '', 'ASISTENCIAL', 'Sargento de Bomberos', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(126, '419', '', 'ASISTENCIAL', 'Teniente de Bomberos', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(127, '420', '', 'ASISTENCIAL', 'Secretario Bilingüe', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(128, '425', '', 'ASISTENCIAL', 'Secretario Ejecutivo', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(129, '428', '', 'ASISTENCIAL', 'Cabo de Prisiones', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(130, '430', '', 'ASISTENCIAL', 'Secretario Ejecutivo del Despacho del Gobernador', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(131, '438', '', 'ASISTENCIAL', 'Sargento de Prisiones', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(132, '440', '', 'ASISTENCIAL', 'Secretario', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(133, '457', '', 'ASISTENCIAL', 'Teniente de Prisiones', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(134, '470', '', 'ASISTENCIAL', 'Auxiliar de Servicios Generales', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(135, '472', '', 'ASISTENCIAL', 'Ayudante', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(136, '475', '', 'ASISTENCIAL', 'Bombero', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(137, '477', '', 'ASISTENCIAL', 'Celador', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(138, '480', '', 'ASISTENCIAL', 'Conductor', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(139, '482', '', 'ASISTENCIAL', 'Conductor Mecánico', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(140, '485', '', 'ASISTENCIAL', 'Guardián', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(141, '487', '', 'ASISTENCIAL', 'Operario', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(142, '490', '', 'ASISTENCIAL', 'Operario Calificado', 4, 1, '2025-08-25 15:52:35', '2025-08-25 15:52:35'),
(143, '501', '', 'CONTRATISTA', 'Posdoctorado', 2, 1, '2025-08-25 16:07:31', '2025-08-25 16:07:31'),
(144, '502', '', 'CONTRATISTA', 'Doctorado', 2, 1, '2025-08-25 16:07:31', '2025-08-25 16:07:31'),
(145, '503', '', 'CONTRATISTA', 'Magister', 2, 1, '2025-08-25 16:07:31', '2025-08-25 16:07:31'),
(146, '504', '', 'CONTRATISTA', 'Especialista', 2, 1, '2025-08-25 16:07:31', '2025-08-25 16:07:31'),
(147, '505', '', 'CONTRATISTA', 'Profesional', 2, 1, '2025-08-25 16:07:31', '2025-08-25 16:07:31'),
(148, '506', '', 'CONTRATISTA', 'Tecnólogo', 2, 1, '2025-08-25 16:07:31', '2025-08-25 16:07:31'),
(149, '507', '', 'CONTRATISTA', 'Técnico', 2, 1, '2025-08-25 16:07:31', '2025-08-25 16:07:31'),
(150, '508', '', 'CONTRATISTA', 'Bachiller', 2, 1, '2025-08-25 16:07:31', '2025-08-25 16:07:31'),
(151, '509', '', 'CONTRATISTA', 'Primaria', 2, 1, '2025-08-25 16:07:32', '2025-08-25 16:07:32'),
(152, '501', '', 'TRABAJADOR_OFICIAL', 'Posdoctorado', 1, 1, '2025-08-25 16:07:32', '2025-08-25 16:07:32'),
(153, '502', '', 'TRABAJADOR_OFICIAL', 'Doctorado', 1, 1, '2025-08-25 16:07:32', '2025-08-25 16:07:32'),
(154, '503', '', 'TRABAJADOR_OFICIAL', 'Magister', 1, 1, '2025-08-25 16:07:32', '2025-08-25 16:07:32'),
(155, '504', '', 'TRABAJADOR_OFICIAL', 'Especialista', 1, 1, '2025-08-25 16:07:32', '2025-08-25 16:07:32'),
(156, '505', '', 'TRABAJADOR_OFICIAL', 'Profesional', 1, 1, '2025-08-25 16:07:32', '2025-08-25 16:07:32'),
(157, '506', '', 'TRABAJADOR_OFICIAL', 'Tecnólogo', 1, 1, '2025-08-25 16:07:32', '2025-08-25 16:07:32'),
(158, '507', '', 'TRABAJADOR_OFICIAL', 'Técnico', 1, 1, '2025-08-25 16:07:32', '2025-08-25 16:07:32'),
(159, '508', '', 'TRABAJADOR_OFICIAL', 'Bachiller', 1, 1, '2025-08-25 16:07:32', '2025-08-25 16:07:32'),
(160, '509', '', 'TRABAJADOR_OFICIAL', 'Primaria', 1, 1, '2025-08-25 16:07:32', '2025-08-25 16:07:32');

-- --------------------------------------------------------

--
-- Table structure for table `estructuras`
--

DROP TABLE IF EXISTS `estructuras`;
CREATE TABLE `estructuras` (
  `id` varchar(36) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usuario_creador_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `estructuras`
--

INSERT INTO `estructuras` (`id`, `nombre`, `descripcion`, `activa`, `fecha_creacion`, `fecha_actualizacion`, `usuario_creador_id`) VALUES
('13f455ee-4e8d-4b1d-bba8-20c32a79c86a', 'Arbelaez', NULL, 1, '2025-08-20 00:55:56', '2025-08-20 00:55:56', '1'),
('3cafb80e-73a7-4dd7-ba36-a6fe6be26bfe', 'canal', NULL, 1, '2025-08-20 01:13:50', '2025-08-20 01:13:50', '1'),
('49448107-a45f-4f81-8dd4-613d0cb78c06', 'Dian', NULL, 1, '2025-08-20 17:00:21', '2025-08-20 17:00:21', '1'),
('69b7e584-39d9-45a0-8de4-62daffb20466', 'Canal capital', NULL, 1, '2025-08-20 17:12:34', '2025-08-20 17:12:34', '1'),
('6f36c61a-b3e6-406f-96a9-658f4416b83a', 'Popayan', NULL, 1, '2025-08-25 20:22:30', '2025-08-25 20:22:30', '1'),
('c520d45b-ee60-46c7-b46e-d2867d670bdb', 'Gobernacion Nariño', NULL, 1, '2025-08-20 05:06:49', '2025-08-20 05:06:49', '1'),
('estructura_default', 'Estructura Organizacional Principal', 'Estructura organizacional principal del sistema de cargas de trabajo', 1, '2025-08-20 00:39:50', '2025-08-20 00:39:50', 'admin_default'),
('f98fbd33-66cb-419d-b478-1d3dcc03356b', 'Cavanzo', NULL, 1, '2025-08-20 00:43:49', '2025-08-20 00:43:49', '1');

-- --------------------------------------------------------

--
-- Table structure for table `procedimientos`
--

DROP TABLE IF EXISTS `procedimientos`;
CREATE TABLE `procedimientos` (
  `id` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `actividad_id` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT 1,
  `nivel_jerarquico` varchar(50) DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `procedimientos`
--

INSERT INTO `procedimientos` (`id`, `nombre`, `descripcion`, `actividad_id`, `activo`, `nivel_jerarquico`, `orden`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Elaboración del Plan Estratégico', 'Procedimiento para elaborar el plan estratégico', 1, 1, 'PROFESIONAL', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(2, 'Análisis PESTEL', 'Análisis político, económico, social, tecnológico, ambiental y legal', 1, 1, 'DIRECTIVO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(3, 'Análisis FODA', 'Análisis de fortalezas, oportunidades, debilidades y amenazas', 1, 1, 'PROFESIONAL', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(4, 'Elaboración del Plan Estratégico', 'Elaboración del plan estratégico organizacional', 2, 1, 'DIRECTIVO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(5, 'Definición de Metas SMART', 'Definición de metas específicas, medibles, alcanzables, relevantes y con tiempo', 2, 1, 'PROFESIONAL', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(6, 'Planificación de Auditoría', 'Planificación y programación de auditorías internas', 3, 1, 'PROFESIONAL', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(7, 'Ejecución de Auditoría', 'Ejecución y documentación de auditorías internas', 3, 1, 'TECNICO', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(8, 'Identificación de Oportunidades', 'Identificación de oportunidades de mejora', 4, 1, 'PROFESIONAL', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(9, 'Implementación de Mejoras', 'Implementación de mejoras identificadas', 4, 1, 'TECNICO', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(10, 'Redacción de Avisos', 'Redacción de avisos de empleo', 5, 1, 'PROFESIONAL', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(11, 'Publicación en Medios', 'Publicación de avisos en diferentes medios', 5, 1, 'ASISTENCIAL', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(12, 'Revisión de CV', 'Revisión y evaluación de currículums vitae', 6, 1, 'PROFESIONAL', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(13, 'Entrevistas de Selección', 'Conducción de entrevistas de selección', 6, 1, 'PROFESIONAL', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(14, 'Diseño de Programas', 'Diseño de programas de capacitación', 7, 1, 'PROFESIONAL', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(15, 'Ejecución de Capacitaciones', 'Ejecución de sesiones de capacitación', 7, 1, 'TECNICO', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(16, 'Elaboración de Evaluaciones', 'Elaboración de evaluaciones de desempeño', 8, 1, 'PROFESIONAL', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(17, 'Entrevistas de Evaluación', 'Conducción de entrevistas de evaluación', 8, 1, 'PROFESIONAL', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(18, 'Registro de Facturas', 'Registro de facturas de proveedores', 9, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(19, 'Registro de Ventas', 'Registro de ventas y facturación', 9, 1, 'TECNICO', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(20, 'Conciliación Bancaria', 'Conciliación de cuentas bancarias', 10, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(21, 'Cierre de Libros', 'Cierre contable de libros', 10, 1, 'PROFESIONAL', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(22, 'Análisis de Costos', 'Análisis de costos históricos', 11, 1, 'PROFESIONAL', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(23, 'Proyección Presupuestaria', 'Proyección presupuestaria anual', 11, 1, 'PROFESIONAL', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(24, 'Seguimiento de Gastos', 'Seguimiento de gastos vs presupuesto', 12, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(25, 'Reportes de Control', 'Elaboración de reportes de control presupuestario', 12, 1, 'PROFESIONAL', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(26, 'Entrevistas con Usuarios', 'Entrevistas para recopilar requerimientos', 13, 1, 'PROFESIONAL', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(27, 'Documentación de Requerimientos', 'Documentación de especificaciones técnicas', 13, 1, 'PROFESIONAL', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(28, 'Programación Frontend', 'Desarrollo de interfaces de usuario', 14, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(29, 'Programación Backend', 'Desarrollo de lógica de negocio', 14, 1, 'TECNICO', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(30, 'Clasificación de Tickets', 'Clasificación y priorización de tickets', 15, 1, 'ASISTENCIAL', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(31, 'Resolución de Incidencias', 'Resolución de incidencias técnicas', 15, 1, 'TECNICO', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(32, 'Monitoreo de Sistemas', 'Monitoreo continuo de sistemas', 16, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(33, 'Actualización de Software', 'Actualización y parcheo de software', 16, 1, 'TECNICO', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(34, 'procedimiento1', NULL, 19, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(35, 'procedimiento1', NULL, 20, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(36, 'procedimiento1', NULL, 12, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(37, 'procedimiento2', NULL, 13, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(38, 'procedimiento1', NULL, 14, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(39, 'procedimiento1', NULL, 15, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(40, 'procedimiento1', NULL, 16, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(41, 'procedimiento2', NULL, 17, 1, 'TECNICO', 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(42, 'procedimiento22', NULL, 18, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 16:57:04'),
(43, 'procedimiento10', NULL, 19, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(44, 'procedimiento20', NULL, 20, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(45, 'procedimiento11', NULL, 21, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(46, 'procedimiento8', NULL, 22, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(47, 'Liquidación nomina', NULL, 23, 1, 'TECNICO', 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(48, 'procedimiento1', NULL, 25, 1, 'TECNICO', 1, '2025-08-25 15:23:01', '2025-08-25 15:23:01'),
(49, 'procedimiento1', NULL, 26, 1, 'TECNICO', 1, '2025-08-25 16:59:04', '2025-08-25 16:59:04'),
(50, 'procedimiento1', NULL, 27, 1, 'TECNICO', 1, '2025-09-02 11:49:47', '2025-09-02 11:49:47');

-- --------------------------------------------------------

--
-- Table structure for table `procesos`
--

DROP TABLE IF EXISTS `procesos`;
CREATE TABLE `procesos` (
  `id` int(11) NOT NULL,
  `nombre` text NOT NULL,
  `descripcion` text DEFAULT NULL,
  `dependencia_id` int(11) DEFAULT NULL,
  `activo` tinyint(4) DEFAULT 1,
  `orden` int(11) DEFAULT 0,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `procesos`
--

INSERT INTO `procesos` (`id`, `nombre`, `descripcion`, `dependencia_id`, `activo`, `orden`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Proceso Estratégico', 'Proceso de planificación estratégica', 1, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(2, 'Planificación Estratégica', 'Proceso de planificación estratégica organizacional', 1, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(3, 'Gestión de Calidad', 'Proceso de gestión de calidad y mejora continua', 1, 1, 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(4, 'Reclutamiento y Selección', 'Proceso de reclutamiento y selección de personal', 2, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(5, 'Desarrollo de Personal', 'Proceso de capacitación y desarrollo del personal', 2, 1, 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(6, 'Contabilidad', 'Proceso de contabilidad y registros financieros', 3, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(7, 'Presupuestación', 'Proceso de presupuestación y control financiero', 3, 1, 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(8, 'Desarrollo de Software', 'Proceso de desarrollo y mantenimiento de software', 4, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(9, 'Soporte Técnico', 'Proceso de soporte técnico y mantenimiento de sistemas', 4, 1, 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(10, 'Proceso1', NULL, 3, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(11, 'Proceso1', NULL, 11, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(12, 'Proceso1', NULL, 13, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(13, 'proceso2', NULL, 14, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(14, 'Proceso1', NULL, 1, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(15, 'Proceso1', NULL, 15, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(16, 'Proceso1', NULL, 16, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(17, 'proceso2', NULL, 16, 1, 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(18, 'proceso22', NULL, 17, 1, 1, '2025-08-25 11:56:02', '2025-08-25 16:56:57'),
(19, 'proceso10', NULL, 18, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(20, 'proceso20', NULL, 18, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(21, 'contab1', NULL, 19, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(22, 'proceso8', NULL, 18, 1, 2, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(23, 'Nomina', NULL, 21, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(24, 'Gestión Documetal', NULL, 21, 1, 1, '2025-08-25 11:56:02', '2025-08-25 11:56:02'),
(25, 'Proceso1', NULL, 23, 1, 1, '2025-08-25 15:22:51', '2025-08-25 15:22:51'),
(26, 'Proceso1', NULL, 24, 1, 1, '2025-08-25 16:58:54', '2025-08-25 16:58:54'),
(27, 'Actualizar software', NULL, 25, 1, 1, '2025-09-02 11:49:37', '2025-09-02 11:49:37');

-- --------------------------------------------------------

--
-- Table structure for table `tiempos_procedimientos`
--

DROP TABLE IF EXISTS `tiempos_procedimientos`;
CREATE TABLE `tiempos_procedimientos` (
  `id` int(11) NOT NULL,
  `procedimiento_id` int(11) NOT NULL,
  `proceso_id` int(11) DEFAULT NULL,
  `actividad_id` int(11) DEFAULT NULL,
  `empleo_id` int(11) NOT NULL,
  `estructura_id` varchar(36) DEFAULT NULL,
  `usuario_id` varchar(36) NOT NULL,
  `tiempo_estandar` decimal(10,2) NOT NULL COMMENT 'Tiempo estándar por procedimiento en horas',
  `frecuencia_mensual` decimal(10,2) NOT NULL DEFAULT 0.00,
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `horas_directivo` decimal(10,2) DEFAULT 0.00 COMMENT 'Horas hombre para nivel Directivo',
  `horas_asesor` decimal(10,2) DEFAULT 0.00 COMMENT 'Horas hombre para nivel Asesor',
  `horas_profesional` decimal(10,2) DEFAULT 0.00 COMMENT 'Horas hombre para nivel Profesional',
  `horas_tecnico` decimal(10,2) DEFAULT 0.00 COMMENT 'Horas hombre para nivel Técnico',
  `horas_asistencial` decimal(10,2) DEFAULT 0.00 COMMENT 'Horas hombre para nivel Asistencial',
  `activo` tinyint(1) DEFAULT 1 COMMENT 'Indica si el registro está activo',
  `tiempo_minimo` decimal(10,2) DEFAULT 0.00 COMMENT 'Tiempo mínimo en horas',
  `tiempo_promedio` decimal(10,2) DEFAULT 0.00 COMMENT 'Tiempo promedio en horas',
  `tiempo_maximo` decimal(10,2) DEFAULT 0.00 COMMENT 'Tiempo máximo en horas',
  `horas_contratista` decimal(10,2) DEFAULT 0.00,
  `horas_trabajador_oficial` decimal(10,2) DEFAULT 0.00,
  `grado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tiempos_procedimientos`
--

INSERT INTO `tiempos_procedimientos` (`id`, `procedimiento_id`, `proceso_id`, `actividad_id`, `empleo_id`, `estructura_id`, `usuario_id`, `tiempo_estandar`, `frecuencia_mensual`, `observaciones`, `fecha_creacion`, `fecha_actualizacion`, `horas_directivo`, `horas_asesor`, `horas_profesional`, `horas_tecnico`, `horas_asistencial`, `activo`, `tiempo_minimo`, `tiempo_promedio`, `tiempo_maximo`, `horas_contratista`, `horas_trabajador_oficial`, `grado`) VALUES
(2175, 40, 16, 26, 28, '69b7e584-39d9-45a0-8de4-62daffb20466', '1', 6.24, 1.00, NULL, '2025-08-25 16:25:36', '2025-08-25 16:25:36', 6.24, 0.00, 0.00, 0.00, 0.00, 1, 4.00, 6.00, 7.00, 0.00, 0.00, NULL),
(2176, 47, 23, 33, 28, '69b7e584-39d9-45a0-8de4-62daffb20466', '1', 4.28, 0.50, NULL, '2025-08-25 16:27:35', '2025-08-25 16:36:20', 2.14, 0.00, 0.00, 0.00, 0.00, 1, 2.00, 4.00, 6.00, 0.00, 0.00, NULL),
(2177, 47, 23, 32, 28, '69b7e584-39d9-45a0-8de4-62daffb20466', '1', 4.28, 0.50, NULL, '2025-08-25 16:35:03', '2025-08-25 16:35:03', 2.14, 0.00, 0.00, 0.00, 0.00, 1, 2.00, 4.00, 6.00, 0.00, 0.00, NULL),
(2178, 47, 23, 33, 28, '69b7e584-39d9-45a0-8de4-62daffb20466', '1', 4.19, 0.17, NULL, '2025-08-25 16:35:45', '2025-08-25 16:35:45', 0.71, 0.00, 0.00, 0.00, 0.00, 1, 2.50, 3.00, 9.00, 0.00, 0.00, NULL),
(2179, 47, 23, 35, 28, '69b7e584-39d9-45a0-8de4-62daffb20466', '1', 7.42, 20.00, NULL, '2025-08-25 16:36:16', '2025-08-25 16:36:16', 148.40, 0.00, 0.00, 0.00, 0.00, 1, 3.60, 7.00, 10.00, 0.00, 0.00, NULL),
(2180, 47, 23, 34, 85, '69b7e584-39d9-45a0-8de4-62daffb20466', '1', 3.39, 0.25, NULL, '2025-08-25 16:39:31', '2025-08-25 16:39:31', 0.00, 0.00, 0.85, 0.00, 0.00, 1, 1.00, 3.00, 6.00, 0.00, 0.00, NULL),
(2181, 47, 23, 35, 85, '69b7e584-39d9-45a0-8de4-62daffb20466', '1', 5.35, 0.25, NULL, '2025-08-25 16:39:50', '2025-08-25 16:39:50', 0.00, 0.00, 1.34, 0.00, 0.00, 1, 2.00, 5.00, 8.00, 0.00, 0.00, NULL),
(2182, 47, 23, 35, 77, '69b7e584-39d9-45a0-8de4-62daffb20466', '1', 6.42, 0.33, NULL, '2025-08-25 16:42:06', '2025-08-25 16:42:06', 0.00, 2.12, 0.00, 0.00, 0.00, 1, 5.00, 6.00, 7.00, 0.00, 0.00, NULL),
(2183, 47, 23, 34, 128, '69b7e584-39d9-45a0-8de4-62daffb20466', '1', 5.17, 1.00, NULL, '2025-08-25 16:50:43', '2025-08-25 16:50:43', 0.00, 0.00, 0.00, 0.00, 5.17, 1, 2.00, 5.00, 7.00, 0.00, 0.00, NULL),
(2184, 47, 23, 33, 115, '69b7e584-39d9-45a0-8de4-62daffb20466', '1', 7.49, 0.50, NULL, '2025-08-25 16:51:42', '2025-08-25 16:51:42', 0.00, 0.00, 0.00, 3.75, 0.00, 1, 5.00, 7.00, 9.00, 0.00, 0.00, NULL),
(2185, 47, 23, 35, 84, '69b7e584-39d9-45a0-8de4-62daffb20466', '1', 6.06, 0.50, NULL, '2025-08-25 16:57:39', '2025-08-25 16:57:39', 0.00, 0.00, 3.03, 0.00, 0.00, 1, 3.00, 6.00, 7.00, 0.00, 0.00, NULL),
(2186, 49, 26, 37, 151, '6f36c61a-b3e6-406f-96a9-658f4416b83a', '1', 8.38, 20.00, NULL, '2025-08-25 16:59:47', '2025-08-25 16:59:47', 0.00, 0.00, 0.00, 0.00, 0.00, 1, 5.00, 8.00, 10.00, 167.60, 0.00, NULL),
(2187, 42, 18, 27, 152, '69b7e584-39d9-45a0-8de4-62daffb20466', '1', 3.39, 1.00, NULL, '2025-09-01 20:15:49', '2025-09-01 20:16:16', 0.00, 0.00, 0.00, 0.00, 0.00, 1, 2.00, 3.00, 5.00, 0.00, 3.39, NULL),
(2188, 40, 16, 26, 118, '69b7e584-39d9-45a0-8de4-62daffb20466', 'e6ca7aa1-3a90-4ab4-b510-60fced3937bc', 23.18, 0.50, NULL, '2025-09-01 21:01:05', '2025-09-01 21:01:41', 0.00, 0.00, 0.00, 11.59, 0.00, 1, 10.00, 20.00, 40.00, 0.00, 0.00, NULL),
(2189, 40, 16, 26, 83, '69b7e584-39d9-45a0-8de4-62daffb20466', 'e6ca7aa1-3a90-4ab4-b510-60fced3937bc', 26.75, 4.00, NULL, '2025-09-01 21:01:38', '2025-09-01 21:01:41', 0.00, 0.00, 107.00, 0.00, 0.00, 1, 15.00, 25.00, 35.00, 0.00, 0.00, NULL),
(2190, 50, 27, 38, 114, '6f36c61a-b3e6-406f-96a9-658f4416b83a', '1', 10.70, 0.50, NULL, '2025-09-02 11:50:27', '2025-09-02 11:50:31', 0.00, 0.00, 0.00, 5.35, 0.00, 1, 5.00, 10.00, 15.00, 0.00, 0.00, NULL),
(2191, 50, 27, 38, 149, '6f36c61a-b3e6-406f-96a9-658f4416b83a', 'e6ca7aa1-3a90-4ab4-b510-60fced3937bc', 8.74, 0.33, NULL, '2025-09-02 11:51:40', '2025-09-02 11:51:42', 0.00, 0.00, 0.00, 0.00, 2.88, 1, 5.00, 8.00, 12.00, 2.88, 0.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
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
('d06759d7-7417-428f-8a02-0819b9567284', 'consultor@cargas-trabajo.gov.co', '$2a$10$lP1R1YVn8b9MwIvYjNAplukOP1L4ZJjfORb.EcjvLfMz.yf5JpAKm', 'Juan', 'García', 'consulta', 1, '2025-08-14 04:01:45', '2025-08-14 04:01:45'),
('e6ca7aa1-3a90-4ab4-b510-60fced3937bc', 'ayala@gmail.com', '$2a$10$MJ5/2tYSWcj9JacsnGV9KO7o66zAzoqCBECSwfH8sHCfASgdc1RKu', 'Diego', 'Ayala', 'tiempos', 1, '2025-09-02 01:05:37', '2025-09-02 02:29:03'),
('user_1755225276718', 'tiempos@cargas-trabajo.gov.co', '$2a$10$M3cKBjFPc2f345A.sLy2BOlnhXcnnk2y/w76LbTDvF0vZfhMgY0/W', 'Carlos', 'Martínez', 'usuario', 1, '2025-08-14 21:34:36', '2025-08-14 22:15:39');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_totales_por_niveles`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `v_totales_por_niveles`;
CREATE TABLE `v_totales_por_niveles` (
`nivel_jerarquico` varchar(11)
,`total_horas` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Structure for view `v_totales_por_niveles`
--
DROP TABLE IF EXISTS `v_totales_por_niveles`;

DROP VIEW IF EXISTS `v_totales_por_niveles`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_totales_por_niveles`  AS SELECT 'DIRECTIVO' AS `nivel_jerarquico`, sum(`tiempos_procedimientos`.`horas_directivo`) AS `total_horas` FROM `tiempos_procedimientos` WHERE `tiempos_procedimientos`.`activo` = 1union allselect 'ASESOR' AS `nivel_jerarquico`,sum(`tiempos_procedimientos`.`horas_asesor`) AS `total_horas` from `tiempos_procedimientos` where `tiempos_procedimientos`.`activo` = 1 union all select 'PROFESIONAL' AS `nivel_jerarquico`,sum(`tiempos_procedimientos`.`horas_profesional`) AS `total_horas` from `tiempos_procedimientos` where `tiempos_procedimientos`.`activo` = 1 union all select 'TECNICO' AS `nivel_jerarquico`,sum(`tiempos_procedimientos`.`horas_tecnico`) AS `total_horas` from `tiempos_procedimientos` where `tiempos_procedimientos`.`activo` = 1 union all select 'ASISTENCIAL' AS `nivel_jerarquico`,sum(`tiempos_procedimientos`.`horas_asistencial`) AS `total_horas` from `tiempos_procedimientos` where `tiempos_procedimientos`.`activo` = 1  ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `actividades`
--
ALTER TABLE `actividades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proceso_id` (`proceso_id`),
  ADD KEY `idx_procedimiento_id` (`procedimiento_id`);

--
-- Indexes for table `dependencias`
--
ALTER TABLE `dependencias`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `elementos_estructura`
--
ALTER TABLE `elementos_estructura`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_estructura_elemento` (`estructura_id`,`tipo`,`elemento_id`),
  ADD KEY `idx_estructura_id` (`estructura_id`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_elemento_id` (`elemento_id`),
  ADD KEY `idx_padre_id` (`padre_id`),
  ADD KEY `idx_orden` (`orden`);

--
-- Indexes for table `empleos`
--
ALTER TABLE `empleos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `estructuras`
--
ALTER TABLE `estructuras`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_nombre_unico` (`nombre`),
  ADD KEY `idx_activa` (`activa`),
  ADD KEY `idx_fecha_creacion` (`fecha_creacion`);

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
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_estructura_id` (`estructura_id`),
  ADD KEY `idx_horas_directivo` (`horas_directivo`),
  ADD KEY `idx_horas_asesor` (`horas_asesor`),
  ADD KEY `idx_horas_profesional` (`horas_profesional`),
  ADD KEY `idx_horas_tecnico` (`horas_tecnico`),
  ADD KEY `idx_horas_asistencial` (`horas_asistencial`),
  ADD KEY `idx_proceso_id` (`proceso_id`),
  ADD KEY `idx_actividad_id` (`actividad_id`),
  ADD KEY `idx_empleo_procedimiento` (`empleo_id`,`procedimiento_id`),
  ADD KEY `idx_usuario_empleo` (`usuario_id`,`empleo_id`),
  ADD KEY `fk_tiempos_procedimiento_new` (`procedimiento_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `dependencias`
--
ALTER TABLE `dependencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `empleos`
--
ALTER TABLE `empleos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=161;

--
-- AUTO_INCREMENT for table `procedimientos`
--
ALTER TABLE `procedimientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `procesos`
--
ALTER TABLE `procesos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `tiempos_procedimientos`
--
ALTER TABLE `tiempos_procedimientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2192;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `actividades`
--
ALTER TABLE `actividades`
  ADD CONSTRAINT `actividades_ibfk_1` FOREIGN KEY (`proceso_id`) REFERENCES `procesos` (`id`),
  ADD CONSTRAINT `fk_actividades_procedimiento` FOREIGN KEY (`procedimiento_id`) REFERENCES `procedimientos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `elementos_estructura`
--
ALTER TABLE `elementos_estructura`
  ADD CONSTRAINT `fk_elemento_estructura` FOREIGN KEY (`estructura_id`) REFERENCES `estructuras` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_elemento_padre` FOREIGN KEY (`padre_id`) REFERENCES `elementos_estructura` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
  ADD CONSTRAINT `fk_tiempos_actividad` FOREIGN KEY (`actividad_id`) REFERENCES `actividades` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tiempos_empleo_new` FOREIGN KEY (`empleo_id`) REFERENCES `empleos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tiempos_procedimiento_new` FOREIGN KEY (`procedimiento_id`) REFERENCES `procedimientos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tiempos_proceso` FOREIGN KEY (`proceso_id`) REFERENCES `procesos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tiempos_usuario_new` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
