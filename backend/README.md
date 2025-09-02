# Sistema de Gestión de Cargas de Trabajo - Backend

Backend completo para el Sistema de Gestión de Cargas de Trabajo desarrollado con Express.js, TypeScript y SQLite.

## 🚀 Características Principales

- **Autenticación JWT**: Sistema completo de autenticación con roles (admin, usuario, consulta)
- **Cálculos PERT Automáticos**: Implementación de la fórmula PERT para cálculo de tiempos esperados
- **Gestión Jerárquica**: Manejo completo de dependencias, procesos, actividades y procedimientos
- **Niveles Jerárquicos**: Soporte para 5 niveles (Directivo, Asesor, Profesional, Técnico, Asistencial)
- **Reportes y Estadísticas**: Generación automática de reportes de cargas de trabajo
- **Simulación de Escenarios**: Capacidad de simular diferentes escenarios de carga
- **API RESTful**: API completa con validación de datos y manejo de errores
- **Base de Datos SQLite**: Base de datos embebida para desarrollo y producción ligera

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/          # Controladores de la API
│   ├── database/            # Configuración y esquemas de BD
│   ├── middleware/          # Middlewares personalizados
│   ├── models/              # Modelos de datos
│   ├── routes/              # Definición de rutas
│   ├── services/            # Lógica de negocio
│   ├── types/               # Tipos de TypeScript
│   ├── utils/               # Utilidades y helpers
│   ├── validators/          # Esquemas de validación
│   └── index.ts             # Punto de entrada
├── package.json
├── tsconfig.json
├── .env
└── README.md
```

## 🛠️ Tecnologías Utilizadas

- **Node.js + TypeScript**: Runtime y lenguaje principal
- **Express.js**: Framework web
- **SQLite**: Base de datos embebida
- **JWT**: Autenticación y autorización
- **Joi**: Validación de esquemas
- **Bcrypt**: Encriptación de contraseñas
- **Helmet**: Seguridad HTTP
- **CORS**: Manejo de CORS

## 📊 Modelo de Datos

### Entidades Principales

1. **Usuarios**: Sistema de autenticación con roles
2. **Dependencias**: Oficinas o direcciones de la organización
3. **Procesos**: Procesos por dependencia
4. **Actividades**: Actividades dentro de cada proceso
5. **Procedimientos**: Procedimientos específicos con nivel jerárquico
6. **Empleos**: Empleos por nivel jerárquico
7. **Tiempos de Procedimientos**: Tiempos con cálculos PERT

### Fórmula PERT

```
Tiempo Esperado = ((Tmin + 4*Tprom + Tmax) / 6) * 1.07
Carga Total = Frecuencia Mensual * Tiempo Esperado
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
cd sistema-cargas-trabajo/backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar variables de entorno
nano .env
```

### Variables de Entorno

```env
# Configuración del servidor
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=sistema_cargas_trabajo_secret_key_2024
JWT_EXPIRES_IN=24h

# Base de datos
DB_PATH=./database/cargas_trabajo.db

# CORS
FRONTEND_URL=http://localhost:5173

# Factor PERT
PERT_FACTOR=1.07
```

### Inicialización

```bash
# Compilar TypeScript
npm run build

# Poblar base de datos con datos iniciales
npm run seed

# Iniciar servidor de desarrollo
npm run dev

# Iniciar servidor de producción
npm start
```

## 📡 API Endpoints

### Autenticación (`/api/auth`)

- `POST /login` - Iniciar sesión
- `POST /register` - Registrar usuario (admin)
- `GET /profile` - Obtener perfil
- `PUT /profile` - Actualizar perfil
- `POST /change-password` - Cambiar contraseña
- `GET /verify-token` - Verificar token
- `POST /logout` - Cerrar sesión

### Cargas de Trabajo (`/api/cargas`)

- `GET /stats` - Estadísticas generales
- `GET /dependencia/:id/reporte` - Reporte por dependencia
- `GET /resumen-empleos` - Resumen de empleos necesarios
- `GET /consolidadas` - Cargas consolidadas
- `GET /eficiencia-niveles` - Análisis de eficiencia
- `GET /brechas` - Reporte de brechas
- `POST /simular` - Simular escenarios
- `GET /tiempos` - Buscar tiempos
- `POST /tiempos` - Crear tiempo
- `PUT /tiempos/:id` - Actualizar tiempo
- `DELETE /tiempos/:id` - Eliminar tiempo

### Dependencias (`/api/dependencias`)

- `GET /` - Listar dependencias
- `POST /` - Crear dependencia
- `GET /:id` - Obtener dependencia
- `PUT /:id` - Actualizar dependencia
- `DELETE /:id` - Eliminar dependencia
- `GET /:id/procesos` - Dependencia con procesos
- `GET /stats` - Estadísticas
- `GET /exportar` - Exportar datos

## 👥 Roles y Permisos

### Admin
- Acceso completo al sistema
- Gestión de usuarios
- Configuración del sistema

### Usuario
- Crear y modificar datos
- Generar reportes
- Acceso a estadísticas

### Consulta
- Solo lectura
- Visualización de reportes
- Acceso a estadísticas básicas

## 🧪 Testing

```bash
# Ejecutar pruebas
npm test

