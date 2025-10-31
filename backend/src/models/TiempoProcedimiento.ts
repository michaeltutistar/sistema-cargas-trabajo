import { BaseModel } from './BaseModel';
import { TiempoProcedimiento, CrearTiempoProcedimientoDTO, ActualizarTiempoProcedimientoDTO, ResumenTiempos, TotalesPorNiveles } from '../types';
import { ValidacionError, RecursoNoEncontradoError } from '../types';
import { db } from '../database/mysql';
import { calcularTiempoPERT, validarTiempos } from '../utils/calculoPERT';

export class TiempoProcedimientoModel extends BaseModel<TiempoProcedimiento> {
  constructor() {
    super('tiempos_procedimientos');
  }

  protected mapearResultado(row: any): TiempoProcedimiento {
    return {
      id: row.id,
      procedimientoId: row.procedimiento_id,
      empleoId: row.empleo_id,
      estructuraId: row.estructura_id,
      procesoId: row.proceso_id,
      actividadId: row.actividad_id,
      usuarioId: row.usuario_id,
      grado: row.grado,
      frecuenciaMensual: row.frecuencia_mensual,
      tiempoMinimo: row.tiempo_minimo,
      tiempoPromedio: row.tiempo_promedio,
      tiempoMaximo: row.tiempo_maximo,
      tiempoEstandar: row.tiempo_estandar,
      horasDirectivo: row.horas_directivo || 0,
      horasAsesor: row.horas_asesor || 0,
      horasProfesional: row.horas_profesional || 0,
      horasTecnico: row.horas_tecnico || 0,
      horasAsistencial: row.horas_asistencial || 0,
      horasContratista: row.horas_contratista || 0,
      horasTrabajadorOficial: row.horas_trabajador_oficial || 0,
      observaciones: row.observaciones,
      activo: row.activo === 1,
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion)
    };
  }

  protected override validarDatos(datos: Partial<TiempoProcedimiento>): void {
    if (datos.frecuenciaMensual !== undefined && datos.frecuenciaMensual < 0) {
      throw new ValidacionError('La frecuencia mensual no puede ser negativa');
    }

    if (datos.tiempoMinimo !== undefined && datos.tiempoMinimo < 0) {
      throw new ValidacionError('El tiempo mínimo no puede ser negativo');
    }

    if (datos.tiempoPromedio !== undefined && datos.tiempoPromedio < 0) {
      throw new ValidacionError('El tiempo promedio no puede ser negativo');
    }

    if (datos.tiempoMaximo !== undefined && datos.tiempoMaximo < 0) {
      throw new ValidacionError('El tiempo máximo no puede ser negativo');
    }

    // Validar consistencia de tiempos si están presentes
    if (datos.tiempoMinimo !== undefined && 
        datos.tiempoPromedio !== undefined && 
        datos.tiempoMaximo !== undefined) {
      if (!validarTiempos(datos.tiempoMinimo, datos.tiempoPromedio, datos.tiempoMaximo)) {
        throw new ValidacionError('Los tiempos deben cumplir: Tiempo Mínimo ≤ Tiempo Promedio ≤ Tiempo Máximo');
      }
    }

    if (datos.observaciones && datos.observaciones.length > 500) {
      throw new ValidacionError('Las observaciones no pueden exceder 500 caracteres');
    }
  }

  /**
   * Crear un nuevo tiempo de procedimiento con cálculos automáticos
   */
  async crearTiempoProcedimiento(datos: CrearTiempoProcedimientoDTO, usuarioId?: string): Promise<TiempoProcedimiento> {
    this.validarDatos(datos);

    // Verificar que el procedimiento existe
    const [procedimientoExiste] = await db.query(
      'SELECT id FROM procedimientos WHERE id = ? AND activo = 1',
      [datos.procedimientoId]
    );

    if ((procedimientoExiste as any[]).length === 0) {
      throw new RecursoNoEncontradoError('El procedimiento especificado no existe o está inactivo');
    }

    // Verificar que el empleo existe
    const [empleoExiste] = await db.query(
      'SELECT id FROM empleos WHERE id = ? AND activo = 1',
      [datos.empleoId]
    );

    if ((empleoExiste as any[]).length === 0) {
      throw new RecursoNoEncontradoError('El empleo especificado no existe o está inactivo');
    }

    // Verificar que la combinación procedimiento-empleo no exista PARA EL USUARIO Y ESTRUCTURA ESPECÍFICOS
    console.log('🔍 Verificando combinación existente...');
    console.log('   Procedimiento ID:', datos.procedimientoId, 'tipo:', typeof datos.procedimientoId);
    console.log('   Empleo ID:', datos.empleoId, 'tipo:', typeof datos.empleoId);
    console.log('   Usuario ID:', usuarioId, 'tipo:', typeof usuarioId);
    console.log('   Estructura ID:', datos.estructuraId, 'tipo:', typeof datos.estructuraId);
    console.log('   Estructura ID es undefined?', datos.estructuraId === undefined);
    console.log('   Estructura ID es null?', datos.estructuraId === null);
    console.log('   Estructura ID es string vacío?', datos.estructuraId === '');
    console.log('   Datos completos recibidos:', JSON.stringify(datos, null, 2));
    
    let query = '';
    let params: any[] = [];
    
    // Obtener el actividad_id a partir del procedimiento_id
    console.log('🔍 Obteniendo actividad_id para procedimiento_id:', datos.procedimientoId);
    const [actividadesResult] = await db.query(
      'SELECT id FROM actividades WHERE procedimiento_id = ? AND activa = 1',
      [datos.procedimientoId]
    );
    
    // Crear una clave única para el lock basada en la combinación
    const lockKey = `tiempo_${datos.procedimientoId}_${datos.empleoId}_${usuarioId}_${datos.estructuraId || 'null'}`;
    console.log('🔒 Lock key:', lockKey);
    
    if ((actividadesResult as any[]).length === 0) {
      throw new RecursoNoEncontradoError('No se encontró una actividad activa para el procedimiento especificado');
    }
    
    const actividadId = (actividadesResult as any[])[0].id;
    console.log('🔍 actividad_id obtenido:', actividadId);
    
    // ELIMINADA LA RESTRICCIÓN: Ahora se permite múltiples registros del mismo procedimiento + empleo
    // Esto permite que un empleo pueda tener múltiples actividades del mismo procedimiento
    console.log('✅ Permitido múltiples registros del mismo procedimiento + empleo');
    console.log('✅ El empleo puede tener múltiples actividades del mismo procedimiento');

    // Verificación de compatibilidad de nivel jerárquico eliminada

    // Calcular tiempo estándar usando PERT
    const tiempoEstandar = calcularTiempoPERT(
      datos.tiempoMinimo,
      datos.tiempoPromedio,
      datos.tiempoMaximo
    );

    // Obtener el nivel jerárquico del empleo
    console.log('🔍 Obteniendo nivel jerárquico para empleo_id:', datos.empleoId);
    const [empleoInfo] = await db.query(
      'SELECT nivel_jerarquico FROM empleos WHERE id = ? AND activo = 1',
      [datos.empleoId]
    );

    if ((empleoInfo as any[]).length === 0) {
      throw new RecursoNoEncontradoError('No se pudo obtener la información del empleo');
    }

    const nivelJerarquico = (empleoInfo as any[])[0].nivel_jerarquico;
    console.log('🔍 Nivel jerárquico obtenido:', nivelJerarquico);

    // Calcular horas hombre por niveles de empleo
    // Solo se asignan horas al nivel correspondiente al empleo seleccionado
    const horasDelNivel = tiempoEstandar * datos.frecuenciaMensual;
    
    let horasDirectivo = 0;
    let horasAsesor = 0;
    let horasProfesional = 0;
    let horasTecnico = 0;
    let horasAsistencial = 0;
    let horasContratista = 0;
    let horasTrabajadorOficial = 0;

    // Asignar las horas al nivel jerárquico correspondiente
    switch (nivelJerarquico) {
      case 'DIRECTIVO':
        horasDirectivo = horasDelNivel;
        break;
      case 'ASESOR':
        horasAsesor = horasDelNivel;
        break;
      case 'PROFESIONAL':
        horasProfesional = horasDelNivel;
        break;
      case 'TECNICO':
        horasTecnico = horasDelNivel;
        break;
      case 'ASISTENCIAL':
        horasAsistencial = horasDelNivel;
        break;
      case 'CONTRATISTA':
        horasContratista = horasDelNivel;
        break;
      case 'TRABAJADOR_OFICIAL':
        horasTrabajadorOficial = horasDelNivel;
        break;
      default:
        console.warn(`⚠️ Nivel jerárquico no reconocido: ${nivelJerarquico}`);
        break;
    }

    console.log('📊 Horas calculadas por nivel:');
    console.log(`   - Directivo: ${horasDirectivo}`);
    console.log(`   - Asesor: ${horasAsesor}`);
    console.log(`   - Profesional: ${horasProfesional}`);
    console.log(`   - Técnico: ${horasTecnico}`);
    console.log(`   - Asistencial: ${horasAsistencial}`);
    console.log(`   - Contratista: ${horasContratista}`);
    console.log(`   - Trabajador Oficial: ${horasTrabajadorOficial}`);

    // Usar INSERT IGNORE para evitar duplicados de forma atómica
    console.log('🔄 Intentando inserción con protección contra duplicados...');
    
    try {
      // Intentar insertar directamente con manejo de errores
      const [resultado] = await db.query(`
        INSERT INTO tiempos_procedimientos (
          procedimiento_id, 
          empleo_id, 
          usuario_id,
          estructura_id,
          proceso_id,
          actividad_id,
          grado,
          frecuencia_mensual, 
          tiempo_estandar,
          tiempo_minimo,
          tiempo_promedio,
          tiempo_maximo,
          horas_directivo,
          horas_asesor,
          horas_profesional,
          horas_tecnico,
          horas_asistencial,
          horas_contratista,
          horas_trabajador_oficial,
          observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        datos.procedimientoId,
        datos.empleoId,
        usuarioId,
        datos.estructuraId || null,
        datos.procesoId || null,
        datos.actividadId || null,
        datos.grado || null,
        datos.frecuenciaMensual,
        tiempoEstandar,
        datos.tiempoMinimo,
        datos.tiempoPromedio,
        datos.tiempoMaximo,
        horasDirectivo,
        horasAsesor,
        horasProfesional,
        horasTecnico,
        horasAsistencial,
        horasContratista,
        horasTrabajadorOficial,
        datos.observaciones || null
      ]);

      console.log('✅ Inserción exitosa');

      // Obtener el ID del registro insertado
      const insertId = (resultado as any).insertId;

      // Retornar el tiempo creado
      const tiempoCreado = await this.buscarPorId(insertId.toString());
      if (!tiempoCreado) {
        throw new Error('Error al crear el tiempo de procedimiento');
      }
      return tiempoCreado;
      
    } catch (error: any) {
      console.log('❌ Error en inserción:', error);
      
      // Si es un error de duplicado, verificar si realmente existe
      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
        console.log('🔍 Error de duplicado detectado, verificando si realmente existe...');
        
        // Verificar si realmente existe el registro
        const [verificacionFinal] = await db.query(query, params);
        
        if ((verificacionFinal as any[]).length > 0) {
          console.log('❌ Registro realmente existe, lanzando error de validación');
          throw new ValidacionError('Ya existe un tiempo registrado para esta combinación de actividad y empleo en esta estructura');
        } else {
          console.log('✅ Registro no existe realmente, reintentando inserción...');
          // Reintentar la inserción
          return await this.crearTiempoProcedimiento(datos, usuarioId);
        }
      }
      
      throw error;
    }
  }

  /**
   * Buscar tiempos con información detallada
   */
  async buscarConDetalles(
    filtros: {
      procedimientoId?: string;
      empleoId?: string;
      dependenciaId?: string;
      procesoId?: string;
      actividadId?: string;
      nivelJerarquico?: string;
      activo?: boolean;
      usuarioId?: string;
    } = {}
  ): Promise<Array<TiempoProcedimiento & {
    procedimientoNombre: string;
    empleoDenominacion: string;
    actividadNombre: string;
    procesoNombre: string;
    dependenciaNombre: string;
    nivelJerarquico: string;
  }>> {
    let condiciones: string[] = ['t.activo = 1'];
    let parametros: any[] = [];

    if (filtros.procedimientoId) {
      condiciones.push('t.procedimiento_id = ?');
      parametros.push(filtros.procedimientoId);
    }

    if (filtros.empleoId) {
      condiciones.push('t.empleo_id = ?');
      parametros.push(filtros.empleoId);
    }

    if (filtros.dependenciaId) {
      condiciones.push('d.id = ?');
      parametros.push(filtros.dependenciaId);
    }

    if (filtros.procesoId) {
      condiciones.push('p.id = ?');
      parametros.push(filtros.procesoId);
    }

    if (filtros.actividadId) {
      condiciones.push('a.id = ?');
      parametros.push(filtros.actividadId);
    }

    if (filtros.nivelJerarquico) {
      condiciones.push('e.nivel_jerarquico = ?');
      parametros.push(filtros.nivelJerarquico);
    }

    if (filtros.usuarioId) {
      condiciones.push('t.usuario_id = ?');
      parametros.push(filtros.usuarioId);
    }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

    const sql = `
      SELECT 
        t.*,
        pr.nombre as procedimiento_nombre,
        e.nombre as empleo_denominacion,
        a.nombre as actividad_nombre,
        p.nombre as proceso_nombre,
        d.nombre as dependencia_nombre,
        e.nivel_jerarquico
      FROM tiempos_procedimientos t
      INNER JOIN procedimientos pr ON t.procedimiento_id = pr.id
      INNER JOIN empleos e ON t.empleo_id = e.id
      INNER JOIN actividades a ON pr.actividad_id = a.id
      INNER JOIN procesos p ON a.proceso_id = p.id
      INNER JOIN dependencias d ON p.dependencia_id = d.id
      ${whereClause}
      ORDER BY d.nombre ASC, p.orden ASC, a.orden ASC, pr.orden ASC, e.nivel_jerarquico ASC
    `;

    const [resultado] = await db.query(sql, parametros);

    return (resultado as any[]).map(row => ({
      ...this.mapearResultado(row),
      procedimientoNombre: row.procedimiento_nombre,
      empleoDenominacion: row.empleo_denominacion,
      actividadNombre: row.actividad_nombre,
      procesoNombre: row.proceso_nombre,
      dependenciaNombre: row.dependencia_nombre,
      nivelJerarquico: row.nivel_jerarquico
    }));
  }

  /**
   * Recalcular todos los tiempos estándar y horas hombre
   */
  async recalcularTodos(): Promise<{ actualizados: number; errores: string[] }> {
    const tiempos = await this.listar();
    let actualizados = 0;
    const errores: string[] = [];

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      for (const tiempo of tiempos) {
        try {
          const tiempoEstandar = calcularTiempoPERT(
            tiempo.tiempoMinimo,
            tiempo.tiempoPromedio,
            tiempo.tiempoMaximo
          );

          // Recalcular horas hombre por niveles
          const horasDirectivo = (tiempo.horasDirectivo / tiempo.frecuenciaMensual) * tiempo.frecuenciaMensual;
          const horasAsesor = (tiempo.horasAsesor / tiempo.frecuenciaMensual) * tiempo.frecuenciaMensual;
          const horasProfesional = (tiempo.horasProfesional / tiempo.frecuenciaMensual) * tiempo.frecuenciaMensual;
          const horasTecnico = (tiempo.horasTecnico / tiempo.frecuenciaMensual) * tiempo.frecuenciaMensual;
          const horasAsistencial = (tiempo.horasAsistencial / tiempo.frecuenciaMensual) * tiempo.frecuenciaMensual;
          const horasContratista = (tiempo.horasContratista / tiempo.frecuenciaMensual) * tiempo.frecuenciaMensual;
          const horasTrabajadorOficial = (tiempo.horasTrabajadorOficial / tiempo.frecuenciaMensual) * tiempo.frecuenciaMensual;

          await connection.query(
            `UPDATE tiempos_procedimientos 
             SET tiempo_estandar = ?, 
                 horas_directivo = ?, 
                 horas_asesor = ?, 
                 horas_profesional = ?, 
                 horas_tecnico = ?, 
                 horas_asistencial = ?, 
                 horas_contratista = ?, 
                 horas_trabajador_oficial = ?, 
                 fecha_actualizacion = ? 
             WHERE id = ?`,
            [tiempoEstandar, horasDirectivo, horasAsesor, horasProfesional, horasTecnico, horasAsistencial, horasContratista, horasTrabajadorOficial, new Date().toISOString(), tiempo.id]
          );

          actualizados++;
        } catch (error) {
          errores.push(`Error en tiempo ${tiempo.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return { actualizados, errores };
  }

  /**
   * Obtener resumen de cargas por dependencia
   */
  async obtenerResumenPorDependencia(): Promise<Array<ResumenTiempos>> {
    const sql = `
      SELECT 
        d.id as dependencia_id,
        d.nombre as dependencia_nombre,
        COUNT(DISTINCT t.procedimiento_id) as total_procedimientos,
        SUM(t.horas_directivo + t.horas_asesor + t.horas_profesional + t.horas_tecnico + t.horas_asistencial + t.horas_contratista + t.horas_trabajador_oficial) as total_horas,
        SUM(t.horas_directivo) as horas_directivo,
        SUM(t.horas_asesor) as horas_asesor,
        SUM(t.horas_profesional) as horas_profesional,
        SUM(t.horas_tecnico) as horas_tecnico,
        SUM(t.horas_asistencial) as horas_asistencial,
        SUM(t.horas_contratista) as horas_contratista,
        SUM(t.horas_trabajador_oficial) as horas_trabajador_oficial
      FROM dependencias d
      INNER JOIN procesos p ON d.id = p.dependencia_id
      INNER JOIN actividades a ON p.id = a.proceso_id
      INNER JOIN procedimientos pr ON a.id = pr.actividad_id
      INNER JOIN tiempos_procedimientos t ON pr.id = t.procedimiento_id
      WHERE d.activa = 1 AND p.activo = 1 AND a.activa = 1 AND pr.activo = 1 AND t.activo = 1
      GROUP BY d.id, d.nombre
      ORDER BY total_horas DESC
    `;

    const [resultado] = await db.query(sql);

    return (resultado as any[]).map(row => ({
      dependenciaId: row.dependencia_id,
      dependenciaNombre: row.dependencia_nombre,
      totalProcedimientos: row.total_procedimientos || 0,
      totalHoras: Math.round((row.total_horas || 0) * 100) / 100,
      porNivelJerarquico: {
        DIRECTIVO: Math.round((row.horas_directivo || 0) * 100) / 100,
        ASESOR: Math.round((row.horas_asesor || 0) * 100) / 100,
        PROFESIONAL: Math.round((row.horas_profesional || 0) * 100) / 100,
        TECNICO: Math.round((row.horas_tecnico || 0) * 100) / 100,
        ASISTENCIAL: Math.round((row.horas_asistencial || 0) * 100) / 100,
        CONTRATISTA: Math.round((row.horas_contratista || 0) * 100) / 100,
        TRABAJADOR_OFICIAL: Math.round((row.horas_trabajador_oficial || 0) * 100) / 100
      }
    }));
  }

  /**
   * Importar tiempos desde datos externos (migración)
   */
  async importarTiempos(
    datosImportacion: Array<{
      procedimientoId: string;
      empleoId: string;
      frecuenciaMensual: number;
      tiempoMinimo: number;
      tiempoPromedio: number;
      tiempoMaximo: number;
      observaciones?: string;
      usuarioId?: string;
    }>
  ): Promise<{ creados: number; errores: string[] }> {
    let creados = 0;
    const errores: string[] = [];

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      for (let index = 0; index < datosImportacion.length; index++) {
        const datos = datosImportacion[index];
        if (datos) {
          try {
            await this.crearTiempoProcedimiento(datos, datos.usuarioId);
            creados++;
          } catch (error) {
            errores.push(`Fila ${index + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          }
        }
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return { creados, errores };
  }

  /**
   * Duplicar tiempos de un procedimiento a otro
   */
  async duplicarTiemposProcedimiento(
    procedimientoOrigenId: string,
    procedimientoDestinoId: string,
    usuarioId?: string
  ): Promise<{ creados: number; errores: string[] }> {
    const tiemposOrigen = await this.buscarPorProcedimiento(procedimientoOrigenId, usuarioId);
    
    if (tiemposOrigen.length === 0) {
      return { creados: 0, errores: ['El procedimiento origen no tiene tiempos registrados'] };
    }

    let creados = 0;
    const errores: string[] = [];

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      for (const tiempo of tiemposOrigen) {
        try {
          await this.crearTiempoProcedimiento({
            procedimientoId: procedimientoDestinoId,
            empleoId: tiempo.empleoId,
            frecuenciaMensual: tiempo.frecuenciaMensual,
            tiempoMinimo: tiempo.tiempoMinimo,
            tiempoPromedio: tiempo.tiempoPromedio,
            tiempoMaximo: tiempo.tiempoMaximo,
            observaciones: tiempo.observaciones ? `${tiempo.observaciones} (Copia)` : 'Tiempo duplicado'
          }, usuarioId);
          creados++;
        } catch (error) {
          errores.push(`Empleo ${tiempo.empleoId}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return { creados, errores };
  }

  /**
   * Buscar tiempos por procedimiento (incluyendo filtro por usuario)
   */
  async buscarPorProcedimiento(procedimientoId: string, usuarioId?: string): Promise<TiempoProcedimiento[]> {
    let query = `
      SELECT t.*, p.nombre as procedimiento_nombre, e.nombre as empleo_nombre, e.nivel_jerarquico
      FROM tiempos_procedimientos t
      INNER JOIN procedimientos p ON t.procedimiento_id = p.id
      INNER JOIN empleos e ON t.empleo_id = e.id
      WHERE t.procedimiento_id = ? AND t.activo = 1
    `;
    
    const params: any[] = [procedimientoId];
    
    // Si se proporciona usuarioId, filtrar por usuario
    if (usuarioId) {
      query += ' AND t.usuario_id = ?';
      params.push(usuarioId);
    }
    
    query += ' ORDER BY t.fecha_creacion DESC';

    const [tiempos] = await db.query(query, params);
    return tiempos as TiempoProcedimiento[];
  }

  /**
   * Buscar tiempos por empleo (incluyendo filtro por usuario)
   */
  async buscarPorEmpleo(empleoId: string, usuarioId?: string): Promise<TiempoProcedimiento[]> {
    let query = `
      SELECT t.*, p.nombre as procedimiento_nombre, e.nombre as empleo_nombre, e.nivel_jerarquico
      FROM tiempos_procedimientos t
      INNER JOIN procedimientos p ON t.procedimiento_id = p.id
      INNER JOIN empleos e ON t.empleo_id = e.id
      WHERE t.empleo_id = ? AND t.activo = 1
    `;
    
    const params: any[] = [empleoId];
    
    // Si se proporciona usuarioId, filtrar por usuario
    if (usuarioId) {
      query += ' AND t.usuario_id = ?';
      params.push(usuarioId);
    }
    
    query += ' ORDER BY t.fecha_creacion DESC';

    const [tiempos] = await db.query(query, params);
    return tiempos as TiempoProcedimiento[];
  }

  /**
   * Listar todos los tiempos (incluyendo filtro por usuario)
   */
  async listar(usuarioId?: string): Promise<TiempoProcedimiento[]> {
    let query = `
      SELECT t.*, p.nombre as procedimiento_nombre, e.nombre as empleo_nombre, e.nivel_jerarquico
      FROM tiempos_procedimientos t
      INNER JOIN procedimientos p ON t.procedimiento_id = p.id
      INNER JOIN empleos e ON t.empleo_id = e.id
      WHERE t.activo = 1
    `;
    
    const params: any[] = [];
    
    // Si se proporciona usuarioId, filtrar por usuario
    if (usuarioId) {
      query += ' AND t.usuario_id = ?';
      params.push(usuarioId);
    }
    
    query += ' ORDER BY t.fecha_creacion DESC';

    const [tiempos] = await db.query(query, params);
    return tiempos as TiempoProcedimiento[];
  }

  /**
   * Buscar por ID (incluyendo filtro por usuario)
   */
  override async buscarPorId(id: string, usuarioId?: string): Promise<TiempoProcedimiento | null> {
    let query = `
      SELECT t.*, p.nombre as procedimiento_nombre, e.nombre as empleo_nombre, e.nivel_jerarquico
      FROM tiempos_procedimientos t
      INNER JOIN procedimientos p ON t.procedimiento_id = p.id
      INNER JOIN empleos e ON t.empleo_id = e.id
      WHERE t.id = ? AND t.activo = 1
    `;
    
    const params: any[] = [id];
    
    // Si se proporciona usuarioId, filtrar por usuario
    if (usuarioId) {
      query += ' AND t.usuario_id = ?';
      params.push(usuarioId);
    }

    const [tiempos] = await db.query(query, params);
    const tiempo = (tiempos as any[])[0];
    
    return tiempo || null;
  }

  /**
   * Actualizar tiempo de procedimiento (incluyendo filtro por usuario)
   */
  async actualizarTiempoProcedimiento(
    id: string, 
    datos: ActualizarTiempoProcedimientoDTO, 
    usuarioId?: string
  ): Promise<TiempoProcedimiento> {
    this.validarDatos(datos);

    // Verificar que el tiempo existe y pertenece al usuario
    const tiempoExistente = await this.buscarPorId(id, usuarioId);
    if (!tiempoExistente) {
      throw new RecursoNoEncontradoError('Tiempo de procedimiento no encontrado');
    }

    // Construir query de actualización
    const camposActualizar: string[] = [];
    const valores: any[] = [];

    if (datos.frecuenciaMensual !== undefined) {
      camposActualizar.push('frecuencia_mensual = ?');
      valores.push(datos.frecuenciaMensual);
    }

    if (datos.tiempoMinimo !== undefined) {
      camposActualizar.push('tiempo_minimo = ?');
      valores.push(datos.tiempoMinimo);
    }

    if (datos.tiempoPromedio !== undefined) {
      camposActualizar.push('tiempo_promedio = ?');
      valores.push(datos.tiempoPromedio);
    }

    if (datos.tiempoMaximo !== undefined) {
      camposActualizar.push('tiempo_maximo = ?');
      valores.push(datos.tiempoMaximo);
    }

    if (datos.horasDirectivo !== undefined) {
      camposActualizar.push('horas_directivo = ?');
      valores.push(datos.horasDirectivo);
    }

    if (datos.horasAsesor !== undefined) {
      camposActualizar.push('horas_asesor = ?');
      valores.push(datos.horasAsesor);
    }

    if (datos.horasProfesional !== undefined) {
      camposActualizar.push('horas_profesional = ?');
      valores.push(datos.horasProfesional);
    }

    if (datos.horasTecnico !== undefined) {
      camposActualizar.push('horas_tecnico = ?');
      valores.push(datos.horasTecnico);
    }

    if (datos.horasAsistencial !== undefined) {
      camposActualizar.push('horas_asistencial = ?');
      valores.push(datos.horasAsistencial);
    }

    if (datos.horasContratista !== undefined) {
      camposActualizar.push('horas_contratista = ?');
      valores.push(datos.horasContratista);
    }

    if (datos.horasTrabajadorOficial !== undefined) {
      camposActualizar.push('horas_trabajador_oficial = ?');
      valores.push(datos.horasTrabajadorOficial);
    }

    if (datos.observaciones !== undefined) {
      camposActualizar.push('observaciones = ?');
      valores.push(datos.observaciones);
    }

    if (camposActualizar.length === 0) {
      throw new ValidacionError('No se proporcionaron campos para actualizar');
    }

    // Agregar fecha de actualización
    camposActualizar.push('fecha_actualizacion = NOW()');

    // Agregar ID y usuario_id a los valores
    valores.push(id);
    if (usuarioId) {
      valores.push(usuarioId);
    }

    // Construir query
    let query = `UPDATE tiempos_procedimientos SET ${camposActualizar.join(', ')} WHERE id = ?`;
    if (usuarioId) {
      query += ' AND usuario_id = ?';
    }

    await db.query(query, valores);

    // Retornar el tiempo actualizado
    const tiempoActualizado = await this.buscarPorId(id, usuarioId);
    if (!tiempoActualizado) {
      throw new Error('Error al actualizar el tiempo de procedimiento');
    }
    return tiempoActualizado;
  }

  /**
   * Eliminar tiempo de procedimiento (incluyendo filtro por usuario)
   */
  async eliminarTiempoProcedimiento(id: string, usuarioId?: string): Promise<void> {
    // Verificar que el tiempo existe y pertenece al usuario
    const tiempoExistente = await this.buscarPorId(id, usuarioId);
    if (!tiempoExistente) {
      throw new RecursoNoEncontradoError('Tiempo de procedimiento no encontrado');
    }

    // Soft delete
    let query = 'UPDATE tiempos_procedimientos SET activo = 0, fecha_actualizacion = NOW() WHERE id = ?';
    const params: any[] = [id];
    
    if (usuarioId) {
      query += ' AND usuario_id = ?';
      params.push(usuarioId);
    }

    await db.query(query, params);
  }

  /**
   * Verificar compatibilidad de nivel jerárquico entre procedimiento y empleo
   */
  async verificarCompatibilidadNivelJerarquico(
    procedimientoId: string, 
    empleoId: string
  ): Promise<boolean> {
    const [procedimiento] = await db.query(
      'SELECT nivel_jerarquico FROM procedimientos WHERE id = ?',
      [procedimientoId]
    );

    const [empleo] = await db.query(
      'SELECT nivel_jerarquico FROM empleos WHERE id = ?',
      [empleoId]
    );

    if ((procedimiento as any[]).length === 0 || (empleo as any[]).length === 0) {
      return false;
    }

    const nivelProcedimiento = (procedimiento as any[])[0].nivel_jerarquico;
    const nivelEmpleo = (empleo as any[])[0].nivel_jerarquico;

    // Mapeo de niveles jerárquicos para compatibilidad
    const nivelesCompatibles: { [key: string]: string[] } = {
      'DIRECTIVO': ['DIRECTIVO'],
      'ASESOR': ['DIRECTIVO', 'ASESOR'],
      'PROFESIONAL': ['DIRECTIVO', 'ASESOR', 'PROFESIONAL'],
      'TECNICO': ['DIRECTIVO', 'ASESOR', 'PROFESIONAL', 'TECNICO'],
      'ASISTENCIAL': ['DIRECTIVO', 'ASESOR', 'PROFESIONAL', 'TECNICO', 'ASISTENCIAL'],
      'CONTRATISTA': ['DIRECTIVO', 'ASESOR', 'PROFESIONAL', 'TECNICO', 'ASISTENCIAL', 'CONTRATISTA']
    };

    return nivelesCompatibles[nivelEmpleo]?.includes(nivelProcedimiento) || false;
  }

  /**
   * Obtener totales por niveles de empleo
   */
  async obtenerTotalesPorNiveles(usuarioId?: string, dependenciaId?: string): Promise<TotalesPorNiveles[]> {
    let whereClause = 'WHERE t.activo = 1';
    const params: any[] = [];

    if (usuarioId) {
      whereClause += ' AND t.usuario_id = ?';
      params.push(usuarioId);
    }

    if (dependenciaId) {
      // Obtener la estructura_id de la dependencia
      const [dependenciaInfo] = await db.query(`
        SELECT ee.estructura_id
        FROM dependencias d
        INNER JOIN elementos_estructura ee ON d.id = ee.elemento_id
        WHERE d.id = ? AND ee.tipo = 'dependencia'
      `, [dependenciaId]);

      if ((dependenciaInfo as any[]).length === 0) {
        console.log(`❌ No se encontró información de estructura para dependencia ${dependenciaId}`);
        return [];
      }

      const estructuraId = (dependenciaInfo as any[])[0].estructura_id;
      console.log(`🔍 Estructura ID para dependencia ${dependenciaId}: ${estructuraId}`);

      // Filtrar por estructura específica - buscar procedimientos que pertenecen a esta estructura
      whereClause += ' AND t.estructura_id = ? AND EXISTS (SELECT 1 FROM procedimientos p INNER JOIN elementos_estructura ee_proc ON p.id = ee_proc.elemento_id AND ee_proc.tipo = "procedimiento" WHERE p.id = t.procedimiento_id AND ee_proc.estructura_id = ?)';
      params.push(estructuraId, estructuraId);
    }

    const sql = `
      SELECT 
        'DIRECTIVO' as nivel_jerarquico,
        COALESCE(SUM(t.horas_directivo), 0) as total_horas
      FROM tiempos_procedimientos t
      ${whereClause}
      
      UNION ALL
      
      SELECT 
        'ASESOR' as nivel_jerarquico,
        COALESCE(SUM(t.horas_asesor), 0) as total_horas
      FROM tiempos_procedimientos t
      ${whereClause}
      
      UNION ALL
      
      SELECT 
        'PROFESIONAL' as nivel_jerarquico,
        COALESCE(SUM(t.horas_profesional), 0) as total_horas
      FROM tiempos_procedimientos t
      ${whereClause}
      
      UNION ALL
      
      SELECT 
        'TECNICO' as nivel_jerarquico,
        COALESCE(SUM(t.horas_tecnico), 0) as total_horas
      FROM tiempos_procedimientos t
      ${whereClause}
      
      UNION ALL
      
      SELECT 
        'ASISTENCIAL' as nivel_jerarquico,
        COALESCE(SUM(t.horas_asistencial), 0) as total_horas
      FROM tiempos_procedimientos t
      ${whereClause}
      
      UNION ALL
      
      SELECT 
        'CONTRATISTA' as nivel_jerarquico,
        COALESCE(SUM(t.horas_contratista), 0) as total_horas
      FROM tiempos_procedimientos t
      ${whereClause}
      
      UNION ALL
      
      SELECT 
        'TRABAJADOR_OFICIAL' as nivel_jerarquico,
        COALESCE(SUM(t.horas_trabajador_oficial), 0) as total_horas
      FROM tiempos_procedimientos t
      ${whereClause}
      
      ORDER BY 
        CASE nivel_jerarquico
          WHEN 'DIRECTIVO' THEN 1
          WHEN 'ASESOR' THEN 2
          WHEN 'PROFESIONAL' THEN 3
          WHEN 'TECNICO' THEN 4
          WHEN 'ASISTENCIAL' THEN 5
          WHEN 'CONTRATISTA' THEN 6
          WHEN 'TRABAJADOR_OFICIAL' THEN 7
        END
    `;

    // Duplicar los parámetros para cada UNION
    const allParams = [...params, ...params, ...params, ...params, ...params, ...params, ...params];
    
    console.log(`🔍 SQL para totales por niveles:`, sql);
    console.log(`🔍 Parámetros:`, allParams);
    
    const [resultado] = await db.query(sql, allParams);
    
    console.log(`🔍 Resultado totales por niveles:`, resultado);
    
    return (resultado as any[]).map(row => ({
      nivelJerarquico: row.nivel_jerarquico as any,
      totalHoras: Math.round((row.total_horas || 0) * 100) / 100
    }));
  }

  /**
   * Obtener estadísticas de tiempos por usuario
   */
  async obtenerEstadisticasPorUsuario(usuarioId: string): Promise<{
    totalTiempos: number;
    tiempoPromedio: number;
    procedimientosUnicos: number;
    empleosUnicos: number;
  }> {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_tiempos,
        AVG(tiempo_estandar) as tiempo_promedio,
        COUNT(DISTINCT procedimiento_id) as procedimientos_unicos,
        COUNT(DISTINCT empleo_id) as empleos_unicos
      FROM tiempos_procedimientos 
      WHERE usuario_id = ? AND activo = 1
    `, [usuarioId]);

    const stat = (stats as any[])[0];
    return {
      totalTiempos: stat.total_tiempos || 0,
      tiempoPromedio: parseFloat(stat.tiempo_promedio) || 0,
      procedimientosUnicos: stat.procedimientos_unicos || 0,
      empleosUnicos: stat.empleos_unicos || 0
    };
  }

  /**
   * Obtener tiempos por usuario con información completa
   */
  async obtenerTiemposPorUsuario(usuarioId: string): Promise<TiempoProcedimiento[]> {
    const [tiempos] = await db.query(`
      SELECT 
        t.*,
        p.nombre as procedimiento_nombre,
        e.nombre as empleo_nombre,
        e.nivel_jerarquico,
        e.codigo as empleo_codigo
      FROM tiempos_procedimientos t
      INNER JOIN procedimientos p ON t.procedimiento_id = p.id
      INNER JOIN empleos e ON t.empleo_id = e.id
      WHERE t.usuario_id = ? AND t.activo = 1
      ORDER BY t.fecha_creacion DESC
    `, [usuarioId]);

    return tiempos as TiempoProcedimiento[];
  }

  /**
   * Crear o actualizar tiempo de procedimiento (maneja duplicados inteligentemente)
   */
  async crearOActualizarTiempoProcedimiento(datos: CrearTiempoProcedimientoDTO, usuarioId?: string): Promise<TiempoProcedimiento> {
    console.log('🔍 TiempoProcedimientoModel.crearOActualizarTiempoProcedimiento() - Iniciando...');
    console.log('📊 Datos recibidos:', datos);
    console.log('👤 Usuario ID:', usuarioId);

    this.validarDatos(datos);

    // Verificar que el procedimiento existe
    const [procedimientoExiste] = await db.query(
      'SELECT id FROM procedimientos WHERE id = ? AND activo = 1',
      [datos.procedimientoId]
    );

    if ((procedimientoExiste as any[]).length === 0) {
      throw new RecursoNoEncontradoError('El procedimiento especificado no existe o está inactivo');
    }

    // Verificar que el empleo existe
    const [empleoExiste] = await db.query(
      'SELECT id FROM empleos WHERE id = ? AND activo = 1',
      [datos.empleoId]
    );

    if ((empleoExiste as any[]).length === 0) {
      throw new RecursoNoEncontradoError('El empleo especificado no existe o está inactivo');
    }

    // Obtener el actividad_id a partir del procedimiento_id
    console.log('🔍 Obteniendo actividad_id para procedimiento_id:', datos.procedimientoId);
    const [actividadesResult] = await db.query(
      'SELECT id FROM actividades WHERE procedimiento_id = ? AND activa = 1',
      [datos.procedimientoId]
    );
    
    if ((actividadesResult as any[]).length === 0) {
      throw new RecursoNoEncontradoError('No se encontró una actividad activa para el procedimiento especificado');
    }
    
    const actividadId = (actividadesResult as any[])[0].id;
    console.log('🔍 actividad_id obtenido:', actividadId);

    // Buscar si ya existe un tiempo para esta combinación
    let query = '';
    let params: any[] = [];
    
    if (datos.estructuraId) {
      // Si hay estructura, buscar por actividad + empleo + estructura
      query = `
        SELECT tp.id 
        FROM tiempos_procedimientos tp
        INNER JOIN actividades a ON tp.procedimiento_id = a.procedimiento_id
        WHERE a.id = ? AND tp.empleo_id = ? AND tp.usuario_id = ? AND tp.estructura_id = ?
      `;
      params = [actividadId, datos.empleoId, usuarioId, datos.estructuraId];
    } else {
      // Si no hay estructura, buscar solo por actividad + empleo
      query = `
        SELECT tp.id 
        FROM tiempos_procedimientos tp
        INNER JOIN actividades a ON tp.procedimiento_id = a.procedimiento_id
        WHERE a.id = ? AND tp.empleo_id = ? AND tp.usuario_id = ? AND tp.estructura_id IS NULL
      `;
      params = [actividadId, datos.empleoId, usuarioId];
    }
    
    console.log('🔍 Buscando tiempo existente con query:', query);
    console.log('🔍 Parámetros:', params);
    
    const [tiempoExistente] = await db.query(query, params);
    console.log('📊 Tiempo existente encontrado:', (tiempoExistente as any[]).length > 0 ? (tiempoExistente as any[])[0] : 'No encontrado');

    // Calcular tiempo estándar usando PERT
    const tiempoEstandar = calcularTiempoPERT(
      datos.tiempoMinimo,
      datos.tiempoPromedio,
      datos.tiempoMaximo
    );

    // Obtener el nivel jerárquico del empleo
    console.log('🔍 Obteniendo nivel jerárquico para empleo_id:', datos.empleoId);
    const [empleoInfo] = await db.query(
      'SELECT nivel_jerarquico FROM empleos WHERE id = ? AND activo = 1',
      [datos.empleoId]
    );

    if ((empleoInfo as any[]).length === 0) {
      throw new RecursoNoEncontradoError('No se pudo obtener la información del empleo');
    }

    const nivelJerarquico = (empleoInfo as any[])[0].nivel_jerarquico;
    console.log('🔍 Nivel jerárquico obtenido:', nivelJerarquico);

    // Calcular horas hombre por niveles de empleo
    // Solo se asignan horas al nivel correspondiente al empleo seleccionado
    const horasDelNivel = tiempoEstandar * datos.frecuenciaMensual;
    
    let horasDirectivo = 0;
    let horasAsesor = 0;
    let horasProfesional = 0;
    let horasTecnico = 0;
    let horasAsistencial = 0;
    let horasContratista = 0;
    let horasTrabajadorOficial = 0;

    // Asignar las horas al nivel jerárquico correspondiente
    switch (nivelJerarquico) {
      case 'DIRECTIVO':
        horasDirectivo = horasDelNivel;
        break;
      case 'ASESOR':
        horasAsesor = horasDelNivel;
        break;
      case 'PROFESIONAL':
        horasProfesional = horasDelNivel;
        break;
      case 'TECNICO':
        horasTecnico = horasDelNivel;
        break;
      case 'ASISTENCIAL':
        horasAsistencial = horasDelNivel;
        break;
      case 'CONTRATISTA':
        horasContratista = horasDelNivel;
        break;
      case 'TRABAJADOR_OFICIAL':
        horasTrabajadorOficial = horasDelNivel;
        break;
      default:
        console.warn(`⚠️ Nivel jerárquico no reconocido: ${nivelJerarquico}`);
        break;
    }

    console.log('📊 Horas calculadas por nivel:');
    console.log(`   - Directivo: ${horasDirectivo}`);
    console.log(`   - Asesor: ${horasAsesor}`);
    console.log(`   - Profesional: ${horasProfesional}`);
    console.log(`   - Técnico: ${horasTecnico}`);
    console.log(`   - Asistencial: ${horasAsistencial}`);
    console.log(`   - Contratista: ${horasContratista}`);
    console.log(`   - Trabajador Oficial: ${horasTrabajadorOficial}`);

    if ((tiempoExistente as any[]).length > 0) {
      // Si existe, actualizar
      const tiempoId = (tiempoExistente as any[])[0].id;
      console.log('🔄 Actualizando tiempo existente con ID:', tiempoId);
      
      await db.query(`
        UPDATE tiempos_procedimientos 
        SET frecuencia_mensual = ?,
            tiempo_minimo = ?,
            tiempo_promedio = ?,
            tiempo_maximo = ?,
            tiempo_estandar = ?,
            horas_directivo = ?,
            horas_asesor = ?,
            horas_profesional = ?,
            horas_tecnico = ?,
            horas_asistencial = ?,
            horas_contratista = ?,
            horas_trabajador_oficial = ?,
            observaciones = ?,
            fecha_actualizacion = NOW()
        WHERE id = ?
      `, [
        datos.frecuenciaMensual,
        datos.tiempoMinimo,
        datos.tiempoPromedio,
        datos.tiempoMaximo,
        tiempoEstandar,
        horasDirectivo,
        horasAsesor,
        horasProfesional,
        horasTecnico,
        horasAsistencial,
        horasContratista,
        horasTrabajadorOficial,
        datos.observaciones || null,
        tiempoId
      ]);

      console.log('✅ Tiempo actualizado exitosamente');
      
      // Retornar el tiempo actualizado
      const tiempoActualizado = await this.buscarPorId(tiempoId.toString());
      if (!tiempoActualizado) {
        throw new Error('Error al actualizar el tiempo de procedimiento');
      }
      return tiempoActualizado;
    } else {
      // Si no existe, crear nuevo
      console.log('🆕 Creando nuevo tiempo');
      
      const [resultado] = await db.query(`
        INSERT INTO tiempos_procedimientos (
          procedimiento_id, 
          empleo_id, 
          usuario_id,
          estructura_id,
          proceso_id,
          actividad_id,
          frecuencia_mensual, 
          tiempo_estandar,
          tiempo_minimo,
          tiempo_promedio,
          tiempo_maximo,
          horas_directivo,
          horas_asesor,
          horas_profesional,
          horas_tecnico,
          horas_asistencial,
          horas_contratista,
          horas_trabajador_oficial,
          observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        datos.procedimientoId,
        datos.empleoId,
        usuarioId,
        datos.estructuraId || null,
        datos.procesoId || null,
        datos.actividadId || null,
        datos.frecuenciaMensual,
        tiempoEstandar,
        datos.tiempoMinimo,
        datos.tiempoPromedio,
        datos.tiempoMaximo,
        horasDirectivo,
        horasAsesor,
        horasProfesional,
        horasTecnico,
        horasAsistencial,
        horasContratista,
        horasTrabajadorOficial,
        datos.observaciones || null
      ]);

      console.log('✅ Nuevo tiempo creado exitosamente');

      // Obtener el ID del registro insertado
      const insertId = (resultado as any).insertId;

      // Retornar el tiempo creado
      const tiempoCreado = await this.buscarPorId(insertId.toString());
      if (!tiempoCreado) {
        throw new Error('Error al crear el tiempo de procedimiento');
      }
      return tiempoCreado;
    }
  }



  /**
   * Obtener procedimientos con tiempos por dependencia
   */
  async obtenerProcedimientosPorDependencia(dependenciaId: string): Promise<any[]> {
    try {
      // Obtener la estructura_id de la dependencia
      const [dependenciaInfo] = await db.query(`
        SELECT ee.estructura_id
        FROM dependencias d
        INNER JOIN elementos_estructura ee ON d.id = ee.elemento_id
        WHERE d.id = ? AND ee.tipo = 'dependencia'
      `, [dependenciaId]);

      if ((dependenciaInfo as any[]).length === 0) {
        console.log(`❌ No se encontró información de estructura para dependencia ${dependenciaId}`);
        return [];
      }

      const estructuraId = (dependenciaInfo as any[])[0].estructura_id;
      console.log(`🔍 Estructura ID para dependencia ${dependenciaId}: ${estructuraId}`);

      // Buscar procedimientos que pertenecen a esta dependencia específica, incluyendo información del proceso y actividad
      const query = `
        SELECT 
          p.id,
          p.nombre,
          p.descripcion,
          tp.frecuencia_mensual,
          tp.tiempo_estandar,
          tp.tiempo_minimo,
          tp.tiempo_promedio,
          tp.tiempo_maximo,
          tp.horas_directivo,
          tp.horas_asesor,
          tp.horas_profesional,
          tp.horas_tecnico,
          tp.horas_asistencial,
          tp.grado,
          tp.horas_contratista,
          tp.horas_trabajador_oficial,
          tp.observaciones,
          COALESCE(tp.proceso_id, pr_fallback.id) as proceso_id,
          COALESCE(pr.nombre, pr_fallback.nombre) as proceso_nombre,
          COALESCE(pr.descripcion, pr_fallback.descripcion) as proceso_descripcion,
          COALESCE(tp.actividad_id, a_fallback.id) as actividad_id,
          COALESCE(act.nombre, a_fallback.nombre) as actividad_nombre,
          COALESCE(act.descripcion, a_fallback.descripcion) as actividad_descripcion,
          COALESCE(CONCAT(u.nombre, ' ', u.apellido), u.email) as usuario_registra,
          DATE_FORMAT(tp.fecha_creacion, '%Y-%m-%d') as fecha_registro
        FROM tiempos_procedimientos tp
        INNER JOIN procedimientos p ON tp.procedimiento_id = p.id
        INNER JOIN elementos_estructura ee_proc ON p.id = ee_proc.elemento_id AND ee_proc.tipo = 'procedimiento'
        LEFT JOIN procesos pr ON tp.proceso_id = pr.id
        LEFT JOIN actividades act ON tp.actividad_id = act.id
        LEFT JOIN actividades a_fallback ON p.actividad_id = a_fallback.id
        LEFT JOIN procesos pr_fallback ON a_fallback.proceso_id = pr_fallback.id
        LEFT JOIN usuarios u ON tp.usuario_id = u.id
        WHERE tp.activo = 1 
          AND tp.estructura_id = ?
          AND ee_proc.estructura_id = ?
          AND (
            -- Filtrar por dependencia: el proceso debe pertenecer a la dependencia seleccionada
            (tp.proceso_id IS NOT NULL AND pr.dependencia_id = ?)
            OR 
            -- O si no hay proceso directo, usar el proceso de la actividad de fallback
            (tp.proceso_id IS NULL AND a_fallback.proceso_id IS NOT NULL AND pr_fallback.dependencia_id = ?)
          )
        ORDER BY COALESCE(pr.nombre, pr_fallback.nombre), COALESCE(act.nombre, a_fallback.nombre), p.nombre
      `;

      const [resultados] = await db.query(query, [estructuraId, estructuraId, dependenciaId, dependenciaId]);
      
      console.log(`[DEBUG] Procedimientos encontrados para dependencia ${dependenciaId} en estructura ${estructuraId}:`, resultados);
      
      // Log para debug: verificar si el campo grado está presente
      if (Array.isArray(resultados) && resultados.length > 0) {
        const primerResultado = resultados[0] as any;
        console.log(`[DEBUG GRADO] Primer resultado completo:`, JSON.stringify(primerResultado, null, 2));
        console.log(`[DEBUG GRADO] Primer resultado tiene grado?:`, 'grado' in primerResultado);
        console.log(`[DEBUG GRADO] Valor de grado del primer resultado:`, primerResultado.grado);
        console.log(`[DEBUG GRADO] Keys del primer resultado:`, Object.keys(primerResultado));
        console.log(`[DEBUG GRADO] Tipo de grado:`, typeof primerResultado.grado);
      }
      
      return resultados as any[];
    } catch (error) {
      console.error('Error obteniendo procedimientos por dependencia:', error);
      throw error;
    }
  }
}