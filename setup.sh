#!/bin/bash

# ============================================================================
# SCRIPT DE INSTALACIÓN INICIAL
# Sistema de Gestión de Cargas de Trabajo - VPS Ubuntu 24.04 LTS
# ============================================================================

set -e  # Salir si hay algún error

echo "🚀 INSTALACIÓN INICIAL DEL SISTEMA"
echo "=================================="

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

# Verificar que somos root o tenemos sudo
if [[ $EUID -ne 0 ]]; then
   error "Este script debe ejecutarse como root o con sudo"
   exit 1
fi

log "Iniciando instalación del sistema..."

# ============================================================================
# PASO 1: ACTUALIZAR EL SISTEMA
# ============================================================================
log "PASO 1: Actualizando el sistema..."
apt update && apt upgrade -y
success "Sistema actualizado"

# ============================================================================
# PASO 2: INSTALAR HERRAMIENTAS BÁSICAS
# ============================================================================
log "PASO 2: Instalando herramientas básicas..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
success "Herramientas básicas instaladas"

# ============================================================================
# PASO 3: INSTALAR DOCKER (OPCIONAL)
# ============================================================================
log "PASO 3: Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $SUDO_USER
systemctl enable docker
systemctl start docker
rm get-docker.sh
success "Docker instalado y configurado"

# ============================================================================
# PASO 4: INSTALAR NODE.JS 20.x
# ============================================================================
log "PASO 4: Instalando Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pnpm
success "Node.js 20.x y pnpm instalados"

# Verificar versiones
log "Verificando versiones instaladas..."
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "pnpm: $(pnpm --version)"

# ============================================================================
# PASO 5: INSTALAR BASE DE DATOS MYSQL
# ============================================================================
log "PASO 5: Instalando MySQL Server..."
apt install -y mysql-server mysql-client

# Configurar MySQL
log "Configurando MySQL..."
mysql_secure_installation

# Crear base de datos y usuario
log "Creando base de datos y usuario..."
mysql -u root -p -e "
CREATE DATABASE IF NOT EXISTS cargas_trabajo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'cargas_user'@'localhost' IDENTIFIED BY 'CargasTrabajo2025!';
GRANT ALL PRIVILEGES ON cargas_trabajo.* TO 'cargas_user'@'localhost';
FLUSH PRIVILEGES;
"

success "MySQL instalado y configurado"
success "Base de datos 'cargas_trabajo' creada"
success "Usuario 'cargas_user' creado con permisos completos"

# ============================================================================
# PASO 6: INSTALAR Y CONFIGURAR NGINX
# ============================================================================
log "PASO 6: Instalando y configurando Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx
success "Nginx instalado y configurado"

# ============================================================================
# PASO 7: CONFIGURAR FIREWALL
# ============================================================================
log "PASO 7: Configurando firewall..."
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 8080
ufw --force enable
success "Firewall configurado"

# ============================================================================
# PASO 8: INSTALAR PM2
# ============================================================================
log "PASO 8: Instalando PM2..."
npm install -g pm2
success "PM2 instalado"

# ============================================================================
# PASO 9: CREAR DIRECTORIOS NECESARIOS
# ============================================================================
log "PASO 9: Creando directorios necesarios..."
mkdir -p /var/www/cargas-trabajo
mkdir -p /var/log/cargas-trabajo
mkdir -p /var/backup/cargas-trabajo
chown -R $SUDO_USER:$SUDO_USER /var/www/cargas-trabajo
chown -R $SUDO_USER:$SUDO_USER /var/log/cargas-trabajo
chown -R $SUDO_USER:$SUDO_USER /var/backup/cargas-trabajo
success "Directorios creados y configurados"

# ============================================================================
# PASO 10: CONFIGURAR NGINX
# ============================================================================
log "PASO 10: Configurando Nginx..."

# Crear configuración del sitio
cat > /etc/nginx/sites-available/cargas-trabajo << 'EOF'
server {
    listen 80;
    server_name _;

    # Logs
    access_log /var/log/nginx/cargas-trabajo-access.log;
    error_log /var/log/nginx/cargas-trabajo-error.log;

    # Frontend estático
    location / {
        root /var/www/cargas-trabajo/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache para archivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
EOF

# Habilitar el sitio
ln -sf /etc/nginx/sites-available/cargas-trabajo /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
nginx -t

# Recargar Nginx
systemctl reload nginx
success "Nginx configurado para el proyecto"

# ============================================================================
# PASO 11: CONFIGURAR ALIASES ÚTILES
# ============================================================================
log "PASO 11: Configurando alias útiles..."

# Agregar alias al .bashrc del usuario
cat >> /home/$SUDO_USER/.bashrc << 'EOF'

# ============================================================================
# ALIAS PARA SISTEMA DE CARGAS DE TRABAJO
# ============================================================================
alias deploy="cd /var/www/cargas-trabajo && ./deploy.sh"
alias status="pm2 status cargas-trabajo"
alias logs="pm2 logs cargas-trabajo --lines 50"
alias restart="pm2 restart cargas-trabajo"
alias monit="pm2 monit cargas-trabajo"
alias backup="cp /var/www/cargas-trabajo/cargas_trabajo.db /var/backup/cargas-trabajo/cargas_trabajo_\$(date +%Y%m%d_%H%M%S).db"
EOF

success "Alias configurados"

# ============================================================================
# PASO 12: INSTALACIÓN COMPLETADA
# ============================================================================
echo ""
echo "🎉 ================================================"
echo "✅ INSTALACIÓN COMPLETADA EXITOSAMENTE"
echo "🎉 ================================================"
echo ""
echo "📋 RESUMEN DE LA INSTALACIÓN:"
echo "   ✅ Sistema actualizado"
echo "   ✅ Herramientas básicas instaladas"
echo "   ✅ Docker instalado"
echo "   ✅ Node.js 20.x instalado"
echo "   ✅ pnpm instalado"
echo "   ✅ SQLite3 instalado"
echo "   ✅ Nginx configurado"
echo "   ✅ Firewall configurado"
echo "   ✅ PM2 instalado"
echo "   ✅ Directorios creados"
echo ""
echo "🚀 PRÓXIMOS PASOS:"
echo "   1. Subir tu proyecto a /var/www/cargas-trabajo/"
echo "   2. Ejecutar: cd /var/www/cargas-trabajo && ./deploy.sh"
echo "   3. Configurar dominio (opcional)"
echo "   4. Configurar SSL con Certbot (opcional)"
echo ""
echo "📁 DIRECTORIOS IMPORTANTES:"
echo "   Proyecto: /var/www/cargas-trabajo/"
echo "   Logs: /var/log/cargas-trabajo/"
echo "   Backup: /var/backup/cargas-trabajo/"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "   deploy    - Hacer deploy de la aplicación"
echo "   status    - Ver estado de PM2"
echo "   logs      - Ver logs de la aplicación"
echo "   restart   - Reiniciar la aplicación"
echo "   monit     - Monitorear en tiempo real"
echo "   backup    - Hacer backup de la base de datos"
echo ""
echo "🌐 ACCESO:"
echo "   Frontend: http://TU_IP_VPS"
echo "   API: http://TU_IP_VPS/api"
echo ""
echo "================================================"

# Reiniciar sesión para cargar alias
log "Reinicia tu sesión SSH para cargar los alias, o ejecuta: source ~/.bashrc" 