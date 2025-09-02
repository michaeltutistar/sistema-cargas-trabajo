import { Router } from 'express';
import { authController } from '../controllers';
import { validar, validarId } from '../middleware/validacion';
import { autenticar, esAdmin } from '../middleware/auth';
import { 
  loginSchema, 
  crearUsuarioSchema, 
  actualizarUsuarioSchema,
  cambiarPasswordSchema,
  recuperarPasswordSchema
} from '../validators/schemas';

const router = Router();

/**
 * @route POST /auth/login
 * @desc Iniciar sesión
 * @access Público
 */
router.post('/login', 
  validar(loginSchema),
  authController.login.bind(authController)
);

/**
 * @route POST /auth/register
 * @desc Registrar nuevo usuario
 * @access Privado (Solo admin)
 */
router.post('/register',
  autenticar(),
  esAdmin(),
  validar(crearUsuarioSchema),
  authController.registrar.bind(authController)
);

/**
 * @route GET /auth/profile
 * @desc Obtener perfil del usuario autenticado
 * @access Privado
 */
router.get('/profile',
  autenticar(),
  authController.obtenerPerfil.bind(authController)
);

/**
 * @route PUT /auth/profile
 * @desc Actualizar perfil del usuario
 * @access Privado
 */
router.put('/profile',
  autenticar(),
  validar(actualizarUsuarioSchema),
  authController.actualizarPerfil.bind(authController)
);

/**
 * @route POST /auth/change-password
 * @desc Cambiar contraseña
 * @access Privado
 */
router.post('/change-password',
  autenticar(),
  validar(cambiarPasswordSchema),
  authController.cambiarPassword.bind(authController)
);

/**
 * @route GET /auth/verify-token
 * @desc Verificar validez del token
 * @access Privado
 */
router.get('/verify-token',
  autenticar(),
  authController.verificarToken.bind(authController)
);

/**
 * @route POST /auth/reset-password
 * @desc Resetear contraseña
 * @access Público
 */
router.post('/reset-password',
  validar(recuperarPasswordSchema),
  authController.resetearPassword.bind(authController)
);

/**
 * @route POST /auth/validate-password
 * @desc Validar fortaleza de contraseña
 * @access Público
 */
router.post('/validate-password',
  authController.validarPassword.bind(authController)
);

/**
 * @route POST /auth/logout
 * @desc Cerrar sesión
 * @access Privado
 */
router.post('/logout',
  autenticar(),
  authController.logout.bind(authController)
);

/**
 * @route POST /auth/refresh-token
 * @desc Refrescar token
 * @access Privado
 */
router.post('/refresh-token',
  autenticar(),
  authController.refrescarToken.bind(authController)
);

/**
 * @route POST /auth/recovery-token
 * @desc Generar token de recuperación
 * @access Público
 */
router.post('/recovery-token',
  validar(recuperarPasswordSchema),
  authController.generarTokenRecuperacion.bind(authController)
);

/**
 * @route GET /auth/stats
 * @desc Obtener estadísticas de autenticación
 * @access Privado (Solo admin)
 */
router.get('/stats',
  autenticar(),
  esAdmin(),
  authController.obtenerEstadisticas.bind(authController)
);

/**
 * @route PUT /auth/users/:id/deactivate
 * @desc Desactivar usuario
 * @access Privado (Solo admin)
 */
router.put('/users/:id/deactivate',
  autenticar(),
  esAdmin(),
  validarId(),
  authController.desactivarUsuario.bind(authController)
);

/**
 * @route PUT /auth/users/:id/activate
 * @desc Activar usuario
 * @access Privado (Solo admin)
 */
router.put('/users/:id/activate',
  autenticar(),
  esAdmin(),
  validarId(),
  authController.activarUsuario.bind(authController)
);

export default router;
