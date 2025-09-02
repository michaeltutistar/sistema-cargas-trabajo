import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
// Eliminar importación y uso de inicializarBaseDatos de SQLite
// import { inicializarBaseDatos } from './database/config';
import routes from './routes';
import { 
  manejarErrores, 
  rutaNoEncontrada, 
  logearError,
  sanitizarEntrada,
  establecerTimeout
} from './middleware/errores';
import { limitarSolicitudes } from './middleware/auth';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();
const PORT = process.env['PORT'] || 3001;

// Configurar CORS
const corsOptions = {
  origin: process.env['FRONTEND_URL'] || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

// Middlewares de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors(corsOptions));

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middlewares de seguridad y utilidades
app.use(sanitizarEntrada());
app.use(establecerTimeout(30000)); // 30 segundos
app.use(limitarSolicitudes(1000, 900000)); // 1000 requests por 15 minutos

// Middleware de logging para requests
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - UserAgent: ${userAgent}`);
  next();
});

// Rutas principales
app.use('/api', routes);

// Ruta raíz
app.get('/', (_req, res) => {
  res.json({
    message: 'API del Sistema de Gestión de Cargas de Trabajo',
    version: '1.0.0',
    status: 'Funcionando correctamente',
    documentation: '/api/info',
    health: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Middleware para rutas no encontradas
app.use(rutaNoEncontrada());

// Middleware de manejo de errores
app.use(logearError());
app.use(manejarErrores());

/**
 * Función para inicializar el servidor
 */
async function iniciarServidor() {
  try {
    // Inicializar base de datos (eliminar para MySQL)
    // console.log('🔄 Inicializando base de datos...');
    // await inicializarBaseDatos();
    // console.log('✅ Base de datos inicializada correctamente');

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log('🚀 ====================================');
      console.log('🚀 SISTEMA DE GESTIÓN DE CARGAS DE TRABAJO');
      console.log('🚀 ====================================');
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`🚀 Modo: ${process.env['NODE_ENV'] || 'development'}`);
      console.log(`🚀 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🚀 Documentación: http://localhost:${PORT}/api/info`);
      console.log(`🚀 Salud del API: http://localhost:${PORT}/api/health`);
      console.log('🚀 ====================================');
    });

    // Manejar cierre graceful
    const cerrarGraceful = () => {
      console.log('\n⏳ Cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    };

    // Escuchar señales de cierre
    process.on('SIGTERM', cerrarGraceful);
    process.on('SIGINT', cerrarGraceful);

    // Manejar errores no capturados
    process.on('uncaughtException', (error) => {
      console.error('❌ Error no capturado:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promesa rechazada no manejada:', reason);
      console.error('En promise:', promise);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Error inicializando servidor:', error);
    process.exit(1);
  }
}

// Inicializar servidor solo si este archivo se ejecuta directamente
if (require.main === module) {
  iniciarServidor();
}

export default app;
