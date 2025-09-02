import { Request, Response } from 'express';
import { procesoModel } from '../models';
import { generarRespuestaExito, generarRespuestaError } from '../utils/helpers';
import { ValidacionError, RecursoNoEncontradoError } from '../types';

/**
 * Controlador para gestión de procesos
 */
class ProcesoController {
  /**
   * Listar procesos con filtros y paginación
   */
  async listar(req: Request, res: Response) {
    try {
      const { 
        pagina = 1, 
        limite = 10, 
        busqueda = '', 
        dependenciaId,
        activo 
      } = req.query;

      const filtros: any = {};
      if (dependenciaId) filtros.dependenciaId = dependenciaId;
      if (activo !== undefined) filtros.activo = activo === 'true';

      const filtrosBase: Record<string, any> = { ...filtros };
      if (busqueda) filtrosBase['busqueda'] = busqueda;

      const procesos = await procesoModel.buscarConFiltros(filtrosBase, Number(pagina), Number(limite));

      return res.json(generarRespuestaExito(procesos, 'Procesos obtenidos exitosamente'));
    } catch (error) {
      console.error('Error listando procesos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Crear nuevo proceso
   */
  async crear(req: Request, res: Response) {
    try {
      const proceso = await procesoModel.crearProceso(req.body);
      return res.status(201).json(generarRespuestaExito(proceso, 'Proceso creado exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error creando proceso:', error);
        return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Obtener proceso por ID
   */
  async obtenerPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de proceso requerido', 400));
      }

      const proceso = await procesoModel.buscarPorId(id);
      
      if (!proceso) {
        return res.status(404).json(generarRespuestaError('Proceso no encontrado', 404));
      }

      return res.json(generarRespuestaExito(proceso, 'Proceso obtenido exitosamente'));
    } catch (error) {
      console.error('Error obteniendo proceso:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener proceso con sus actividades
   */
  async obtenerConActividades(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de proceso requerido', 400));
      }

      const proceso = await procesoModel.obtenerConActividades(id);
      
      if (!proceso) {
        return res.status(404).json(generarRespuestaError('Proceso no encontrado', 404));
      }

      return res.json(generarRespuestaExito(proceso, 'Proceso con actividades obtenido exitosamente'));
    } catch (error) {
      console.error('Error obteniendo proceso con actividades:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Actualizar proceso
   */
  async actualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de proceso requerido', 400));
      }

      const proceso = await procesoModel.actualizarProceso(id, req.body);
      
      if (!proceso) {
        return res.status(404).json(generarRespuestaError('Proceso no encontrado', 404));
      }

      return res.json(generarRespuestaExito(proceso, 'Proceso actualizado exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      } else if (error instanceof RecursoNoEncontradoError) {
        return res.status(404).json(generarRespuestaError(error.message, 404));
      } else {
        console.error('Error actualizando proceso:', error);
        return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Eliminar proceso (soft delete)
   */
  async eliminar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de proceso requerido', 400));
      }

      const eliminado = await procesoModel.eliminar(id);
      
      if (!eliminado) {
        return res.status(404).json(generarRespuestaError('Proceso no encontrado', 404));
      }

      return res.json(generarRespuestaExito({}, 'Proceso eliminado exitosamente'));
    } catch (error) {
      console.error('Error eliminando proceso:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Buscar procesos por dependencia
   */
  async buscarPorDependencia(req: Request, res: Response) {
    try {
      const { dependenciaId } = req.params;
      if (!dependenciaId) {
        return res.status(400).json(generarRespuestaError('ID de dependencia requerido', 400));
      }

      const procesos = await procesoModel.buscarPorDependencia(dependenciaId);
      return res.json(generarRespuestaExito(procesos, 'Procesos obtenidos exitosamente'));
    } catch (error) {
      console.error('Error buscando procesos por dependencia:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Buscar proceso por código en dependencia
   */
  async buscarPorCodigo(req: Request, res: Response) {
    try {
      const { dependenciaId, codigo } = req.params;
      if (!dependenciaId || !codigo) {
        return res.status(400).json(generarRespuestaError('ID de dependencia y código requeridos', 400));
      }

      const proceso = await procesoModel.buscarPorCodigoEnDependencia(dependenciaId, codigo);
      
      if (!proceso) {
        return res.status(404).json(generarRespuestaError('Proceso no encontrado', 404));
      }

      return res.json(generarRespuestaExito(proceso, 'Proceso encontrado exitosamente'));
    } catch (error) {
      console.error('Error buscando proceso por código:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Reordenar procesos
   */
  async reordenar(req: Request, res: Response) {
    try {
      const { ordenes } = req.body;
      
      if (!Array.isArray(ordenes)) {
        return res.status(400).json(generarRespuestaError('Los órdenes deben ser un array', 400));
      }

      await procesoModel.reordenar(ordenes[0]?.dependenciaId, ordenes);
      return res.json(generarRespuestaExito({}, 'Procesos reordenados exitosamente'));
    } catch (error) {
      console.error('Error reordenando procesos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Duplicar proceso
   */
  async duplicar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de proceso requerido', 400));
      }
      
      const { nuevoNombre, nuevoCodigo } = req.body;
      
      if (!nuevoNombre) {
        return res.status(400).json(generarRespuestaError('El nuevo nombre es requerido', 400));
      }

      const nuevoProceso = await procesoModel.duplicarProceso(id!, { nombre: nuevoNombre, codigo: nuevoCodigo });
      return res.status(201).json(generarRespuestaExito(nuevoProceso, 'Proceso duplicado exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error duplicando proceso:', error);
        return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Obtener estadísticas de procesos
   */
  async obtenerEstadisticas(_req: Request, res: Response) {
    try {
      const estadisticas = await procesoModel.obtenerEstadisticas();
      return res.json(generarRespuestaExito(estadisticas, 'Estadísticas obtenidas exitosamente'));
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }
}

// Instancia del controlador
export const procesoController = new ProcesoController();
