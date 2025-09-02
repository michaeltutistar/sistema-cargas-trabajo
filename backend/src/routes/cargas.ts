import { Router } from 'express';
import { cargasTrabajoController } from '../controllers';
import { validar, validarId, validarConsulta } from '../middleware/validacion';
import { autenticar, puedeConsultar, puedeModificar } from '../middleware/auth';
import { 
  crearTiempoProcedimientoSchema, 
  actualizarTiempoProcedimientoSchema,
  consultaPaginacionSchema
} from '../validators/schemas';

const router = Router();

// RUTAS TEMPORALMENTE DESHABILITADAS - DEPENDEN DEL SERVICIO ELIMINADO
/*
// Obtener estadísticas generales del sistema
router.get('/stats',
  autenticar(),
  puedeConsultar(),
  cargasTrabajoController.obtenerEstadisticasGenerales.bind(cargasTrabajoController)
);

// Generar reporte de cargas por dependencia
router.get('/dependencia/:dependenciaId/reporte',
  autenticar(),
  puedeConsultar(),
  validarId('dependenciaId'),
  cargasTrabajoController.generarReportePorDependencia.bind(cargasTrabajoController)
);

// Generar resumen de empleos necesarios
router.get('/resumen-empleos',
  autenticar(),
  puedeConsultar(),
  cargasTrabajoController.generarResumenEmpleos.bind(cargasTrabajoController)
);

// Calcular cargas consolidadas
router.get('/consolidadas',
  autenticar(),
  puedeConsultar(),
  cargasTrabajoController.calcularCargasConsolidadas.bind(cargasTrabajoController)
);

// Analizar eficiencia por nivel jerárquico
router.get('/eficiencia-niveles',
  autenticar(),
  puedeConsultar(),
  cargasTrabajoController.analizarEficienciaPorNivel.bind(cargasTrabajoController)
);

// Generar reporte de brechas
router.get('/brechas',
  autenticar(),
  puedeConsultar(),
  cargasTrabajoController.generarReporteBrechas.bind(cargasTrabajoController)
);

// Simular escenarios de cargas
router.post('/simular',
  autenticar(),
  puedeConsultar(),
  cargasTrabajoController.simularEscenario.bind(cargasTrabajoController)
);
*/

/**
 * @route GET /cargas/tiempos
 * @desc Buscar tiempos con filtros
 * @access Privado (Consulta)
 */
router.get('/tiempos',
  autenticar(),
  puedeConsultar(),
  validarConsulta(consultaPaginacionSchema),
  cargasTrabajoController.buscarTiempos.bind(cargasTrabajoController)
);

/**
 * @route POST /cargas/tiempos
 * @desc Crear tiempo de procedimiento
 * @access Privado (Modificar)
 */
router.post('/tiempos',
  autenticar(),
  puedeModificar(),
  validar(crearTiempoProcedimientoSchema),
  cargasTrabajoController.crearTiempoProcedimiento.bind(cargasTrabajoController)
);

/**
 * @route POST /cargas/tiempos/multiples
 * @desc Crear múltiples tiempos de procedimiento
 * @access Privado (Modificar)
 */
router.post('/tiempos/multiples',
  autenticar(),
  puedeModificar(),
  cargasTrabajoController.crearMultiplesTiemposProcedimiento.bind(cargasTrabajoController)
);

/**
 * @route POST /cargas/tiempos/finalizar-registro
 * @desc Finalizar registro de tiempos (maneja duplicados inteligentemente)
 * @access Privado (Modificar)
 */
router.post('/tiempos/finalizar-registro',
  autenticar(),
  puedeModificar(),
  cargasTrabajoController.finalizarRegistroTiempos.bind(cargasTrabajoController)
);

/**
 * @route GET /cargas/tiempos/:id
 * @desc Obtener tiempo de procedimiento por ID
 * @access Privado (Consulta)
 */
router.get('/tiempos/:id',
  autenticar(),
  puedeConsultar(),
  validarId(),
  cargasTrabajoController.obtenerTiempoProcedimiento.bind(cargasTrabajoController)
);

/**
 * @route PUT /cargas/tiempos/:id
 * @desc Actualizar tiempo de procedimiento
 * @access Privado (Modificar)
 */
