-- Agregar columna código a la tabla procesos
ALTER TABLE `procesos` 
ADD COLUMN `codigo` VARCHAR(50) NULL AFTER `nombre`; 