-- Script para corregir la estructura de la tabla empleos
DROP TABLE IF EXISTS empleos;

CREATE TABLE `empleos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` text DEFAULT NULL,
  `nombre` text NOT NULL,
  `nivel_jerarquico` text DEFAULT NULL,
  `denominacion` text DEFAULT NULL,
  `grado` int(11) DEFAULT NULL,
  `activo` int(11) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 