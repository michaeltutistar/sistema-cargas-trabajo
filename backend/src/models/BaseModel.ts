import { generarId } from '../utils/helpers';
import { RecursoNoEncontradoError } from '../types';
import { db } from '../database/mysql';

/**
 * Modelo base que proporciona operaciones CRUD comunes
 */
export abstract class BaseModel<T> {
  protected tabla: string;

  constructor(tabla: string) {
    this.tabla = tabla;
  }

  /**
   * Buscar un registro por ID
   */
  async buscarPorId(id: string | number): Promise<T | null> {
    const sql = `SELECT * FROM ${this.tabla} WHERE id = ?`;
    const [rows] = await db.query(sql, [id]);
    const resultado = rows as any[];
    if (resultado.length === 0) {
      return null;
    }
    return this.mapearResultado(resultado[0]!);
  }

  /**
   * Buscar todos los registros con filtros opcionales
   */
  async buscarTodos(
    filtros: Record<string, any> = {},
    orden: { campo: string; direccion: 'ASC' | 'DESC' } = { campo: 'fecha_creacion', direccion: 'DESC' },
    limite?: number,
    offset?: number
  ): Promise<T[]> {
    let sql = `SELECT * FROM ${this.tabla}`;
    const params: any[] = [];

    // Aplicar filtros
    if (Object.keys(filtros).length > 0) {
      const condiciones = Object.keys(filtros).map(campo => {
        if (filtros[campo] === null) {
          return `${campo} IS NULL`;
        } else if (Array.isArray(filtros[campo])) {
          const placeholders = filtros[campo].map(() => '?').join(',');
          params.push(...filtros[campo]);
          return `${campo} IN (${placeholders})`;
        } else {
          params.push(filtros[campo]);
          return `${campo} = ?`;
        }
      });
      sql += ` WHERE ${condiciones.join(' AND ')}`;
    }

    // Aplicar orden
    sql += ` ORDER BY ${orden.campo} ${orden.direccion}`;

    // Aplicar límite y offset
    if (limite) {
      sql += ` LIMIT ?`;
      params.push(limite);
      if (offset) {
        sql += ` OFFSET ?`;
        params.push(offset);
      }
    }

    const [rows] = await db.query(sql, params);
    const resultado = rows as any[];
    return resultado.map((row: any) => this.mapearResultado(row));
  }

  /**
   * Contar registros con filtros opcionales
   */
  async contar(filtros: Record<string, any> = {}): Promise<number> {
    let sql = `SELECT COUNT(*) as total FROM ${this.tabla}`;
    const params: any[] = [];

    if (Object.keys(filtros).length > 0) {
      const condiciones = Object.keys(filtros).map(campo => {
        if (filtros[campo] === null) {
          return `${campo} IS NULL`;
        } else if (Array.isArray(filtros[campo])) {
          const placeholders = filtros[campo].map(() => '?').join(',');
          params.push(...filtros[campo]);
          return `${campo} IN (${placeholders})`;
        } else {
          params.push(filtros[campo]);
          return `${campo} = ?`;
        }
      });
      sql += ` WHERE ${condiciones.join(' AND ')}`;
    }

    const [rows] = await db.query(sql, params);
    const resultado = rows as any[];
    return resultado[0]?.total || 0;
  }

  /**
   * Crear un nuevo registro
   */
  async crear(datos: Partial<T>): Promise<T> {
    const id = generarId();
    const fechaActual = new Date().toISOString();
    
    const datosCompletos: any = {
      id,
      ...datos,
      fecha_creacion: fechaActual
    };

    // Solo agregar fecha_actualizacion si la tabla la tiene
    // Esto se puede verificar dinámicamente o por configuración
    if (this.tabla !== 'dependencias') {
      datosCompletos.fecha_actualizacion = fechaActual;
    }

    const campos = Object.keys(datosCompletos);
    const valores = Object.values(datosCompletos);
    const placeholders = campos.map(() => '?').join(',');

    const sql = `
      INSERT INTO ${this.tabla} (${campos.join(',')})
      VALUES (${placeholders})
    `;

    await db.query(sql, valores);
    
    const registroCreado = await this.buscarPorId(id);
    if (!registroCreado) {
      throw new Error('Error al crear el registro');
    }
    
    return registroCreado;
  }

