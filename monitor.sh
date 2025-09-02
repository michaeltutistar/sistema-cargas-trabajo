#!/bin/bash

# ============================================================================
# SCRIPT DE MONITOREO Y ALERTAS
# Sistema de Gestión de Cargas de Trabajo
# ============================================================================

set -e  # Salir si hay algún error

echo "📊 MONITOREO DEL SISTEMA"
echo "========================"

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
# CONFIGURACIÓN
# ============================================================================

# Umbrales de alerta
CPU_THRESHOLD=80
MEMORY_THRESHOLD=80
DISK_THRESHOLD=85
PROCESS_COUNT_THRESHOLD=100

# Archivo de log
LOG_FILE="/var/log/cargas-trabajo/monitor.log"
mkdir -p /var/log/cargas-trabajo

# ============================================================================
# FUNCIÓN DE MONITOREO DEL SISTEMA
# ============================================================================

monitor_system() {
    log "🔍 Monitoreando sistema..."
    
    # CPU
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    CPU_USAGE_INT=${CPU_USAGE%.*}
    
    if [ ${CPU_USAGE_INT} -gt ${CPU_THRESHOLD} ]; then
        warning "⚠️  CPU alto: ${CPU_USAGE}%"
        echo "$(date): CPU alto: ${CPU_USAGE}%" >> ${LOG_FILE}
    else
        success "✅ CPU: ${CPU_USAGE}%"
    fi
    
    # Memoria
    MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    MEMORY_USAGE_INT=${MEMORY_USAGE%.*}
    
    if [ ${MEMORY_USAGE_INT} -gt ${MEMORY_THRESHOLD} ]; then
        warning "⚠️  Memoria alta: ${MEMORY_USAGE}%"
        echo "$(date): Memoria alta: ${MEMORY_USAGE}%" >> ${LOG_FILE}
    else
        success "✅ Memoria: ${MEMORY_USAGE}%"
    fi
    
    # Disco
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    
    if [ ${DISK_USAGE} -gt ${DISK_THRESHOLD} ]; then
        warning "⚠️  Disco alto: ${DISK_USAGE}%"
        echo "$(date): Disco alto: ${DISK_USAGE}%" >> ${LOG_FILE}
    else
        success "✅ Disco: ${DISK_USAGE}%"
    fi
    
    # Procesos
    PROCESS_COUNT=$(ps aux | wc -l)
    
    if [ ${PROCESS_COUNT} -gt ${PROCESS_COUNT_THRESHOLD} ]; then
        warning "⚠️  Muchos procesos: ${PROCESS_COUNT}"
        echo "$(date): Muchos procesos: ${PROCESS_COUNT}" >> ${LOG_FILE}
    else
        success "✅ Procesos: ${PROCESS_COUNT}"
    fi
}

# ============================================================================
# FUNCIÓN DE MONITOREO DE LA APLICACIÓN
# ============================================================================

monitor_application() {
    log "🔍 Monitoreando aplicación..."
    
    # Verificar si PM2 está funcionando
    if command -v pm2 &> /dev/null; then
        PM2_STATUS=$(pm2 status cargas-trabajo --no-daemon | grep "online" | wc -l)
        
        if [ ${PM2_STATUS} -gt 0 ]; then
            success "✅ PM2: Aplicación funcionando"
        else
            error "❌ PM2: Aplicación no está funcionando"
            echo "$(date): PM2: Aplicación no está funcionando" >> ${LOG_FILE}
        fi
        
        # Verificar puerto 8080
        if netstat -tlnp | grep :8080 > /dev/null; then
            success "✅ Puerto 8080: Activo"
        else
            error "❌ Puerto 8080: No activo"
            echo "$(date): Puerto 8080: No activo" >> ${LOG_FILE}
        fi
        
        # Verificar Nginx
        if systemctl is-active --quiet nginx; then
            success "✅ Nginx: Activo"
        else
            error "❌ Nginx: No activo"
            echo "$(date): Nginx: No activo" >> ${LOG_FILE}
        fi
        
        # Verificar MySQL
        if systemctl is-active --quiet mysql; then
            success "✅ MySQL: Activo"
        else
            error "❌ MySQL: No activo"
            echo "$(date): MySQL: No activo" >> ${LOG_FILE}
        fi
    else
        warning "⚠️  PM2 no está instalado"
    fi
}

# ============================================================================
# FUNCIÓN DE MONITOREO DE BASE DE DATOS
# ============================================================================

