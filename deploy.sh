#!/bin/bash

# ============================================================================
# SCRIPT DE DEPLOY AUTOMÁTICO
# Sistema de Gestión de Cargas de Trabajo
# ============================================================================

set -e  # Salir si hay algún error

echo "🚀 Iniciando deploy automático..."
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

# Verificar que estamos en el directorio correcto
if [ ! -f "servidor-produccion.js" ]; then
    error "No se encontró servidor-produccion.js. Ejecuta desde el directorio raíz del proyecto."
    exit 1
fi

log "Verificando estado actual..."

# Backup de la base de datos
if [ -f "cargas_trabajo.db" ]; then
    log "Creando backup de la base de datos..."
    cp cargas_trabajo.db "backup/cargas_trabajo_$(date +%Y%m%d_%H%M%S).db"
    success "Backup creado exitosamente"
fi

# Obtener últimos cambios del repositorio (si es git)
if [ -d ".git" ]; then
    log "Obteniendo últimos cambios del repositorio..."
    git pull origin main
    success "Cambios obtenidos del repositorio"
fi

# Instalar dependencias del frontend
log "Instalando dependencias del frontend..."
if command -v pnpm &> /dev/null; then
    pnpm install
else
    npm install
fi
success "Dependencias del frontend instaladas"

# Construir el frontend
log "Construyendo frontend..."
if command -v pnpm &> /dev/null; then
    pnpm run build
else
    npm run build
fi
success "Frontend construido exitosamente"

# Instalar dependencias del backend
log "Instalando dependencias del backend..."
cd backend
npm install
cd ..
success "Dependencias del backend instaladas"

# Crear directorio de logs si no existe
mkdir -p logs

# Reiniciar la aplicación con PM2
log "Reiniciando aplicación con PM2..."
if command -v pm2 &> /dev/null; then
    pm2 restart ecosystem.config.js --env production
    success "Aplicación reiniciada con PM2"
    
    # Verificar estado
    log "Verificando estado de la aplicación..."
    pm2 status cargas-trabajo
    
    # Guardar configuración PM2
    pm2 save
    success "Configuración PM2 guardada"
else
    warning "PM2 no está instalado. Reiniciando manualmente..."
    # Matar proceso existente si está corriendo
    pkill -f "servidor-produccion.js" || true
    
    # Iniciar nuevo proceso
    nohup node servidor-produccion.js > logs/app.log 2>&1 &
    success "Aplicación iniciada manualmente"
fi

# Verificar que la aplicación esté funcionando
log "Verificando que la aplicación esté funcionando..."
sleep 5

if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    success "✅ Aplicación funcionando correctamente en puerto 8080"
else
    warning "⚠️  La aplicación podría no estar funcionando. Verifica los logs."
fi

# Limpiar archivos temporales
log "Limpiando archivos temporales..."
rm -rf node_modules/.vite-temp 2>/dev/null || true

# Mostrar información final
echo ""
echo "🎉 ================================================"
echo "✅ DEPLOY COMPLETADO EXITOSAMENTE"
echo "🎉 ================================================"
echo ""
echo "📊 Estado de la aplicación:"
if command -v pm2 &> /dev/null; then
    pm2 status cargas-trabajo
else
    echo "   Proceso manual en ejecución"
fi

echo ""
echo "🌐 URLs de acceso:"
echo "   Frontend: http://localhost:8080"
echo "   API: http://localhost:8080/api"
echo "   Health Check: http://localhost:8080/api/health"
echo ""
echo "📁 Logs disponibles en: ./logs/"
echo "🔧 Para monitorear: pm2 monit cargas-trabajo"
echo "🔄 Para reiniciar: pm2 restart cargas-trabajo"
echo ""
echo "================================================" 