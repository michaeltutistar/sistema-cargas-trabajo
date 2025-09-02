# 🚀 GUÍA COMPLETA DE DEPLOY - Sistema de Gestión de Cargas de Trabajo

## 📋 **INFORMACIÓN DEL PROYECTO**

- **Nombre**: Sistema de Gestión de Cargas de Trabajo
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Base de datos**: MySQL (producción) / SQLite (desarrollo)
- **Servidor**: Ubuntu 24.04 LTS (VPS KVM 2 Hostinger)
- **Puerto principal**: 8080
- **Proxy reverso**: Nginx
- **Gestor de procesos**: PM2
- **SSL/HTTPS**: Let's Encrypt (opcional)

---

## 🎯 **REQUISITOS PREVIOS**

### **VPS Configurado:**
- ✅ Ubuntu 24.04 LTS
- ✅ Acceso SSH root
- ✅ IP pública configurada
- ✅ Dominio apuntando al VPS (opcional, para SSL)

### **Local:**
- ✅ Git configurado
- ✅ Base de datos exportada desde phpMyAdmin
- ✅ Archivo `cargas_trabajo_produccion.sql` en `backend/database/`

---

## 🚀 **PASO 1: PREPARACIÓN LOCAL**

### **1.1 Limpiar proyecto (ya completado)**
```bash
# Los archivos ya están limpios y configurados
# - .gitignore creado
# - Archivos de configuración creados
# - Scripts de deploy creados
```

### **1.2 Verificar archivos de configuración**
```bash
# Verificar que existan estos archivos:
ls -la
# - setup.sh
# - deploy.sh
# - monitor.sh
# - setup_ssl.sh
# - env.production
# - ecosystem.config.js
# - backend/database/setup_database.sh
# - backend/database/backup_mysql.sh
# - backend/database/cargas_trabajo_produccion.sql
```

### **1.3 Commit y push de cambios**
```bash
git add .
git commit -m "🚀 Configuración completa para deploy en VPS"
git push origin main
```

---

## 🌐 **PASO 2: CONEXIÓN AL VPS**

### **2.1 Conectar por SSH**
```bash
# Conectar como root
ssh root@TU_IP_VPS

# O si tienes usuario específico
ssh usuario@TU_IP_VPS
sudo su -
```

### **2.2 Verificar sistema**
```bash
# Verificar versión de Ubuntu
lsb_release -a

# Verificar espacio en disco
df -h

# Verificar memoria RAM
free -h

# Verificar CPU
nproc
```

---

## ⚙️ **PASO 3: INSTALACIÓN INICIAL DEL SISTEMA**

### **3.1 Clonar proyecto**
```bash
# Ir al directorio de aplicaciones
cd /var/www

# Clonar el proyecto
git clone https://github.com/TU_USUARIO/sistema-cargas-trabajo.git
cd sistema-cargas-trabajo

# Dar permisos
chmod +x *.sh
chmod +x backend/database/*.sh
```

### **3.2 Ejecutar instalación inicial**
```bash
# Ejecutar script de instalación
./setup.sh
```

**Este script instalará:**
- ✅ Node.js 20.x
- ✅ pnpm (gestor de paquetes)
- ✅ MySQL Server
- ✅ Nginx
- ✅ PM2
- ✅ UFW (firewall)
- ✅ Docker (opcional)
- ✅ Directorios necesarios

---

## 🗄️ **PASO 4: CONFIGURACIÓN DE BASE DE DATOS**

### **4.1 Configurar MySQL**
```bash
# Ir al directorio de base de datos
cd backend/database

# Ejecutar script de configuración
./setup_database.sh
```

**Este script:**
- ✅ Instala MySQL Server
- ✅ Crea base de datos `cargas_trabajo`
- ✅ Crea usuario `cargas_user`
- ✅ Importa datos desde `cargas_trabajo_produccion.sql`
- ✅ Configura permisos y seguridad

### **4.2 Verificar base de datos**
```bash
# Conectar a MySQL
mysql -u cargas_user -p'CargasTrabajo2025!' cargas_trabajo

# Verificar tablas
SHOW TABLES;

# Verificar datos
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM dependencias;
SELECT COUNT(*) FROM procedimientos;

# Salir
EXIT;
```

---

## 🚀 **PASO 5: DESPLIEGUE DE LA APLICACIÓN**

### **5.1 Configurar variables de entorno**
```bash
# Copiar archivo de producción
cp env.production .env

# Verificar configuración
cat .env
```

### **5.2 Instalar dependencias y construir**
```bash
# Instalar dependencias frontend
pnpm install

# Construir frontend
pnpm run build

# Instalar dependencias backend
cd backend
npm install
cd ..
```

### **5.3 Desplegar con PM2**
```bash
# Iniciar aplicación
pm2 start ecosystem.config.js

# Verificar estado
pm2 status
pm2 logs cargas-trabajo

# Configurar inicio automático
pm2 startup
pm2 save
```

---

## 🌐 **PASO 6: CONFIGURACIÓN DE NGINX**

### **6.1 Verificar configuración**
```bash
# Verificar sintaxis
nginx -t

# Recargar configuración
systemctl reload nginx

# Verificar estado
systemctl status nginx
```