monitor_database() {
    log "🔍 Monitoreando base de datos..."
    
    # Verificar conexión a MySQL
    if mysql -u cargas_user -p'CargasTrabajo2025!' -e "SELECT 1;" > /dev/null 2>&1; then
        success "✅ MySQL: Conexión exitosa"
        
        # Contar registros en tablas principales
        USER_COUNT=$(mysql -u cargas_user -p'CargasTrabajo2025!' -e "SELECT COUNT(*) FROM usuarios;" cargas_trabajo 2>/dev/null | tail -1)
        DEPENDENCIAS_COUNT=$(mysql -u cargas_user -p'CargasTrabajo2025!' -e "SELECT COUNT(*) FROM dependencias;" cargas_trabajo 2>/dev/null | tail -1)
        PROCEDIMIENTOS_COUNT=$(mysql -u cargas_user -p'CargasTrabajo2025!' -e "SELECT COUNT(*) FROM procedimientos;" cargas_trabajo 2>/dev/null | tail -1)
        
        log "📊 Usuarios: ${USER_COUNT}"
        log "📊 Dependencias: ${DEPENDENCIAS_COUNT}"
        log "📊 Procedimientos: ${PROCEDIMIENTOS_COUNT}"
        
    else
        error "❌ MySQL: Error de conexión"
        echo "$(date): MySQL: Error de conexión" >> ${LOG_FILE}
    fi
}

# ============================================================================
# FUNCIÓN DE MONITOREO DE LOGS
# ============================================================================

monitor_logs() {
    log "🔍 Monitoreando logs..."
    
    # Verificar logs de la aplicación
    if [ -f "/var/log/cargas-trabajo/cargas-trabajo-error.log" ]; then
        ERROR_COUNT=$(tail -100 /var/log/cargas-trabajo/cargas-trabajo-error.log | grep -c "ERROR\|Error\|error" || echo "0")
        
        if [ ${ERROR_COUNT} -gt 10 ]; then
            warning "⚠️  Muchos errores en logs: ${ERROR_COUNT}"
            echo "$(date): Muchos errores en logs: ${ERROR_COUNT}" >> ${LOG_FILE}
        else
            success "✅ Logs de error: ${ERROR_COUNT} errores recientes"
        fi
    else
        warning "⚠️  Archivo de logs no encontrado"
    fi
    
    # Verificar logs de Nginx
    if [ -f "/var/log/nginx/cargas-trabajo-error.log" ]; then
        NGINX_ERROR_COUNT=$(tail -100 /var/log/nginx/cargas-trabajo-error.log | grep -c "error\|Error\|ERROR" || echo "0")
        
        if [ ${NGINX_ERROR_COUNT} -gt 5 ]; then
            warning "⚠️  Errores en Nginx: ${NGINX_ERROR_COUNT}"
            echo "$(date): Errores en Nginx: ${NGINX_ERROR_COUNT}" >> ${LOG_FILE}
        else
            success "✅ Logs de Nginx: ${NGINX_ERROR_COUNT} errores recientes"
        fi
    fi
}

# ============================================================================
# FUNCIÓN DE MONITOREO DE RED
# ============================================================================

monitor_network() {
    log "🔍 Monitoreando red..."
    
    # Verificar conectividad a internet
    if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        success "✅ Internet: Conectado"
    else
        error "❌ Internet: Sin conexión"
        echo "$(date): Internet: Sin conexión" >> ${LOG_FILE}
    fi
    
    # Verificar puertos abiertos
    OPEN_PORTS=$(netstat -tlnp | grep LISTEN | wc -l)
    log "📊 Puertos abiertos: ${OPEN_PORTS}"
    
    # Verificar conexiones activas
    ACTIVE_CONNECTIONS=$(netstat -an | grep ESTABLISHED | wc -l)
    log "📊 Conexiones activas: ${ACTIVE_CONNECTIONS}"
}

# ============================================================================
# FUNCIÓN DE MONITOREO DE SEGURIDAD
# ============================================================================

monitor_security() {
    log "🔍 Monitoreando seguridad..."
    
    # Verificar intentos de login SSH
    SSH_FAILED=$(grep "Failed password" /var/log/auth.log | tail -100 | wc -l)
    
    if [ ${SSH_FAILED} -gt 10 ]; then
        warning "⚠️  Muchos intentos fallidos de SSH: ${SSH_FAILED}"
        echo "$(date): Muchos intentos fallidos de SSH: ${SSH_FAILED}" >> ${LOG_FILE}
    else
        success "✅ SSH: ${SSH_FAILED} intentos fallidos recientes"
    fi
    
    # Verificar firewall
    if ufw status | grep -q "Status: active"; then
        success "✅ Firewall: Activo"
    else
        warning "⚠️  Firewall: No activo"
        echo "$(date): Firewall: No activo" >> ${LOG_FILE}
    fi
}

