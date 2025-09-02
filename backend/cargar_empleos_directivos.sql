-- Script para cargar empleos del nivel DIRECTIVO
-- Fecha: 2025-01-27
-- Descripción: Carga masiva de empleos y cargos del nivel jerárquico DIRECTIVO

-- Limpiar empleos existentes del nivel DIRECTIVO (opcional - descomentar si necesitas limpiar)
-- DELETE FROM empleos WHERE nivel_jerarquico = 'DIRECTIVO';

-- Insertar empleos del nivel DIRECTIVO
INSERT INTO empleos (codigo, denominacion, nivel_jerarquico, activo, fecha_creacion, fecha_actualizacion) VALUES
('005', 'Alcalde', 'DIRECTIVO', 1, NOW(), NOW()),
('030', 'Alcalde Local', 'DIRECTIVO', 1, NOW(), NOW()),
('032', 'Consejero de Justicia', 'DIRECTIVO', 1, NOW(), NOW()),
('036', 'Auditor Fiscal de Contraloría', 'DIRECTIVO', 1, NOW(), NOW()),
('010', 'Contralor', 'DIRECTIVO', 1, NOW(), NOW()),
('035', 'Contralor Auxiliar', 'DIRECTIVO', 1, NOW(), NOW()),
('003', 'Decano de Escuela o Institución Tecnológica', 'DIRECTIVO', 1, NOW(), NOW()),
('007', 'Decano de Institución Universitaria', 'DIRECTIVO', 1, NOW(), NOW()),
('008', 'Decano de Universidad', 'DIRECTIVO', 1, NOW(), NOW()),
('009', 'Director Administrativo o Financiero o Técnico u Operativo', 'DIRECTIVO', 1, NOW(), NOW()),
('060', 'Director de Area Metropolitana', 'DIRECTIVO', 1, NOW(), NOW()),
('055', 'Director de Departamento Administrativo', 'DIRECTIVO', 1, NOW(), NOW()),
('028', 'Director de Escuela o de Instituto o de Centro de Universidad', 'DIRECTIVO', 1, NOW(), NOW()),
('065', 'Director de Hospital', 'DIRECTIVO', 1, NOW(), NOW()),
('016', 'Director Ejecutivo de Asociación de Municipios', 'DIRECTIVO', 1, NOW(), NOW()),
('050', 'Director o Gerente General de Entidad Descentralizada', 'DIRECTIVO', 1, NOW(), NOW()),
('080', 'Director Local de Salud', 'DIRECTIVO', 1, NOW(), NOW()),
('024', 'Director o Gerente Regional o Provincial', 'DIRECTIVO', 1, NOW(), NOW()),
('039', 'Gerente', 'DIRECTIVO', 1, NOW(), NOW()),
('085', 'Gerente Empresa Social del Estado', 'DIRECTIVO', 1, NOW(), NOW()),
('001', 'Gobernador', 'DIRECTIVO', 1, NOW(), NOW()),
('027', 'Jefe de Departamento de Universidad', 'DIRECTIVO', 1, NOW(), NOW()),
('006', 'Jefe de Oficina', 'DIRECTIVO', 1, NOW(), NOW()),
('015', 'Personero', 'DIRECTIVO', 1, NOW(), NOW()),
('017', 'Personero Auxiliar', 'DIRECTIVO', 1, NOW(), NOW()),
('040', 'Personero Delegado', 'DIRECTIVO', 1, NOW(), NOW()),
('043', 'Personero Local de Bogotá', 'DIRECTIVO', 1, NOW(), NOW()),
('071', 'Presidente Consejo de Justicia', 'DIRECTIVO', 1, NOW(), NOW()),
('042', 'Rector de Institución Técnica Profesional', 'DIRECTIVO', 1, NOW(), NOW()),
('048', 'Rector de Institución Universitaria o de Escuela o de Institución Tecnológica', 'DIRECTIVO', 1, NOW(), NOW()),
('067', 'Rector de Universidad', 'DIRECTIVO', 1, NOW(), NOW()),
('020', 'Secretario de Despacho', 'DIRECTIVO', 1, NOW(), NOW()),
('054', 'Secretario General de Entidad Descentralizada', 'DIRECTIVO', 1, NOW(), NOW()),
('058', 'Secretario General de Institución Técnica Profesional', 'DIRECTIVO', 1, NOW(), NOW()),
('064', 'Secretario General de Institución Universitaria', 'DIRECTIVO', 1, NOW(), NOW()),
('052', 'Secretario General de Universidad', 'DIRECTIVO', 1, NOW(), NOW()),
('066', 'Secretario General de Escuela o de Institución Tecnológica', 'DIRECTIVO', 1, NOW(), NOW()),
('073', 'Secretario General de Organismo de Control', 'DIRECTIVO', 1, NOW(), NOW()),
('097', 'Secretario Seccional o Local de Salud', 'DIRECTIVO', 1, NOW(), NOW()),
('025', 'Subcontralor', 'DIRECTIVO', 1, NOW(), NOW()),
('070', 'Subdirector', 'DIRECTIVO', 1, NOW(), NOW()),
('068', 'Subdirector Administrativo o Financiero o Técnico u Operativo', 'DIRECTIVO', 1, NOW(), NOW()),
('072', 'Subdirector Científico', 'DIRECTIVO', 1, NOW(), NOW()),
('074', 'Subdirector de Área Metropolitana', 'DIRECTIVO', 1, NOW(), NOW()),
('076', 'Subdirector de Departamento Administrativo', 'DIRECTIVO', 1, NOW(), NOW()),
('078', 'Subdirector Ejecutivo de Asociación de Municipios', 'DIRECTIVO', 1, NOW(), NOW()),
('084', 'Subdirector o Subgerente General de Entidad Descentralizada', 'DIRECTIVO', 1, NOW(), NOW()),
('090', 'Subgerente', 'DIRECTIVO', 1, NOW(), NOW()),
('045', 'Subsecretario de Despacho', 'DIRECTIVO', 1, NOW(), NOW()),
('091', 'Tesorero Distrital', 'DIRECTIVO', 1, NOW(), NOW()),
('094', 'Veedor Distrital', 'DIRECTIVO', 1, NOW(), NOW()),
('095', 'Viceveedor Distrital', 'DIRECTIVO', 1, NOW(), NOW()),
('099', 'Veedor Distrital Delegado', 'DIRECTIVO', 1, NOW(), NOW()),
('096', 'Vicerrector de Institución Técnica Profesional', 'DIRECTIVO', 1, NOW(), NOW()),
('098', 'Vicerrector de Institución Universitaria', 'DIRECTIVO', 1, NOW(), NOW()),
('057', 'Vicerrector de Escuela Tecnológica o de Institución Tecnológica', 'DIRECTIVO', 1, NOW(), NOW()),
('077', 'Vicerrector de Universidad', 'DIRECTIVO', 1, NOW(), NOW());

-- Verificar la inserción
SELECT 
    COUNT(*) as total_empleos_directivos,
    'DIRECTIVO' as nivel_jerarquico
FROM empleos 
WHERE nivel_jerarquico = 'DIRECTIVO';

-- Mostrar algunos empleos insertados para verificación
SELECT 
    codigo,
    denominacion,
    nivel_jerarquico,
    activo
FROM empleos 
WHERE nivel_jerarquico = 'DIRECTIVO'
ORDER BY codigo
LIMIT 10; 