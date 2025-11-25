-- Script para crear usuario de pruebas con rol "tiempos"
-- Fecha: 2025-11-18
-- Datos del usuario:
--   Cédula: 123456789
--   Nombre: Usuario pruebas
--   Email: pruebas@tac.com
--   Contraseña: 123456789 (la cédula)
--   Rol: tiempos

-- IMPORTANTE: Verificar que el email no exista antes de ejecutar
-- SELECT * FROM usuarios WHERE email = 'pruebas@tac.com';

-- Insertar usuario de pruebas
INSERT INTO usuarios (id, email, password, nombre, apellido, rol, activo, fecha_creacion, fecha_actualizacion) VALUES
('80d1862c-f632-4412-81f8-14bacc697152', 'pruebas@tac.com', '$2a$10$DhhOc0yyaDqiqCoB.lIpV.J1Oo./uLyKoAsKSEnYtGT6dVjiGEZu.', 'Usuario', 'pruebas', 'tiempos', 1, NOW(), NOW());

-- Verificar que se creó correctamente
-- SELECT id, email, nombre, apellido, rol, activo FROM usuarios WHERE email = 'pruebas@tac.com';

