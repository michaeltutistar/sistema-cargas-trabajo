#!/bin/bash

# ============================================================================
# SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS MYSQL
# Sistema de Gestión de Cargas de Trabajo - VPS Ubuntu 24.04 LTS
# ============================================================================

set -e  # Salir si hay algún error

echo "🗄️ CONFIGURACIÓN DE BASE DE DATOS MYSQL"
echo "========================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "cargas_trabajo_produccion.sql" ]; then
    error "No se encontró cargas_trabajo_produccion.sql. Ejecuta desde backend/database/"
    exit 1
fi

# ============================================================================
# CONFIGURACIÓN DE BASE DE DATOS
# ============================================================================

# Variables de configuración
DB_NAME="cargas_trabajo"
DB_USER="cargas_user"
DB_PASSWORD="CargasTrabajo2025!"
DB_HOST="localhost"
DB_PORT="3306"

log "Configurando base de datos MySQL..."

# ============================================================================
# PASO 1: INSTALAR MYSQL SERVER
# ============================================================================
log "PASO 1: Instalando MySQL Server..."
apt update
apt install -y mysql-server mysql-client

# ============================================================================
# PASO 2: CONFIGURAR MYSQL
# ============================================================================
log "PASO 2: Configurando MySQL..."

# Crear archivo de configuración temporal
cat > /tmp/mysql_secure_install.sql << EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASSWORD}';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
FLUSH PRIVILEGES;
EOF

# Ejecutar configuración de seguridad
mysql -u root < /tmp/mysql_secure_install.sql
rm /tmp/mysql_secure_install.sql

# ============================================================================
# PASO 3: CREAR BASE DE DATOS Y USUARIO
# ============================================================================
log "PASO 3: Creando base de datos y usuario..."

# Crear archivo SQL para configuración
cat > /tmp/setup_db.sql << EOF
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario
CREATE USER IF NOT EXISTS '${DB_USER}'@'${DB_HOST}' IDENTIFIED BY '${DB_PASSWORD}';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'${DB_HOST}';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON \`${DB_NAME}\`.* TO '${DB_USER}'@'${DB_HOST}';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Mostrar bases de datos
SHOW DATABASES;

-- Mostrar usuarios
SELECT User, Host FROM mysql.user WHERE User = '${DB_USER}';
EOF

# Ejecutar configuración
mysql -u root -p${DB_PASSWORD} < /tmp/setup_db.sql
rm /tmp/setup_db.sql

success "Base de datos y usuario creados"

# ============================================================================
# PASO 4: IMPORTAR DATOS
# ============================================================================
log "PASO 4: Importando datos desde cargas_trabajo_produccion.sql..."

# Verificar que el archivo existe
if [ -f "cargas_trabajo_produccion.sql" ]; then
    log "Importando datos..."
    mysql -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < cargas_trabajo_produccion.sql
    success "Datos importados exitosamente"
else
    error "No se encontró cargas_trabajo_produccion.sql"
    exit 1
fi

# ============================================================================
# PASO 5: VERIFICAR IMPORTACIÓN
# ============================================================================
log "PASO 5: Verificando importación..."

# Crear script de verificación
cat > /tmp/verify_import.sql << EOF
USE \`${DB_NAME}\`;

-- Mostrar tablas
SHOW TABLES;

-- Contar registros en usuarios
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- Mostrar usuario admin
SELECT id, email, nombre, apellido, rol FROM usuarios WHERE email = 'admin@admin.com';

-- Contar dependencias
SELECT COUNT(*) as total_dependencias FROM dependencias;

-- Contar procedimientos
SELECT COUNT(*) as total_procedimientos FROM procedimientos;
EOF

# Ejecutar verificación
mysql -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < /tmp/verify_import.sql
rm /tmp/verify_import.sql

# ============================================================================
# PASO 6: CONFIGURAR MYSQL PARA ACCESO EXTERNO (OPCIONAL)
# ============================================================================
log "PASO 6: Configurando acceso externo..."

# Comentar bind-address para permitir conexiones externas
sed -i 's/^bind-address/#bind-address/' /etc/mysql/mysql.conf.d/mysqld.cnf

# Reiniciar MySQL
systemctl restart mysql

# ============================================================================
# PASO 7: CONFIGURAR FIREWALL
# ============================================================================
log "PASO 7: Configurando firewall para MySQL..."

# Permitir puerto MySQL
ufw allow 3306

# ============================================================================
# INSTALACIÓN COMPLETADA
# ============================================================================
echo ""
echo "🎉 ================================================"
echo "✅ BASE DE DATOS MYSQL CONFIGURADA EXITOSAMENTE"
echo "🎉 ================================================"
echo ""
echo "📊 INFORMACIÓN DE CONEXIÓN:"
echo "   Host: ${DB_HOST}"
echo "   Puerto: ${DB_PORT}"
echo "   Base de datos: ${DB_NAME}"
echo "   Usuario: ${DB_USER}"
echo "   Contraseña: ${DB_PASSWORD}"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "   Conectar: mysql -u ${DB_USER} -p${DB_NAME}"
echo "   Ver estado: systemctl status mysql"
echo "   Reiniciar: systemctl restart mysql"
echo "   Ver logs: tail -f /var/log/mysql/error.log"
echo ""
echo "🌐 ACCESO EXTERNO:"
echo "   Host: ${DB_HOST}"
echo "   Puerto: ${DB_PORT}"
echo "   Usuario: ${DB_USER}"
echo "   Base de datos: ${DB_NAME}"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Cambia la contraseña por defecto en producción"
echo "   - Configura SSL para conexiones externas"
echo "   - Limita el acceso por IP si es necesario"
echo ""
echo "================================================"

# Crear archivo de configuración para la aplicación
cat > database_config.env << EOF
# Configuración de Base de Datos MySQL
DB_TYPE=mysql
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
EOF

success "Archivo de configuración database_config.env creado"
log "Copia este archivo a tu aplicación y renómbralo a .env" 