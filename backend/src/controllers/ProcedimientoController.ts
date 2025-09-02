import { Request, Response } from 'express';
import { procedimientoModel } from '../models';
import { generarRespuestaExito, generarRespuestaError } from '../utils/helpers';
import { ValidacionError, RecursoNoEncontradoError } from '../types';

/**
 * Controlador para gestión de procedimientos
 */
class ProcedimientoController {
  /**
   * Listar procedimientos con filtros y paginación
   */
  async listar(req: Request, res: Response) {
    try {
      console.log('🔍 ProcedimientoController.listar() - Iniciando...');
      
      const { 
        pagina = 1, 
        limite = 10, 
        busqueda = '', 
        actividadId,
        nivelJerarquico,
        activo 
      } = req.query;

      console.log('📊 Filtros recibidos:', { pagina, limite, busqueda, actividadId, nivelJerarquico, activo });

      const filtros: any = {};
      if (actividadId) filtros.actividadId = actividadId;
      if (nivelJerarquico) filtros.nivelJerarquico = nivelJerarquico;
      if (activo !== undefined) filtros.activo = activo === 'true';

      const filtrosBase: Record<string, any> = { ...filtros };
      if (busqueda) filtrosBase['busqueda'] = busqueda;

      console.log('📊 Filtros procesados:', filtrosBase);

      const procedimientos = await procedimientoModel.buscarConFiltros(filtrosBase, Number(pagina), Number(limite));

      console.log('✅ Procedimientos obtenidos:', procedimientos);

      return res.json(generarRespuestaExito(procedimientos, 'Procedimientos obtenidos exitosamente'));
    } catch (error) {
      console.error('❌ Error listando procedimientos:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Crear nuevo procedimiento
   */
  async crear(req: Request, res: Response) {
    try {
      const procedimiento = await procedimientoModel.crearProcedimiento(req.body);
      return res.status(201).json(generarRespuestaExito(procedimiento, 'Procedimiento creado exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error creando procedimiento:', error);
        return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Obtener procedimiento por ID
   */
  async obtenerPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de procedimiento requerido', 400));
      }

      const procedimiento = await procedimientoModel.buscarPorId(id);
      
      if (!procedimiento) {
        return res.status(404).json(generarRespuestaError('Procedimiento no encontrado', 404));
      }

      return res.json(generarRespuestaExito(procedimiento, 'Procedimiento obtenido exitosamente'));
    } catch (error) {
      console.error('Error obteniendo procedimiento:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener procedimiento con sus tiempos
   */
  async obtenerConTiempos(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de procedimiento requerido', 400));
      }

      const procedimiento = await procedimientoModel.obtenerConTiempos(id);
      
      if (!procedimiento) {
        return res.status(404).json(generarRespuestaError('Procedimiento no encontrado', 404));
      }

      return res.json(generarRespuestaExito(procedimiento, 'Procedimiento con tiempos obtenido exitosamente'));
    } catch (error) {
      console.error('Error obteniendo procedimiento con tiempos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Actualizar procedimiento
   */
  async actualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de procedimiento requerido', 400));
      }

      const procedimiento = await procedimientoModel.actualizarProcedimiento(id, req.body);
      
      if (!procedimiento) {
        return res.status(404).json(generarRespuestaError('Procedimiento no encontrado', 404));
      }

      return res.json(generarRespuestaExito(procedimiento, 'Procedimiento actualizado exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      } else if (error instanceof RecursoNoEncontradoError) {
        return res.status(404).json(generarRespuestaError(error.message, 404));
      } else {
        console.error('Error actualizando procedimiento:', error);
        return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Eliminar procedimiento (soft delete)
   */
  async eliminar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de procedimiento requerido', 400));
      }

      const eliminado = await procedimientoModel.eliminar(id);
      
      if (!eliminado) {
        return res.status(404).json(generarRespuestaError('Procedimiento no encontrado', 404));
      }

      return res.json(generarRespuestaExito({}, 'Procedimiento eliminado exitosamente'));
    } catch (error) {
      console.error('Error eliminando procedimiento:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Buscar procedimientos por actividad
   */
  async buscarPorActividad(req: Request, res: Response) {
    try {
      const { actividadId } = req.params;
      if (!actividadId) {
        return res.status(400).json(generarRespuestaError('ID de actividad requerido', 400));
      }

      const procedimientos = await procedimientoModel.buscarPorActividad(actividadId);
      return res.json(generarRespuestaExito(procedimientos, 'Procedimientos obtenidos exitosamente'));
    } catch (error) {
      console.error('Error buscando procedimientos por actividad:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Buscar procedimiento por código en actividad
   */
  async buscarPorCodigo(req: Request, res: Response) {
    try {
      const { actividadId, codigo } = req.params;
      if (!actividadId || !codigo) {
        return res.status(400).json(generarRespuestaError('ID de actividad y código requeridos', 400));
      }

      const procedimiento = await procedimientoModel.buscarPorCodigoEnActividad(actividadId, codigo);
      
      if (!procedimiento) {
        return res.status(404).json(generarRespuestaError('Procedimiento no encontrado', 404));
      }

      return res.json(generarRespuestaExito(procedimiento, 'Procedimiento encontrado exitosamente'));
    } catch (error) {
      console.error('Error buscando procedimiento por código:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Buscar procedimientos por nivel jerárquico
   */
  async buscarPorNivel(req: Request, res: Response) {
    try {
      const { nivel } = req.params;
      if (!nivel) {
        return res.status(400).json(generarRespuestaError('Nivel jerárquico requerido', 400));
      }

      const procedimientos = await procedimientoModel.buscarPorNivelJerarquico(nivel as any);
      return res.json(generarRespuestaExito(procedimientos, 'Procedimientos obtenidos exitosamente'));
    } catch (error) {
      console.error('Error buscando procedimientos por nivel:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Reordenar procedimientos
   */
  async reordenar(req: Request, res: Response) {
    try {
      const { ordenes } = req.body;
      
      if (!Array.isArray(ordenes)) {
        return res.status(400).json(generarRespuestaError('Los órdenes deben ser un array', 400));
      }

      await procedimientoModel.reordenar(ordenes[0]?.actividadId, ordenes);
      return res.json(generarRespuestaExito({}, 'Procedimientos reordenados exitosamente'));
    } catch (error) {
      console.error('Error reordenando procedimientos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Duplicar procedimiento
   */
  async duplicar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de procedimiento requerido', 400));
      }
      
      const { nuevoNombre } = req.body;
      
      if (!nuevoNombre) {
        return res.status(400).json(generarRespuestaError('El nuevo nombre es requerido', 400));
      }

      const nuevoProcedimiento = await procedimientoModel.duplicarProcedimiento(id!, { nombre: nuevoNombre });
      return res.status(201).json(generarRespuestaExito(nuevoProcedimiento, 'Procedimiento duplicado exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error duplicando procedimiento:', error);
        return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Obtener estadísticas de procedimientos
   */
  async obtenerEstadisticas(_req: Request, res: Response) {
    try {
      const estadisticas = await procedimientoModel.obtenerEstadisticas();
      return res.json(generarRespuestaExito(estadisticas, 'Estadísticas obtenidas exitosamente'));
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }
}

// Instancia del controlador
export const procedimientoController = new ProcedimientoController();
