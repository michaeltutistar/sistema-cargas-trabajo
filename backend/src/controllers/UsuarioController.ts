import { Request, Response } from 'express';
import { UsuarioModel } from '../models/Usuario';
import { generarRespuestaExito, generarRespuestaError } from '../utils/helpers';
import { ValidacionError } from '../types';

export class UsuarioController {
  private usuarioModel = new UsuarioModel();

  /**
   * Obtener todos los usuarios con paginación y filtros
   */
  async obtenerUsuarios(req: Request, res: Response): Promise<void> {
    try {
      const { 
        pagina = 1, 
        limite = 10, 
        rol, 
        activo, 
        busqueda 
      } = req.query;

      const filtros: any = {};
      if (rol) filtros.rol = rol;
      if (activo !== undefined) filtros.activo = activo === 'true';
      if (busqueda) filtros.busqueda = busqueda;

      const resultado = await this.usuarioModel.buscarConFiltros(
        filtros,
        parseInt(pagina as string),
        parseInt(limite as string)
      );

      res.json(generarRespuestaExito(resultado, 'Usuarios obtenidos exitosamente'));
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener un usuario por ID
   */
  async obtenerUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json(generarRespuestaError('ID de usuario requerido', 400));
        return;
      }

      const usuario = await this.usuarioModel.buscarPorId(id);

      if (!usuario) {
        res.status(404).json(generarRespuestaError('Usuario no encontrado', 404));
        return;
      }

      res.json(generarRespuestaExito(usuario, 'Usuario obtenido exitosamente'));
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Crear un nuevo usuario
   */
  async crearUsuario(req: Request, res: Response): Promise<void> {
    try {
      const datosUsuario = req.body;
      const usuario = await this.usuarioModel.crearUsuario(datosUsuario);

      res.status(201).json(generarRespuestaExito(usuario, 'Usuario creado exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error creando usuario:', error);
        res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Actualizar un usuario existente
   */
  async actualizarUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json(generarRespuestaError('ID de usuario requerido', 400));
        return;
      }

      const datosActualizacion = req.body;

      // Remover campos que no se pueden actualizar
      const { password, ...datosPermitidos } = datosActualizacion;

      const usuario = await this.usuarioModel.actualizar(id, datosPermitidos);

      res.json(generarRespuestaExito(usuario, 'Usuario actualizado exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error actualizando usuario:', error);
        res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Cambiar contraseña de un usuario
   */
  async cambiarPassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { passwordActual, passwordNueva } = req.body;

      if (!id) {
        res.status(400).json(generarRespuestaError('ID de usuario requerido', 400));
        return;
      }

      if (!passwordActual || !passwordNueva) {
        res.status(400).json(generarRespuestaError('La contraseña actual y nueva son requeridas', 400));
        return;
      }

      await this.usuarioModel.cambiarPassword(id, passwordActual, passwordNueva);

      res.json(generarRespuestaExito(null, 'Contraseña cambiada exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Cambiar rol de un usuario
   */
  async cambiarRol(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rol } = req.body;

      if (!id) {
        res.status(400).json(generarRespuestaError('ID de usuario requerido', 400));
        return;
      }

      if (!rol) {
        res.status(400).json(generarRespuestaError('El rol es requerido', 400));
        return;
      }

      const usuario = await this.usuarioModel.cambiarRol(id, rol);

      res.json(generarRespuestaExito(usuario, 'Rol cambiado exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error cambiando rol:', error);
        res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Activar/desactivar usuario
   */
  async cambiarEstado(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { activo } = req.body;

      if (!id) {
        res.status(400).json(generarRespuestaError('ID de usuario requerido', 400));
        return;
      }

      if (typeof activo !== 'boolean') {
        res.status(400).json(generarRespuestaError('El estado debe ser true o false', 400));
        return;
      }

      const usuario = await this.usuarioModel.cambiarEstado(id, activo);

      res.json(generarRespuestaExito(usuario, `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`));
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error);
      res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Eliminar un usuario
   */
  async eliminarUsuario(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json(generarRespuestaError('ID de usuario requerido', 400));
        return;
      }

      await this.usuarioModel.eliminar(id);

      res.json(generarRespuestaExito(null, 'Usuario eliminado exitosamente'));
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async obtenerEstadisticas(_req: Request, res: Response): Promise<void> {
    try {
      const estadisticas = await this.usuarioModel.obtenerEstadisticasUsuarios();

      res.json(generarRespuestaExito(estadisticas, 'Estadísticas obtenidas exitosamente'));
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }
} 