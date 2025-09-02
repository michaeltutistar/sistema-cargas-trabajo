import { Router } from 'express';
import { procesoController } from '../controllers';
import { autenticar, autorizar } from '../middleware/auth';
import { 
  validar as validarEsquema, 
  validarId as validarParametros, 
  validarConsulta 
} from '../middleware/validacion';
import {
  crearProcesoSchema,
  actualizarProcesoSchema,
  consultaPaginacionSchema,
  reordenarSchema,
  duplicarSchema
} from '../validators/schemas';

const router = Router();

/**
 * @route GET /api/procesos
 * @desc Listar procesos con filtros y paginación
 * @access Private (todos los roles autenticados)
 */
router.get('/',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  validarConsulta(consultaPaginacionSchema),
  procesoController.listar
);

/**
 * @route POST /api/procesos
 * @desc Crear nuevo proceso
 * @access Private (admin, usuario)
 */
router.post('/',
  autenticar(),
  autorizar('admin', 'usuario'),
  validarEsquema(crearProcesoSchema),
  procesoController.crear
);

/**
 * @route GET /api/procesos/estadisticas
 * @desc Obtener estadísticas de procesos
 * @access Private (todos los roles autenticados)
 */
router.get('/estadisticas',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  procesoController.obtenerEstadisticas
);

/**
 * @route POST /api/procesos/reordenar
 * @desc Reordenar procesos
 * @access Private (admin, usuario)
 */
router.post('/reordenar',
  autenticar(),
  autorizar('admin', 'usuario'),
  validarEsquema(reordenarSchema),
  procesoController.reordenar
);

/**
 * @route GET /api/procesos/:id
 * @desc Obtener proceso por ID
 * @access Private (todos los roles autenticados)
 */
router.get('/:id',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  validarParametros(),
  procesoController.obtenerPorId
);

/**
 * @route PUT /api/procesos/:id
 * @desc Actualizar proceso
 * @access Private (admin, usuario)
 */
router.put('/:id',
  autenticar(),
  autorizar('admin', 'usuario'),
  validarParametros(),
  validarEsquema(actualizarProcesoSchema),
  procesoController.actualizar
);

/**
 * @route DELETE /api/procesos/:id
 * @desc Eliminar proceso (soft delete)
 * @access Private (admin)
 */
router.delete('/:id',
  autenticar(),
  autorizar('admin'),
  validarParametros(),
  procesoController.eliminar
);

/**
 * @route GET /api/procesos/:id/actividades
 * @desc Obtener proceso con sus actividades
 * @access Private (todos los roles autenticados)
 */
router.get('/:id/actividades',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  validarParametros(),
  procesoController.obtenerConActividades
);

/**
 * @route POST /api/procesos/:id/duplicar
 * @desc Duplicar proceso
 * @access Private (admin, usuario)
 */
router.post('/:id/duplicar',
  autenticar(),
  autorizar('admin', 'usuario'),
  validarParametros(),
  validarEsquema(duplicarSchema),
  procesoController.duplicar
);

/**
 * @route GET /api/procesos/dependencia/:dependenciaId
 * @desc Buscar procesos por dependencia
 * @access Private (todos los roles autenticados)
 */
router.get('/dependencia/:dependenciaId',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  validarParametros('dependenciaId'),
  procesoController.buscarPorDependencia
);

/**
 * @route GET /api/procesos/dependencia/:dependenciaId/codigo/:codigo
 * @desc Buscar proceso por código en dependencia
 * @access Private (todos los roles autenticados)
 */
router.get('/dependencia/:dependenciaId/codigo/:codigo',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta'),
  procesoController.buscarPorCodigo
);

export default router;
