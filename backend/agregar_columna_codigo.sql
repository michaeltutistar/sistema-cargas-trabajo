-- Agregar columna código a la tabla dependencias
ALTER TABLE `dependencias` 
ADD COLUMN `codigo` VARCHAR(50) NOT NULL AFTER `nombre`,
ADD UNIQUE KEY `idx_codigo_unico` (`codigo`);

-- Actualizar registros existentes con códigos generados
UPDATE `dependencias` 
SET `codigo` = CONCAT('DEP', LPAD(id, 3, '0'))
WHERE `codigo` IS NULL OR `codigo` = ''; 