import { Request, Response } from 'express';
import { authService } from '../services';
import { generarRespuestaExito, generarRespuestaError } from '../utils/helpers';
import { AutenticacionError, ValidacionError } from '../types';

export class AuthController {
  /**
   * Iniciar sesión
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      const resultado = await authService.login({ email, password });
      
      // Cambiar la estructura para que sea compatible con el frontend
      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          token: resultado.token,
          user: resultado.usuario
        }
      });
    } catch (error) {
      if (error instanceof AutenticacionError) {
        res.status(401).json(generarRespuestaError(error.message, 401));
      } else {
        console.error('Error en login:', error);
        res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Registrar nuevo usuario (solo admins)
   */
  async registrar(req: Request, res: Response) {
    try {
      const datosUsuario = req.body;
      
      const resultado = await authService.registrar(datosUsuario);
      
      res.status(201).json(generarRespuestaExito(resultado, 'Usuario registrado exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error en registro:', error);
        res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async obtenerPerfil(req: Request, res: Response) {
    try {
      const userId = req.usuario!.id;
      
      const perfil = await authService.obtenerPerfil(userId);
      
      res.json(generarRespuestaExito(perfil, 'Perfil obtenido exitosamente'));
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  async actualizarPerfil(req: Request, res: Response) {
    try {
      const userId = req.usuario!.id;
      const datosActualizacion = req.body;
      
      const perfilActualizado = await authService.actualizarPerfil(userId, datosActualizacion);
      
      res.json(generarRespuestaExito(perfilActualizado, 'Perfil actualizado exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error actualizando perfil:', error);
        res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Cambiar contraseña
   */
  async cambiarPassword(req: Request, res: Response) {
    try {
      const userId = req.usuario!.id;
      const { passwordActual, passwordNuevo } = req.body;
      
      await authService.cambiarPassword(userId, passwordActual, passwordNuevo);
      
      res.json(generarRespuestaExito({}, 'Contraseña cambiada exitosamente'));
    } catch (error) {
      if (error instanceof AutenticacionError || error instanceof ValidacionError) {
        res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Verificar token
   */
  async verificarToken(req: Request, res: Response) {
    try {
      const userId = req.usuario!.id;
      
      const verificacion = await authService.verificarToken(userId);
      
      if (verificacion.valido) {
        res.json(generarRespuestaExito(verificacion.usuario, 'Token válido'));
      } else {
        res.status(401).json(generarRespuestaError('Token inválido', 401));
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Resetear contraseña
   */
  async resetearPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      const passwordTemporal = await authService.resetearPassword(email);
      
      // En un entorno real, enviarías esto por email
      res.json(generarRespuestaExito(
        { passwordTemporal }, 
        'Contraseña temporal generada. En producción se enviaría por email.'
      ));
    } catch (error) {
      if (error instanceof AutenticacionError) {
        res.status(404).json(generarRespuestaError(error.message, 404));
      } else {
        console.error('Error reseteando contraseña:', error);
        res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Validar fortaleza de contraseña
   */
  async validarPassword(req: Request, res: Response) {
    try {
      const { password } = req.body;
      
      const validacion = authService.validarFortalezaPassword(password);
      
      res.json(generarRespuestaExito(validacion, 'Validación de contraseña completada'));
    } catch (error) {
      console.error('Error validando contraseña:', error);
      res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener estadísticas de autenticación (solo admin)
   */
  async obtenerEstadisticas(_req: Request, res: Response) {
    try {
      const estadisticas = await authService.obtenerEstadisticasAuth();
      
      res.json(generarRespuestaExito(estadisticas, 'Estadísticas obtenidas exitosamente'));
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Desactivar usuario (solo admin)
   */
  async desactivarUsuario(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!req.usuario) {
        return res.status(401).json(generarRespuestaError('Usuario no autenticado', 401));
      }
      const adminId = req.usuario.id;
      
      await authService.desactivarUsuario(id!, adminId);
      
      return res.json(generarRespuestaExito({}, 'Usuario desactivado exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error desactivando usuario:', error);
        return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Activar usuario (solo admin)
   */
  async activarUsuario(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de usuario requerido', 400));
      }
      
      await authService.activarUsuario(id);
      
      return res.json(generarRespuestaExito({}, 'Usuario activado exitosamente'));
    } catch (error) {
      console.error('Error activando usuario:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Logout (invalidar token - para implementación futura)
   */
  async logout(_req: Request, res: Response) {
    try {
      // TODO: Implementar invalidación de token si se usa una lista negra
      
      res.json(generarRespuestaExito({}, 'Sesión cerrada exitosamente'));
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Refrescar token (para implementación futura)
   */
  async refrescarToken(req: Request, res: Response) {
    try {
      if (!req.usuario) {
        return res.status(401).json(generarRespuestaError('Usuario no autenticado', 401));
      }
      
      const userId = req.usuario.id;
      
      // Verificar que el usuario siga activo
      const verificacion = await authService.verificarToken(userId);
      
      if (!verificacion.valido || !verificacion.usuario) {
        return res.status(401).json(generarRespuestaError('Token inválido', 401));
      }

      // Generar nuevo token
      const resultado = await authService.login({
        email: verificacion.usuario.email,
        password: '' // No necesitamos verificar password para refresh
      });

      return res.json(generarRespuestaExito(resultado, 'Token refrescado exitosamente'));
    } catch (error) {
      console.error('Error refrescando token:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Generar token de recuperación
   */
  async generarTokenRecuperacion(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      const tokenInfo = await authService.generarTokenRecuperacion(email);
      
      // En producción, enviarías el token por email y no lo devolverías en la respuesta
      res.json(generarRespuestaExito(
        { 
          mensaje: 'Token de recuperación generado',
          // Solo para desarrollo - remover en producción
          token: tokenInfo.token,
          expira: tokenInfo.expira
        }, 
        'Token de recuperación enviado al email (simulado)'
      ));
    } catch (error) {
      if (error instanceof AutenticacionError) {
        res.status(404).json(generarRespuestaError(error.message, 404));
      } else {
        console.error('Error generando token de recuperación:', error);
        res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }
}

// Instancia del controlador
export const authController = new AuthController();