### **6.2 Verificar firewall**
```bash
# Verificar estado
ufw status

# Puertos abiertos:
# - 22 (SSH)
# - 80 (HTTP)
# - 443 (HTTPS, si configuras SSL)
# - 8080 (aplicación, solo local)
```

---

## 🔒 **PASO 7: CONFIGURACIÓN SSL/HTTPS (OPCIONAL)**

### **7.1 Configurar dominio**
```bash
# Asegúrate de que tu dominio apunte a la IP del VPS
# Ejemplo: micarga.com -> A -> TU_IP_VPS

# Ejecutar script SSL
./setup_ssl.sh
```

**Este script:**
- ✅ Instala Certbot
- ✅ Configura Nginx para SSL
- ✅ Obtiene certificado Let's Encrypt
- ✅ Configura renovación automática
- ✅ Configura redirección HTTP → HTTPS

---

## 📊 **PASO 8: VERIFICACIÓN Y MONITOREO**

### **8.1 Verificar funcionamiento**
```bash
# Verificar aplicación
curl http://localhost:8080

# Verificar Nginx
curl http://localhost

# Si configuraste SSL
curl https://TU_DOMINIO
```

### **8.2 Ejecutar monitoreo**
```bash
# Monitoreo completo
./monitor.sh full

# Monitoreo específico
./monitor.sh system    # CPU, memoria, disco
./monitor.sh app       # Aplicación, servicios
./monitor.sh db        # Base de datos
./monitor.sh security  # Seguridad, firewall
```

---

## 🔄 **PASO 9: MANTENIMIENTO Y ACTUALIZACIONES**

### **9.1 Deploy automático**
```bash
# Para futuras actualizaciones
./deploy.sh
```

### **9.2 Backup de base de datos**
```bash
# Backup manual
cd backend/database
./backup_mysql.sh backup

# Listar backups
./backup_mysql.sh list

# Restaurar backup
./backup_mysql.sh restore /var/backup/cargas-trabajo/archivo.sql.gz
```

### **9.3 Logs y monitoreo**
```bash
# Ver logs de la aplicación
pm2 logs cargas-trabajo

# Ver logs de Nginx
tail -f /var/log/nginx/cargas-trabajo-access.log
tail -f /var/log/nginx/cargas-trabajo-error.log

# Ver logs de MySQL
tail -f /var/log/mysql/error.log
```

---

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **Problema: Aplicación no inicia**
```bash
# Verificar logs
pm2 logs cargas-trabajo

# Verificar puerto
netstat -tlnp | grep :8080

# Reiniciar aplicación
pm2 restart cargas-trabajo
```

### **Problema: Base de datos no conecta**
```bash
# Verificar MySQL
systemctl status mysql

# Verificar conexión
mysql -u cargas_user -p'CargasTrabajo2025!' cargas_trabajo

# Verificar logs
tail -f /var/log/mysql/error.log
```

### **Problema: Nginx no funciona**
```bash
# Verificar sintaxis
nginx -t

# Verificar estado
systemctl status nginx

# Ver logs
tail -f /var/log/nginx/error.log
```

---

## 📱 **ACCESO A LA APLICACIÓN**

### **Sin dominio (solo IP):**
- **Frontend**: `http://TU_IP_VPS`
- **API**: `http://TU_IP_VPS/api`

### **Con dominio y SSL:**
- **Frontend**: `https://TU_DOMINIO`
- **API**: `https://TU_DOMINIO/api`

### **Credenciales de acceso:**
- **Email**: `admin@admin.com`
- **Contraseña**: `MDAsociety369`

---

## 🔧 **COMANDOS ÚTILES DIARIOS**

```bash
# Ver estado general
./monitor.sh full

# Ver logs en tiempo real
pm2 logs cargas-trabajo --lines 100

# Backup diario
cd backend/database && ./backup_mysql.sh

# Ver uso del sistema
htop
df -h
free -h

# Ver servicios
systemctl status nginx mysql pm2-root
```

---

## 📞 **SOPORTE Y MANTENIMIENTO**

### **Archivos importantes:**
- **Logs**: `/var/log/cargas-trabajo/`
- **Backups**: `/var/backup/cargas-trabajo/`
- **Configuración**: `/etc/nginx/sites-available/`
- **Aplicación**: `/var/www/cargas-trabajo/`

### **Scripts disponibles:**
- **`setup.sh`**: Instalación inicial
- **`deploy.sh`**: Deploy automático
- **`monitor.sh`**: Monitoreo del sistema
- **`setup_ssl.sh`**: Configuración SSL
- **`setup_database.sh`**: Configuración MySQL
- **`backup_mysql.sh`**: Backup de base de datos

---

## 🎉 **¡DEPLOY COMPLETADO!**

Tu Sistema de Gestión de Cargas de Trabajo está ahora funcionando en producción en tu VPS de Hostinger.

**Próximos pasos recomendados:**
1. 🔒 Configurar SSL/HTTPS con tu dominio
2. 📊 Configurar monitoreo automático
3. 💾 Configurar backup automático diario
4. 🔄 Configurar deploy automático con webhooks

**¿Necesitas ayuda con algún paso específico?** 