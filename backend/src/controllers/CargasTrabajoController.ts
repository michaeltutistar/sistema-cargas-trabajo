import { Request, Response } from 'express';
// import { cargasTrabajoService } from '../services';
import { tiempoProcedimientoModel } from '../models';
import { generarRespuestaExito, generarRespuestaError } from '../utils/helpers';
import { ValidacionError, RecursoNoEncontradoError } from '../types';

export class CargasTrabajoController {
  // MÉTODOS TEMPORALMENTE DESHABILITADOS - DEPENDEN DEL SERVICIO ELIMINADO
  /*
  // Generar reporte de cargas por dependencia
  // async generarReportePorDependencia(req: Request, res: Response) {
  //   try {
  //     const { dependenciaId } = req.params;
  //     if (!dependenciaId) {
  //       return res.status(400).json(generarRespuestaError('ID de dependencia requerido', 400));
  //     }
  //     
  //     const reporte = await cargasTrabajoService.generarReportePorDependencia(dependenciaId);
  //     
  //     return res.json(generarRespuestaExito(reporte, 'Reporte generado exitosamente'));
  //   } catch (error) {
  //     if (error instanceof RecursoNoEncontradoError) {
  //       return res.status(404).json(generarRespuestaError(error.message, 404));
  //     } else {
  //       console.error('Error generando reporte:', error);
  //       return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
  //     }
  //   }
  // }

  // Generar resumen de empleos necesarios
  // async generarResumenEmpleos(req: Request, res: Response) {
  //   try {
  //     const { dependenciaId } = req.query;
  //     
  //     const resumen = await cargasTrabajoService.generarResumenEmpleos(
  //       dependenciaId as string
  //     );
  //     
  //     res.json(generarRespuestaExito(resumen, 'Resumen de empleos generado exitosamente'));
  //   } catch (error) {
  //     console.error('Error generando resumen de empleos:', error);
  //     res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
  //   }
  // }

  // Calcular cargas consolidadas
  // async calcularCargasConsolidadas(req: Request, res: Response) {
  //   try {
  //     const { dependenciaId, procesoId, nivelJerarquico } = req.query;
  //     
  //     const cargas = await cargasTrabajoService.calcularCargasConsolidadas({
  //       dependenciaId: dependenciaId as string,
  //       procesoId: procesoId as string,
  //       nivelJerarquico: nivelJerarquico as any
  //     });
  //     
  //     res.json(generarRespuestaExito(cargas, 'Cargas consolidadas calculadas exitosamente'));
  //   } catch (error) {
  //     console.error('Error calculando cargas consolidadas:', error);
  //     res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
  //   }
  // }

  // Obtener estadísticas generales del sistema
  // async obtenerEstadisticasGenerales(_req: Request, res: Response) {
  //   try {
  //     const estadisticas = await cargasTrabajoService.obtenerEstadisticasGenerales();
  //     
  //     res.json(generarRespuestaExito(estadisticas, 'Estadísticas obtenidas exitosamente'));
  //   } catch (error) {
  //     console.error('Error obteniendo estadísticas:', error);
  //     res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
  //   }
  // }

  // Analizar eficiencia por nivel jerárquico
  // async analizarEficienciaPorNivel(_req: Request, res: Response) {
  //   try {
  //     const analisis = await cargasTrabajoService.analizarEficienciaPorNivel();
  //     
  //     res.json(generarRespuestaExito(analisis, 'Análisis de eficiencia completado'));
  //   } catch (error) {
  //     console.error('Error analizando eficiencia:', error);
  //     res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
  //   }
  // }

  // Generar reporte de brechas
  // async generarReporteBrechas(_req: Request, res: Response) {
  //   try {
  //     const reporte = await cargasTrabajoService.generarReporteBrechas();
  //     
  //     res.json(generarRespuestaExito(reporte, 'Reporte de brechas generado exitosamente'));
  //   } catch (error) {
  //     console.error('Error generando reporte de brechas:', error);
  //     res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
  //   }
  // }

  // Simular escenarios de cargas
  // async simularEscenario(req: Request, res: Response) {
  //   try {
  //     const { 
  //       frecuenciaMultiplicador, 
  //       tiempoMultiplicador, 
  //       procedimientosExcluidos 
  //     } = req.body;
  //     
  //     const simulacion = await cargasTrabajoService.simularEscenario({
  //       frecuenciaMultiplicador,
  //       tiempoMultiplicador,
  //       procedimientosExcluidos
  //     });
  //     
  //     res.json(generarRespuestaExito(simulacion, 'Simulación completada exitosamente'));
  //   } catch (error) {
  //     console.error('Error en simulación:', error);
  //     res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
  //   }
  // }
  */

