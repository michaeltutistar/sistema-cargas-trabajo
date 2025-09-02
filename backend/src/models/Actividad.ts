import { BaseModel } from './BaseModel';
import { Actividad, CrearActividadDTO } from '../types';
import { ValidacionError, RecursoNoEncontradoError } from '../types';
import { limpiarString, generarCodigo } from '../utils/helpers';
import { db } from '../database/mysql';

export class ActividadModel extends BaseModel<Actividad> {
  /**
   * Estadísticas generales (override BaseModel)
   */
  override async obtenerEstadisticas(): Promise<{ total: number; activos: number; inactivos: number; ultimaActualizacion: string | null; }> {
    const sql = `
      SELECT COUNT(id) as total,
             SUM(CASE WHEN activa = 1 THEN 1 ELSE 0 END) as activos,
             SUM(CASE WHEN activa = 0 THEN 1 ELSE 0 END) as inactivos,
             MAX(fecha_actualizacion) as ultima_actualizacion
      FROM actividades`;
    const [rowsStats] = await db.query(sql);
    const resultadoStats = rowsStats as any[];
    const stats = resultadoStats[0] as any;
    return {
      total: stats?.total || 0,
      activos: stats?.activos || 0,
      inactivos: stats?.inactivos || 0,
      ultimaActualizacion: stats?.ultima_actualizacion || null
    };
  }
  constructor() {
    super('actividades');
  }

  protected mapearResultado(row: any): Actividad {
    return {
      id: row.id,
      procesoId: row.proceso_id,
      procedimientoId: row.procedimiento_id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      codigo: row.codigo || '', // Campo opcional ya que no existe en la tabla
      orden: row.orden,
      activa: Boolean(row.activa),
      fechaCreacion: new Date(row.fecha_creacion || new Date()),
      fechaActualizacion: new Date(row.fecha_actualizacion || row.fecha_creacion || new Date())
    };
  }

  protected override validarDatos(datos: Partial<Actividad>): void {
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
  }

  /**
   * Crear una nueva actividad
   */
  async crearActividad(datos: CrearActividadDTO): Promise<Actividad> {
    this.validarDatos(datos);

    const nombre = limpiarString(datos.nombre);
    let actividadData: any = {
      nombre,
      ...(datos.descripcion ? { descripcion: limpiarString(datos.descripcion) } : {}),
      orden: datos.orden,
      activa: true
    };

    // Si se proporciona procedimientoId, crear actividad para un procedimiento
    if (datos.procedimientoId) {
      console.log('🔍 Verificando procedimiento con ID:', datos.procedimientoId, 'Tipo:', typeof datos.procedimientoId);
      
      // Verificar que el procedimiento existe
      const [rowsProc] = await db.query(
        'SELECT id FROM procedimientos WHERE id = ? AND activo = 1',
        [datos.procedimientoId]
      );
      const resultadoProc = rowsProc as any[];

      if (resultadoProc.length === 0) {
        throw new RecursoNoEncontradoError('El procedimiento especificado no existe o está inactivo');
      }

      // Verificar que el nombre no exista en el mismo procedimiento
      const [rowsNom] = await db.query(
        'SELECT id FROM actividades WHERE procedimiento_id = ? AND nombre = ?',
        [datos.procedimientoId, nombre]
      );
      const resultadoNom = rowsNom as any[];

      if (resultadoNom.length > 0) {
        throw new ValidacionError('Ya existe una actividad con este nombre en el procedimiento');
      }

      actividadData.procedimiento_id = datos.procedimientoId;
    }
    // Si se proporciona procesoId, crear actividad para un proceso
    else if (datos.procesoId) {
      console.log('🔍 Verificando proceso con ID:', datos.procesoId, 'Tipo:', typeof datos.procesoId);
      
      // Verificar que el proceso existe
      const [rowsProc] = await db.query(
        'SELECT id FROM procesos WHERE id = ? AND activo = 1',
        [datos.procesoId]
      );
      const resultadoProc = rowsProc as any[];

      if (resultadoProc.length === 0) {
        throw new RecursoNoEncontradoError('El proceso especificado no existe o está inactivo');
      }

      // Verificar que el nombre no exista en el mismo proceso
      const [rowsNom] = await db.query(
        'SELECT id FROM actividades WHERE proceso_id = ? AND nombre = ?',
        [datos.procesoId, nombre]
      );
      const resultadoNom = rowsNom as any[];

      if (resultadoNom.length > 0) {
        throw new ValidacionError('Ya existe una actividad con este nombre en el proceso');
      }

      actividadData.proceso_id = datos.procesoId;
    }
    else {
      throw new ValidacionError('Debe proporcionar un procesoId o un procedimientoId');
    }

    return this.crearSinId(actividadData);
  }