# Ejecutar pruebas con cobertura
npm run test:coverage

# Ejecutar pruebas en modo watch
npm run test:watch
```

## 📈 Características Avanzadas

### Cálculos Automáticos
- Cálculo automático de tiempos PERT
- Validación de consistencia de tiempos (Tmin ≤ Tprom ≤ Tmax)
- Recálculo masivo de cargas de trabajo

### Reportes
- Reporte por dependencia con estructura jerárquica
- Resumen de empleos necesarios por nivel
- Análisis de eficiencia por nivel jerárquico
- Reporte de brechas (procedimientos sin tiempos)

### Simulación
- Simulación de escenarios con diferentes parámetros
- Análisis de impacto de cambios en frecuencias
- Proyección de necesidades de personal

### Importación/Exportación
- Importación masiva de datos desde CSV/Excel
- Exportación de reportes en JSON/CSV
- Migración de datos desde sistemas legacy

## 🔒 Seguridad

- Autenticación JWT con expiración configurable
- Encriptación de contraseñas con bcrypt
- Validación de entrada con Joi
- Sanitización de datos
- Rate limiting
- Headers de seguridad con Helmet

## 📋 Scripts Disponibles

```json
{
  "dev": "nodemon --exec ts-node src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "test": "jest",
  "seed": "ts-node src/database/seed.ts"
}
```

## 🚀 Despliegue

### Desarrollo Local
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

### Docker (Opcional)
```bash
# Construir imagen
docker build -t cargas-trabajo-backend .

# Ejecutar contenedor
docker run -p 3001:3001 cargas-trabajo-backend
```

## 📊 Monitoreo y Logs

El sistema incluye logging automático de:
- Requests HTTP con timestamp, método, URL, IP y User-Agent
- Errores detallados con stack trace
- Operaciones de base de datos
- Autenticación y autorización

## 🔧 Configuración Avanzada

### Base de Datos
- Configuración automática de esquemas
- Migraciones automáticas
- Índices optimizados para consultas frecuentes
- Backup y restore automático

### Performance
- Rate limiting configurable
- Timeout de requests
- Compresión de respuestas
- Cache de consultas frecuentes

## 📞 Soporte

Para soporte técnico o reportar bugs:
- Crear issue en el repositorio
- Contactar al equipo de desarrollo
- Revisar la documentación de la API en `/api/info`

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 🎯 Datos de Prueba

### Usuario Administrador por Defecto
- **Email**: admin@cargas-trabajo.gov.co
- **Contraseña**: Admin123!

### Usuarios de Ejemplo
- **Analista**: analista@cargas-trabajo.gov.co / Usuario123!
- **Consultor**: consultor@cargas-trabajo.gov.co / Consulta123!

### Datos de Ejemplo
El sistema incluye datos de ejemplo que representan:
- 1 Dependencia (Dirección General)
- 3 Procesos (Estratégico, Misional, Apoyo)
- 6 Actividades distribuidas por proceso
- 6 Procedimientos con diferentes niveles jerárquicos
- 11 Empleos distribuidos por nivel
- Tiempos de ejemplo con cálculos PERT

## 🔄 Versionado

- **v1.0.0**: Versión inicial con funcionalidades básicas
- Usar semantic versioning para futuras versiones
- Mantener backward compatibility en APIs

## 🛣️ Roadmap

### Próximas Características
- [ ] Notificaciones en tiempo real
- [ ] Dashboard avanzado con gráficos
- [ ] Integración con sistemas de RH
- [ ] API para dispositivos móviles
- [ ] Análisis predictivo con ML
- [ ] Exportación a formatos adicionales (PDF, Excel)
- [ ] Auditoría completa de cambios
- [ ] Workflow de aprobaciones
