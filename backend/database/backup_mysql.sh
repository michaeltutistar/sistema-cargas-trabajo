#!/bin/bash

# ============================================================================
# SCRIPT DE BACKUP AUTOMÁTICO MYSQL
# Sistema de Gestión de Cargas de Trabajo
# ============================================================================

set -e  # Salir si hay algún error

echo "🗄️ BACKUP AUTOMÁTICO DE BASE DE DATOS MYSQL"
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
# CONFIGURACIÓN
# ============================================================================

# Variables de base de datos
DB_NAME="cargas_trabajo"
DB_USER="cargas_user"
DB_PASSWORD="CargasTrabajo2025!"
DB_HOST="localhost"

# Directorio de backup
BACKUP_DIR="/var/backup/cargas-trabajo"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/cargas_trabajo_${DATE}.sql"

# Crear directorio de backup si no existe
mkdir -p ${BACKUP_DIR}

# ============================================================================
# FUNCIÓN DE BACKUP
# ============================================================================

backup_database() {
    log "Iniciando backup de la base de datos..."
    
    # Crear backup con mysqldump
    mysqldump \
        --host=${DB_HOST} \
        --user=${DB_USER} \
        --password=${DB_PASSWORD} \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --add-drop-database \
        --add-drop-table \
        --databases ${DB_NAME} > ${BACKUP_FILE}
    
    if [ $? -eq 0 ]; then
        success "Backup creado exitosamente: ${BACKUP_FILE}"
        
        # Comprimir backup
        gzip ${BACKUP_FILE}
        success "Backup comprimido: ${BACKUP_FILE}.gz"
        
        # Mostrar información del backup
        BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
        log "Tamaño del backup: ${BACKUP_SIZE}"
        
        return 0
    else
        error "Error al crear el backup"
        return 1
    fi
}

# ============================================================================
# FUNCIÓN DE LIMPIEZA
# ============================================================================

cleanup_old_backups() {
    log "Limpiando backups antiguos..."
    
    # Mantener solo los últimos 10 backups
    BACKUP_COUNT=$(ls -1 ${BACKUP_DIR}/*.sql.gz 2>/dev/null | wc -l)
    
    if [ ${BACKUP_COUNT} -gt 10 ]; then
        log "Encontrados ${BACKUP_COUNT} backups, eliminando los más antiguos..."
        
        # Listar backups por fecha y eliminar los más antiguos
        ls -t ${BACKUP_DIR}/*.sql.gz | tail -n +11 | xargs rm -f
        
        success "Backups antiguos eliminados"
    else
        log "Solo ${BACKUP_COUNT} backups, no es necesario limpiar"
    fi
}

# ============================================================================
# FUNCIÓN DE VERIFICACIÓN
# ============================================================================

verify_backup() {
    log "Verificando integridad del backup..."
    
    # Verificar que el archivo existe y no está corrupto
    if [ -f "${BACKUP_FILE}.gz" ]; then
        # Verificar que se puede descomprimir
        if gunzip -t "${BACKUP_FILE}.gz" 2>/dev/null; then
            success "Backup verificado correctamente"
            return 0
        else
            error "Backup corrupto o dañado"
            return 1
        fi
    else
        error "Archivo de backup no encontrado"
        return 1
    fi
}

# ============================================================================
# FUNCIÓN DE RESTAURACIÓN
# ============================================================================

restore_database() {
    local RESTORE_FILE=$1
    
    if [ -z "${RESTORE_FILE}" ]; then
        error "Debes especificar un archivo de backup para restaurar"
        echo "Uso: $0 restore <archivo_backup>"
        exit 1
    fi
    
    if [ ! -f "${RESTORE_FILE}" ]; then
        error "Archivo de backup no encontrado: ${RESTORE_FILE}"
        exit 1
    fi
    
    log "¿Estás seguro de que quieres restaurar la base de datos?"
    log "Esto sobrescribirá todos los datos actuales!"
    read -p "Escribe 'SI' para confirmar: " confirm
    
    if [ "${confirm}" = "SI" ]; then
        log "Restaurando base de datos desde: ${RESTORE_FILE}"
        
        # Crear backup del estado actual antes de restaurar
        backup_database
        
        # Restaurar base de datos
        if [[ "${RESTORE_FILE}" == *.gz ]]; then
            gunzip -c "${RESTORE_FILE}" | mysql \
                --host=${DB_HOST} \
                --user=${DB_USER} \
                --password=${DB_PASSWORD} \
                ${DB_NAME}
        else
            mysql \
                --host=${DB_HOST} \
                --user=${DB_USER} \
                --password=${DB_PASSWORD} \
                ${DB_NAME} < "${RESTORE_FILE}"
        fi
        
        if [ $? -eq 0 ]; then
            success "Base de datos restaurada exitosamente"
        else
            error "Error al restaurar la base de datos"
            exit 1
        fi
    else
        log "Restauración cancelada"
    fi
}

# ============================================================================
# FUNCIÓN PRINCIPAL
# ============================================================================

main() {
    case "${1}" in
        "backup")
            backup_database
            cleanup_old_backups
            verify_backup
            ;;
        "restore")
            restore_database "${2}"
            ;;
        "list")
            log "Listando backups disponibles:"
            ls -lh ${BACKUP_DIR}/*.sql.gz 2>/dev/null || echo "No hay backups disponibles"
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        *)
            echo "Uso: $0 {backup|restore <archivo>|list|cleanup}"
            echo ""
            echo "Comandos disponibles:"
            echo "  backup    - Crear backup de la base de datos"
            echo "  restore   - Restaurar base de datos desde backup"
            echo "  list      - Listar backups disponibles"
            echo "  cleanup   - Limpiar backups antiguos"
            echo ""
            echo "Ejemplos:"
            echo "  $0 backup"
            echo "  $0 restore /var/backup/cargas-trabajo/cargas_trabajo_20250101_120000.sql.gz"
            echo "  $0 list"
            echo "  $0 cleanup"
            exit 1
            ;;
    esac
}

# ============================================================================
# EJECUCIÓN
# ============================================================================

# Si no hay argumentos, hacer backup por defecto
if [ $# -eq 0 ]; then
    main "backup"
else
    main "$@"
fi

# ============================================================================
# RESUMEN FINAL
# ============================================================================

if [ "${1}" = "backup" ] || [ $# -eq 0 ]; then
    echo ""
    echo "🎉 ================================================"
    echo "✅ BACKUP COMPLETADO EXITOSAMENTE"
    echo "🎉 ================================================"
    echo ""
    echo "📁 Archivo de backup: ${BACKUP_FILE}.gz"
    echo "📊 Tamaño: $(du -h "${BACKUP_FILE}.gz" | cut -f1)"
    echo "🕐 Fecha: $(date)"
    echo ""
    echo "🔧 COMANDOS ÚTILES:"
    echo "   Listar backups: $0 list"
    echo "   Limpiar antiguos: $0 cleanup"
    echo "   Restaurar: $0 restore <archivo>"
    echo ""
    echo "================================================"
fi 