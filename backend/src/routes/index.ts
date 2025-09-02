import { Router } from 'express';
import authRoutes from './auth';
import cargasRoutes from './cargas';
import dependenciasRoutes from './dependencias';
import procesosRoutes from './procesos';
import actividadesRoutes from './actividades';
import procedimientosRoutes from './procedimientos';
import empleosRoutes from './empleos';
import estructuraRoutes from './estructura';
import usuariosRoutes from './usuarios';

const router = Router();

// Definir rutas principales
router.use('/auth', authRoutes);
router.use('/cargas', cargasRoutes);
router.use('/dependencias', dependenciasRoutes);
router.use('/procesos', procesosRoutes);
router.use('/actividades', actividadesRoutes);
router.use('/procedimientos', procedimientosRoutes);
router.use('/empleos', empleosRoutes);
router.use('/estructura', estructuraRoutes);
router.use('/usuarios', usuariosRoutes);

// Ruta de salud del API
router.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'API del Sistema de Gestión de Cargas de Trabajo funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta de información del API
router.get('/info', (_req, res) => {
  res.json({
    name: 'Sistema de Gestión de Cargas de Trabajo API',
    version: '1.0.0',
    description: 'API para gestión de cargas de trabajo con cálculos PERT automáticos',
    author: 'Sistema Cargas Trabajo Team',
    endpoints: {
      auth: '/api/auth',
      cargas: '/api/cargas',
      dependencias: '/api/dependencias',
      procesos: '/api/procesos',
      actividades: '/api/actividades',
      procedimientos: '/api/procedimientos',
      empleos: '/api/empleos'
    },
    features: [
      'Autenticación JWT',
      'Cálculos PERT automáticos',
      'Gestión jerárquica de datos',
      'Reportes y estadísticas',
      'Simulación de escenarios',
      'Exportación de datos'
    ]
  });
});

export default router;