  /**
   * Buscar actividades por proceso
   */
  async buscarPorProceso(procesoId: string): Promise<Actividad[]> {
    return this.buscarPorCampo('proceso_id', procesoId);
  }

  /**
   * Buscar actividades activas por proceso
   */
  async buscarActivasPorProceso(procesoId: string): Promise<Actividad[]> {
    const filtros = { proceso_id: procesoId, activa: 1 };
    return this.buscarTodos(filtros, { campo: 'orden', direccion: 'ASC' });
  }

  /**
   * Buscar actividad por código en proceso
   */
  async buscarPorCodigoEnProceso(procesoId: string, codigo: string): Promise<Actividad | null> {
    const sql = 'SELECT * FROM actividades WHERE proceso_id = ? AND codigo = ? LIMIT 1';
    const [rowsCod] = await db.query(sql, [procesoId, codigo]);
    const resultadoCod = rowsCod as any[];
    
    if (resultadoCod.length === 0) {
      return null;
    }
    
    return this.mapearResultado(resultadoCod[0]!);
  }

  /**
   * Actualizar actividad
   */
  async actualizarActividad(
    id: string,
    datos: { 
      nombre?: string; 
      descripcion?: string; 
      codigo?: string; 
      orden?: number;
      procesoId?: string;
      activa?: boolean;
    }
  ): Promise<Actividad> {
    this.validarDatos(datos);

    const actividadActual = await this.buscarPorId(id);
    if (!actividadActual) {
      throw new RecursoNoEncontradoError('Actividad no encontrada');
    }

    const datosActualizacion: any = {};

    // Si se cambia el proceso, verificar que existe
    if (datos.procesoId) {
      const [procesoExiste] = await db.query(
        'SELECT id FROM procesos WHERE id = ? AND activo = 1',
        [datos.procesoId]
      );
      const resultadoProcesoExiste = procesoExiste as any[];

      if (resultadoProcesoExiste.length === 0) {
        throw new RecursoNoEncontradoError('El proceso especificado no existe o está inactivo');
      }
      datosActualizacion.proceso_id = datos.procesoId;
    }

    const procesoFinal = datos.procesoId || actividadActual.procesoId;

    if (datos.nombre) {
      datosActualizacion.nombre = limpiarString(datos.nombre);
    }

    if (datos.codigo) {
      const codigo = limpiarString(datos.codigo);
      const [codigoExiste] = await db.query(
        'SELECT id FROM actividades WHERE proceso_id = ? AND codigo = ? AND id != ?',
        [procesoFinal, codigo, id]
      );
      const resultadoCodigoExiste = codigoExiste as any[];

      if (resultadoCodigoExiste.length > 0) {
        throw new ValidacionError('Ya existe una actividad con este código en el proceso');
      }
      datosActualizacion.codigo = codigo;
    }

    if (datos.descripcion !== undefined) {
      datosActualizacion.descripcion = datos.descripcion ? limpiarString(datos.descripcion) : null;
    }

    if (datos.orden !== undefined) {
      datosActualizacion.orden = datos.orden;
    }

    if (datos.activa !== undefined) {
      datosActualizacion.activa = datos.activa;
    }

    return this.actualizar(id, datosActualizacion);
  }

  /**
   * Obtener actividad con sus procedimientos
   */
  async obtenerConProcedimientos(id: string): Promise<any> {
    const actividad = await this.buscarPorId(id);
    if (!actividad) {
      return null;
    }

    const sql = `
      SELECT pr.*, COUNT(tp.id) as total_tiempos
      FROM procedimientos pr
      LEFT JOIN tiempos_procedimientos tp ON pr.id = tp.procedimiento_id AND tp.activo = 1
      WHERE pr.actividad_id = ? AND pr.activo = 1
      GROUP BY pr.id
      ORDER BY pr.orden ASC, pr.nombre ASC
    `;

    const [rowsProc] = await db.query(sql, [id]);
    const resultadoProc = rowsProc as any[];

    // Obtener información del proceso y dependencia
    const [rowsJerarquia] = await db.query(`
      SELECT 
        p.nombre as proceso_nombre, p.codigo as proceso_codigo,
        d.nombre as dependencia_nombre, d.codigo as dependencia_codigo
      FROM actividades a
      INNER JOIN procesos p ON a.proceso_id = p.id
      INNER JOIN dependencias d ON p.dependencia_id = d.id
      WHERE a.id = ?
    `, [id]);
    const resultadoJerarquia = rowsJerarquia as any[];
    const jerarquia = resultadoJerarquia[0] || null;

    return {
      ...actividad,
      jerarquia: jerarquia,
      procedimientos: resultadoProc.map(pr => ({
        id: pr.id,
        nombre: pr.nombre,
        descripcion: pr.descripcion,
        codigo: pr.codigo,
        requisitos: pr.requisitos,
        nivelJerarquico: pr.nivel_jerarquico,
        orden: pr.orden,
        totalTiempos: pr.total_tiempos || 0,
        activo: Boolean(pr.activo),
        fechaCreacion: new Date(pr.fecha_creacion),
        fechaActualizacion: new Date(pr.fecha_actualizacion)
      }))
    };
  }

