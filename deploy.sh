#!/usr/bin/env bash
set -euo pipefail

# Uso: ./deploy.sh [branch]
# Variables opcionales:
#   PM2_APP (por defecto: cargas-trabajo)
#   ECOSYSTEM (por defecto: ecosystem.config.js)

BRANCH="${1:-main}"
PM2_APP="${PM2_APP:-cargas-trabajo}"
ECOSYSTEM="${ECOSYSTEM:-ecosystem.config.js}"

has_cmd() { command -v "$1" >/dev/null 2>&1; }

echo "==> Directorio: $(pwd)"

if ! has_cmd git; then
  echo "[ERROR] git no está instalado." >&2
  exit 1
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
  pm2 start "${ECOSYSTEM}" --env production
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

echo "✅ Despliegue completado con éxito" 