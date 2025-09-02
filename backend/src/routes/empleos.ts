import { Router } from 'express';
import { empleoController } from '../controllers';
import { autenticar, autorizar } from '../middleware/auth';
import { 
  validar as validarEsquema, 
  validarId as validarParametros, 
  validarConsulta 
} from '../middleware/validacion';
import {
  crearEmpleoSchema,
  actualizarEmpleoSchema,
  consultaPaginacionSchema,
  duplicarSchema
} from '../validators/schemas';

const router = Router();

/**
 * @route GET /api/empleos
 * @desc Listar empleos con filtros y paginación
 * @access Private (todos los roles autenticados)
 */
router.get('/',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta', 'tiempos'),
  validarConsulta(consultaPaginacionSchema),
  empleoController.listar
);

/**
 * @route POST /api/empleos
 * @desc Crear nuevo empleo
 * @access Private (admin, usuario)
 */
router.post('/',
  autenticar(),
  autorizar('admin', 'usuario'),
  validarEsquema(crearEmpleoSchema),
  empleoController.crear
);

/**
 * @route GET /api/empleos/activos
 * @desc Listar empleos activos
 * @access Private (todos los roles autenticados)
 */
router.get('/activos',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta', 'tiempos'),
  empleoController.listarActivos
);

/**
 * @route GET /api/empleos/estadisticas
 * @desc Obtener estadísticas de empleos
 * @access Private (todos los roles autenticados)
 */
router.get('/estadisticas',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta', 'tiempos'),
  empleoController.obtenerEstadisticas
);

/**
 * @route GET /api/empleos/exportar
 * @desc Exportar empleos a CSV
 * @access Private (admin, usuario)
 */
router.get('/exportar',
  autenticar(),
  autorizar('admin', 'usuario'),
  empleoController.exportar
);

/**
 * @route POST /api/empleos/importar
 * @desc Importar empleos desde CSV
 * @access Private (admin)
 */
router.post('/importar',
  autenticar(),
  autorizar('admin'),
  empleoController.importar
);

/**
 * @route GET /api/empleos/:id
 * @desc Obtener empleo por ID
 * @access Private (todos los roles autenticados)
 */
router.get('/:id',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta', 'tiempos'),
  validarParametros('id'),
  empleoController.obtenerPorId
);

/**
 * @route PUT /api/empleos/:id
 * @desc Actualizar empleo
 * @access Private (admin, usuario)
 */
router.put('/:id',
  autenticar(),
  autorizar('admin', 'usuario'),
  validarParametros('id'),
  validarEsquema(actualizarEmpleoSchema),
  empleoController.actualizar
);

/**
 * @route DELETE /api/empleos/:id
 * @desc Eliminar empleo (soft delete)
 * @access Private (admin)
 */
router.delete('/:id',
  autenticar(),
  autorizar('admin'),
  validarParametros('id'),
  empleoController.eliminar
);

/**
 * @route GET /api/empleos/:id/tiempos
 * @desc Obtener empleo con sus tiempos asociados
 * @access Private (todos los roles autenticados)
 */
router.get('/:id/tiempos',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta', 'tiempos'),
  validarParametros('id'),
  empleoController.obtenerConTiempos
);

/**
 * @route POST /api/empleos/:id/duplicar
 * @desc Duplicar empleo
 * @access Private (admin, usuario)
 */
router.post('/:id/duplicar',
  autenticar(),
  autorizar('admin', 'usuario'),
  validarParametros('id'),
  validarEsquema(duplicarSchema),
  empleoController.duplicar
);

/**
 * @route GET /api/empleos/codigo/:codigo
 * @desc Buscar empleo por código
 * @access Private (todos los roles autenticados)
 */
router.get('/codigo/:codigo',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta', 'tiempos'),
  empleoController.buscarPorCodigo
);

/**
 * @route GET /api/empleos/nivel/:nivel
 * @desc Buscar empleos por nivel jerárquico
 * @access Private (todos los roles autenticados)
 */
router.get('/nivel/:nivel',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta', 'tiempos'),
  empleoController.buscarPorNivel
);

/**
 * @route GET /api/empleos/grado/:grado
 * @desc Buscar empleos por grado
 * @access Private (todos los roles autenticados)
 */
router.get('/grado/:grado',
  autenticar(),
  autorizar('admin', 'usuario', 'consulta', 'tiempos'),
  empleoController.buscarPorGrado
);

export default router;
