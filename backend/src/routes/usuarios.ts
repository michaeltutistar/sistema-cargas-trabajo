import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { autenticar, esAdmin } from '../middleware/auth';
import { validar } from '../middleware/validacion';
import { 
  crearUsuarioSchema, 
  actualizarUsuarioSchema, 
  cambiarPasswordSchema 
} from '../validators/schemas';

const router = Router();
const usuarioController = new UsuarioController();

// Todas las rutas requieren autenticación y rol de admin
router.use(autenticar());
router.use(esAdmin());

/**
 * @route GET /usuarios
 * @desc Obtener todos los usuarios con paginación y filtros
 * @access Privado (Solo admin)
 */
router.get('/', usuarioController.obtenerUsuarios.bind(usuarioController));

/**
 * @route GET /usuarios/:id
 * @desc Obtener un usuario por ID
 * @access Privado (Solo admin)
 */
router.get('/:id', usuarioController.obtenerUsuario.bind(usuarioController));

/**
 * @route POST /usuarios
 * @desc Crear un nuevo usuario
 * @access Privado (Solo admin)
 */
router.post('/', 
  validar(crearUsuarioSchema),
  usuarioController.crearUsuario.bind(usuarioController)
);

/**
 * @route PUT /usuarios/:id
 * @desc Actualizar un usuario existente
 * @access Privado (Solo admin)
 */
router.put('/:id',
  validar(actualizarUsuarioSchema),
  usuarioController.actualizarUsuario.bind(usuarioController)
);

/**
 * @route PUT /usuarios/:id/password
 * @desc Cambiar contraseña de un usuario
 * @access Privado (Solo admin)
 */
router.put('/:id/password',
  validar(cambiarPasswordSchema),
  usuarioController.cambiarPassword.bind(usuarioController)
);

/**
 * @route PUT /usuarios/:id/rol
 * @desc Cambiar rol de un usuario
 * @access Privado (Solo admin)
 */
router.put('/:id/rol', usuarioController.cambiarRol.bind(usuarioController));

/**
 * @route PUT /usuarios/:id/estado
 * @desc Activar/desactivar usuario
 * @access Privado (Solo admin)
 */
router.put('/:id/estado', usuarioController.cambiarEstado.bind(usuarioController));

/**
 * @route DELETE /usuarios/:id
 * @desc Eliminar un usuario
 * @access Privado (Solo admin)
 */
router.delete('/:id', usuarioController.eliminarUsuario.bind(usuarioController));

/**
 * @route GET /usuarios/stats/estadisticas
 * @desc Obtener estadísticas de usuarios
 * @access Privado (Solo admin)
 */
router.get('/stats/estadisticas', usuarioController.obtenerEstadisticas.bind(usuarioController));

export default router; 