  /**
   * Reordenar actividades en un proceso
   */
  async reordenar(procesoId: string, nuevosOrdenes: Array<{ id: string; orden: number }>): Promise<void> {
    await db.query(
      'START TRANSACTION',
      () => {
        for (const item of nuevosOrdenes) {
          db.query(
            'UPDATE actividades SET orden = ?, fecha_actualizacion = ? WHERE id = ? AND proceso_id = ?',
            [item.orden, new Date().toISOString(), item.id, procesoId]
          );
        }
      }
    );
  }

  /**
   * Obtener siguiente número de orden disponible
   */
  async obtenerSiguienteOrden(procesoId: string): Promise<number> {
    const sql = 'SELECT MAX(orden) as max_orden FROM actividades WHERE proceso_id = ?';
    const [rowsMaxOrden] = await db.query(sql, [procesoId]);
    const resultadoMaxOrden = rowsMaxOrden as any[];
    const maxOrden = resultadoMaxOrden[0]?.max_orden || 0;
    return maxOrden + 1;
  }

  /**
   * Buscar actividades con filtros y jerarquía
   */
  async buscarConFiltros(
    filtros: {
      procesoId?: string;
      dependenciaId?: string;
      activa?: boolean;
      busqueda?: string;
    } = {},
    pagina: number = 1,
    limite: number = 10
  ): Promise<{
    actividades: Array<Actividad & { 
      procesoNombre: string; 
      dependenciaNombre: string;
      totalProcedimientos: number;
    }>;
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }> {
    let condiciones: string[] = [];
    let parametros: any[] = [];

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

    // Filtro por estado
    if (filtros.activa !== undefined) {
      condiciones.push('a.activa = ?');
      parametros.push(filtros.activa ? 1 : 0);
    }

    // Búsqueda por texto
    if (filtros.busqueda) {
      condiciones.push('(a.nombre LIKE ? OR a.codigo LIKE ? OR a.descripcion LIKE ?)');
      const busqueda = `%${filtros.busqueda}%`;
      parametros.push(busqueda, busqueda, busqueda);
    }

    const offset = (pagina - 1) * limite;
    
    let sqlBase = `
      FROM actividades a
      INNER JOIN procesos p ON a.proceso_id = p.id
      INNER JOIN dependencias d ON p.dependencia_id = d.id
      LEFT JOIN (
        SELECT actividad_id, COUNT(*) as total_procedimientos
        FROM procedimientos 
        WHERE activo = 1
        GROUP BY actividad_id
      ) pr ON a.id = pr.actividad_id
    `;
    
    if (condiciones.length > 0) {
      sqlBase += ` WHERE ${condiciones.join(' AND ')}`;
    }

    // Contar total
    const sqlCount = `SELECT COUNT(*) as total ${sqlBase}`;
    const [rowsTotal] = await db.query(sqlCount, parametros);
    const resultadoTotal = rowsTotal as any[];
    const total = resultadoTotal[0]?.total || 0;

    // Obtener registros
    const sqlSelect = `
      SELECT 
        a.*,
        p.nombre as proceso_nombre,
        d.nombre as dependencia_nombre,
        COALESCE(pr.total_procedimientos, 0) as total_procedimientos
      ${sqlBase} 
      ORDER BY d.nombre ASC, p.orden ASC, a.orden ASC, a.nombre ASC
      LIMIT ? OFFSET ?
    `;
    const [rowsActividades] = await db.query(sqlSelect, [...parametros, limite, offset]);
    
    const resultadoActividades = rowsActividades as any[];
    const actividades = resultadoActividades.map((row: any) => ({
      ...this.mapearResultado(row),
      procesoNombre: row.proceso_nombre,
      dependenciaNombre: row.dependencia_nombre,
      totalProcedimientos: row.total_procedimientos || 0
    }));
    
    const totalPaginas = Math.ceil(total / limite);

    return {
      actividades,
      total,
      pagina,
      limite,
      totalPaginas
    };
  }