router.put('/tiempos/:id',
  autenticar(),
  puedeModificar(),
  validarId(),
  validar(actualizarTiempoProcedimientoSchema),
  cargasTrabajoController.actualizarTiempoProcedimiento.bind(cargasTrabajoController)
);

/**
 * @route DELETE /cargas/tiempos/:id
 * @desc Eliminar tiempo de procedimiento
 * @access Privado (Modificar)
 */
router.delete('/tiempos/:id',
  autenticar(),
  puedeModificar(),
  validarId(),
  cargasTrabajoController.eliminarTiempoProcedimiento.bind(cargasTrabajoController)
);

/**
 * @route POST /cargas/tiempos/recalcular
 * @desc Recalcular todos los tiempos PERT
 * @access Privado (Modificar)
 */
router.post('/tiempos/recalcular',
  autenticar(),
  puedeModificar(),
  cargasTrabajoController.recalcularTiempos.bind(cargasTrabajoController)
);

/**
 * @route GET /cargas/resumen-dependencias
 * @desc Obtener resumen por dependencia
 * @access Privado (Consulta)
 */
router.get('/resumen-dependencias',
  autenticar(),
  puedeConsultar(),
  cargasTrabajoController.obtenerResumenPorDependencia.bind(cargasTrabajoController)
);

/**
 * @route GET /cargas/stats-tiempos
 * @desc Obtener estadísticas de tiempos
 * @access Privado (Consulta)
 */
router.get('/stats-tiempos',
  autenticar(),
  puedeConsultar(),
  cargasTrabajoController.obtenerEstadisticasTiempos.bind(cargasTrabajoController)
);

/**
 * @route POST /cargas/tiempos/importar
 * @desc Importar tiempos desde archivo
 * @access Privado (Modificar)
 */
router.post('/tiempos/importar',
  autenticar(),
  puedeModificar(),
  cargasTrabajoController.importarTiempos.bind(cargasTrabajoController)
);

/**
 * @route POST /cargas/tiempos/duplicar
 * @desc Duplicar tiempos de un procedimiento a otro
 * @access Privado (Modificar)
 */
router.post('/tiempos/duplicar',
  autenticar(),
  puedeModificar(),
  cargasTrabajoController.duplicarTiempos.bind(cargasTrabajoController)
);

/**
 * @route POST /cargas/tiempos/validar-compatibilidad
 * @desc Validar compatibilidad entre procedimiento y empleo
 * @access Privado (Consulta)
 */
router.post('/tiempos/validar-compatibilidad',
  autenticar(),
  puedeConsultar(),
  cargasTrabajoController.validarCompatibilidad.bind(cargasTrabajoController)
);

/**
 * @route GET /cargas/exportar
 * @desc Exportar datos de cargas de trabajo
 * @access Privado (Consulta)
 */
router.get('/exportar',
  autenticar(),
  puedeConsultar(),
  cargasTrabajoController.exportarDatos.bind(cargasTrabajoController)
);

/**
 * @route GET /cargas/tiempos/totales-por-niveles/:dependenciaId
 * @desc Obtener totales por niveles de empleo para una dependencia
 * @access Privado (Consulta)
 */
router.get('/tiempos/totales-por-niveles/:dependenciaId',
  autenticar(),
  puedeConsultar(),
  validarId('dependenciaId'),
  cargasTrabajoController.obtenerTotalesPorNiveles.bind(cargasTrabajoController)
);

/**
 * @route GET /cargas/tiempos/procedimientos-por-dependencia/:dependenciaId
 * @desc Obtener procedimientos con tiempos por dependencia
 * @access Privado (Consulta)
 */
router.get('/tiempos/procedimientos-por-dependencia/:dependenciaId',
  autenticar(),
  puedeConsultar(),
  validarId('dependenciaId'),
  cargasTrabajoController.obtenerProcedimientosPorDependencia.bind(cargasTrabajoController)
);

// Alias para compatibilidad con frontend antiguo - TEMPORALMENTE DESHABILITADOS
/*
router.get('/estadisticas',
  autenticar(),
  puedeConsultar(),
  cargasTrabajoController.obtenerEstadisticasGenerales.bind(cargasTrabajoController)
);

router.get('/analisis',
  autenticar(),
  puedeConsultar(),
  cargasTrabajoController.calcularCargasConsolidadas.bind(cargasTrabajoController)
);
*/

export default router;
