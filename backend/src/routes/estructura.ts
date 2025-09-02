import { Router } from 'express';
import { estructuraController } from '../controllers/EstructuraController';
import { autenticar, puedeModificar, puedeConsultar } from '../middleware/auth';
import { validarId } from '../middleware/validacion';

const router = Router();

/**
 * @route POST /estructura
 * @desc Crear nueva estructura
 * @access Privado (Modificar)
 */
router.post('/',
  autenticar(),
  puedeModificar(),
  estructuraController.crearEstructura.bind(estructuraController)
);

/**
 * @route GET /estructura
 * @desc Listar todas las estructuras activas
 * @access Privado (Consulta)
 */
router.get('/',
  autenticar(),
  puedeConsultar(),
  estructuraController.listarEstructuras.bind(estructuraController)
);

/**
 * @route GET /estructura/:id
 * @desc Obtener estructura por ID
 * @access Privado (Consulta)
 */
router.get('/:id',
  autenticar(),
  puedeConsultar(),
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
  puedeModificar(),
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
  puedeModificar(),
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
  puedeModificar(),
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
  puedeConsultar(),
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
  puedeModificar(),
  estructuraController.agregarElemento.bind(estructuraController)
);

/**
 * @route DELETE /estructura/elemento/:id
 * @desc Eliminar elemento de la estructura
 * @access Privado (Modificar)
 */
router.delete('/elemento/:id',
  autenticar(),
  puedeModificar(),
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
  puedeConsultar(),
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
  puedeConsultar(),
  validarId('estructuraId'),
  estructuraController.obtenerDependenciasPorEstructura.bind(estructuraController)
);

export default router; 