  /**
   * Crear un nuevo registro sin ID (para tablas con auto-increment)
   */
  async crearSinId(datos: Partial<T>): Promise<T> {
    const fechaActual = new Date().toISOString();
    
    const datosCompletos: any = {
      ...datos
    };

    // Tablas que no tienen columnas de fecha
    const tablasSinFechas = ['dependencias', 'procesos', 'actividades', 'procedimientos', 'empleos'];
    
    // Solo agregar fechas si la tabla las tiene
    if (!tablasSinFechas.includes(this.tabla)) {
      datosCompletos.fecha_creacion = fechaActual;
      datosCompletos.fecha_actualizacion = fechaActual;
    }

    const campos = Object.keys(datosCompletos);
    const valores = Object.values(datosCompletos);
    const placeholders = campos.map(() => '?').join(',');

    const sql = `
      INSERT INTO ${this.tabla} (${campos.join(',')})
      VALUES (${placeholders})
    `;

    const [result]: any = await db.query(sql, valores);
    
    // Para tablas con auto-increment, usar el ID generado por MySQL
    const idGenerado = result.insertId;
    console.log('🔍 ID generado por MySQL:', idGenerado);
    const registroCreado = await this.buscarPorId(idGenerado.toString());
    if (!registroCreado) {
      throw new Error('Error al crear el registro');
    }
    
    console.log('🔍 Registro creado:', registroCreado);
    return registroCreado;
  }

  /**
   * Actualizar un registro existente
   */
  async actualizar(id: string, datos: Partial<T>): Promise<T> {
    // Verificar que el registro existe
    const registroExistente = await this.buscarPorId(id);
    if (!registroExistente) {
      throw new RecursoNoEncontradoError(`Registro con ID ${id} no encontrado`);
    }

    const datosActualizacion = {
      ...datos,
      fecha_actualizacion: new Date().toISOString()
    };

    const campos = Object.keys(datosActualizacion);
    const valores = Object.values(datosActualizacion);
    const asignaciones = campos.map(campo => `${campo} = ?`).join(',');

    const sql = `UPDATE ${this.tabla} SET ${asignaciones} WHERE id = ?`;
    
    const [result]: any = await db.query(sql, [...valores, id]);
    
    if (result.affectedRows === 0) { // db.query returns an array of rows, so length is 1
      throw new RecursoNoEncontradoError(`No se pudo actualizar el registro con ID ${id}`);
    }

    const registroActualizado = await this.buscarPorId(id);
    if (!registroActualizado) {
      throw new Error('Error al obtener el registro actualizado');
    }
    
    return registroActualizado;
  }

  /**
   * Eliminar un registro (soft delete - marca como inactivo)
   */
  async eliminar(id: string): Promise<boolean> {
    const sql = `UPDATE ${this.tabla} SET activo = 0, fecha_actualizacion = ? WHERE id = ?`;
    const [result]: any = await db.query(sql, [new Date().toISOString(), id]);
    return result.affectedRows > 0; // db.query returns an array of rows, so length is 1
  }

  /**
   * Eliminar permanentemente un registro
   */
  async eliminarPermanente(id: string): Promise<boolean> {
    const sql = `DELETE FROM ${this.tabla} WHERE id = ?`;
    const [result]: any = await db.query(sql, [id]);
    return result.affectedRows > 0; // db.query returns an array of rows, so length is 1
  }

  /**
   * Restaurar un registro eliminado (soft delete)
   */
  async restaurar(id: string): Promise<boolean> {
    const sql = `UPDATE ${this.tabla} SET activo = 1, fecha_actualizacion = ? WHERE id = ?`;
    const [result]: any = await db.query(sql, [new Date().toISOString(), id]);
    return result.affectedRows > 0; // db.query returns an array of rows, so length is 1
  }

