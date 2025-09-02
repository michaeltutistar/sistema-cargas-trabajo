-- Script para agregar campo estructura_id a la tabla tiempos_procedimientos
-- Esto permitirá que cada tiempo pertenezca a una estructura específica

-- 1. Agregar la columna estructura_id a la tabla tiempos_procedimientos
ALTER TABLE `tiempos_procedimientos` 
ADD COLUMN `estructura_id` varchar(36) DEFAULT NULL AFTER `empleo_id`;

-- 2. Agregar índice para mejorar el rendimiento de consultas por estructura
ALTER TABLE `tiempos_procedimientos` 
ADD INDEX `idx_estructura_id` (`estructura_id`);

-- 3. Agregar índice compuesto para estructura + usuario + procedimiento + empleo
ALTER TABLE `tiempos_procedimientos` 
ADD UNIQUE INDEX `idx_estructura_usuario_procedimiento_empleo` (`estructura_id`, `usuario_id`, `procedimiento_id`, `empleo_id`);

-- 4. Agregar foreign key constraint para estructura_id
ALTER TABLE `tiempos_procedimientos` 
ADD CONSTRAINT `fk_tiempos_estructura` 
FOREIGN KEY (`estructura_id`) REFERENCES `estructuras`(`id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Actualizar registros existentes para asignar estructura_id (opcional)
-- Por ahora asignar NULL para registros existentes
-- UPDATE `tiempos_procedimientos` 
-- SET `estructura_id` = NULL 
-- WHERE `estructura_id` IS NULL;

-- Verificar la estructura final
DESCRIBE `tiempos_procedimientos`;

-- Mostrar los índices de la tabla
SHOW INDEX FROM `tiempos_procedimientos`; 