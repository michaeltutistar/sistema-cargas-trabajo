-- Crear tabla para gestión de estructura
CREATE TABLE IF NOT EXISTS `estructuras` (
  `id` varchar(36) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usuario_creador_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_nombre_unico` (`nombre`),
  KEY `idx_activa` (`activa`),
  KEY `idx_fecha_creacion` (`fecha_creacion`),
  CONSTRAINT `fk_estructura_usuario` FOREIGN KEY (`usuario_creador_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla para elementos de estructura
CREATE TABLE IF NOT EXISTS `elementos_estructura` (
  `id` varchar(36) NOT NULL,
  `estructura_id` varchar(36) NOT NULL,
  `tipo` enum('dependencia', 'proceso', 'actividad', 'procedimiento', 'nivel_empleo', 'empleo') NOT NULL,
  `elemento_id` varchar(36) NOT NULL,
  `padre_id` varchar(36) DEFAULT NULL,
  `orden` int NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_estructura_elemento` (`estructura_id`, `tipo`, `elemento_id`),
  KEY `idx_estructura_id` (`estructura_id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_elemento_id` (`elemento_id`),
  KEY `idx_padre_id` (`padre_id`),
  KEY `idx_orden` (`orden`),
  CONSTRAINT `fk_elemento_estructura` FOREIGN KEY (`estructura_id`) REFERENCES `estructuras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_elemento_padre` FOREIGN KEY (`padre_id`) REFERENCES `elementos_estructura`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar estructura por defecto
INSERT INTO `estructuras` (`id`, `nombre`, `descripcion`, `activa`, `usuario_creador_id`) 
VALUES (
  'estructura_default',
  'Estructura Organizacional Principal',
  'Estructura organizacional principal del sistema de cargas de trabajo',
  1,
  (SELECT id FROM usuarios WHERE email = 'admin@cargas-trabajo.gov.co' LIMIT 1)
) ON DUPLICATE KEY UPDATE 
  `descripcion` = VALUES(`descripcion`),
  `fecha_actualizacion` = CURRENT_TIMESTAMP; 