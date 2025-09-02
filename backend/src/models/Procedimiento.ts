import { BaseModel } from './BaseModel';
import { Procedimiento, CrearProcedimientoDTO, NivelJerarquico } from '../types';
import { ValidacionError, RecursoNoEncontradoError } from '../types';
import { limpiarString } from '../utils/helpers';
import { db } from '../database/mysql';

export class ProcedimientoModel extends BaseModel<Procedimiento> {
  constructor() {
    super('procedimientos');
  }

  protected mapearResultado(row: any): Procedimiento {
    return {
      id: row.id,
      actividadId: row.actividad_id,
      nombre: row.nombre,
      descripcion: row.descripcion || undefined,
      codigo: row.codigo || '', // Campo no existe en DB, usar valor por defecto
      requisitos: row.requisitos || 'Requisitos por defecto', // Campo no existe en DB, usar valor por defecto
      nivelJerarquico: row.nivel_jerarquico as NivelJerarquico || 'TECNICO',
      orden: row.orden,
      activo: Boolean(row.activo),
      fechaCreacion: row.fecha_creacion ? new Date(row.fecha_creacion) : new Date(),
      fechaActualizacion: row.fecha_actualizacion ? new Date(row.fecha_actualizacion) : new Date()
    };
  }

  protected override validarDatos(datos: Partial<Procedimiento>): void {
    if (datos.nombre && datos.nombre.trim().length < 3) {
      throw new ValidacionError('El nombre debe tener al menos 3 caracteres');
    }

    if (datos.codigo && datos.codigo.trim().length < 2) {
      throw new ValidacionError('El código debe tener al menos 2 caracteres');
    }

    if (datos.orden && datos.orden < 1) {
      throw new ValidacionError('El orden debe ser mayor a 0');
    }

    if (datos.descripcion && datos.descripcion.length > 500) {
      throw new ValidacionError('La descripción no puede exceder 500 caracteres');
    }

    if (datos.requisitos && datos.requisitos.trim().length < 10) {
      throw new ValidacionError('Los requisitos deben tener al menos 10 caracteres');
    }

    if (datos.nivelJerarquico && !Object.values(NivelJerarquico).includes(datos.nivelJerarquico)) {
      throw new ValidacionError('Nivel jerárquico no válido');
    }
  }

  /**
   * Crear un nuevo procedimiento
   */
  async crearProcedimiento(datos: CrearProcedimientoDTO): Promise<Procedimiento> {
    this.validarDatos(datos);

    // Verificar que la actividad existe
    const [actividadExiste] = await db.query(
      'SELECT id FROM actividades WHERE id = ? AND activa = 1',
      [datos.actividadId]
    );

    if ((actividadExiste as any[]).length === 0) {
      throw new RecursoNoEncontradoError('La actividad especificada no existe o está inactiva');
    }

    const nombre = limpiarString(datos.nombre);

    // Verificar que el nombre no exista en la misma actividad
    const [nombreExiste] = await db.query(
      'SELECT id FROM procedimientos WHERE actividad_id = ? AND nombre = ?',
      [datos.actividadId, nombre]
    );

    if ((nombreExiste as any[]).length > 0) {
      throw new ValidacionError('Ya existe un procedimiento con este nombre en la actividad');
    }

    const procedimientoData = {
      actividad_id: datos.actividadId,
      nombre,
      ...(datos.descripcion ? { descripcion: limpiarString(datos.descripcion) } : {}),
      nivel_jerarquico: datos.nivelJerarquico,
      orden: datos.orden,
      activo: true
    };

    return this.crearSinId(procedimientoData);
  }

  /**
   * Buscar procedimientos por actividad
   */
  async buscarPorActividad(actividadId: string): Promise<Procedimiento[]> {
    return this.buscarPorCampo('actividad_id', actividadId);
  }

  /**
   * Buscar procedimientos activos por actividad
   */
  async buscarActivosPorActividad(actividadId: string): Promise<Procedimiento[]> {
    const filtros = { actividad_id: actividadId, activo: 1 };
    return this.buscarTodos(filtros, { campo: 'orden', direccion: 'ASC' });
  }

  /**
   * Buscar procedimientos por nivel jerárquico
   */
  async buscarPorNivelJerarquico(nivelJerarquico: NivelJerarquico): Promise<Procedimiento[]> {
    return this.buscarPorCampo('nivel_jerarquico', nivelJerarquico);
  }

