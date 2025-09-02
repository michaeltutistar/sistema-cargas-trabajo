import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';

// Importar rutas del backend existente
import authRoutes from './src/routes/auth';
import dependenciasRoutes from './src/routes/dependencias';
import procesosRoutes from './src/routes/procesos';
import actividadesRoutes from './src/routes/actividades';
import procedimientosRoutes from './src/routes/procedimientos';
import empleosRoutes from './src/routes/empleos';
import cargasRoutes from './src/routes/cargas';

// Middleware personalizado
import { manejarErrores } from './src/middleware/errores';

const app = express();
const PORT = parseInt(process.env['PORT'] || '3001', 10);

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
  origin: process.env['NODE_ENV'] === 'production' 
    ? true // Permitir cualquier origen en producción
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Ruta de health check (antes de los archivos estáticos)
app.get('/api/health', (_req, res) => {
  return res.json({
    success: true,
    message: 'Backend Sistema Cargas de Trabajo FUNCIONANDO (Servidor Integrado TypeScript)',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: 'integrated-typescript',
    database: 'SQLite',
    frontend: 'React SPA'
  });
});

// Información de la API
app.get('/api/info', (_req, res) => {
  return res.json({
    success: true,
    message: 'API Sistema de Gestión de Cargas de Trabajo - Servidor Integrado',
    version: '1.0.0',
    features: [
      'Autenticación JWT',
      'Gestión de Procedimientos (82 del Excel)',
      'Cálculos PERT Automáticos',
      'Reportes Consolidados',
      'Servidor Integrado Frontend+Backend',
      'Base de datos SQLite poblada',
      'Middleware de seguridad Helmet'
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
    database: 'SQLite con 82 procedimientos reales',
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
    
    // Leer y mostrar información del index.html
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const jsMatches = indexContent.match(/assets\/index-[a-zA-Z0-9]+\.js/g);
    const cssMatches = indexContent.match(/assets\/index-[a-zA-Z0-9]+\.css/g);
    
    if (jsMatches) {
      console.log('✅ Assets JS encontrados:', jsMatches);
    }
    if (cssMatches) {
      console.log('✅ Assets CSS encontrados:', cssMatches);
    }
  } else {
    console.log('❌ index.html NO encontrado');
  }
  
  // Servir archivos estáticos con configuración optimizada
  app.use(express.static(frontendPath, {
    setHeaders: (res, filePath) => {
      // Cache para assets con hash
      if (filePath.includes('/assets/') && (filePath.endsWith('.js') || filePath.endsWith('.css'))) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 año
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 día
      }
    },
    index: false // Manejamos index.html manualmente
  }));

  // SPA Fallback: todas las rutas no-API redirigen a index.html
  app.get('*', (req, res) => {
    // No servir API routes como archivos estáticos
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ 
        success: false, 
        message: 'API endpoint no encontrado',
        path: req.path,
        available_endpoints: [
          '/api/health',
          '/api/info',
          '/api/auth/*',
          '/api/dependencias/*',
          '/api/procedimientos/*'
        ]
      });
    }
    
    // Servir index.html para todas las rutas del frontend (SPA routing)
    return res.sendFile(indexPath);
  });
  
  console.log('✅ Frontend React configurado correctamente');
  console.log('✅ SPA routing habilitado para React Router');
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
    
    return res.status(503).json({
      success: false,
      message: 'Frontend no disponible. Ejecuta "npm run build" en el directorio raíz.',
      backend_available: true,
      frontend_available: false,
      instructions: 'cd /workspace/sistema-cargas-trabajo && npm run build'
    });
  });
}

// Middleware de manejo de errores (debe ir al final)
app.use(manejarErrores);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 SERVIDOR INTEGRADO INICIADO EXITOSAMENTE');
  console.log('==========================================');
  console.log(`📍 URL Principal: http://localhost:${PORT}`);
  console.log(`🔗 API Backend: http://localhost:${PORT}/api/`);
  console.log(`🖥️ Frontend React: http://localhost:${PORT}/`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`ℹ️ API Info: http://localhost:${PORT}/api/info`);
  console.log('==========================================');
  console.log('✅ Backend API TypeScript funcionando');
  console.log(`${fs.existsSync(frontendPath) ? '✅' : '❌'} Frontend React ${fs.existsSync(frontendPath) ? 'integrado y servido' : 'no disponible'}`);
  console.log('✅ SPA routing configurado para React Router');
  console.log('✅ Middleware de seguridad Helmet habilitado');
  console.log('✅ CORS configurado para producción');
  console.log('🎯 Sistema completo listo para producción\n');
});

export default app;
