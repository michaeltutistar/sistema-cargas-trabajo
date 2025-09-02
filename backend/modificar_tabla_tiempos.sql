-- Script para modificar la tabla tiempos_procedimientos
-- Agregar campo usuario_id para permitir múltiples registros por usuario

-- 1. Agregar la columna usuario_id a la tabla tiempos_procedimientos
ALTER TABLE `tiempos_procedimientos` 
ADD COLUMN `usuario_id` varchar(36) DEFAULT NULL AFTER `empleo_id`;

-- 2. Agregar índice para mejorar el rendimiento de consultas por usuario
ALTER TABLE `tiempos_procedimientos` 
ADD INDEX `idx_usuario_id` (`usuario_id`);

-- 3. Agregar índice compuesto para usuario + procedimiento + empleo
ALTER TABLE `tiempos_procedimientos` 
ADD UNIQUE INDEX `idx_usuario_procedimiento_empleo` (`usuario_id`, `procedimiento_id`, `empleo_id`);

-- 4. Eliminar el índice único anterior si existe (procedimiento + empleo)
-- Primero verificamos si existe el índice
-- ALTER TABLE `tiempos_procedimientos` DROP INDEX IF EXISTS `idx_procedimiento_empleo`;

-- 5. Agregar foreign key constraint para usuario_id
ALTER TABLE `tiempos_procedimientos` 
ADD CONSTRAINT `fk_tiempos_usuario` 
FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. Actualizar registros existentes para asignar usuario_id (opcional)
-- Si hay registros existentes, asignar al usuario admin por defecto
UPDATE `tiempos_procedimientos` 
SET `usuario_id` = '3b3a50f4-f5da-4de8-a800-859ceae8d9d6' 
WHERE `usuario_id` IS NULL;

-- 7. Hacer la columna usuario_id NOT NULL después de asignar valores
ALTER TABLE `tiempos_procedimientos` 
MODIFY COLUMN `usuario_id` varchar(36) NOT NULL;

-- Verificar la estructura final
DESCRIBE `tiempos_procedimientos`;

-- Mostrar los índices de la tabla
SHOW INDEX FROM `tiempos_procedimientos`; 