# ============================================================================
# FUNCIÓN DE GENERACIÓN DE REPORTE
# ============================================================================

generate_report() {
    log "📋 Generando reporte de monitoreo..."
    
    REPORT_FILE="/var/log/cargas-trabajo/monitor_report_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > ${REPORT_FILE} << EOF
================================================================
REPORTE DE MONITOREO - Sistema de Cargas de Trabajo
Fecha: $(date)
================================================================

SISTEMA:
- CPU: ${CPU_USAGE}%
- Memoria: ${MEMORY_USAGE}%
- Disco: ${DISK_USAGE}%
- Procesos: ${PROCESS_COUNT}

APLICACIÓN:
- PM2: $(if command -v pm2 &> /dev/null; then echo "Instalado"; else echo "No instalado"; fi)
- Puerto 8080: $(if netstat -tlnp | grep :8080 > /dev/null; then echo "Activo"; else echo "No activo"; fi)
- Nginx: $(if systemctl is-active --quiet nginx; then echo "Activo"; else echo "No activo"; fi)
- MySQL: $(if systemctl is-active --quiet mysql; then echo "Activo"; else echo "No activo"; fi)

BASE DE DATOS:
- Conexión: $(if mysql -u cargas_user -p'CargasTrabajo2025!' -e "SELECT 1;" > /dev/null 2>&1; then echo "OK"; else echo "Error"; fi)

SEGURIDAD:
- Firewall: $(if ufw status | grep -q "Status: active"; then echo "Activo"; else echo "No activo"; fi)
- Intentos SSH fallidos: ${SSH_FAILED}

================================================================
EOF
    
    success "📋 Reporte generado: ${REPORT_FILE}"
}

# ============================================================================
# FUNCIÓN PRINCIPAL
# ============================================================================

main() {
    case "${1}" in
        "system")
            monitor_system
            ;;
        "app")
            monitor_application
            ;;
        "db")
            monitor_database
            ;;
        "logs")
            monitor_logs
            ;;
        "network")
            monitor_network
            ;;
        "security")
            monitor_security
            ;;
        "full")
            monitor_system
            monitor_application
            monitor_database
            monitor_logs
            monitor_network
            monitor_security
            generate_report
            ;;
        *)
            echo "Uso: $0 {system|app|db|logs|network|security|full}"
            echo ""
            echo "Comandos disponibles:"
            echo "  system   - Monitorear sistema (CPU, memoria, disco)"
            echo "  app      - Monitorear aplicación (PM2, puertos, servicios)"
            echo "  db       - Monitorear base de datos"
            echo "  logs     - Monitorear logs de errores"
            echo "  network  - Monitorear red y conectividad"
            echo "  security - Monitorear seguridad (SSH, firewall)"
            echo "  full     - Monitoreo completo + reporte"
            echo ""
            echo "Ejemplos:"
            echo "  $0 full          # Monitoreo completo"
            echo "  $0 system        # Solo sistema"
            echo "  $0 app           # Solo aplicación"
            exit 1
            ;;
    esac
}

# ============================================================================
# EJECUCIÓN
# ============================================================================

# Si no hay argumentos, hacer monitoreo completo
if [ $# -eq 0 ]; then
    main "full"
else
    main "$@"
fi

# ============================================================================
# RESUMEN FINAL
# ============================================================================

if [ "${1}" = "full" ] || [ $# -eq 0 ]; then
    echo ""
    echo "🎉 ================================================"
    echo "✅ MONITOREO COMPLETADO"
    echo "🎉 ================================================"
    echo ""
    echo "📊 RESUMEN:"
    echo "   Sistema: Monitoreado"
    echo "   Aplicación: Verificada"
    echo "   Base de datos: Verificada"
    echo "   Logs: Analizados"
    echo "   Red: Verificada"
    echo "   Seguridad: Verificada"
    echo ""
    echo "📁 Logs disponibles en: /var/log/cargas-trabajo/"
    echo "📋 Reporte generado: /var/log/cargas-trabajo/"
    echo ""
    echo "🔧 COMANDOS ÚTILES:"
    echo "   Monitoreo completo: $0 full"
    echo "   Solo sistema: $0 system"
    echo "   Solo aplicación: $0 app"
    echo "   Solo base de datos: $0 db"
    echo ""
    echo "================================================"
fi 