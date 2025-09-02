import { Router } from 'express';
import { actividadController } from '../controllers';
import { autenticar, autorizar } from '../middleware/auth';
import { 
  validar as validarEsquema, 
  validarId as validarParametros, 
  validarConsulta 
} from '../middleware/validacion';
import {
  crearActividadSchema,
  actualizarActividadSchema,
  consultaPaginacionSchema,
  reordenarSchema,
  duplicarSchema
} from '../validators/schemas';

const router = Router();

/**
 * @route GET /api/actividades
 * @desc Listar actividades con filtros y paginación
 * @access Private (todos los roles autenticados)
 */
router.get('/',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  validarConsulta(consultaPaginacionSchema),
  actividadController.listar
);

/**
 * @route POST /api/actividades
 * @desc Crear nueva actividad
 * @access Private (admin, usuario)
 */
router.post('/',
  autenticar(),
  autorizar('admin', 'usuario'),
  validarEsquema(crearActividadSchema),
  actividadController.crear
);

/**
 * @route GET /api/actividades/estadisticas
 * @desc Obtener estadísticas de actividades
 * @access Private (todos los roles autenticados)
 */
router.get('/estadisticas',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  actividadController.obtenerEstadisticas
);

/**
 * @route POST /api/actividades/reordenar
 * @desc Reordenar actividades
 * @access Private (admin, usuario)
 */
router.post('/reordenar',
  autenticar(),
  autorizar('admin', 'usuario'),
  validarEsquema(reordenarSchema),
  actividadController.reordenar
);

/**
 * @route GET /api/actividades/:id
 * @desc Obtener actividad por ID
 * @access Private (todos los roles autenticados)
 */
router.get('/:id',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  validarParametros(),
  actividadController.obtenerPorId
);

/**
 * @route PUT /api/actividades/:id
 * @desc Actualizar actividad
 * @access Private (admin, usuario)
 */
router.put('/:id',
  autenticar(),
  autorizar('admin', 'usuario'),
  validarParametros(),
  validarEsquema(actualizarActividadSchema),
  actividadController.actualizar
);

/**
 * @route DELETE /api/actividades/:id
 * @desc Eliminar actividad (soft delete)
 * @access Private (admin)
 */
router.delete('/:id',
  autenticar(),
  autorizar('admin'),
  validarParametros(),
  actividadController.eliminar
);

/**
 * @route GET /api/actividades/:id/procedimientos
 * @desc Obtener actividad con sus procedimientos
 * @access Private (todos los roles autenticados)
 */
router.get('/:id/procedimientos',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  validarParametros(),
  actividadController.obtenerConProcedimientos
);

/**
 * @route POST /api/actividades/:id/duplicar
 * @desc Duplicar actividad
 * @access Private (admin, usuario)
 */
router.post('/:id/duplicar',
  autenticar(),
  autorizar('admin', 'usuario'),
  validarParametros(),
  validarEsquema(duplicarSchema),
  actividadController.duplicar
);

/**
 * @route GET /api/actividades/proceso/:procesoId
 * @desc Buscar actividades por proceso
 * @access Private (todos los roles autenticados)
 */
router.get('/proceso/:procesoId',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  validarParametros('procesoId'),
  actividadController.buscarPorProceso
);

/**
 * @route GET /api/actividades/proceso/:procesoId/codigo/:codigo
 * @desc Buscar actividad por código en proceso
 * @access Private (todos los roles autenticados)
 */
router.get('/proceso/:procesoId/codigo/:codigo',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  actividadController.buscarPorCodigo
);

export default router;
