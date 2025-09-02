import { Request, Response } from 'express';
import { empleoModel } from '../models';
import { generarRespuestaExito, generarRespuestaError } from '../utils/helpers';
import { ValidacionError, RecursoNoEncontradoError } from '../types';

/**
 * Controlador para gestión de empleos
 */
class EmpleoController {
  /**
   * Listar empleos con filtros y paginación
   */
  async listar(req: Request, res: Response) {
    try {
      const { 
        pagina = 1, 
        limite = 10, 
        busqueda = '', 
        nivelJerarquico,
        grado,
        activo 
      } = req.query;

      const filtros: any = {};
      if (nivelJerarquico) filtros.nivelJerarquico = nivelJerarquico;
      if (grado) filtros.grado = Number(grado);
      if (activo !== undefined) filtros.activo = activo === 'true';

      const filtrosBase: Record<string, any> = { ...filtros };
      if (busqueda) filtrosBase['busqueda'] = busqueda;

      const empleos = await empleoModel.buscarConFiltros(filtrosBase, Number(pagina), Number(limite));

      return res.json(generarRespuestaExito(empleos, 'Empleos obtenidos exitosamente'));
    } catch (error) {
      console.error('Error listando empleos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Crear nuevo empleo
   */
  async crear(req: Request, res: Response) {
    try {
      const empleo = await empleoModel.crearEmpleo(req.body);
      return res.status(201).json(generarRespuestaExito(empleo, 'Empleo creado exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error creando empleo:', error);
        return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Obtener empleo por ID
   */
  async obtenerPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de empleo requerido', 400));
      }

      const empleo = await empleoModel.buscarPorId(id);
      
      if (!empleo) {
        return res.status(404).json(generarRespuestaError('Empleo no encontrado', 404));
      }

      return res.json(generarRespuestaExito(empleo, 'Empleo obtenido exitosamente'));
    } catch (error) {
      console.error('Error obteniendo empleo:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener empleo con sus tiempos asociados
   */
  async obtenerConTiempos(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de empleo requerido', 400));
      }

      const empleo = await empleoModel.obtenerConTiempos(id);
      
      if (!empleo) {
        return res.status(404).json(generarRespuestaError('Empleo no encontrado', 404));
      }

      return res.json(generarRespuestaExito(empleo, 'Empleo con tiempos obtenido exitosamente'));
    } catch (error) {
      console.error('Error obteniendo empleo con tiempos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Actualizar empleo
   */
  async actualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de empleo requerido', 400));
      }

      const empleo = await empleoModel.actualizar(id, req.body);
      
      if (!empleo) {
        return res.status(404).json(generarRespuestaError('Empleo no encontrado', 404));
      }

      return res.json(generarRespuestaExito(empleo, 'Empleo actualizado exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      } else if (error instanceof RecursoNoEncontradoError) {
        return res.status(404).json(generarRespuestaError(error.message, 404));
      } else {
        console.error('Error actualizando empleo:', error);
        return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Eliminar empleo (soft delete)
   */
  async eliminar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de empleo requerido', 400));
      }

      const eliminado = await empleoModel.eliminar(id);
      
      if (!eliminado) {
        return res.status(404).json(generarRespuestaError('Empleo no encontrado', 404));
      }

      return res.json(generarRespuestaExito({}, 'Empleo eliminado exitosamente'));
    } catch (error) {
      console.error('Error eliminando empleo:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Buscar empleo por código
   */
  async buscarPorCodigo(req: Request, res: Response) {
    try {
      const { codigo } = req.params;
      if (!codigo) {
        return res.status(400).json(generarRespuestaError('Código de empleo requerido', 400));
      }

      const empleo = await empleoModel.buscarPorCodigo(codigo);
      
      if (!empleo) {
        return res.status(404).json(generarRespuestaError('Empleo no encontrado', 404));
      }

      return res.json(generarRespuestaExito(empleo, 'Empleo encontrado exitosamente'));
    } catch (error) {
      console.error('Error buscando empleo por código:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Buscar empleos por nivel jerárquico
   */
  async buscarPorNivel(req: Request, res: Response) {
    try {
      const { nivel } = req.params;
      if (!nivel) {
        return res.status(400).json(generarRespuestaError('Nivel jerárquico requerido', 400));
      }

      const empleos = await empleoModel.buscarPorNivelJerarquico(nivel as any);
      return res.json(generarRespuestaExito(empleos, 'Empleos obtenidos exitosamente'));
    } catch (error) {
      console.error('Error buscando empleos por nivel:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Buscar empleos por grado
   */
  async buscarPorGrado(req: Request, res: Response) {
    try {
      const { grado } = req.params;
      if (!grado) {
        return res.status(400).json(generarRespuestaError('Grado requerido', 400));
      }

      const empleos = await empleoModel.buscarPorGrado(Number(grado));
      return res.json(generarRespuestaExito(empleos, 'Empleos obtenidos exitosamente'));
    } catch (error) {
      console.error('Error buscando empleos por grado:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Listar empleos activos
   */
  async listarActivos(_req: Request, res: Response) {
    try {
      const empleos = await empleoModel.buscarActivos();
      return res.json(generarRespuestaExito(empleos, 'Empleos activos obtenidos exitosamente'));
    } catch (error) {
      console.error('Error listando empleos activos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Duplicar empleo
   */
  async duplicar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de empleo requerido', 400));
      }
      
      const { nuevaDenominacion, nuevoCodigo } = req.body;
      
      if (!nuevaDenominacion) {
        return res.status(400).json(generarRespuestaError('La nueva denominación es requerida', 400));
      }

      const nuevoEmpleo = await empleoModel.duplicarEmpleo(id!, { denominacion: nuevaDenominacion, codigo: nuevoCodigo });
      return res.status(201).json(generarRespuestaExito(nuevoEmpleo, 'Empleo duplicado exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      } else {
        console.error('Error duplicando empleo:', error);
        return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Obtener estadísticas de empleos
   */
  async obtenerEstadisticas(_req: Request, res: Response) {
    try {
      const estadisticas = await empleoModel.obtenerEstadisticas();
      return res.json(generarRespuestaExito(estadisticas, 'Estadísticas obtenidas exitosamente'));
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Exportar empleos a CSV
   */
  async exportar(_req: Request, res: Response) {
    try {
      const empleos = await empleoModel.buscarActivos();
      const csv = this.convertirACSV(empleos);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="empleos.csv"');
      return res.send(csv);
    } catch (error) {
      console.error('Error exportando empleos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Importar empleos desde CSV
   */
  async importar(req: Request, res: Response) {
    try {
      const { empleos } = req.body;
      
      if (!Array.isArray(empleos)) {
        return res.status(400).json(generarRespuestaError('Los datos deben ser un array', 400));
      }

      const resultados = {
        creados: 0,
        errores: [] as string[]
      };

      for (const [index, empleoData] of empleos.entries()) {
        try {
          await empleoModel.crearEmpleo(empleoData);
          resultados.creados++;
        } catch (error) {
          resultados.errores.push(`Fila ${index + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      return res.json(generarRespuestaExito(resultados, 'Importación completada'));
    } catch (error) {
      console.error('Error importando empleos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Convertir empleos a formato CSV
   */
  private convertirACSV(empleos: any[]): string {
    if (empleos.length === 0) {
      return 'ID,Denominación,Código,Nivel Jerárquico,Grado,Descripción,Activo,Fecha Creación';
    }

    const headers = ['ID', 'Denominación', 'Código', 'Nivel Jerárquico', 'Grado', 'Descripción', 'Activo', 'Fecha Creación'].join(',');
    
    const filas = empleos.map(emp => [
      emp.id,
      `"${emp.denominacion}"`,
      `"${emp.codigo}"`,
      `"${emp.nivelJerarquico}"`,
      emp.grado,
      `"${emp.descripcion || ''}"`,
      emp.activo ? 'Sí' : 'No',
      new Date(emp.fechaCreacion).toLocaleDateString()
    ].join(','));

    return [headers, ...filas].join('\n');
  }
}

// Instancia del controlador
export const empleoController = new EmpleoController();