  /**
   * Verificar si se puede eliminar la actividad
   */
  async puedeEliminar(id: string): Promise<{ puede: boolean; motivo?: string }> {
    // Verificar si tiene procedimientos asociados
    const sql = `
      SELECT COUNT(*) as total 
      FROM procedimientos 
      WHERE actividad_id = ? AND activo = 1
    `;
    
    const [rowsProcedimientos] = await db.query(sql, [id]);
    const resultadoProcedimientos = rowsProcedimientos as any[];
    const totalProcedimientos = resultadoProcedimientos[0]?.total || 0;

    if (totalProcedimientos > 0) {
      return {
        puede: false,
        motivo: `No se puede eliminar. La actividad tiene ${totalProcedimientos} procedimiento(s) asociado(s)`
      };
    }

    return { puede: true };
  }

  /**
   * Obtener estadísticas de actividades
   */
  async obtenerEstadisticasActividades(): Promise<{
    total: number;
    activas: number;
    inactivas: number;
    porProceso: Array<{ proceso: string; dependencia: string; cantidad: number }>;
    conProcedimientos: number;
    sinProcedimientos: number;
  }> {
    // Estadísticas generales
    const [rowsStats] = await db.query(`
      SELECT
        COUNT(id) as total,
        SUM(activa = 1) as activas,
        SUM(activa = 0) as inactivas,
        SUM((SELECT COUNT(*) FROM procedimientos WHERE actividad_id = actividades.id) > 0) as con_procedimientos,
        SUM((SELECT COUNT(*) FROM procedimientos WHERE actividad_id = actividades.id) = 0) as sin_procedimientos
      FROM actividades
    `);
    const stats = (rowsStats as any[])[0];

    // Detalle por proceso
    const [rowsPorProceso] = await db.query(`
      SELECT
        p.nombre as proceso,
        d.nombre as dependencia,
        COUNT(a.id) as cantidad
      FROM actividades a
      INNER JOIN procesos p ON a.proceso_id = p.id
      INNER JOIN dependencias d ON p.dependencia_id = d.id
      GROUP BY p.id, d.id
    `);
    const porProceso = (rowsPorProceso as any[]).map((row: any) => ({
      proceso: row.proceso,
      dependencia: row.dependencia,
      cantidad: row.cantidad || 0
    }));

    return {
      total: stats.total || 0,
      activas: stats.activas || 0,
      inactivas: stats.inactivas || 0,
      conProcedimientos: stats.con_procedimientos || 0,
      sinProcedimientos: stats.sin_procedimientos || 0,
      porProceso,
    };
  }

  /**
   * Duplicar actividad (crear copia en el mismo u otro proceso)
   */
  async duplicarActividad(
    id: string, 
    nuevoDatos: { 
      nombre: string; 
      procesoId?: string; 
      codigo?: string;
    }
  ): Promise<Actividad> {
    const actividadOriginal = await this.buscarPorId(id);
    if (!actividadOriginal) {
      throw new RecursoNoEncontradoError('Actividad no encontrada');
    }

    const procesoDestino = nuevoDatos.procesoId || actividadOriginal.procesoId;
    const siguienteOrden = await this.obtenerSiguienteOrden(procesoDestino);
    const codigo = nuevoDatos.codigo || generarCodigo(nuevoDatos.nombre, 'ACT');

    const nuevaActividad = await this.crearActividad({
      procesoId: procesoDestino,
      nombre: nuevoDatos.nombre,
      codigo,
      descripcion: actividadOriginal.descripcion ? 
        `${actividadOriginal.descripcion} (Copia)` : 'Copia de actividad',
      orden: siguienteOrden
    });

    return nuevaActividad;
  }

  /**
   * Obtener actividades por dependencia (a través del proceso)
   */
  async buscarPorDependencia(dependenciaId: string): Promise<Array<Actividad & { procesoNombre: string }>> {
    const sql = `
      SELECT a.*, p.nombre as proceso_nombre
      FROM actividades a
      INNER JOIN procesos p ON a.proceso_id = p.id
      WHERE p.dependencia_id = ? AND a.activa = 1 AND p.activo = 1
      ORDER BY p.orden ASC, a.orden ASC
    `;

    const [rowsActividades] = await db.query(sql, [dependenciaId]);
    const resultadoActividades = rowsActividades as any[];
    return resultadoActividades.map((row: any) => ({
      ...this.mapearResultado(row),
      procesoNombre: row.proceso_nombre
    }));
  }
}
