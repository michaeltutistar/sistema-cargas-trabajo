#!/bin/bash
set -e
set -u
set -o pipefail || true

# Uso: ./deploy.sh [branch] [--skip-backup]
# Variables opcionales:
#   PM2_APP (por defecto: cargas-trabajo)
#   ECOSYSTEM (por defecto: ecosystem.config.js)
#   SKIP_BACKUP (si se pasa --skip-backup, no hace backup)

BRANCH="${1:-main}"
SKIP_BACKUP=false

# Verificar si se pasó --skip-backup
if [[ "${*}" == *"--skip-backup"* ]]; then
  SKIP_BACKUP=true
fi

PM2_APP="${PM2_APP:-cargas-trabajo}"
ECOSYSTEM="${ECOSYSTEM:-ecosystem.config.js}"

has_cmd() { command -v "$1" >/dev/null 2>&1; }

echo "🚀 ============================================="
echo "🚀 INICIANDO PROCESO DE DESPLIEGUE"
echo "🚀 ============================================="
echo "==> Directorio: $(pwd)"
echo "==> Branch: ${BRANCH}"
echo ""

if ! has_cmd git; then
  echo "[ERROR] git no está instalado." >&2
  exit 1
fi

# 0) BACKUP ANTES DE DESPLEGAR
if [ "${SKIP_BACKUP}" = false ]; then
  echo "💾 ============================================="
  echo "💾 CREANDO BACKUP ANTES DEL DESPLIEGUE"
  echo "💾 ============================================="
  
  # Backup de base de datos
  if [ -f "backend/database/backup_mysql.sh" ]; then
    echo "==> Creando backup de base de datos..."
    if bash backend/database/backup_mysql.sh backup; then
      echo "✅ Backup de base de datos creado exitosamente"
    else
      echo "⚠️  [ADVERTENCIA] No se pudo crear backup de base de datos, pero continuamos..."
    fi
  else
    echo "⚠️  [ADVERTENCIA] Script de backup no encontrado, saltando backup de BD..."
  fi
  
  # Backup del código actual (snapshot del estado antes del deploy)
  echo "==> Creando snapshot del código actual..."
  SNAPSHOT_DIR="/var/backup/cargas-trabajo/snapshots"
  mkdir -p "${SNAPSHOT_DIR}"
  SNAPSHOT_DATE=$(date +%Y%m%d_%H%M%S)
  SNAPSHOT_NAME="snapshot_pre_deploy_${SNAPSHOT_DATE}"
  
  if git status --porcelain | grep -q .; then
    echo "⚠️  [ADVERTENCIA] Hay cambios sin commitear, guardándolos en snapshot..."
    git stash save "snapshot_pre_deploy_${SNAPSHOT_DATE}"
  fi
  
  CURRENT_COMMIT=$(git rev-parse HEAD)
  echo "${CURRENT_COMMIT}" > "${SNAPSHOT_DIR}/${SNAPSHOT_NAME}.txt"
  echo "✅ Snapshot guardado: ${SNAPSHOT_NAME} (commit: ${CURRENT_COMMIT})"
  
  echo "💾 ============================================="
  echo ""
else
  echo "⚠️  Saltando backup (--skip-backup activado)"
  echo ""
fi

# 1) Actualizar código
echo "==> Actualizando código (branch: ${BRANCH})"
 git fetch --all
 git checkout "${BRANCH}"
 git pull --ff-only

# 2) PNPM y dependencias
if ! has_cmd pnpm; then
  echo "==> Activando corepack y preparando pnpm"
  if has_cmd corepack; then
    corepack enable || true
    corepack prepare pnpm@latest --activate || true
  else
    echo "[WARN] corepack no disponible; se usará npx pnpm si es posible"
  fi
fi

# Instalar deps (incluye devDependencies para build)
echo "==> Instalando dependencias con pnpm"
if has_cmd pnpm; then
  pnpm install --frozen-lockfile
else
  npx pnpm install --frozen-lockfile
fi

# 3) Build frontend
echo "==> Compilando TypeScript"
 npx tsc -b

echo "==> Construyendo frontend con Vite"
 npx vite build

# 4) Logs para PM2
mkdir -p logs

# 5) PM2 start/reload
if ! has_cmd pm2; then
  echo "[ERROR] pm2 no está instalado. Instálalo con: npm i -g pm2" >&2
  exit 1
fi

echo "==> Iniciando/recargando PM2 (${PM2_APP})"
if pm2 describe "${PM2_APP}" >/dev/null 2>&1; then
  pm2 reload "${PM2_APP}"
else
  # Intentar usar ecosystem.config.js si existe, sino usar comando directo
  if [ -f "${ECOSYSTEM}" ]; then
    echo "==> Usando ecosystem.config.js"
    pm2 start "${ECOSYSTEM}" --env production
  else
    echo "==> Ecosystem no encontrado, iniciando directamente"
    pm2 start servidor-produccion-clean.cjs --name "${PM2_APP}" --env production
  fi
fi

# 6) Mostrar estado
pm2 list | sed -n '1,200p'

# 7) Recargar Nginx (opcional)
if has_cmd nginx && has_cmd systemctl; then
  echo "==> Probando configuración de Nginx"
  if sudo nginx -t; then
    echo "==> Recargando Nginx"
    sudo systemctl reload nginx || true
  else
    echo "[WARN] nginx -t falló; no se recarga Nginx"
  fi
else
  echo "[INFO] Nginx/systemctl no disponible. Saltando recarga de Nginx"
fi

echo ""
echo "✅ ============================================="
echo "✅ DESPLIEGUE COMPLETADO CON ÉXITO"
echo "✅ ============================================="
echo ""
if [ "${SKIP_BACKUP}" = false ]; then
  echo "💾 BACKUPS CREADOS:"
  echo "   - Base de datos: /var/backup/cargas-trabajo/"
  echo "   - Snapshot código: /var/backup/cargas-trabajo/snapshots/"
  echo ""
  echo "🔧 COMANDOS ÚTILES:"
  echo "   Ver backups BD: backend/database/backup_mysql.sh list"
  echo "   Restaurar BD: backend/database/backup_mysql.sh restore <archivo>"
  echo "   Ver último commit antes del deploy: cat /var/backup/cargas-trabajo/snapshots/snapshot_pre_deploy_*.txt"
  echo ""
fi
echo "📊 Estado de la aplicación:"
pm2 list | grep "${PM2_APP}" || echo "   (usar 'pm2 list' para ver detalles)"
echo ""
echo "📝 Logs recientes:"
pm2 logs "${PM2_APP}" --lines 10 --nostream || echo "   (usar 'pm2 logs ${PM2_APP}' para ver logs completos)"
echo ""
echo "✅ =============================================" 