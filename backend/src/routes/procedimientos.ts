import { Router } from 'express';
import { procedimientoController } from '../controllers';
import { autenticar, autorizar } from '../middleware/auth';
import { 
  validar as validarEsquema, 
  validarId as validarParametros, 
  validarConsulta 
} from '../middleware/validacion';
import {
  crearProcedimientoSchema,
  actualizarProcedimientoSchema,
  consultaPaginacionSchema,
  reordenarSchema,
  duplicarSchema
} from '../validators/schemas';

const router = Router();

/**
 * @route GET /api/procedimientos
 * @desc Listar procedimientos con filtros y paginación
 * @access Private (todos los roles autenticados)
 */
router.get('/',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  validarConsulta(consultaPaginacionSchema),
  procedimientoController.listar
);

/**
 * @route POST /api/procedimientos
 * @desc Crear nuevo procedimiento
 * @access Private (admin, usuario)
 */
router.post('/',
  autenticar(),
  autorizar('admin', 'usuario'),
  validarEsquema(crearProcedimientoSchema),
  procedimientoController.crear
);

/**
 * @route GET /api/procedimientos/estadisticas
 * @desc Obtener estadísticas de procedimientos
 * @access Private (todos los roles autenticados)
 */
router.get('/estadisticas',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  procedimientoController.obtenerEstadisticas
);

/**
 * @route POST /api/procedimientos/reordenar
 * @desc Reordenar procedimientos
 * @access Private (admin, usuario)
 */
router.post('/reordenar',
  autenticar(),
  autorizar('admin', 'usuario'),
  validarEsquema(reordenarSchema),
  procedimientoController.reordenar
);

/**
 * @route GET /api/procedimientos/:id
 * @desc Obtener procedimiento por ID
 * @access Private (todos los roles autenticados)
 */
router.get('/:id',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  validarParametros('id'),
  procedimientoController.obtenerPorId
);

/**
 * @route PUT /api/procedimientos/:id
 * @desc Actualizar procedimiento
 * @access Private (admin, usuario)
 */
router.put('/:id',
  autenticar(),
  autorizar('admin', 'usuario'),
  validarParametros('id'),
  validarEsquema(actualizarProcedimientoSchema),
  procedimientoController.actualizar
);

/**
 * @route DELETE /api/procedimientos/:id
 * @desc Eliminar procedimiento (soft delete)
 * @access Private (admin)
 */
router.delete('/:id',
  autenticar(),
  autorizar('admin'),
  validarParametros('id'),
  procedimientoController.eliminar
);

/**
 * @route GET /api/procedimientos/:id/tiempos
 * @desc Obtener procedimiento con sus tiempos
 * @access Private (todos los roles autenticados)
 */
router.get('/:id/tiempos',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  validarParametros('id'),
  procedimientoController.obtenerConTiempos
);

/**
 * @route POST /api/procedimientos/:id/duplicar
 * @desc Duplicar procedimiento
 * @access Private (admin, usuario)
 */
router.post('/:id/duplicar',
  autenticar(),
  autorizar('admin', 'usuario'),
  validarParametros('id'),
  validarEsquema(duplicarSchema),
  procedimientoController.duplicar
);

/**
 * @route GET /api/procedimientos/actividad/:actividadId
 * @desc Buscar procedimientos por actividad
 * @access Private (todos los roles autenticados)
 */
router.get('/actividad/:actividadId',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  validarParametros('actividadId'),
  procedimientoController.buscarPorActividad
);

/**
 * @route GET /api/procedimientos/actividad/:actividadId/codigo/:codigo
 * @desc Buscar procedimiento por código en actividad
 * @access Private (todos los roles autenticados)
 */
router.get('/actividad/:actividadId/codigo/:codigo',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  procedimientoController.buscarPorCodigo
);

/**
 * @route GET /api/procedimientos/nivel/:nivel
 * @desc Buscar procedimientos por nivel jerárquico
 * @access Private (todos los roles autenticados)
 */
router.get('/nivel/:nivel',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  procedimientoController.buscarPorNivel
);

export default router;
