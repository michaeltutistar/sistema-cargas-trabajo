import { BaseModel } from './BaseModel';
import { Dependencia, CrearDependenciaDTO } from '../types';
import { ValidacionError } from '../types';
import { limpiarString, generarCodigo } from '../utils/helpers';
import { db } from '../database/mysql';

export class DependenciaModel extends BaseModel<Dependencia> {
  constructor() {
    super('dependencias');
  }

  protected mapearResultado(row: any): Dependencia {
    return {
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      codigo: row.codigo,
      activa: Boolean(row.activa),
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: row.fecha_actualizacion ? new Date(row.fecha_actualizacion) : new Date(row.fecha_creacion)
    };
  }

  protected override validarDatos(datos: Partial<Dependencia>): void {
    if (datos.nombre && datos.nombre.trim().length < 3) {
      throw new ValidacionError('El nombre debe tener al menos 3 caracteres');
    }

    if (datos.codigo && datos.codigo.trim().length < 2) {
      throw new ValidacionError('El código debe tener al menos 2 caracteres');
    }

    if (datos.descripcion && datos.descripcion.length > 500) {
      throw new ValidacionError('La descripción no puede exceder 500 caracteres');
    }
  }

  /**
   * Crear una nueva dependencia
   */
  async crearDependencia(datos: CrearDependenciaDTO): Promise<Dependencia> {
    this.validarDatos(datos);

    const nombre = limpiarString(datos.nombre);

    const dependenciaData = {
      nombre,
      ...(datos.descripcion ? { descripcion: limpiarString(datos.descripcion) } : {}),
      activa: true
    };

    return this.crearSinId(dependenciaData);
  }

  /**
   * Buscar dependencia por código
   */
  async buscarPorCodigo(codigo: string): Promise<Dependencia | null> {
    return this.buscarUnoPorCampo('codigo', codigo);
  }

  /**
   * Buscar dependencias activas
   */
  async buscarActivas(): Promise<Dependencia[]> {
    return this.buscarPorCampo('activa', 1);
  }

  /**
   * Actualizar dependencia
   */
  async actualizarDependencia(
    id: string,
    datos: { nombre?: string; descripcion?: string; codigo?: string; activa?: boolean }
  ): Promise<Dependencia> {
    this.validarDatos(datos);

    const datosActualizacion: any = {};

    if (datos.nombre) {
      const nombre = limpiarString(datos.nombre);
      datosActualizacion.nombre = nombre;
    }

    if (datos.codigo) {
      const codigo = limpiarString(datos.codigo);
      const codigoExiste = await this.existe('codigo', codigo, id);
      if (codigoExiste) {
        throw new ValidacionError('Ya existe una dependencia con este código');
      }
      datosActualizacion.codigo = codigo;
    }

    if (datos.descripcion !== undefined) {
      datosActualizacion.descripcion = datos.descripcion ? limpiarString(datos.descripcion) : null;
    }

    if (datos.activa !== undefined) {
      datosActualizacion.activa = datos.activa;
    }

    return this.actualizar(id, datosActualizacion);
  }

