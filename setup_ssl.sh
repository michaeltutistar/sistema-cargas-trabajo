#!/bin/bash

# ============================================================================
# SCRIPT DE CONFIGURACIÓN SSL/HTTPS
# Sistema de Gestión de Cargas de Trabajo - VPS Ubuntu 24.04 LTS
# ============================================================================

set -e  # Salir si hay algún error

echo "🔒 CONFIGURACIÓN SSL/HTTPS CON LET'S ENCRYPT"
echo "============================================="

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

# ============================================================================
# VERIFICACIONES INICIALES
# ============================================================================

# Verificar que somos root o tenemos sudo
if [[ $EUID -ne 0 ]]; then
   error "Este script debe ejecutarse como root o con sudo"
   exit 1
fi

# Verificar que Nginx esté instalado
if ! command -v nginx &> /dev/null; then
    error "Nginx no está instalado. Ejecuta setup.sh primero."
    exit 1
fi

# Verificar que la aplicación esté funcionando
if ! netstat -tlnp | grep :8080 > /dev/null; then
    error "La aplicación no está funcionando en el puerto 8080"
    exit 1
fi

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

# Solicitar dominio
echo ""
echo "🌐 CONFIGURACIÓN DE DOMINIO"
echo "============================"
read -p "Ingresa tu dominio (ej: micarga.com): " DOMAIN
read -p "¿Quieres incluir www.${DOMAIN}? (s/n): " INCLUDE_WWW

if [ -z "${DOMAIN}" ]; then
    error "Debes ingresar un dominio válido"
    exit 1
fi

# Configurar variables
if [ "${INCLUDE_WWW}" = "s" ] || [ "${INCLUDE_WWW}" = "S" ]; then
    DOMAINS="${DOMAIN} www.${DOMAIN}"
    NGINX_SERVER_NAME="${DOMAIN} www.${DOMAIN}"
else
    DOMAINS="${DOMAIN}"
    NGINX_SERVER_NAME="${DOMAIN}"
fi

log "Dominio configurado: ${DOMAINS}"

# ============================================================================
# PASO 1: INSTALAR CERTBOT
# ============================================================================
log "PASO 1: Instalando Certbot..."
apt update
apt install -y certbot python3-certbot-nginx
success "Certbot instalado"

# ============================================================================
# PASO 2: CONFIGURAR NGINX PARA SSL
# ============================================================================
log "PASO 2: Configurando Nginx para SSL..."

# Crear configuración de sitio con SSL
cat > /etc/nginx/sites-available/cargas-trabajo-ssl << EOF
# Configuración HTTP (redirigir a HTTPS)
server {
    listen 80;
    server_name ${NGINX_SERVER_NAME};
    
    # Redirigir todo el tráfico HTTP a HTTPS
    return 301 https://\$server_name\$request_uri;
}

# Configuración HTTPS
server {
    listen 443 ssl http2;
    server_name ${NGINX_SERVER_NAME};
    
    # SSL (se configurará automáticamente con Certbot)
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Logs
    access_log /var/log/nginx/cargas-trabajo-ssl-access.log;
    error_log /var/log/nginx/cargas-trabajo-ssl-error.log;
    
    # Frontend estático
    location / {
        root /var/www/cargas-trabajo/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache para archivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Headers de seguridad
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }
    
    # API Backend
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Seguridad adicional
    location ~ /\. {
        deny all;
    }
    
    location ~ /\.ht {
        deny all;
    }
}
EOF

# Habilitar el sitio SSL
ln -sf /etc/nginx/sites-available/cargas-trabajo-ssl /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/cargas-trabajo

# Verificar configuración
nginx -t
success "Configuración de Nginx para SSL creada"

# ============================================================================
# PASO 3: OBTENER CERTIFICADO SSL
# ============================================================================
log "PASO 3: Obteniendo certificado SSL con Let's Encrypt..."

# Obtener certificado
if certbot --nginx -d ${DOMAINS} --non-interactive --agree-tos --email admin@${DOMAIN} --redirect; then
    success "Certificado SSL obtenido exitosamente"
else
    error "Error al obtener el certificado SSL"
    log "Verificando que el dominio apunte a este servidor..."
    log "Asegúrate de que el DNS esté configurado correctamente"
    exit 1
fi

# ============================================================================
# PASO 4: CONFIGURAR RENOVACIÓN AUTOMÁTICA
# ============================================================================
log "PASO 4: Configurando renovación automática..."

# Crear script de renovación
cat > /etc/cron.daily/certbot-renew << EOF
#!/bin/bash
certbot renew --quiet --nginx
EOF

chmod +x /etc/cron.daily/certbot-renew
success "Renovación automática configurada"

# ============================================================================
# PASO 5: CONFIGURAR FIREWALL
# ============================================================================
log "PASO 5: Configurando firewall..."

# Permitir puertos HTTPS
ufw allow 443
ufw allow 80

# Verificar estado
ufw status
success "Firewall configurado para HTTPS"

# ============================================================================
# PASO 6: VERIFICAR CONFIGURACIÓN
# ============================================================================
log "PASO 6: Verificando configuración..."

# Recargar Nginx
systemctl reload nginx

# Verificar que esté funcionando
if systemctl is-active --quiet nginx; then
    success "✅ Nginx funcionando con SSL"
else
    error "❌ Nginx no está funcionando"
    exit 1
fi

# Verificar certificado
if certbot certificates | grep -q "${DOMAIN}"; then
    success "✅ Certificado SSL verificado"
else
    error "❌ Certificado SSL no encontrado"
    exit 1
fi

# ============================================================================
# PASO 7: CONFIGURACIÓN COMPLETADA
# ============================================================================
echo ""
echo "🎉 ================================================"
echo "✅ SSL/HTTPS CONFIGURADO EXITOSAMENTE"
echo "🎉 ================================================"
echo ""
echo "🌐 INFORMACIÓN DEL DOMINIO:"
echo "   Dominio principal: ${DOMAIN}"
echo "   Incluye www: ${INCLUDE_WWW}"
echo "   URLs configuradas: ${DOMAINS}"
echo ""
echo "🔒 CERTIFICADO SSL:"
echo "   Proveedor: Let's Encrypt"
echo "   Renovación: Automática (diaria)"
echo "   Validez: 90 días"
echo ""
echo "🌐 ACCESO:"
echo "   HTTP: http://${DOMAIN} (redirige a HTTPS)"
echo "   HTTPS: https://${DOMAIN}"
echo "   API: https://${DOMAIN}/api"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "   Ver certificados: certbot certificates"
echo "   Renovar manualmente: certbot renew --nginx"
echo "   Ver logs: tail -f /var/log/letsencrypt/letsencrypt.log"
echo "   Ver estado Nginx: systemctl status nginx"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - El certificado se renueva automáticamente"
echo "   - Verifica que tu dominio apunte a este servidor"
echo "   - Los logs están en /var/log/letsencrypt/"
echo ""
echo "================================================"

# ============================================================================
# VERIFICACIÓN FINAL
# ============================================================================
log "Realizando verificación final..."

# Verificar que HTTPS esté funcionando
if curl -s -I "https://${DOMAIN}" | grep -q "HTTP/2 200\|HTTP/1.1 200"; then
    success "✅ HTTPS funcionando correctamente"
else
    warning "⚠️  HTTPS podría no estar funcionando. Verifica la configuración."
fi

# Mostrar información del certificado
log "Información del certificado:"
certbot certificates | grep -A 10 "${DOMAIN}"

success "🎉 Configuración SSL/HTTPS completada exitosamente!" 