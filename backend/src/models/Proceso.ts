import { BaseModel } from './BaseModel';
import { Proceso, CrearProcesoDTO } from '../types';
import { ValidacionError, RecursoNoEncontradoError } from '../types';
import { limpiarString, generarCodigo } from '../utils/helpers';
import { db } from '../database/mysql';

export class ProcesoModel extends BaseModel<Proceso> {
  constructor() {
    super('procesos');
  }

  protected mapearResultado(row: any): Proceso {
    return {
      id: row.id,
      dependenciaId: row.dependencia_id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      codigo: row.codigo || '', // Campo opcional ya que no existe en la tabla
      orden: row.orden,
      activo: Boolean(row.activo),
      fechaCreacion: new Date(row.fecha_creacion || new Date()),
      fechaActualizacion: new Date(row.fecha_actualizacion || row.fecha_creacion || new Date())
    };
  }

  protected override validarDatos(datos: Partial<Proceso>): void {
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
   * Crear un nuevo proceso
   */
  async crearProceso(datos: CrearProcesoDTO): Promise<Proceso> {
    this.validarDatos(datos);

    // Verificar que la dependencia existe
    const [rowsDep] = await db.query(
      'SELECT id FROM dependencias WHERE id = ? AND activa = 1',
      [datos.dependenciaId]
    );
    const dependenciaExiste = rowsDep as any[];

    if (dependenciaExiste.length === 0) {
      throw new RecursoNoEncontradoError('La dependencia especificada no existe o está inactiva');
    }

    const nombre = limpiarString(datos.nombre);

    // Verificar que el nombre no exista en la misma dependencia
    const [rowsNom] = await db.query(
      'SELECT id FROM procesos WHERE dependencia_id = ? AND nombre = ?',
      [datos.dependenciaId, nombre]
    );
    const nombreExiste = rowsNom as any[];

    if (nombreExiste.length > 0) {
      throw new ValidacionError('Ya existe un proceso con este nombre en la dependencia');
    }

    const procesoData = {
      dependencia_id: datos.dependenciaId,
      nombre,
      ...(datos.descripcion ? { descripcion: limpiarString(datos.descripcion) } : {}),
      orden: datos.orden,
      activo: true
    };

    const procesoCreado = await this.crearSinId(procesoData);
    console.log('🔍 Proceso creado con ID:', procesoCreado.id);
    return procesoCreado;
  }

  /**
   * Buscar procesos por dependencia
   */
  async buscarPorDependencia(dependenciaId: string): Promise<Proceso[]> {
    return this.buscarPorCampo('dependencia_id', dependenciaId);
  }

  /**
   * Buscar procesos activos por dependencia
   */
  async buscarActivosPorDependencia(dependenciaId: string): Promise<Proceso[]> {
    const filtros = { dependencia_id: dependenciaId, activo: 1 };
    return this.buscarTodos(filtros, { campo: 'orden', direccion: 'ASC' });
  }

  /**
   * Buscar proceso por código en dependencia
   */
  async buscarPorCodigoEnDependencia(dependenciaId: string, codigo: string): Promise<Proceso | null> {
    const sql = 'SELECT * FROM procesos WHERE dependencia_id = ? AND codigo = ? LIMIT 1';
    const [rows] = await db.query(sql, [dependenciaId, codigo]);
    const resultado = rows as any[];
    
    if (resultado.length === 0) {
      return null;
    }
    
    return this.mapearResultado(resultado[0]!);
  }

  /**
   * Actualizar proceso
   */
  async actualizarProceso(
    id: string,
    datos: { 
      nombre?: string; 
      descripcion?: string; 
      codigo?: string; 
      orden?: number;
      dependenciaId?: string;
      activo?: boolean;
    }
  ): Promise<Proceso> {
    this.validarDatos(datos);

    const procesoActual = await this.buscarPorId(id);
    if (!procesoActual) {
      throw new RecursoNoEncontradoError('Proceso no encontrado');
    }

    const datosActualizacion: any = {};

    // Si se cambia la dependencia, verificar que existe
    if (datos.dependenciaId) {
      const [rowsDep] = await db.query(
        'SELECT id FROM dependencias WHERE id = ? AND activa = 1',
        [datos.dependenciaId]
      );
      const dependenciaExisteRows = rowsDep as any[];

      if (dependenciaExisteRows.length === 0) {
        throw new RecursoNoEncontradoError('La dependencia especificada no existe o está inactiva');
      }
      datosActualizacion.dependencia_id = datos.dependenciaId;
    }

    const dependenciaFinal = datos.dependenciaId || procesoActual.dependenciaId;

    if (datos.nombre) {
      datosActualizacion.nombre = limpiarString(datos.nombre);
    }

    if (datos.codigo) {
      const codigo = limpiarString(datos.codigo);
      const [rowsCod] = await db.query(
        'SELECT id FROM procesos WHERE dependencia_id = ? AND codigo = ? AND id != ?',
        [dependenciaFinal, codigo, id]
      );
      const codigoExiste = rowsCod as any[];

      if (codigoExiste.length > 0) {
        throw new ValidacionError('Ya existe un proceso con este código en la dependencia');
      }
      datosActualizacion.codigo = codigo;
    }

    if (datos.descripcion !== undefined) {
      datosActualizacion.descripcion = datos.descripcion ? limpiarString(datos.descripcion) : null;
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
   * Obtener proceso con sus actividades
   */
  async obtenerConActividades(id: string): Promise<any> {
    const proceso = await this.buscarPorId(id);
    if (!proceso) {
      return null;
    }

    const sql = `
      SELECT a.*, COUNT(pr.id) as total_procedimientos
      FROM actividades a
      LEFT JOIN procedimientos pr ON a.id = pr.actividad_id AND pr.activo = 1
      WHERE a.proceso_id = ? AND a.activa = 1
      GROUP BY a.id
      ORDER BY a.orden ASC, a.nombre ASC
    `;

    const [rowsAct] = await db.query(sql, [id]);
    const actividades = rowsAct as any[];

    // Obtener información de la dependencia
    const [rowsDepInfo] = await db.query(
      'SELECT nombre, codigo FROM dependencias WHERE id = ?',
      [proceso.dependenciaId]
    );
    const dependencia = rowsDepInfo as any[];

    return {
      ...proceso,
      dependencia: dependencia[0] || null,
      actividades: actividades.map((a: any) => ({
        id: a.id,
        nombre: a.nombre,
        descripcion: a.descripcion,
        codigo: a.codigo,
        orden: a.orden,
        totalProcedimientos: a.total_procedimientos || 0,
        activa: Boolean(a.activa),
        fechaCreacion: new Date(a.fecha_creacion),
        fechaActualizacion: new Date(a.fecha_actualizacion)
      }))
    };
  }

  /**
   * Reordenar procesos en una dependencia
   */
  async reordenar(dependenciaId: string, nuevosOrdenes: Array<{ id: string; orden: number }>): Promise<void> {
    await db.query('START TRANSACTION');
    try {
      for (const item of nuevosOrdenes) {
        await db.query(
          'UPDATE procesos SET orden = ?, fecha_actualizacion = ? WHERE id = ? AND dependencia_id = ?',
          [item.orden, new Date().toISOString(), item.id, dependenciaId]
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
  async obtenerSiguienteOrden(dependenciaId: string): Promise<number> {
    const sql = 'SELECT MAX(orden) as max_orden FROM procesos WHERE dependencia_id = ?';
    const [rowsMax] = await db.query(sql, [dependenciaId]);
    const resultadoMax = rowsMax as any[];
    const maxOrden = resultadoMax[0]?.max_orden || 0;
    return maxOrden + 1;
  }

  /**
   * Buscar procesos con filtros
   */
  async buscarConFiltros(
    filtros: {
      dependenciaId?: string;
      activo?: boolean;
      busqueda?: string;
    } = {},
    pagina: number = 1,
    limite: number = 10
  ): Promise<{
    procesos: Array<Proceso & { dependenciaNombre: string }>;
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }> {
    let condiciones: string[] = [];
    let parametros: any[] = [];

    // Filtro por dependencia
    if (filtros.dependenciaId) {
      condiciones.push('p.dependencia_id = ?');
      parametros.push(filtros.dependenciaId);
    }

    // Filtro por estado
    if (filtros.activo !== undefined) {
      condiciones.push('p.activo = ?');
      parametros.push(filtros.activo ? 1 : 0);
    }

    // Búsqueda por texto
    if (filtros.busqueda) {
      condiciones.push('(p.nombre LIKE ? OR p.codigo LIKE ? OR p.descripcion LIKE ?)');
      const busqueda = `%${filtros.busqueda}%`;
      parametros.push(busqueda, busqueda, busqueda);
    }

    const offset = (pagina - 1) * limite;
    
    let sqlBase = `
      FROM procesos p
      INNER JOIN dependencias d ON p.dependencia_id = d.id
    `;
    
    if (condiciones.length > 0) {
      sqlBase += ` WHERE ${condiciones.join(' AND ')}`;
    }

    // Contar total
    const sqlCount = `SELECT COUNT(*) as total ${sqlBase}`;
    const [rowsCount] = await db.query(sqlCount, parametros);
    const resultadoCount = rowsCount as any[];
    const total = resultadoCount[0]?.total || 0;

    // Obtener registros
    const sqlSelect = `
      SELECT p.*, d.nombre as dependencia_nombre
      ${sqlBase} 
      ORDER BY d.nombre ASC, p.orden ASC, p.nombre ASC
      LIMIT ? OFFSET ?
    `;
    const [rowsSel] = await db.query(sqlSelect, [...parametros, limite, offset]);
    const resultadoSel = rowsSel as any[];
    const procesos = resultadoSel.map((row: any) => ({
      ...this.mapearResultado(row),
      dependenciaNombre: row.dependencia_nombre
    }));
    
    const totalPaginas = Math.ceil(total / limite);

    return {
      procesos,
      total,
      pagina,
      limite,
      totalPaginas
    };
  }

  /**
   * Verificar si se puede eliminar el proceso
   */
  async puedeEliminar(_id: string): Promise<{ puede: boolean; motivo?: string }> {
    // Verificar si tiene actividades asociadas
    const sql = `
      SELECT COUNT(*) as total 
      FROM actividades 
      WHERE proceso_id = ? AND activa = 1
    `;
    
    const [rowsActCount] = await db.query(sql);
    const resultadoActCount = rowsActCount as any[];
    const totalActividades = resultadoActCount[0]?.total || 0;

    if (totalActividades > 0) {
      return {
        puede: false,
        motivo: `No se puede eliminar. El proceso tiene ${totalActividades} actividad(es) asociada(s)`
      };
    }

    return { puede: true };
  }

  /**
   * Obtener estadísticas de procesos
   */
  override async obtenerEstadisticas(): Promise<{ total: number; activos: number; inactivos: number; ultimaActualizacion: string | null; }> {
    const sql = `
      SELECT 
        COUNT(id) as total,
        SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as inactivos,
        MAX(fecha_actualizacion) as ultima_actualizacion
      FROM procesos
    `;

    const [rowsStats] = await db.query(sql);
    const stats = rowsStats as any[];

    return {
      total: stats[0]?.total || 0,
      activos: stats[0]?.activos || 0,
      inactivos: stats[0]?.inactivos || 0,
      ultimaActualizacion: stats[0]?.ultima_actualizacion || null
    };
  }

  /**
   * Duplicar proceso (crear copia en la misma u otra dependencia)
   */
  async duplicarProceso(
    id: string, 
    nuevoDatos: { 
      nombre: string; 
      dependenciaId?: string; 
      codigo?: string;
    }
  ): Promise<Proceso> {
    const procesoOriginal = await this.buscarPorId(id);
    if (!procesoOriginal) {
      throw new RecursoNoEncontradoError('Proceso no encontrado');
    }

    const dependenciaDestino = nuevoDatos.dependenciaId || procesoOriginal.dependenciaId;
    const siguienteOrden = await this.obtenerSiguienteOrden(dependenciaDestino);
    const codigo = nuevoDatos.codigo || generarCodigo(nuevoDatos.nombre, 'PROC');

    const nuevoProceso = await this.crearProceso({
      dependenciaId: dependenciaDestino,
      nombre: nuevoDatos.nombre,
      codigo,
      descripcion: procesoOriginal.descripcion ? 
        `${procesoOriginal.descripcion} (Copia)` : 'Copia de proceso',
      orden: siguienteOrden
    });

    return nuevoProceso;
  }
}
