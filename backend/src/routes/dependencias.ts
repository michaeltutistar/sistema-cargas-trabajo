import { Router } from 'express';
import { dependenciaController } from '../controllers';
import { validar, validarId, validarConsulta } from '../middleware/validacion';
import { autenticar, puedeConsultar, puedeModificar } from '../middleware/auth';
import { 
  crearDependenciaSchema, 
  actualizarDependenciaSchema,
  consultaPaginacionSchema
} from '../validators/schemas';

const router = Router();

/**
 * @route GET /dependencias
 * @desc Listar dependencias con filtros y paginación
 * @access Privado (Consulta)
 */
router.get('/',
  autenticar(),
  puedeConsultar(),
  validarConsulta(consultaPaginacionSchema),
  dependenciaController.listar.bind(dependenciaController)
);

/**
 * @route GET /dependencias/activas
 * @desc Listar dependencias activas (sin paginación)
 * @access Privado (Consulta)
 */
router.get('/activas',
  autenticar(),
  puedeConsultar(),
  dependenciaController.listarActivas.bind(dependenciaController)
);

/**
 * @route GET /dependencias/stats
 * @desc Obtener estadísticas de dependencias
 * @access Privado (Consulta)
 */
router.get('/stats',
  autenticar(),
  puedeConsultar(),
  dependenciaController.obtenerEstadisticas.bind(dependenciaController)
);

/**
 * @route GET /dependencias/ranking
 * @desc Obtener ranking de dependencias por procesos
 * @access Privado (Consulta)
 */
router.get('/ranking',
  autenticar(),
  puedeConsultar(),
  dependenciaController.obtenerRanking.bind(dependenciaController)
);

/**
 * @route GET /dependencias/exportar
 * @desc Exportar dependencias
 * @access Privado (Consulta)
 */
router.get('/exportar',
  autenticar(),
  puedeConsultar(),
  dependenciaController.exportar.bind(dependenciaController)
);

/**
 * @route POST /dependencias
 * @desc Crear nueva dependencia
 * @access Privado (Modificar)
 */
router.post('/',
  autenticar(),
  puedeModificar(),
  validar(crearDependenciaSchema),
  dependenciaController.crear.bind(dependenciaController)
);

/**
 * @route POST /dependencias/importar
 * @desc Importar dependencias desde archivo
 * @access Privado (Modificar)
 */
router.post('/importar',
  autenticar(),
  puedeModificar(),
  dependenciaController.importar.bind(dependenciaController)
);

/**
 * @route GET /dependencias/codigo/:codigo
 * @desc Buscar dependencia por código
 * @access Privado (Consulta)
 */
router.get('/codigo/:codigo',
  autenticar(),
  puedeConsultar(),
  dependenciaController.buscarPorCodigo.bind(dependenciaController)
);

/**
 * @route GET /dependencias/:id
 * @desc Obtener dependencia por ID
 * @access Privado (Consulta)
 */
router.get('/:id',
  autenticar(),
  puedeConsultar(),
  validarId(),
  dependenciaController.obtenerPorId.bind(dependenciaController)
);

/**
 * @route GET /dependencias/:id/procesos
 * @desc Obtener dependencia con sus procesos
 * @access Privado (Consulta)
 */
router.get('/:id/procesos',
  autenticar(),
  puedeConsultar(),
  validarId(),
  dependenciaController.obtenerConProcesos.bind(dependenciaController)
);

/**
 * @route PUT /dependencias/:id
 * @desc Actualizar dependencia
 * @access Privado (Modificar)
 */
router.put('/:id',
  autenticar(),
  puedeModificar(),
  validarId(),
  validar(actualizarDependenciaSchema),
  dependenciaController.actualizar.bind(dependenciaController)
);

/**
 * @route DELETE /dependencias/:id
 * @desc Eliminar dependencia (soft delete)
 * @access Privado (Modificar)
 */
router.delete('/:id',
  autenticar(),
  puedeModificar(),
  validarId(),
  dependenciaController.eliminar.bind(dependenciaController)
);

/**
 * @route PUT /dependencias/:id/restaurar
 * @desc Restaurar dependencia eliminada
 * @access Privado (Modificar)
 */
router.put('/:id/restaurar',
  autenticar(),
  puedeModificar(),
  validarId(),
  dependenciaController.restaurar.bind(dependenciaController)
);

/**
 * @route POST /dependencias/:id/duplicar
 * @desc Duplicar dependencia
 * @access Privado (Modificar)
 */
router.post('/:id/duplicar',
  autenticar(),
  puedeModificar(),
  validarId(),
  dependenciaController.duplicar.bind(dependenciaController)
);

/**
 * @route GET /dependencias/:id/verificar-eliminacion
 * @desc Verificar si se puede eliminar la dependencia
 * @access Privado (Consulta)
 */
router.get('/:id/verificar-eliminacion',
  autenticar(),
  puedeConsultar(),
  validarId(),
  dependenciaController.verificarEliminacion.bind(dependenciaController)
);

export default router;