  /**
   * Buscar procedimiento por código en actividad
   */
  async buscarPorCodigoEnActividad(actividadId: string, codigo: string): Promise<Procedimiento | null> {
    const sql = 'SELECT * FROM procedimientos WHERE actividad_id = ? AND codigo = ? LIMIT 1';
    const [rows] = await db.query(sql, [actividadId, codigo]);
    const resultado = rows as any[];
    if (resultado.length === 0) {
      return null;
    }
    return this.mapearResultado(resultado[0]!);
  }

  /**
   * Actualizar procedimiento
   */
  async actualizarProcedimiento(
    id: string,
    datos: { 
      nombre?: string; 
      descripcion?: string; 
      codigo?: string; 
      requisitos?: string;
      nivelJerarquico?: NivelJerarquico;
      orden?: number;
      actividadId?: string;
      activo?: boolean;
    }
  ): Promise<Procedimiento> {
    this.validarDatos(datos);

    const procedimientoActual = await this.buscarPorId(id);
    if (!procedimientoActual) {
      throw new RecursoNoEncontradoError('Procedimiento no encontrado');
    }

    const datosActualizacion: any = {};

    // Si se cambia la actividad, verificar que existe
    if (datos.actividadId) {
      const [actividadExiste] = await db.query(
        'SELECT id FROM actividades WHERE id = ? AND activa = 1',
        [datos.actividadId]
      );

      if ((actividadExiste as any[]).length === 0) {
        throw new RecursoNoEncontradoError('La actividad especificada no existe o está inactiva');
      }
      datosActualizacion.actividad_id = datos.actividadId;
    }

    const actividadFinal = datos.actividadId || procedimientoActual.actividadId;

    if (datos.nombre) {
      datosActualizacion.nombre = limpiarString(datos.nombre);
    }

    if (datos.codigo) {
      const codigo = limpiarString(datos.codigo);
      const [codigoExiste] = await db.query(
        'SELECT id FROM procedimientos WHERE actividad_id = ? AND codigo = ? AND id != ?',
        [actividadFinal, codigo, id]
      );

      if ((codigoExiste as any[]).length > 0) {
        throw new ValidacionError('Ya existe un procedimiento con este código en la actividad');
      }
      datosActualizacion.codigo = codigo;
    }

    if (datos.descripcion !== undefined) {
      datosActualizacion.descripcion = datos.descripcion ? limpiarString(datos.descripcion) : null;
    }

    if (datos.requisitos) {
      datosActualizacion.requisitos = limpiarString(datos.requisitos);
    }

    if (datos.nivelJerarquico) {
      datosActualizacion.nivel_jerarquico = datos.nivelJerarquico;
    }

    if (datos.orden !== undefined) {
      datosActualizacion.orden = datos.orden;
    }

    if (datos.activo !== undefined) {
      datosActualizacion.activo = datos.activo;
    }

    return this.actualizar(id, datosActualizacion);
  }

  /**
   * Obtener procedimiento con sus tiempos
   */
  async obtenerConTiempos(id: string): Promise<any> {
    const procedimiento = await this.buscarPorId(id);
    if (!procedimiento) {
      return null;
    }

    const sql = `
      SELECT 
        tp.*,
        e.denominacion as empleo_denominacion,
        e.codigo as empleo_codigo,
        e.grado as empleo_grado
      FROM tiempos_procedimientos tp
      INNER JOIN empleos e ON tp.empleo_id = e.id
      WHERE tp.procedimiento_id = ? AND tp.activo = 1 AND e.activo = 1
      ORDER BY e.nivel_jerarquico ASC, e.denominacion ASC
    `;

    const [tiempos] = await db.query(sql, [id]);

    // Obtener información de jerarquía completa
    const [rowsJerarquia] = await db.query(`
      SELECT 
        a.nombre as actividad_nombre, a.codigo as actividad_codigo,
        p.nombre as proceso_nombre, p.codigo as proceso_codigo,
        d.nombre as dependencia_nombre, d.codigo as dependencia_codigo
      FROM procedimientos pr
      INNER JOIN actividades a ON pr.actividad_id = a.id
      INNER JOIN procesos p ON a.proceso_id = p.id
      INNER JOIN dependencias d ON p.dependencia_id = d.id
      WHERE pr.id = ?
    `, [id]);
    const jerarquia = rowsJerarquia as any[];

    return {
      ...procedimiento,
      jerarquia: jerarquia[0] || null,
      tiempos: (tiempos as any[]).map(t => ({
        id: t.id,
        empleoId: t.empleo_id,
        empleoDenominacion: t.empleo_denominacion,
        empleoCodigo: t.empleo_codigo,
        empleoGrado: t.empleo_grado,
        frecuenciaMensual: t.frecuencia_mensual,
        tiempoMinimo: t.tiempo_minimo,
        tiempoPromedio: t.tiempo_promedio,
        tiempoMaximo: t.tiempo_maximo,
        tiempoCalculadoPERT: t.tiempo_calculado_pert,
        cargaTotal: t.carga_total,
        observaciones: t.observaciones,
        activo: Boolean(t.activo),
        fechaCreacion: new Date(t.fecha_creacion),
        fechaActualizacion: new Date(t.fecha_actualizacion)
      }))
    };
  }

