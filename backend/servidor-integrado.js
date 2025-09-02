const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// Importar rutas del backend existente
const authRoutes = require('./src/routes/auth');
const dependenciasRoutes = require('./src/routes/dependencias');
const procesosRoutes = require('./src/routes/procesos');
const actividadesRoutes = require('./src/routes/actividades');
const procedimientosRoutes = require('./src/routes/procedimientos');
const empleosRoutes = require('./src/routes/empleos');
const cargasRoutes = require('./src/routes/cargas');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad (configurado para producción)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configurado para producción y desarrollo
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Permitir cualquier origen en producción
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ruta de health check (antes de los archivos estáticos)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend Sistema Cargas de Trabajo FUNCIONANDO (Servidor Integrado)',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: 'integrated'
  });
});

// Información de la API
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    message: 'API Sistema de Gestión de Cargas de Trabajo - Servidor Integrado',
    version: '1.0.0',
    features: [
      'Autenticación JWT',
      'Gestión de Procedimientos',
      'Cálculos PERT Automáticos',
      'Reportes Consolidados',
      'Servidor Integrado Frontend+Backend'
    ],
    endpoints: {
      auth: '/api/auth/*',
      dependencias: '/api/dependencias/*',
      procesos: '/api/procesos/*',
      actividades: '/api/actividades/*',
      procedimientos: '/api/procedimientos/*',
      empleos: '/api/empleos/*',
      cargas: '/api/cargas/*'
    },
    database: 'SQLite',
    static_files: 'React Frontend Integrado'
  });
});

// Rutas de la API (todas con prefijo /api)
app.use('/api/auth', authRoutes);
app.use('/api/dependencias', dependenciasRoutes);
app.use('/api/procesos', procesosRoutes);
app.use('/api/actividades', actividadesRoutes);
app.use('/api/procedimientos', procedimientosRoutes);
app.use('/api/empleos', empleosRoutes);
app.use('/api/cargas', cargasRoutes);

// Servir archivos estáticos del frontend React
const frontendPath = path.join(__dirname, '..', 'dist');

console.log('🔍 Verificando archivos del frontend...');
console.log('📁 Ruta del frontend:', frontendPath);

if (fs.existsSync(frontendPath)) {
  console.log('✅ Directorio dist encontrado');
  
  // Verificar archivos principales
  const indexPath = path.join(frontendPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html encontrado');
  } else {
    console.log('❌ index.html NO encontrado');
  }
  
  // Servir archivos estáticos
  app.use(express.static(frontendPath, {
    setHeaders: (res, path) => {
      // Cache para assets
      if (path.endsWith('.js') || path.endsWith('.css')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 año
      } else if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));

  // SPA Fallback: todas las rutas no-API redirigen a index.html
  app.get('*', (req, res) => {
    // No servir API routes como archivos estáticos
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ 
        success: false, 
        message: 'API endpoint no encontrado',
        path: req.path 
      });
    }
    
    // Servir index.html para todas las rutas del frontend
    res.sendFile(indexPath);
  });
  
  console.log('✅ Frontend React configurado correctamente');
} else {
  console.log('❌ Directorio dist no encontrado');
  console.log('⚠️ Ejecuta "npm run build" en el directorio raíz para generar el frontend');
  
  // Ruta de fallback si no hay frontend
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ 
        success: false, 
        message: 'API endpoint no encontrado' 
      });
    }
    
    res.status(503).json({
      success: false,
      message: 'Frontend no disponible. Ejecuta npm run build.',
      backend_available: true,
      frontend_available: false
    });
  });
}

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error del servidor:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 SERVIDOR INTEGRADO INICIADO EXITOSAMENTE');
  console.log('==========================================');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api/`);
  console.log(`🖥️ Frontend: http://localhost:${PORT}/`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`ℹ️ Info: http://localhost:${PORT}/api/info`);
  console.log('==========================================');
  console.log('✅ Backend API funcionando');
  console.log(`${fs.existsSync(frontendPath) ? '✅' : '❌'} Frontend React ${fs.existsSync(frontendPath) ? 'integrado' : 'no disponible'}`);
  console.log('🎯 Sistema listo para producción\n');
});

module.exports = app;