  /**
   * Buscar registros con paginación
   */
  async buscarConPaginacion(
    filtros: Record<string, any> = {},
    pagina: number = 1,
    limite: number = 10,
    orden: { campo: string; direccion: 'ASC' | 'DESC' } = { campo: 'fecha_creacion', direccion: 'DESC' }
  ): Promise<{
    registros: T[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }> {
    const offset = (pagina - 1) * limite;
    
    const [registros, total] = await Promise.all([
      this.buscarTodos(filtros, orden, limite, offset),
      this.contar(filtros)
    ]);

    const totalPaginas = Math.ceil(total / limite);

    return {
      registros,
      total,
      pagina,
      limite,
      totalPaginas
    };
  }

  /**
   * Buscar por campo específico
   */
  async buscarPorCampo(campo: string, valor: any): Promise<T[]> {
    const sql = `SELECT * FROM ${this.tabla} WHERE ${campo} = ?`;
    const [rows] = await db.query(sql, [valor]);
    const resultado = rows as any[];
    return resultado.map((row: any) => this.mapearResultado(row));
  }

  /**
   * Buscar un registro por campo específico
   */
  async buscarUnoPorCampo(campo: string, valor: any): Promise<T | null> {
    const sql = `SELECT * FROM ${this.tabla} WHERE ${campo} = ? LIMIT 1`;
    const [rows] = await db.query(sql, [valor]);
    const resultado = rows as any[];
    
    if (resultado.length === 0) {
      return null;
    }
    
    return this.mapearResultado(resultado[0]!);
  }

  /**
   * Verificar si existe un registro con un campo específico
   */
  async existe(campo: string, valor: any, excluirId?: string): Promise<boolean> {
    let sql = `SELECT COUNT(*) as total FROM ${this.tabla} WHERE ${campo} = ?`;
    const params: any[] = [valor];

    if (excluirId) {
      sql += ' AND id != ?';
      params.push(excluirId);
    }

    const [rows] = await db.query(sql, params);
    const resultado = rows as any[];
    return (resultado[0]?.total || 0) > 0;
  }

  /**
   * Buscar registros con texto (LIKE)
   */
  async buscarConTexto(
    campos: string[],
    texto: string,
    filtrosAdicionales: Record<string, any> = {}
  ): Promise<T[]> {
    const condicionesTexto = campos.map(campo => `${campo} LIKE ?`).join(' OR ');
    const parametrosTexto = campos.map(() => `%${texto}%`);
    
    let sql = `SELECT * FROM ${this.tabla} WHERE (${condicionesTexto})`;
    let params = parametrosTexto;

    // Agregar filtros adicionales
    if (Object.keys(filtrosAdicionales).length > 0) {
      const condicionesAdicionales = Object.keys(filtrosAdicionales).map(campo => `${campo} = ?`);
      sql += ` AND ${condicionesAdicionales.join(' AND ')}`;
      params.push(...Object.values(filtrosAdicionales));
    }

    sql += ' ORDER BY fecha_actualizacion DESC';

    const [rows] = await db.query(sql, params);
    const resultado = rows as any[];
    return resultado.map((row: any) => this.mapearResultado(row));
  }

  /**
   * Ejecutar consulta personalizada
   */
  async ejecutarConsultaPersonalizada(sql: string, params: any[] = []): Promise<any[]> {
    const [rows] = await db.query(sql, params);
    return rows as any[];
  }

  /**
   * Obtener estadísticas básicas de la tabla
   */
  async obtenerEstadisticas(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    ultimaActualizacion: string | null;
  }> {
    const [total, activos, ultimaAct] = await Promise.all([
      this.contar(),
      this.contar({ activo: 1 }),
      db.query(`SELECT MAX(fecha_actualizacion) as ultima FROM ${this.tabla}`)
    ]);

    return {
      total,
      activos,
      inactivos: total - activos,
      ultimaActualizacion: (ultimaAct && ultimaAct[0] && (ultimaAct[0] as any).ultima) || null
    };
  }

  /**
   * Método abstracto para mapear resultados de la base de datos al tipo T
   */
  protected abstract mapearResultado(row: any): T;

  /**
   * Método para validar datos antes de crear/actualizar
   */
  protected validarDatos(_datos: Partial<T>): void {
    // Implementación base - puede ser sobrescrita por los modelos específicos
  }

  /**
   * Método para preparar datos antes de guardar en la base de datos
   */
  protected prepararDatos(datos: Partial<T>): Record<string, any> {
    // Implementación base - convierte fechas y limpia datos
    const datosPreparados: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(datos)) {
      if (value instanceof Date) {
        datosPreparados[key] = value.toISOString();
      } else if (value !== undefined) {
        datosPreparados[key] = value;
      }
    }
    
    return datosPreparados;
  }
}