  /**
   * Reordenar procedimientos en una actividad
   */
  async reordenar(actividadId: string, nuevosOrdenes: Array<{ id: string; orden: number }>): Promise<void> {
    await db.query('START TRANSACTION');
    try {
      for (const item of nuevosOrdenes) {
        await db.query(
          'UPDATE procedimientos SET orden = ?, fecha_actualizacion = ? WHERE id = ? AND actividad_id = ?',
          [item.orden, new Date().toISOString(), item.id, actividadId]
        );
      }
      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * Obtener siguiente número de orden disponible
   */
  async obtenerSiguienteOrden(actividadId: string): Promise<number> {
    const sql = 'SELECT MAX(orden) as max_orden FROM procedimientos WHERE actividad_id = ?';
    const [resultado] = await db.query(sql, [actividadId]);
    const maxOrden = (resultado as any[])[0]?.max_orden || 0;
    return maxOrden + 1;
  }

  /**
   * Buscar procedimientos con filtros y jerarquía completa
   */
  async buscarConFiltros(
    filtros: {
      actividadId?: string;
      procesoId?: string;
      dependenciaId?: string;
      nivelJerarquico?: NivelJerarquico;
      activo?: boolean;
      busqueda?: string;
    } = {},
    pagina: number = 1,
    limite: number = 10
  ): Promise<{
    procedimientos: Array<Procedimiento & { 
      actividadNombre: string;
      procesoNombre: string; 
      dependenciaNombre: string;
      totalTiempos: number;
    }>;
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }> {
    let condiciones: string[] = [];
    let parametros: any[] = [];

    // Filtro por actividad
    if (filtros.actividadId) {
      condiciones.push('pr.actividad_id = ?');
      parametros.push(filtros.actividadId);
    }

    // Filtro por proceso
    if (filtros.procesoId) {
      condiciones.push('a.proceso_id = ?');
      parametros.push(filtros.procesoId);
    }

    // Filtro por dependencia
    if (filtros.dependenciaId) {
      condiciones.push('p.dependencia_id = ?');
      parametros.push(filtros.dependenciaId);
    }

    // Filtro por nivel jerárquico
    if (filtros.nivelJerarquico) {
      condiciones.push('pr.nivel_jerarquico = ?');
      parametros.push(filtros.nivelJerarquico);
    }

    // Filtro por estado
    if (filtros.activo !== undefined) {
      condiciones.push('pr.activo = ?');
      parametros.push(filtros.activo ? 1 : 0);
    }

    // Búsqueda por texto
    if (filtros.busqueda) {
      condiciones.push('(pr.nombre LIKE ? OR pr.codigo LIKE ? OR pr.descripcion LIKE ? OR pr.requisitos LIKE ?)');
      const busqueda = `%${filtros.busqueda}%`;
      parametros.push(busqueda, busqueda, busqueda, busqueda);
    }

    const offset = (pagina - 1) * limite;
    
    let sqlBase = `
      FROM procedimientos pr
      INNER JOIN actividades a ON pr.actividad_id = a.id
      INNER JOIN procesos p ON a.proceso_id = p.id
      INNER JOIN dependencias d ON p.dependencia_id = d.id
      LEFT JOIN (
        SELECT procedimiento_id, COUNT(*) as total_tiempos
        FROM tiempos_procedimientos 
        GROUP BY procedimiento_id
      ) tp ON pr.id = tp.procedimiento_id
    `;
    
    if (condiciones.length > 0) {
      sqlBase += ` WHERE ${condiciones.join(' AND ')}`;
    }

    // Contar total
    const sqlCount = `SELECT COUNT(*) as total ${sqlBase}`;
    const [resultadoCount] = await db.query(sqlCount, parametros);
    const total = (resultadoCount as any[])[0]?.total || 0;

    // Obtener registros
    const sqlSelect = `
      SELECT 
        pr.*,
        a.nombre as actividad_nombre,
        p.nombre as proceso_nombre,
        d.nombre as dependencia_nombre,
        COALESCE(tp.total_tiempos, 0) as total_tiempos
      ${sqlBase} 
      ORDER BY d.nombre ASC, p.orden ASC, a.orden ASC, pr.orden ASC, pr.nombre ASC
      LIMIT ? OFFSET ?
    `;
    const [resultado] = await db.query(sqlSelect, [...parametros, limite, offset]);
    
    const procedimientos = (resultado as any[]).map(row => ({
      ...this.mapearResultado(row),
      actividadNombre: row.actividad_nombre,
      procesoNombre: row.proceso_nombre,
      dependenciaNombre: row.dependencia_nombre,
      totalTiempos: row.total_tiempos || 0
    }));
    
    const totalPaginas = Math.ceil(total / limite);

    return {
      procedimientos,
      total,
      pagina,
      limite,
      totalPaginas
    };
  }

  /**
   * Verificar si se puede eliminar el procedimiento
   */
  async puedeEliminar(id: string): Promise<{ puede: boolean; motivo?: string }> {
    // Verificar si tiene tiempos asociados
    const sql = `
      SELECT COUNT(*) as total 
      FROM tiempos_procedimientos 
      WHERE procedimiento_id = ? AND activo = 1
    `;
    
    const [resultado] = await db.query(sql, [id]);
    const totalTiempos = (resultado as any[])[0]?.total || 0;

    if (totalTiempos > 0) {
      return {
        puede: false,
        motivo: `No se puede eliminar. El procedimiento tiene ${totalTiempos} tiempo(s) asociado(s)`
      };
    }

    return { puede: true };
  }

  /**
   * Obtener estadísticas de procedimientos
   */
  async obtenerEstadisticasProcedimientos(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    porNivelJerarquico: Record<string, number>;
    conTiempos: number;
    sinTiempos: number;
  }> {
    const sql = `
      SELECT 
        COUNT(pr.id) as total,
        SUM(CASE WHEN pr.activo = 1 THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN pr.activo = 0 THEN 1 ELSE 0 END) as inactivos,
        SUM(CASE WHEN pr.nivel_jerarquico = 'DIRECTIVO' THEN 1 ELSE 0 END) as directivo,
        SUM(CASE WHEN pr.nivel_jerarquico = 'ASESOR' THEN 1 ELSE 0 END) as asesor,
        SUM(CASE WHEN pr.nivel_jerarquico = 'PROFESIONAL' THEN 1 ELSE 0 END) as profesional,
        SUM(CASE WHEN pr.nivel_jerarquico = 'TECNICO' THEN 1 ELSE 0 END) as tecnico,
        SUM(CASE WHEN pr.nivel_jerarquico = 'ASISTENCIAL' THEN 1 ELSE 0 END) as asistencial,
        SUM(CASE WHEN tp.total_tiempos > 0 THEN 1 ELSE 0 END) as con_tiempos,
        SUM(CASE WHEN COALESCE(tp.total_tiempos, 0) = 0 THEN 1 ELSE 0 END) as sin_tiempos
      FROM procedimientos pr
      LEFT JOIN (
        SELECT procedimiento_id, COUNT(*) as total_tiempos
        FROM tiempos_procedimientos 
        WHERE activo = 1
        GROUP BY procedimiento_id
      ) tp ON pr.id = tp.procedimiento_id
    `;

    const [resultado] = await db.query(sql);
    const stats = (resultado as any[])[0]!;

    return {
      total: stats.total || 0,
      activos: stats.activos || 0,
      inactivos: stats.inactivos || 0,
      porNivelJerarquico: {
        [NivelJerarquico.DIRECTIVO]: stats.directivo || 0,
        [NivelJerarquico.ASESOR]: stats.asesor || 0,
        [NivelJerarquico.PROFESIONAL]: stats.profesional || 0,
        [NivelJerarquico.TECNICO]: stats.tecnico || 0,
        [NivelJerarquico.ASISTENCIAL]: stats.asistencial || 0
      },
      conTiempos: stats.con_tiempos || 0,
      sinTiempos: stats.sin_tiempos || 0
    };
  }

  /**
   * Estadísticas generales (override BaseModel)
   */
  override async obtenerEstadisticas(): Promise<{ total: number; activos: number; inactivos: number; ultimaActualizacion: string | null; }> {
    const sql = `
      SELECT COUNT(id) as total,
             SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos,
             SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as inactivos,
             MAX(fecha_actualizacion) as ultima_actualizacion
      FROM procedimientos`;
    const [stats] = await db.query(sql);
    return {
      total: (stats as any[])[0]?.total || 0,
      activos: (stats as any[])[0]?.activos || 0,
      inactivos: (stats as any[])[0]?.inactivos || 0,
      ultimaActualizacion: (stats as any[])[0]?.ultima_actualizacion || null
    };
  }

  /**
   * Duplicar procedimiento (crear copia en la misma u otra actividad)
   */
  async duplicarProcedimiento(
    id: string, 
    nuevoDatos: { 
      nombre: string; 
      actividadId?: string; 
      nivelJerarquico?: NivelJerarquico;
    }
  ): Promise<Procedimiento> {
    const procedimientoOriginal = await this.buscarPorId(id);
    if (!procedimientoOriginal) {
      throw new RecursoNoEncontradoError('Procedimiento no encontrado');
    }

    const actividadDestino = nuevoDatos.actividadId || procedimientoOriginal.actividadId;
    const siguienteOrden = await this.obtenerSiguienteOrden(actividadDestino);

    const nuevoProcedimiento = await this.crearProcedimiento({
      actividadId: actividadDestino,
      nombre: nuevoDatos.nombre,
      descripcion: procedimientoOriginal.descripcion ? 
        `${procedimientoOriginal.descripcion} (Copia)` : 'Copia de procedimiento',
      nivelJerarquico: nuevoDatos.nivelJerarquico || procedimientoOriginal.nivelJerarquico,
      orden: siguienteOrden
    });

    return nuevoProcedimiento;
  }

  /**
   * Obtener procedimientos por proceso (a través de actividades)
   */
  async buscarPorProceso(procesoId: string): Promise<Array<Procedimiento & { actividadNombre: string }>> {
    const sql = `
      SELECT pr.*, a.nombre as actividad_nombre
      FROM procedimientos pr
      INNER JOIN actividades a ON pr.actividad_id = a.id
      WHERE a.proceso_id = ? AND pr.activo = 1 AND a.activa = 1
      ORDER BY a.orden ASC, pr.orden ASC
    `;

    const [resultado] = await db.query(sql, [procesoId]);
    
    return (resultado as any[]).map(row => ({
      ...this.mapearResultado(row),
      actividadNombre: row.actividad_nombre
    }));
  }

  /**
   * Obtener procedimientos por dependencia (a través de procesos y actividades)
   */
  async buscarPorDependencia(dependenciaId: string): Promise<Array<Procedimiento & { 
    actividadNombre: string; 
    procesoNombre: string; 
  }>> {
    const sql = `
      SELECT 
        pr.*, 
        a.nombre as actividad_nombre,
        p.nombre as proceso_nombre
      FROM procedimientos pr
      INNER JOIN actividades a ON pr.actividad_id = a.id
      INNER JOIN procesos p ON a.proceso_id = p.id
      WHERE p.dependencia_id = ? AND pr.activo = 1 AND a.activa = 1 AND p.activo = 1
      ORDER BY p.orden ASC, a.orden ASC, pr.orden ASC
    `;

    const [resultado] = await db.query(sql, [dependenciaId]);
    
    return (resultado as any[]).map(row => ({
      ...this.mapearResultado(row),
      actividadNombre: row.actividad_nombre,
      procesoNombre: row.proceso_nombre
    }));
  }
}
