import { BaseModel } from './BaseModel';
import { Empleo, CrearEmpleoDTO, NivelJerarquico } from '../types';
import { ValidacionError } from '../types';
import { limpiarString, generarCodigo } from '../utils/helpers';
import { db } from '../database/mysql';

export class EmpleoModel extends BaseModel<Empleo> {
  constructor() {
    super('empleos');
  }

  protected mapearResultado(row: any): Empleo {
    return {
      id: row.id,
      nivelJerarquico: row.nivel_jerarquico as NivelJerarquico,
      denominacion: row.denominacion,
      codigo: row.codigo,
      grado: row.grado,
      descripcion: row.descripcion,
      activo: Boolean(row.activo),
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion)
    };
  }

  protected override validarDatos(datos: Partial<Empleo>): void {
    if (datos.denominacion && datos.denominacion.trim().length < 3) {
      throw new ValidacionError('La denominación debe tener al menos 3 caracteres');
    }

    if (datos.codigo && datos.codigo.trim().length < 2) {
      throw new ValidacionError('El código debe tener al menos 2 caracteres');
    }

    if (datos.grado && (datos.grado < 1 || datos.grado > 30)) {
      throw new ValidacionError('El grado debe estar entre 1 y 30');
    }

    if (datos.descripcion && datos.descripcion.length > 500) {
      throw new ValidacionError('La descripción no puede exceder 500 caracteres');
    }

    if (datos.nivelJerarquico && !Object.values(NivelJerarquico).includes(datos.nivelJerarquico)) {
      throw new ValidacionError('Nivel jerárquico no válido');
    }
  }

  /**
   * Crear un nuevo empleo
   */
  async crearEmpleo(datos: CrearEmpleoDTO): Promise<Empleo> {
    this.validarDatos(datos);

    const denominacion = limpiarString(datos.denominacion);
    const codigo = datos.codigo ? limpiarString(datos.codigo) : generarCodigo(denominacion, 'EMP');

    // Verificar que el código no exista
    const codigoExiste = await this.existe('codigo', codigo);
    if (codigoExiste) {
      throw new ValidacionError('Ya existe un empleo con este código');
    }

    // Verificar que la combinación nivel-denominación-grado no exista
    const [rows] = await db.query(
      'SELECT id FROM empleos WHERE nivel_jerarquico = ? AND denominacion = ? AND grado = ?',
      [datos.nivelJerarquico, denominacion, datos.grado]
    );
    const combinacionExiste = rows as any[];

    if (combinacionExiste.length > 0) {
      throw new ValidacionError('Ya existe un empleo con esta combinación de nivel jerárquico, denominación y grado');
    }

    const empleoData = {
      nivel_jerarquico: datos.nivelJerarquico,
      denominacion,
      codigo,
      grado: datos.grado,
      activo: true
    };

    // Crear empleo directamente sin usar BaseModel.crear para evitar columnas que no existen
    const sql = `
      INSERT INTO empleos (nivel_jerarquico, denominacion, codigo, grado, activo)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(sql, [
      empleoData.nivel_jerarquico,
      empleoData.denominacion,
      empleoData.codigo,
      empleoData.grado,
      empleoData.activo ? 1 : 0
    ]);
    
    const id = (result as any).insertId;
    const empleoCreado = await this.buscarPorId(id.toString());
    if (!empleoCreado) {
      throw new Error('Error al crear el empleo');
    }
    
    return empleoCreado;
  }

  /**
   * Buscar empleo por código
   */
  async buscarPorCodigo(codigo: string): Promise<Empleo | null> {
    return this.buscarUnoPorCampo('codigo', codigo);
  }

  /**
   * Buscar empleos por nivel jerárquico
   */
  async buscarPorNivelJerarquico(nivelJerarquico: NivelJerarquico): Promise<Empleo[]> {
    return this.buscarPorCampo('nivel_jerarquico', nivelJerarquico);
  }

  /**
   * Buscar empleos activos por nivel jerárquico
   */
  async buscarActivosPorNivelJerarquico(nivelJerarquico: NivelJerarquico): Promise<Empleo[]> {
    const filtros = { nivel_jerarquico: nivelJerarquico, activo: 1 };
    return this.buscarTodos(filtros, { campo: 'grado', direccion: 'ASC' });
  }

  /**
   * Buscar empleos activos
   */
  async buscarActivos(): Promise<Empleo[]> {
    return this.buscarPorCampo('activo', 1);
  }

  /**
   * Buscar empleos por grado
   */
  async buscarPorGrado(grado: number): Promise<Empleo[]> {
    return this.buscarPorCampo('grado', grado);
  }

  /**
   * Actualizar empleo
   */
  async actualizarEmpleo(
    id: string,
    datos: { 
      denominacion?: string; 
      descripcion?: string; 
      codigo?: string; 
      grado?: number;
      nivelJerarquico?: NivelJerarquico;
      activo?: boolean;
    }
  ): Promise<Empleo> {
    this.validarDatos(datos);

    const empleoActual = await this.buscarPorId(id);
    if (!empleoActual) {
      throw new ValidacionError('Empleo no encontrado');
    }

    const datosActualizacion: any = {};

    if (datos.denominacion) {
      datosActualizacion.denominacion = limpiarString(datos.denominacion);
    }

    if (datos.codigo) {
      const codigo = limpiarString(datos.codigo);
      const codigoExiste = await this.existe('codigo', codigo, id);
      if (codigoExiste) {
        throw new ValidacionError('Ya existe un empleo con este código');
      }
      datosActualizacion.codigo = codigo;
    }

    if (datos.descripcion !== undefined) {
      datosActualizacion.descripcion = datos.descripcion ? limpiarString(datos.descripcion) : null;
    }

    if (datos.grado !== undefined) {
      datosActualizacion.grado = datos.grado;
    }

    if (datos.nivelJerarquico) {
      datosActualizacion.nivel_jerarquico = datos.nivelJerarquico;
    }

    if (datos.activo !== undefined) {
      datosActualizacion.activo = datos.activo;
    }

    // Verificar combinación única si se modifican campos relevantes
    if (datos.nivelJerarquico || datos.denominacion || datos.grado !== undefined) {
      const nivelFinal = datos.nivelJerarquico || empleoActual.nivelJerarquico;
      const denominacionFinal = datos.denominacion ? limpiarString(datos.denominacion) : empleoActual.denominacion;
      const gradoFinal = datos.grado !== undefined ? datos.grado : empleoActual.grado;

      const [combinacionExiste] = await db.query(
        'SELECT id FROM empleos WHERE nivel_jerarquico = ? AND denominacion = ? AND grado = ? AND id != ?',
        [nivelFinal, denominacionFinal, gradoFinal, id]
      );

      if ((combinacionExiste as any[]).length > 0) {
        throw new ValidacionError('Ya existe un empleo con esta combinación de nivel jerárquico, denominación y grado');
      }
    }

    return this.actualizar(id, datosActualizacion);
  }

  /**
   * Buscar empleos con filtros
   */
  async buscarConFiltros(
    filtros: {
      nivelJerarquico?: NivelJerarquico;
      grado?: number;
      activo?: boolean;
      busqueda?: string;
    } = {},
    pagina: number = 1,
    limite: number = 10
  ): Promise<{
    empleos: Empleo[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }> {
    const filtrosBase: Record<string, any> = {};

    if (filtros.nivelJerarquico) {
      filtrosBase['nivel_jerarquico'] = filtros.nivelJerarquico;
    }

    if (filtros.grado !== undefined) {
      filtrosBase['grado'] = filtros.grado;
    }

    if (filtros.activo !== undefined) {
      filtrosBase['activo'] = filtros.activo ? 1 : 0;
    }

    let empleos: Empleo[];
    let total: number;

    if (filtros.busqueda) {
      // Búsqueda por texto
      empleos = await this.buscarConTexto(
        ['denominacion', 'codigo', 'descripcion'],
        filtros.busqueda,
        filtrosBase
      );
      total = empleos.length;

      // Aplicar paginación manual para búsqueda de texto
      const inicio = (pagina - 1) * limite;
      empleos = empleos.slice(inicio, inicio + limite);
    } else {
      // Búsqueda normal con paginación
      const orden = { campo: 'nivel_jerarquico', direccion: 'ASC' as const };
      const resultado = await this.buscarConPaginacion(filtrosBase, pagina, limite, orden);
      empleos = resultado.registros;
      total = resultado.total;
    }

    const totalPaginas = Math.ceil(total / limite);

    return {
      empleos,
      total,
      pagina,
      limite,
      totalPaginas
    };
  }

  /**
   * Obtener empleo con sus tiempos asociados
   */
  async obtenerConTiempos(id: string): Promise<any> {
    const empleo = await this.buscarPorId(id);
    if (!empleo) {
      return null;
    }

    const sql = `
      SELECT 
        tp.*,
        pr.nombre as procedimiento_nombre,
        pr.codigo as procedimiento_codigo,
        a.nombre as actividad_nombre,
        p.nombre as proceso_nombre,
        d.nombre as dependencia_nombre
      FROM tiempos_procedimientos tp
      INNER JOIN procedimientos pr ON tp.procedimiento_id = pr.id
      INNER JOIN actividades a ON pr.actividad_id = a.id
      INNER JOIN procesos p ON a.proceso_id = p.id
      INNER JOIN dependencias d ON p.dependencia_id = d.id
      WHERE tp.empleo_id = ? AND tp.activo = 1
      ORDER BY d.nombre ASC, p.orden ASC, a.orden ASC, pr.orden ASC
    `;

    const [tiempos] = await db.query(sql, [id]);

    return {
      ...empleo,
      tiempos: (tiempos as any[]).map(t => ({
        id: t.id,
        procedimientoId: t.procedimiento_id,
        procedimientoNombre: t.procedimiento_nombre,
        procedimientoCodigo: t.procedimiento_codigo,
        actividadNombre: t.actividad_nombre,
        procesoNombre: t.proceso_nombre,
        dependenciaNombre: t.dependencia_nombre,
        frecuenciaMensual: t.frecuencia_mensual,
        tiempoMinimo: t.tiempo_minimo,
        tiempoPromedio: t.tiempo_promedio,
        tiempoMaximo: t.tiempo_maximo,
        tiempoCalculadoPERT: t.tiempo_calculado_pert,
        cargaTotal: t.carga_total,
        observaciones: t.observaciones,
        fechaCreacion: new Date(t.fecha_creacion),
        fechaActualizacion: new Date(t.fecha_actualizacion)
      }))
    };
  }

  /**
   * Verificar si se puede eliminar el empleo
   */
  async puedeEliminar(id: string): Promise<{ puede: boolean; motivo?: string }> {
    // Verificar si tiene tiempos asociados
    const sql = `
      SELECT COUNT(*) as total 
      FROM tiempos_procedimientos 
      WHERE empleo_id = ? AND activo = 1
    `;
    
    const [resultado] = await db.query(sql, [id]);
    const totalTiempos = (resultado as any[])[0]?.total || 0;

    if (totalTiempos > 0) {
      return {
        puede: false,
        motivo: `No se puede eliminar. El empleo tiene ${totalTiempos} tiempo(s) de procedimiento(s) asociado(s)`
      };
    }

    return { puede: true };
  }

  /**
   * Obtener estadísticas de empleos
   */
  async obtenerEstadisticasEmpleos(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    porNivelJerarquico: Record<string, number>;
    conTiempos: number;
    sinTiempos: number;
    gradoPromedio: number;
  }> {
    const sql = `
      SELECT 
        COUNT(e.id) as total,
        SUM(CASE WHEN e.activo = 1 THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN e.activo = 0 THEN 1 ELSE 0 END) as inactivos,
        SUM(CASE WHEN e.nivel_jerarquico = 'DIRECTIVO' THEN 1 ELSE 0 END) as directivo,
        SUM(CASE WHEN e.nivel_jerarquico = 'ASESOR' THEN 1 ELSE 0 END) as asesor,
        SUM(CASE WHEN e.nivel_jerarquico = 'PROFESIONAL' THEN 1 ELSE 0 END) as profesional,
        SUM(CASE WHEN e.nivel_jerarquico = 'TECNICO' THEN 1 ELSE 0 END) as tecnico,
        SUM(CASE WHEN e.nivel_jerarquico = 'ASISTENCIAL' THEN 1 ELSE 0 END) as asistencial,
        SUM(CASE WHEN tp.total_tiempos > 0 THEN 1 ELSE 0 END) as con_tiempos,
        SUM(CASE WHEN COALESCE(tp.total_tiempos, 0) = 0 THEN 1 ELSE 0 END) as sin_tiempos,
        AVG(e.grado) as grado_promedio
      FROM empleos e
      LEFT JOIN (
        SELECT empleo_id, COUNT(*) as total_tiempos
        FROM tiempos_procedimientos 
        WHERE activo = 1
        GROUP BY empleo_id
      ) tp ON e.id = tp.empleo_id
    `;

    const [stats] = await db.query(sql);

    return {
      total: (stats as any[])[0]?.total || 0,
      activos: (stats as any[])[0]?.activos || 0,
      inactivos: (stats as any[])[0]?.inactivos || 0,
      porNivelJerarquico: {
        [NivelJerarquico.DIRECTIVO]: (stats as any[])[0]?.directivo || 0,
        [NivelJerarquico.ASESOR]: (stats as any[])[0]?.asesor || 0,
        [NivelJerarquico.PROFESIONAL]: (stats as any[])[0]?.profesional || 0,
        [NivelJerarquico.TECNICO]: (stats as any[])[0]?.tecnico || 0,
        [NivelJerarquico.ASISTENCIAL]: (stats as any[])[0]?.asistencial || 0
      },
      conTiempos: (stats as any[])[0]?.con_tiempos || 0,
      sinTiempos: (stats as any[])[0]?.sin_tiempos || 0,
      gradoPromedio: (stats as any[])[0]?.grado_promedio || 0
    };
  }

  /**
   * Obtener empleos por rango de grados
   */
  async buscarPorRangoGrados(gradoMin: number, gradoMax: number): Promise<Empleo[]> {
    const sql = `
      SELECT * FROM empleos 
      WHERE grado >= ? AND grado <= ? AND activo = 1
      ORDER BY nivel_jerarquico ASC, grado ASC, denominacion ASC
    `;
    
    const [resultado] = await db.query(sql, [gradoMin, gradoMax]);
    return (resultado as any[]).map(row => this.mapearResultado(row));
  }

  /**
   * Obtener resumen de empleos por nivel jerárquico
   */
  async obtenerResumenPorNivel(): Promise<Array<{
    nivelJerarquico: NivelJerarquico;
    totalEmpleos: number;
    empleosActivos: number;
    gradoMinimo: number;
    gradoMaximo: number;
    gradoPromedio: number;
    totalTiempos: number;
    cargaTotalHoras: number;
  }>> {
    const sql = `
      SELECT 
        e.nivel_jerarquico,
        COUNT(e.id) as total_empleos,
        SUM(CASE WHEN e.activo = 1 THEN 1 ELSE 0 END) as empleos_activos,
        MIN(e.grado) as grado_minimo,
        MAX(e.grado) as grado_maximo,
        AVG(e.grado) as grado_promedio,
        COUNT(tp.id) as total_tiempos,
        SUM(COALESCE(tp.carga_total, 0)) as carga_total_horas
      FROM empleos e
      LEFT JOIN tiempos_procedimientos tp ON e.id = tp.empleo_id AND tp.activo = 1
      GROUP BY e.nivel_jerarquico
      ORDER BY 
        CASE e.nivel_jerarquico
          WHEN 'DIRECTIVO' THEN 1
          WHEN 'ASESOR' THEN 2
          WHEN 'PROFESIONAL' THEN 3
          WHEN 'TECNICO' THEN 4
          WHEN 'ASISTENCIAL' THEN 5
        END
    `;

    const [resultado] = await db.query(sql);
    
    return (resultado as any[]).map(row => ({
      nivelJerarquico: row.nivel_jerarquico as NivelJerarquico,
      totalEmpleos: row.total_empleos || 0,
      empleosActivos: row.empleos_activos || 0,
      gradoMinimo: row.grado_minimo || 0,
      gradoMaximo: row.grado_maximo || 0,
      gradoPromedio: Math.round((row.grado_promedio || 0) * 100) / 100,
      totalTiempos: row.total_tiempos || 0,
      cargaTotalHoras: Math.round((row.carga_total_horas || 0) * 100) / 100
    }));
  }

  /**
   * Duplicar empleo (crear copia con diferente código/grado)
   */
  async duplicarEmpleo(
    id: string, 
    nuevoDatos: { 
      denominacion?: string; 
      codigo?: string;
      grado?: number;
    }
  ): Promise<Empleo> {
    const empleoOriginal = await this.buscarPorId(id);
    if (!empleoOriginal) {
      throw new ValidacionError('Empleo no encontrado');
    }

    const denominacion = nuevoDatos.denominacion || `${empleoOriginal.denominacion} (Copia)`;
    const grado = nuevoDatos.grado || (empleoOriginal.grado + 1);
    const codigo = nuevoDatos.codigo || generarCodigo(denominacion, 'EMP');

    const nuevoEmpleo = await this.crearEmpleo({
      nivelJerarquico: empleoOriginal.nivelJerarquico,
      denominacion,
      codigo,
      grado,
      descripcion: empleoOriginal.descripcion ? 
        `${empleoOriginal.descripcion} (Copia)` : 'Copia de empleo'
    });

    return nuevoEmpleo;
  }

  /**
   * Obtener empleos compatibles con un procedimiento (mismo nivel jerárquico)
   */
  async buscarCompatiblesConProcedimiento(procedimientoId: string): Promise<Empleo[]> {
    const sql = `
      SELECT e.*
      FROM empleos e
      INNER JOIN procedimientos pr ON e.nivel_jerarquico = pr.nivel_jerarquico
      WHERE pr.id = ? AND e.activo = 1
      ORDER BY e.grado ASC, e.denominacion ASC
    `;

    const [resultado] = await db.query(sql, [procedimientoId]);
    return (resultado as any[]).map(row => this.mapearResultado(row));
  }

  /**
   * Buscar empleos que no tienen tiempos asignados
   */
  async buscarSinTiempos(): Promise<Empleo[]> {
    const sql = `
      SELECT e.*
      FROM empleos e
      LEFT JOIN tiempos_procedimientos tp ON e.id = tp.empleo_id AND tp.activo = 1
      WHERE e.activo = 1 AND tp.id IS NULL
      ORDER BY e.nivel_jerarquico ASC, e.grado ASC, e.denominacion ASC
    `;

    const [resultado] = await db.query(sql);
    return (resultado as any[]).map(row => this.mapearResultado(row));
  }
}
