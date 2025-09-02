import { Request, Response } from 'express';
import { actividadModel } from '../models';
import { generarRespuestaExito, generarRespuestaError } from '../utils/helpers';
import { ValidacionError, RecursoNoEncontradoError } from '../types';

/**
 * Controlador para gestión de actividades
 */
class ActividadController {
  /**
   * Listar actividades con filtros y paginación
   */
  async listar(req: Request, res: Response) {
    try {
      const { 
        pagina = 1, 
        limite = 10, 
        busqueda = '', 
        procesoId,
        activa 
      } = req.query;

      const filtros: any = {};
      if (procesoId) filtros.procesoId = procesoId;
      if (activa !== undefined) filtros.activa = activa === 'true';

      const filtrosBase: Record<string, any> = { ...filtros };
      if (busqueda) filtrosBase['busqueda'] = busqueda;

      const actividades = await actividadModel.buscarConFiltros(filtrosBase, Number(pagina), Number(limite));

      return res.json(generarRespuestaExito(actividades, 'Actividades obtenidas exitosamente'));
    } catch (error) {
      console.error('Error listando actividades:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Crear nueva actividad
   */
  async crear(req: Request, res: Response) {
    try {
      const actividad = await actividadModel.crearActividad(req.body);
      return res.status(201).json(generarRespuestaExito(actividad, 'Actividad creada exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error creando actividad:', error);
        return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Obtener actividad por ID
   */
  async obtenerPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de actividad requerido', 400));
      }

      const actividad = await actividadModel.buscarPorId(id);
      
      if (!actividad) {
        return res.status(404).json(generarRespuestaError('Actividad no encontrada', 404));
      }

      return res.json(generarRespuestaExito(actividad, 'Actividad obtenida exitosamente'));
    } catch (error) {
      console.error('Error obteniendo actividad:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener actividad con sus procedimientos
   */
  async obtenerConProcedimientos(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de actividad requerido', 400));
      }

      const actividad = await actividadModel.obtenerConProcedimientos(id);
      
      if (!actividad) {
        return res.status(404).json(generarRespuestaError('Actividad no encontrada', 404));
      }

      return res.json(generarRespuestaExito(actividad, 'Actividad con procedimientos obtenida exitosamente'));
    } catch (error) {
      console.error('Error obteniendo actividad con procedimientos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Actualizar actividad
   */
  async actualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de actividad requerido', 400));
      }

      const actividad = await actividadModel.actualizarActividad(id, req.body);
      
      if (!actividad) {
        return res.status(404).json(generarRespuestaError('Actividad no encontrada', 404));
      }

      return res.json(generarRespuestaExito(actividad, 'Actividad actualizada exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      } else if (error instanceof RecursoNoEncontradoError) {
        return res.status(404).json(generarRespuestaError(error.message, 404));
      } else {
        console.error('Error actualizando actividad:', error);
        return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Eliminar actividad (soft delete)
   */
  async eliminar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de actividad requerido', 400));
      }

      const eliminado = await actividadModel.eliminar(id);
      
      if (!eliminado) {
        return res.status(404).json(generarRespuestaError('Actividad no encontrada', 404));
      }

      return res.json(generarRespuestaExito({}, 'Actividad eliminada exitosamente'));
    } catch (error) {
      console.error('Error eliminando actividad:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Buscar actividades por proceso
   */
  async buscarPorProceso(req: Request, res: Response) {
    try {
      const { procesoId } = req.params;
      if (!procesoId) {
        return res.status(400).json(generarRespuestaError('ID de proceso requerido', 400));
      }

      const actividades = await actividadModel.buscarPorProceso(procesoId);
      return res.json(generarRespuestaExito(actividades, 'Actividades obtenidas exitosamente'));
    } catch (error) {
      console.error('Error buscando actividades por proceso:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Buscar actividad por código en proceso
   */
  async buscarPorCodigo(req: Request, res: Response) {
    try {
      const { procesoId, codigo } = req.params;
      if (!procesoId || !codigo) {
        return res.status(400).json(generarRespuestaError('ID de proceso y código requeridos', 400));
      }

      const actividad = await actividadModel.buscarPorCodigoEnProceso(procesoId, codigo);
      
      if (!actividad) {
        return res.status(404).json(generarRespuestaError('Actividad no encontrada', 404));
      }

      return res.json(generarRespuestaExito(actividad, 'Actividad encontrada exitosamente'));
    } catch (error) {
      console.error('Error buscando actividad por código:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Reordenar actividades
   */
  async reordenar(req: Request, res: Response) {
    try {
      const { ordenes } = req.body;
      
      if (!Array.isArray(ordenes)) {
        return res.status(400).json(generarRespuestaError('Los órdenes deben ser un array', 400));
      }

      await actividadModel.reordenar(ordenes[0]?.procesoId, ordenes);
      return res.json(generarRespuestaExito({}, 'Actividades reordenadas exitosamente'));
    } catch (error) {
      console.error('Error reordenando actividades:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Duplicar actividad
   */
  async duplicar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de actividad requerido', 400));
      }
      
      const { nuevoNombre, nuevoCodigo } = req.body;
      
      if (!nuevoNombre) {
        return res.status(400).json(generarRespuestaError('El nuevo nombre es requerido', 400));
      }

      const nuevaActividad = await actividadModel.duplicarActividad(id!, { nombre: nuevoNombre, codigo: nuevoCodigo });
      return res.status(201).json(generarRespuestaExito(nuevaActividad, 'Actividad duplicada exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error duplicando actividad:', error);
        return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Obtener estadísticas de actividades
   */
  async obtenerEstadisticas(_req: Request, res: Response) {
    try {
      const estadisticas = await actividadModel.obtenerEstadisticas();
      return res.json(generarRespuestaExito(estadisticas, 'Estadísticas obtenidas exitosamente'));
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }
}

// Instancia del controlador
export const actividadController = new ActividadController();