  /**
   * Crear tiempo de procedimiento
   */
  async crearTiempoProcedimiento(req: Request, res: Response) {
    try {
      console.log('🔍 CargasTrabajoController.crearTiempoProcedimiento() - Iniciando...');
      console.log('📊 Datos recibidos:', req.body);
      console.log('📊 estructuraId en req.body:', req.body.estructuraId);
      console.log('📊 estructuraId tipo:', typeof req.body.estructuraId);
      
      const datosTiempo = req.body;
      
      console.log('📊 datosTiempo:', datosTiempo);
      
      // Obtener el ID del usuario autenticado
      const usuarioId = (req as any).usuario?.id;
      
      console.log('👤 Usuario autenticado:', (req as any).usuario);
      console.log('🆔 Usuario ID:', usuarioId);
      
      if (!usuarioId) {
        console.error('❌ No se pudo obtener el ID del usuario autenticado');
        return res.status(401).json(generarRespuestaError('Usuario no autenticado', 401));
      }
      
      const tiempo = await tiempoProcedimientoModel.crearTiempoProcedimiento(datosTiempo, usuarioId);
      
      console.log('✅ Tiempo creado:', tiempo);
      
      return res.status(201).json(generarRespuestaExito(tiempo, 'Tiempo de procedimiento creado exitosamente'));
    } catch (error) {
      console.error('❌ Error creando tiempo de procedimiento:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
      
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      } else if (error instanceof RecursoNoEncontradoError) {
        return res.status(404).json(generarRespuestaError(error.message, 404));
      } else {
        return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Crear múltiples tiempos de procedimiento
   */
  async crearMultiplesTiemposProcedimiento(req: Request, res: Response) {
    try {
      console.log('🔍 CargasTrabajoController.crearMultiplesTiemposProcedimiento() - Iniciando...');
      console.log('📊 Datos recibidos:', req.body);
      
      const { tiempos } = req.body;
      
      if (!Array.isArray(tiempos) || tiempos.length === 0) {
        return res.status(400).json(generarRespuestaError('Se requiere un array de tiempos válido', 400));
      }
      
      console.log(`📊 Procesando ${tiempos.length} tiempos...`);
      
      const tiemposCreados = [];
      const errores = [];
      
      // Obtener el usuario del request
      const usuarioId = (req as any).usuario?.id;
      console.log('👤 Usuario ID:', usuarioId);
      
      if (!usuarioId) {
        return res.status(401).json(generarRespuestaError('Usuario no autenticado', 401));
      }
      
      for (let i = 0; i < tiempos.length; i++) {
        try {
          const tiempo = await tiempoProcedimientoModel.crearTiempoProcedimiento(tiempos[i], usuarioId);
          tiemposCreados.push(tiempo);
          console.log(`✅ Tiempo ${i + 1} creado exitosamente`);
        } catch (error) {
          console.error(`❌ Error creando tiempo ${i + 1}:`, error);
          errores.push({
            indice: i,
            error: error instanceof Error ? error.message : 'Error desconocido',
            datos: tiempos[i]
          });
        }
      }
      
      const resultado = {
        totalProcesados: tiempos.length,
        exitosos: tiemposCreados.length,
        errores: errores.length,
        tiemposCreados,
        erroresDetalle: errores
      };
      
      console.log('✅ Resultado final:', resultado);
      
      if (errores.length > 0) {
        return res.status(207).json(generarRespuestaExito(
          resultado, 
          `Proceso completado con ${errores.length} errores`
        ));
      } else {
        return res.status(201).json(generarRespuestaExito(
          resultado, 
          `Todos los ${tiemposCreados.length} tiempos fueron creados exitosamente`
        ));
      }
    } catch (error) {
      console.error('❌ Error en crearMultiplesTiemposProcedimiento:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
      
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Finalizar registro de tiempos (maneja duplicados inteligentemente)
   */
  async finalizarRegistroTiempos(req: Request, res: Response) {
    try {
      console.log('🔍 CargasTrabajoController.finalizarRegistroTiempos() - Iniciando...');
      console.log('📊 Datos recibidos:', req.body);
      
      const { tiempos } = req.body;
      
      if (!Array.isArray(tiempos) || tiempos.length === 0) {
        return res.status(400).json(generarRespuestaError('Se requiere un array de tiempos válido', 400));
      }
      
      console.log(`📊 Procesando ${tiempos.length} tiempos para finalizar registro...`);
      
      const tiemposProcesados = [];
      const errores = [];
      
      // Obtener el usuario del request
      const usuarioId = (req as any).usuario?.id;
      console.log('👤 Usuario ID:', usuarioId);
      
      if (!usuarioId) {
        return res.status(401).json(generarRespuestaError('Usuario no autenticado', 401));
      }
      
      for (let i = 0; i < tiempos.length; i++) {
        try {
          const tiempoData = tiempos[i];
          console.log(`🔍 Procesando tiempo ${i + 1}:`, tiempoData);
          
          // Intentar crear o actualizar el tiempo
          const tiempo = await tiempoProcedimientoModel.crearOActualizarTiempoProcedimiento(tiempoData, usuarioId);
          tiemposProcesados.push(tiempo);
          console.log(`✅ Tiempo ${i + 1} procesado exitosamente`);
        } catch (error) {
          console.error(`❌ Error procesando tiempo ${i + 1}:`, error);
          errores.push({
            indice: i,
            error: error instanceof Error ? error.message : 'Error desconocido',
            datos: tiempos[i]
          });
        }
      }
      
      const resultado = {
        totalProcesados: tiempos.length,
        exitosos: tiemposProcesados.length,
        errores: errores.length,
        tiemposProcesados,
        erroresDetalle: errores
      };
      
      console.log('✅ Resultado final de finalización:', resultado);
      
      if (errores.length > 0) {
        return res.status(207).json(generarRespuestaExito(
          resultado, 
          `Finalización completada con ${errores.length} errores`
        ));
      } else {
        return res.status(200).json(generarRespuestaExito(
          resultado, 
          `Registro de tiempos finalizado exitosamente con ${tiemposProcesados.length} tiempos procesados`
        ));
      }
    } catch (error) {
      console.error('❌ Error en finalizarRegistroTiempos:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
      
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener tiempo de procedimiento por ID
   */
  async obtenerTiempoProcedimiento(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de tiempo requerido', 400));
      }
      
      const tiempo = await tiempoProcedimientoModel.buscarPorId(id);
      
      if (!tiempo) {
        return res.status(404).json(generarRespuestaError('Tiempo de procedimiento no encontrado', 404));
      }
      
      return res.json(generarRespuestaExito(tiempo, 'Tiempo de procedimiento obtenido exitosamente'));
    } catch (error) {
      console.error('Error obteniendo tiempo de procedimiento:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Actualizar tiempo de procedimiento
   */
  async actualizarTiempoProcedimiento(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const datosActualizacion = req.body;
      
      // Obtener el usuario del request
      const usuarioId = (req as any).usuario?.id;
      
      if (!usuarioId) {
        return res.status(401).json(generarRespuestaError('Usuario no autenticado', 401));
      }
      
      const tiempoActualizado = await tiempoProcedimientoModel.actualizarTiempoProcedimiento(
        id!, 
        datosActualizacion,
        usuarioId
      );
      
      return res.json(generarRespuestaExito(tiempoActualizado, 'Tiempo de procedimiento actualizado exitosamente'));
    } catch (error) {
      if (error instanceof ValidacionError) {
        return res.status(400).json(generarRespuestaError(error.message, 400));
      } else if (error instanceof RecursoNoEncontradoError) {
        return res.status(404).json(generarRespuestaError(error.message, 404));
      } else {
        console.error('Error actualizando tiempo de procedimiento:', error);
        return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
      }
    }
  }

  /**
   * Eliminar tiempo de procedimiento
   */
  async eliminarTiempoProcedimiento(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(generarRespuestaError('ID de tiempo requerido', 400));
      }
      
      const eliminado = await tiempoProcedimientoModel.eliminar(id);
      
      if (!eliminado) {
        return res.status(404).json(generarRespuestaError('Tiempo de procedimiento no encontrado', 404));
      }
      
      return res.json(generarRespuestaExito({}, 'Tiempo de procedimiento eliminado exitosamente'));
    } catch (error) {
      console.error('Error eliminando tiempo de procedimiento:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Buscar tiempos con filtros
   */
  async buscarTiempos(req: Request, res: Response) {
    try {
      const {
        procedimientoId,
        empleoId,
        dependenciaId,
        procesoId,
        actividadId,
        nivelJerarquico,
        activo,
        pagina = 1,
        limite = 10
      } = req.query;

      const filtros = {
        ...(procedimientoId ? { procedimientoId: procedimientoId as string } : {}),
        ...(empleoId ? { empleoId: empleoId as string } : {}),
        ...(dependenciaId ? { dependenciaId: dependenciaId as string } : {}),
        ...(procesoId ? { procesoId: procesoId as string } : {}),
        ...(actividadId ? { actividadId: actividadId as string } : {}),
        ...(nivelJerarquico ? { nivelJerarquico: nivelJerarquico as string } : {}),
        ...(activo !== undefined ? { activo: activo === 'true' } : {})
      } as {
        procedimientoId?: string;
        empleoId?: string;
        dependenciaId?: string;
        procesoId?: string;
        actividadId?: string;
        nivelJerarquico?: string;
        activo?: boolean;
      };

      const tiempos = await tiempoProcedimientoModel.buscarConDetalles(filtros);
      
      // Aplicar paginación manual
      const paginaNum = parseInt(pagina as string);
      const limiteNum = parseInt(limite as string);
      const inicio = (paginaNum - 1) * limiteNum;
      const tiemposPaginados = tiempos.slice(inicio, inicio + limiteNum);
      
      const resultado = {
        tiempos: tiemposPaginados,
        total: tiempos.length,
        pagina: paginaNum,
        limite: limiteNum,
        totalPaginas: Math.ceil(tiempos.length / limiteNum)
      };

      return res.json(generarRespuestaExito(resultado, 'Tiempos obtenidos exitosamente'));
    } catch (error) {
      console.error('Error buscando tiempos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Recalcular todos los tiempos PERT
   */
  async recalcularTiempos(_req: Request, res: Response) {
    try {
      const resultado = await tiempoProcedimientoModel.recalcularTodos();
      
      return res.json(generarRespuestaExito(resultado, 'Recálculo completado'));
    } catch (error) {
      console.error('Error recalculando tiempos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener resumen por dependencia
   */
  async obtenerResumenPorDependencia(_req: Request, res: Response) {
    try {
      const resumen = await tiempoProcedimientoModel.obtenerResumenPorDependencia();
      
      return res.json(generarRespuestaExito(resumen, 'Resumen por dependencia obtenido exitosamente'));
    } catch (error) {
      console.error('Error obteniendo resumen por dependencia:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener estadísticas de tiempos
   */
  async obtenerEstadisticasTiempos(_req: Request, res: Response) {
    try {
      const estadisticas = await tiempoProcedimientoModel.obtenerEstadisticas();
      
      return res.json(generarRespuestaExito(estadisticas, 'Estadísticas de tiempos obtenidas exitosamente'));
    } catch (error) {
      console.error('Error obteniendo estadísticas de tiempos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Importar tiempos desde archivo CSV/Excel
   */
  async importarTiempos(req: Request, res: Response) {
    try {
      const { tiempos } = req.body;
      
      if (!Array.isArray(tiempos)) {
        return res.status(400).json(generarRespuestaError('Los datos deben ser un array de tiempos', 400));
      }
      
      const resultado = await tiempoProcedimientoModel.importarTiempos(tiempos);
      
      return res.json(generarRespuestaExito(resultado, 'Importación completada'));
    } catch (error) {
      console.error('Error importando tiempos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Duplicar tiempos de un procedimiento a otro
   */
  async duplicarTiempos(req: Request, res: Response) {
    try {
      const { procedimientoOrigenId, procedimientoDestinoId } = req.body;
      
      const resultado = await tiempoProcedimientoModel.duplicarTiemposProcedimiento(
        procedimientoOrigenId,
        procedimientoDestinoId
      );
      
      return res.json(generarRespuestaExito(resultado, 'Tiempos duplicados exitosamente'));
    } catch (error) {
      console.error('Error duplicando tiempos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Validar compatibilidad entre procedimiento y empleo
   */
  async validarCompatibilidad(req: Request, res: Response) {
    try {
      const { procedimientoId, empleoId } = req.body;
      
      const compatibilidad = await tiempoProcedimientoModel.verificarCompatibilidadNivelJerarquico(
        procedimientoId,
        empleoId
      );
      
      return res.json(generarRespuestaExito(compatibilidad, 'Validación de compatibilidad completada'));
    } catch (error) {
      console.error('Error validando compatibilidad:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Exportar datos de cargas de trabajo
   */
  async exportarDatos(req: Request, res: Response) {
    try {
      const { 
        formato = 'json', 
        dependenciaId, 
        incluirInactivos = false 
      } = req.query;

      const filtros: any = {};
      if (dependenciaId) filtros.dependenciaId = dependenciaId;
      if (!incluirInactivos) filtros.activo = true;

      const datos = await tiempoProcedimientoModel.buscarConDetalles(filtros);
      
      if (formato === 'json') {
        return res.json(generarRespuestaExito(datos, 'Datos exportados exitosamente'));
      } else if (formato === 'csv') {
        // Convertir a CSV
        const csvData = this.convertirACSV(datos);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=cargas_trabajo.csv');
        return res.send(csvData);
      } else {
        return res.status(400).json(generarRespuestaError('Formato no soportado', 400));
      }
    } catch (error) {
      console.error('Error exportando datos:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener totales por niveles de empleo para una dependencia
   */
  async obtenerTotalesPorNiveles(req: Request, res: Response) {
    try {
      const { dependenciaId } = req.params;
      
      if (!dependenciaId) {
        return res.status(400).json(generarRespuestaError('dependenciaId es requerido', 400));
      }
      
      const totales = await tiempoProcedimientoModel.obtenerTotalesPorNiveles(undefined, dependenciaId);
      
      return res.json(generarRespuestaExito(totales, 'Totales por niveles obtenidos exitosamente'));
    } catch (error) {
      console.error('Error obteniendo totales por niveles:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Obtener procedimientos con tiempos por dependencia
   */
  async obtenerProcedimientosPorDependencia(req: Request, res: Response) {
    try {
      const { dependenciaId } = req.params;
      
      if (!dependenciaId) {
        return res.status(400).json(generarRespuestaError('dependenciaId es requerido', 400));
      }
      
      const procedimientos = await tiempoProcedimientoModel.obtenerProcedimientosPorDependencia(dependenciaId);
      
      return res.json(generarRespuestaExito(procedimientos, 'Procedimientos por dependencia obtenidos exitosamente'));
    } catch (error) {
      console.error('Error obteniendo procedimientos por dependencia:', error);
      return res.status(500).json(generarRespuestaError('Error interno del servidor', 500));
    }
  }

  /**
   * Convertir datos a formato CSV
   */
  private convertirACSV(datos: any[]): string {
    if (datos.length === 0) return '';

    const headers = [
      'Dependencia',
      'Proceso',
      'Actividad',
      'Procedimiento',
      'Empleo',
      'Nivel Jerárquico',
      'Frecuencia Mensual',
      'Tiempo Mínimo',
      'Tiempo Promedio',
      'Tiempo Máximo',
      'Tiempo PERT',
      'Carga Total',
      'Observaciones'
    ].join(',');

    const filas = datos.map(dato => [
      `"${dato.dependenciaNombre || ''}"`,
      `"${dato.procesoNombre || ''}"`,
      `"${dato.actividadNombre || ''}"`,
      `"${dato.procedimientoNombre || ''}"`,
      `"${dato.empleoDenominacion || ''}"`,
      `"${dato.nivelJerarquico || ''}"`,
      dato.frecuenciaMensual || 0,
      dato.tiempoMinimo || 0,
      dato.tiempoPromedio || 0,
      dato.tiempoMaximo || 0,
      dato.tiempoCalculadoPERT || 0,
      dato.cargaTotal || 0,
      `"${dato.observaciones || ''}"`
    ].join(','));

    return [headers, ...filas].join('\n');
  }
}

// Instancia del controlador
export const cargasTrabajoController = new CargasTrabajoController();