  /**
   * Buscar dependencias con filtros
   */
  async buscarConFiltros(
    filtros: {
      activa?: boolean;
      busqueda?: string;
    } = {},
    pagina: number = 1,
    limite: number = 10
  ): Promise<{
    dependencias: Dependencia[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }> {
    const filtrosBase: Record<string, any> = {};

    if (filtros.activa !== undefined) {
      filtrosBase['activa'] = filtros.activa ? 1 : 0;
    }

    let dependencias: Dependencia[];
    let total: number;

    if (filtros.busqueda) {
      // Búsqueda por texto
      dependencias = await this.buscarConTexto(
        ['nombre', 'codigo', 'descripcion'],
        filtros.busqueda,
        filtrosBase
      );
      total = dependencias.length;

      // Aplicar paginación manual para búsqueda de texto
      const inicio = (pagina - 1) * limite;
      dependencias = dependencias.slice(inicio, inicio + limite);
    } else {
      // Búsqueda normal con paginación
      const resultado = await this.buscarConPaginacion(filtrosBase, pagina, limite);
      dependencias = resultado.registros;
      total = resultado.total;
    }

    const totalPaginas = Math.ceil(total / limite);

    return {
      dependencias,
      total,
      pagina,
      limite,
      totalPaginas
    };
  }

  /**
   * Obtener dependencia con sus procesos
   */
  async obtenerConProcesos(id: string): Promise<any> {
    const dependencia = await this.buscarPorId(id);
    if (!dependencia) {
      return null;
    }

    const sql = `
      SELECT p.*, COUNT(a.id) as total_actividades
      FROM procesos p
      LEFT JOIN actividades a ON p.id = a.proceso_id AND a.activa = 1
      WHERE p.dependencia_id = ? AND p.activo = 1
      GROUP BY p.id
      ORDER BY p.orden ASC, p.nombre ASC
    `;

    const [rows] = await db.query(sql, [id]);
    const procesos = rows as any[];

    return {
      ...dependencia,
      procesos: procesos.map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        codigo: p.codigo,
        orden: p.orden,
        totalActividades: p.total_actividades || 0,
        activo: Boolean(p.activo),
        fechaCreacion: new Date(p.fecha_creacion),
        fechaActualizacion: new Date(p.fecha_actualizacion)
      }))
    };
  }

  /**
   * Verificar si se puede eliminar la dependencia
   */
  async puedeEliminar(id: string): Promise<{ puede: boolean; motivo?: string }> {
    // Verificar si tiene procesos asociados
    const sql = `
      SELECT COUNT(*) as total 
      FROM procesos 
      WHERE dependencia_id = ? AND activo = 1
    `;
    
    const [resultado] = await db.query(sql, [id]);
    const rows = resultado as any[];
    const totalProcesos = rows[0]?.total || 0;

    if (totalProcesos > 0) {
      return {
        puede: false,
        motivo: `No se puede eliminar. La dependencia tiene ${totalProcesos} proceso(s) asociado(s)`
      };
    }

    return { puede: true };
  }

  /**
   * Obtener estadísticas de las dependencias
   */
  async obtenerEstadisticasDependencias(): Promise<{
    total: number;
    activas: number;
    inactivas: number;
    conProcesos: number;
    sinProcesos: number;
  }> {
    const sql = `
      SELECT 
        COUNT(d.id) as total,
        SUM(CASE WHEN d.activa = 1 THEN 1 ELSE 0 END) as activas,
        SUM(CASE WHEN d.activa = 0 THEN 1 ELSE 0 END) as inactivas,
        SUM(CASE WHEN p.total_procesos > 0 THEN 1 ELSE 0 END) as con_procesos,
        SUM(CASE WHEN COALESCE(p.total_procesos, 0) = 0 THEN 1 ELSE 0 END) as sin_procesos
      FROM dependencias d
      LEFT JOIN (
        SELECT dependencia_id, COUNT(*) as total_procesos
        FROM procesos 
        WHERE activo = 1
        GROUP BY dependencia_id
      ) p ON d.id = p.dependencia_id
    `;

    const [resultado] = await db.query(sql);
    const rows = resultado as any[];
    const stats = rows[0]!;

    return {
      total: stats.total || 0,
      activas: stats.activas || 0,
      inactivas: stats.inactivas || 0,
      conProcesos: stats.con_procesos || 0,
      sinProcesos: stats.sin_procesos || 0
    };
  }

  /**
   * Obtener ranking de dependencias por cantidad de procesos
   */
  async obtenerRankingPorProcesos(limite: number = 10): Promise<Array<{
    id: string;
    nombre: string;
    codigo: string;
    totalProcesos: number;
    totalActividades: number;
    totalProcedimientos: number;
  }>> {
    const sql = `
      SELECT 
        d.id,
        d.nombre,
        d.codigo,
        COUNT(DISTINCT p.id) as total_procesos,
        COUNT(DISTINCT a.id) as total_actividades,
        COUNT(DISTINCT pr.id) as total_procedimientos
      FROM dependencias d
      LEFT JOIN procesos p ON d.id = p.dependencia_id AND p.activo = 1
      LEFT JOIN actividades a ON p.id = a.proceso_id AND a.activa = 1
      LEFT JOIN procedimientos pr ON a.id = pr.actividad_id AND pr.activo = 1
      WHERE d.activa = 1
      GROUP BY d.id, d.nombre, d.codigo
      ORDER BY total_procesos DESC, total_actividades DESC
      LIMIT ?
    `;

    const [resultado] = await db.query(sql, [limite]);

    return (resultado as any[]).map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      codigo: row.codigo,
      totalProcesos: row.total_procesos || 0,
      totalActividades: row.total_actividades || 0,
      totalProcedimientos: row.total_procedimientos || 0
    }));
  }

  /**
   * Duplicar dependencia (crear copia)
   */
  async duplicarDependencia(id: string, nuevoNombre: string, nuevoCodigo?: string): Promise<Dependencia> {
    const dependenciaOriginal = await this.buscarPorId(id);
    if (!dependenciaOriginal) {
      throw new ValidacionError('Dependencia no encontrada');
    }

    const codigo = nuevoCodigo || generarCodigo(nuevoNombre, 'DEP');

    const nuevaDependencia = await this.crearDependencia({
      nombre: nuevoNombre,
      codigo,
      descripcion: dependenciaOriginal.descripcion ? 
        `${dependenciaOriginal.descripcion} (Copia)` : 'Copia de dependencia'
    });

    return nuevaDependencia;
  }
}
