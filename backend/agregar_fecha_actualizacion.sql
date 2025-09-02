-- Agregar columna fecha_actualizacion a la tabla dependencias
ALTER TABLE `dependencias` 
ADD COLUMN `fecha_actualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `fecha_creacion`; 