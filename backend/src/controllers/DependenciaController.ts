import { Request, Response } from 'express';
import { dependenciaModel } from '../models';
import { generarRespuestaExito, generarRespuestaError } from '../utils/helpers';
import { ValidacionError, RecursoNoEncontradoError } from '../types';

export class DependenciaController {
  /**
   * Crear nueva dependencia
   */
  async crear(req: Request, res: Response) {
    try {
      const datosDependencia = req.body;
      
      const dependencia = await dependenciaModel.crearDependencia(datosDependencia);
      
      res.status(201).json(generarRespuestaExito(dependencia, 'Dependencia creada exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error creando dependencia:', error);
        res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Obtener dependencia por ID
   */
  async obtenerPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de dependencia requerido', 400));
      }
      
      const dependencia = await dependenciaModel.buscarPorId(id);
      
      if (!dependencia) {
        return res.status(404).json(generarRespuestaError('Dependencia no encontrada', 404));
      }
      
      return res.json(generarRespuestaExito(dependencia, 'Dependencia obtenida exitosamente'));
    } catch (error) {
      console.error('Error obteniendo dependencia:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener dependencia con sus procesos
   */
  async obtenerConProcesos(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de dependencia requerido', 400));
      }
      
      const dependencia = await dependenciaModel.obtenerConProcesos(id);
      
      if (!dependencia) {
        return res.status(404).json(generarRespuestaError('Dependencia no encontrada', 404));
      }
      
      return res.json(generarRespuestaExito(dependencia, 'Dependencia con procesos obtenida exitosamente'));
    } catch (error) {
      console.error('Error obteniendo dependencia con procesos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Listar dependencias con filtros
   */
  async listar(req: Request, res: Response) {
    try {
      const {
        activa,
        busqueda,
        pagina = 1,
        limite = 10
      } = req.query;

      const filtros: any = {};
      if (activa !== undefined) filtros.activa = activa === 'true';
      if (busqueda) filtros.busqueda = busqueda as string;

      const resultado = await dependenciaModel.buscarConFiltros(
        filtros,
        parseInt(pagina as string),
        parseInt(limite as string)
      );
      
      res.json(generarRespuestaExito(resultado, 'Dependencias obtenidas exitosamente'));
    } catch (error) {
      console.error('Error listando dependencias:', error);
      res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Listar dependencias activas (sin paginación)
   */
  async listarActivas(_req: Request, res: Response) {
    try {
      const dependencias = await dependenciaModel.buscarActivas();
      
      res.json(generarRespuestaExito(dependencias, 'Dependencias activas obtenidas exitosamente'));
    } catch (error) {
      console.error('Error listando dependencias activas:', error);
      res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Actualizar dependencia
   */
  async actualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const datosActualizacion = req.body;
      
      const dependenciaActualizada = await dependenciaModel.actualizarDependencia(
        id!, 
        datosActualizacion
      );
      
      res.json(generarRespuestaExito(dependenciaActualizada, 'Dependencia actualizada exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        res.status(400).json(generarRespuestaError(error.message, 400));
      } else if (error instanceof RecursoNoEncontradoError) {
        res.status(404).json(generarRespuestaError(error.message, 404));
      } else {
        console.error('Error actualizando dependencia:', error);
        res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Eliminar dependencia (soft delete)
   */
  async eliminar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de dependencia requerido', 400));
      }
      
      // Verificar si se puede eliminar
      const puedeEliminar = await dependenciaModel.puedeEliminar(id);
      
      if (!puedeEliminar.puede) {
        return res.status(400).json(generarRespuestaError(puedeEliminar.motivo!, 400));
      }
      
      const eliminado = await dependenciaModel.eliminar(id);
      
      if (!eliminado) {
        return res.status(404).json(generarRespuestaError('Dependencia no encontrada', 404));
      }
      
      return res.json(generarRespuestaExito({}, 'Dependencia eliminada exitosamente'));
    } catch (error) {
      console.error('Error eliminando dependencia:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Restaurar dependencia eliminada
   */
  async restaurar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de dependencia requerido', 400));
      }
      
      const restaurado = await dependenciaModel.restaurar(id);
      
      if (!restaurado) {
        return res.status(404).json(generarRespuestaError('Dependencia no encontrada', 404));
      }
      
      return res.json(generarRespuestaExito({}, 'Dependencia restaurada exitosamente'));
    } catch (error) {
      console.error('Error restaurando dependencia:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Buscar dependencia por código
   */
  async buscarPorCodigo(req: Request, res: Response) {
    try {
      const { codigo } = req.params;
      if (!codigo) {
        return res.status(400).json(generarRespuestaError('Código de dependencia requerido', 400));
      }
      
      const dependencia = await dependenciaModel.buscarPorCodigo(codigo);
      
      if (!dependencia) {
        return res.status(404).json(generarRespuestaError('Dependencia no encontrada', 404));
      }
      
      return res.json(generarRespuestaExito(dependencia, 'Dependencia encontrada exitosamente'));
    } catch (error) {
      console.error('Error buscando dependencia por código:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener estadísticas de dependencias
   */
  async obtenerEstadisticas(_req: Request, res: Response) {
    try {
      const estadisticas = await dependenciaModel.obtenerEstadisticas();
      
      res.json(generarRespuestaExito(estadisticas, 'Estadísticas obtenidas exitosamente'));
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener ranking de dependencias por procesos
   */
  async obtenerRanking(req: Request, res: Response) {
    try {
      const { limite = 10 } = req.query;
      
      const ranking = await dependenciaModel.obtenerRankingPorProcesos(parseInt(limite as string));
      
      res.json(generarRespuestaExito(ranking, 'Ranking obtenido exitosamente'));
    } catch (error) {
      console.error('Error obteniendo ranking:', error);
      res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Duplicar dependencia
   */
  async duplicar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de dependencia requerido', 400));
      }
      
      const { nuevoNombre, nuevoCodigo } = req.body;
      
      if (!nuevoNombre) {
        return res.status(400).json(generarRespuestaError('El nuevo nombre es requerido', 400));
      }
      
      const nuevaDependencia = await dependenciaModel.duplicarDependencia(
        id,
        nuevoNombre,
        nuevoCodigo
      );
      
      return res.status(201).json(generarRespuestaExito(nuevaDependencia, 'Dependencia duplicada exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error duplicando dependencia:', error);
        return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Verificar si se puede eliminar
   */
  async verificarEliminacion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const resultado = await dependenciaModel.puedeEliminar(id!);
      
      res.json(generarRespuestaExito(resultado, 'Verificación completada'));
    } catch (error) {
      console.error('Error verificando eliminación:', error);
      res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Exportar dependencias
   */
  async exportar(req: Request, res: Response) {
    try {
      const { formato = 'json', activa } = req.query;
      
      const filtros: any = {};
      if (activa !== undefined) filtros.activa = activa === 'true';
      
      const dependencias = await dependenciaModel.buscarTodos(filtros);
      
      if (formato === 'json') {
        res.json(generarRespuestaExito(dependencias, 'Dependencias exportadas exitosamente'));
      } else if (formato === 'csv') {
        const csvData = this.convertirACSV(dependencias);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=dependencias.csv');
        res.send(csvData);
      } else {
        res.status(400).json(generarRespuestaError('Formato no soportado', 400));
      }
    } catch (error) {
      console.error('Error exportando dependencias:', error);
      res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Convertir dependencias a CSV
   */
  private convertirACSV(dependencias: any[]): string {
    if (dependencias.length === 0) return '';

    const headers = ['ID', 'Nombre', 'Código', 'Descripción', 'Activa', 'Fecha Creación'].join(',');
    
    const filas = dependencias.map(dep => [
      dep.id,
      `"${dep.nombre}"`,
      `"${dep.codigo}"`,
      `"${dep.descripcion || ''}"`,
      dep.activa ? 'Sí' : 'No',
      new Date(dep.fechaCreacion).toLocaleDateString()
    ].join(','));

    return [headers, ...filas].join('\n');
  }

  /**
   * Importar dependencias desde CSV
   */
  async importar(req: Request, res: Response) {
    try {
      const { dependencias } = req.body;
      
      if (!Array.isArray(dependencias)) {
        return res.status(400).json(generarRespuestaError('Los datos deben ser un array', 400));
      }
      
      const resultados = {
        creadas: 0,
        errores: [] as string[]
      };
      
      for (const [index, depData] of dependencias.entries()) {
        try {
          await dependenciaModel.crearDependencia(depData);
          resultados.creadas++;
        } catch (error) {
          resultados.errores.push(`Fila ${index + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }
      
      return res.json(generarRespuestaExito(resultados, 'Importación completada'));
    } catch (error) {
      console.error('Error importando dependencias:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }
}

// Instancia del controlador
export const dependenciaController = new DependenciaController();
