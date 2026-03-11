import { Router } from 'express';
import { estructuraController } from '../controllers/EstructuraController';
import { autenticar, puedeGestionarEstructura, puedeConsultarEstructura } from '../middleware/auth';
import { validarId } from '../middleware/validacion';

const router = Router();

/**
 * @route POST /estructura
 * @desc Crear nueva estructura
 * @access Privado (Modificar)
 */
router.post('/',
  autenticar(),
  puedeGestionarEstructura(),
  estructuraController.crearEstructura.bind(estructuraController)
);

/**
 * @route GET /estructura
 * @desc Listar todas las estructuras activas
 * @access Privado (Consulta)
 */
router.get('/',
  autenticar(),
  puedeConsultarEstructura(),
  estructuraController.listarEstructuras.bind(estructuraController)
);

/**
 * @route GET /estructura/:id
 * @desc Obtener estructura por ID
 * @access Privado (Consulta)
 */
router.get('/:id',
  autenticar(),
  puedeConsultarEstructura(),
  validarId('id'),
  estructuraController.obtenerEstructura.bind(estructuraController)
);

/**
 * @route PUT /estructura/:id
 * @desc Actualizar estructura
 * @access Privado (Modificar)
 */
router.put('/:id',
  autenticar(),
  puedeGestionarEstructura(),
  validarId('id'),
  estructuraController.actualizarEstructura.bind(estructuraController)
);

/**
 * @route DELETE /estructura/:id/desactivar
 * @desc Desactivar estructura
 * @access Privado (Modificar)
 */
router.delete('/:id/desactivar',
  autenticar(),
  puedeGestionarEstructura(),
  validarId('id'),
  estructuraController.desactivarEstructura.bind(estructuraController)
);

/**
 * @route PUT /estructura/:id/activar
 * @desc Activar estructura
 * @access Privado (Modificar)
 */
router.put('/:id/activar',
  autenticar(),
  puedeGestionarEstructura(),
  validarId('id'),
  estructuraController.activarEstructura.bind(estructuraController)
);

/**
 * @route GET /estructura/:id/completa
 * @desc Obtener estructura completa con elementos
 * @access Privado (Consulta)
 */
router.get('/:id/completa',
  autenticar(),
  puedeConsultarEstructura(),
  validarId('id'),
  estructuraController.obtenerEstructuraCompleta.bind(estructuraController)
);

/**
 * @route POST /estructura/elemento
 * @desc Agregar elemento a la estructura
 * @access Privado (Modificar)
 */
router.post('/elemento',
  autenticar(),
  puedeGestionarEstructura(),
  estructuraController.agregarElemento.bind(estructuraController)
);

/**
 * @route DELETE /estructura/elemento/:id
 * @desc Eliminar elemento de la estructura
 * @access Privado (Modificar)
 */
router.delete('/elemento/:id',
  autenticar(),
  puedeGestionarEstructura(),
  validarId('id'),
  estructuraController.eliminarElemento.bind(estructuraController)
);

/**
 * @route GET /estructura/:estructuraId/elementos/:tipo
 * @desc Obtener elementos por tipo
 * @access Privado (Consulta)
 */
router.get('/:estructuraId/elementos/:tipo',
  autenticar(),
  puedeConsultarEstructura(),
  validarId('estructuraId'),
  estructuraController.obtenerElementosPorTipo.bind(estructuraController)
);

/**
 * @route GET /estructura/:estructuraId/dependencias
 * @desc Obtener dependencias por estructura
 * @access Privado (Consulta)
 */
router.get('/:estructuraId/dependencias',
  autenticar(),
  puedeConsultarEstructura(),
  validarId('estructuraId'),
  estructuraController.obtenerDependenciasPorEstructura.bind(estructuraController)
);

export default router; 