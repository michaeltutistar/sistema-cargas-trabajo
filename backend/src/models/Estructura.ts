import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/mysql';
import { BaseModel } from './BaseModel';
import { ValidacionError, RecursoNoEncontradoError } from '../types';

// Tipos para la gestión de estructura
export interface Estructura {
  id: string;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  usuarioCreadorId: string;
}

export interface ElementoEstructura {
  id: string;
  estructuraId: string;
  tipo: 'dependencia' | 'proceso' | 'actividad' | 'procedimiento' | 'nivel_empleo' | 'empleo';
  elementoId: string;
  padreId?: string;
  orden: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  nombreReal?: string;
}

export interface CrearEstructuraDTO {
  nombre: string;
  descripcion?: string;
  usuarioCreadorId: string;
}

export interface CrearElementoEstructuraDTO {
  estructuraId: string;
  tipo: 'dependencia' | 'proceso' | 'actividad' | 'procedimiento' | 'nivel_empleo' | 'empleo';
  elementoId: string;
  padreId?: string;
  orden?: number;
}

export interface EstructuraCompleta {
  estructura: Estructura;
  elementos: ElementoEstructura[];
}

export class EstructuraModel extends BaseModel<Estructura> {
  constructor() {
    super('estructuras');
  }

  protected mapearResultado(row: any): Estructura {
    return {
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      activa: Boolean(row.activa),
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion),
      usuarioCreadorId: row.usuario_creador_id
    };
  }

  /**
   * Crear una nueva estructura
   */
  async crearEstructura(datos: CrearEstructuraDTO): Promise<Estructura> {
    const id = uuidv4();
    
    console.log('📝 EstructuraModel.crearEstructura - Datos:', { id, nombre: datos.nombre, descripcion: datos.descripcion, usuarioCreadorId: datos.usuarioCreadorId });
    
    try {
      const [result] = await db.query(`
        INSERT INTO estructuras (id, nombre, descripcion, usuario_creador_id)
        VALUES (?, ?, ?, ?)
      `, [id, datos.nombre, datos.descripcion || null, datos.usuarioCreadorId]);

      console.log('✅ Estructura insertada correctamente, resultado:', result);

      const estructura = await this.buscarPorId(id);
      if (!estructura) {
        throw new Error('Error al crear la estructura: no se pudo recuperar después de la inserción');
      }
      return estructura;
    } catch (error: any) {
      console.error('❌ Error en crearEstructura:', error);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error errno:', error?.errno);
      console.error('❌ Error sqlMessage:', error?.sqlMessage);
      console.error('❌ Error sql:', error?.sql);
      throw error;
    }
  }

  /**
   * Obtener estructura por ID
   */
  override async buscarPorId(id: string): Promise<Estructura | null> {
    const [rows] = await db.query(
      'SELECT * FROM estructuras WHERE id = ?',
      [id]
    );

    if ((rows as any[]).length === 0) {
      return null;
    }

    return this.mapearResultado((rows as any[])[0]);
  }

  /**
   * Obtener estructura por nombre
   */
  async buscarPorNombre(nombre: string): Promise<Estructura | null> {
    try {
      const [rows] = await db.query(
        'SELECT * FROM estructuras WHERE nombre = ?',
        [nombre]
      );

      if ((rows as any[]).length === 0) {
        return null;
      }

      return this.mapearResultado((rows as any[])[0]);
    } catch (error: any) {
      console.error('❌ Error en buscarPorNombre:', error);
      // Si la tabla no existe, retornar null en lugar de lanzar error
      if (error?.code === 'ER_NO_SUCH_TABLE') {
        console.warn('⚠️ Tabla estructuras no existe aún');
        return null;
      }
      throw error;
    }
  }

  /**
   * Listar todas las estructuras activas
   */
  async listarActivas(): Promise<Estructura[]> {
    const [rows] = await db.query(
      'SELECT * FROM estructuras WHERE activa = 1 ORDER BY fecha_creacion DESC'
    );

    return (rows as any[]).map(row => this.mapearResultado(row));
  }

  /**
   * Actualizar estructura
   */
  async actualizarEstructura(id: string, datos: Partial<CrearEstructuraDTO>): Promise<Estructura> {
    const estructura = await this.buscarPorId(id);
    if (!estructura) {
      throw new RecursoNoEncontradoError('Estructura no encontrada');
    }

    const camposActualizar = [];
    const valores = [];

    if (datos.nombre !== undefined) {
      camposActualizar.push('nombre = ?');
      valores.push(datos.nombre);
    }

    if (datos.descripcion !== undefined) {
      camposActualizar.push('descripcion = ?');
      valores.push(datos.descripcion);
    }

    if (camposActualizar.length === 0) {
      return estructura;
    }

    valores.push(id);

    await db.query(`
      UPDATE estructuras 
      SET ${camposActualizar.join(', ')}
      WHERE id = ?
    `, valores);

    const estructuraActualizada = await this.buscarPorId(id);
    if (!estructuraActualizada) {
      throw new Error('Error al actualizar la estructura');
    }
    return estructuraActualizada;
  }

  /**
   * Desactivar estructura
   */
  async desactivarEstructura(id: string): Promise<void> {
    const estructura = await this.buscarPorId(id);
    if (!estructura) {
      throw new RecursoNoEncontradoError('Estructura no encontrada');
    }

    await db.query(
      'UPDATE estructuras SET activa = 0 WHERE id = ?',
      [id]
    );
  }

  /**
   * Activar estructura
   */
  async activarEstructura(id: string): Promise<void> {
    const estructura = await this.buscarPorId(id);
    if (!estructura) {
      throw new RecursoNoEncontradoError('Estructura no encontrada');
    }

    await db.query(
      'UPDATE estructuras SET activa = 1 WHERE id = ?',
      [id]
    );
  }
}

export class ElementoEstructuraModel extends BaseModel<ElementoEstructura> {
  constructor() {
    super('elementos_estructura');
  }

  protected mapearResultado(row: any): ElementoEstructura {
    return {
      id: row.id,
      estructuraId: row.estructura_id,
      tipo: row.tipo,
      elementoId: row.elemento_id,
      padreId: row.padre_id,
      orden: row.orden,
      activo: Boolean(row.activo),
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion)
    };
  }

  /**
   * Crear elemento de estructura
   */
  async crearElemento(datos: CrearElementoEstructuraDTO): Promise<ElementoEstructura> {
    const id = uuidv4();
    
    // Obtener el siguiente orden si no se especifica
    let orden = datos.orden;
    if (orden === undefined) {
      const [maxOrder] = await db.query(
        'SELECT COALESCE(MAX(orden), 0) + 1 as next_order FROM elementos_estructura WHERE estructura_id = ? AND tipo = ? AND padre_id = ?',
        [datos.estructuraId, datos.tipo, datos.padreId || null]
      );
      orden = (maxOrder as any[])[0].next_order;
    }

    await db.query(`
      INSERT INTO elementos_estructura (id, estructura_id, tipo, elemento_id, padre_id, orden)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, datos.estructuraId, datos.tipo, datos.elementoId, datos.padreId || null, orden]);

    const elemento = await this.buscarPorId(id);
    if (!elemento) {
      throw new Error('Error al crear el elemento de estructura');
    }
    return elemento;
  }

  /**
   * Obtener elemento por ID
   */
  override async buscarPorId(id: string): Promise<ElementoEstructura | null> {
    const [rows] = await db.query(
      'SELECT * FROM elementos_estructura WHERE id = ?',
      [id]
    );

    if ((rows as any[]).length === 0) {
      return null;
    }

    return this.mapearResultado((rows as any[])[0]);
  }

  /**
   * Obtener elementos por estructura y tipo
   */
  async buscarPorEstructuraYTipo(estructuraId: string, tipo: string): Promise<ElementoEstructura[]> {
    const [rows] = await db.query(
      'SELECT * FROM elementos_estructura WHERE estructura_id = ? AND tipo = ? AND activo = 1 ORDER BY orden',
      [estructuraId, tipo]
    );

    return (rows as any[]).map(row => this.mapearResultado(row));
  }

  /**
   * Obtener elementos hijos de un padre
   */
  async buscarHijos(padreId: string): Promise<ElementoEstructura[]> {
    const [rows] = await db.query(
      'SELECT * FROM elementos_estructura WHERE padre_id = ? AND activo = 1 ORDER BY orden',
      [padreId]
    );

    return (rows as any[]).map(row => this.mapearResultado(row));
  }

  /**
   * Obtener estructura completa jerárquica con nombres reales
   */
  async obtenerEstructuraCompleta(estructuraId: string): Promise<ElementoEstructura[]> {
    const [rows] = await db.query(`
      WITH RECURSIVE estructura_hierarquica AS (
        -- Elementos raíz (sin padre)
        SELECT id, estructura_id, tipo, elemento_id, padre_id, orden, activo, fecha_creacion, fecha_actualizacion, 0 as nivel
        FROM elementos_estructura 
        WHERE estructura_id = ? AND padre_id IS NULL AND activo = 1
        
        UNION ALL
        
        -- Elementos hijos
        SELECT e.id, e.estructura_id, e.tipo, e.elemento_id, e.padre_id, e.orden, e.activo, e.fecha_creacion, e.fecha_actualizacion, eh.nivel + 1
        FROM elementos_estructura e
        INNER JOIN estructura_hierarquica eh ON e.padre_id = eh.id
        WHERE e.activo = 1
      )
      SELECT 
        eh.*,
        CASE 
          WHEN eh.tipo = 'dependencia' THEN d.nombre
          WHEN eh.tipo = 'proceso' THEN p.nombre
          WHEN eh.tipo = 'actividad' THEN a.nombre
          WHEN eh.tipo = 'procedimiento' THEN pr.nombre
          ELSE NULL
        END as nombre_real
      FROM estructura_hierarquica eh
      LEFT JOIN dependencias d ON eh.tipo = 'dependencia' AND eh.elemento_id = d.id
      LEFT JOIN procesos p ON eh.tipo = 'proceso' AND eh.elemento_id = p.id
      LEFT JOIN actividades a ON eh.tipo = 'actividad' AND eh.elemento_id = a.id
      LEFT JOIN procedimientos pr ON eh.tipo = 'procedimiento' AND eh.elemento_id = pr.id
      ORDER BY eh.nivel, eh.orden
    `, [estructuraId]);

    return (rows as any[]).map(row => ({
      ...this.mapearResultado(row),
      nombreReal: row.nombre_real
    }));
  }

  /**
   * Eliminar elemento de estructura
   */
  async eliminarElemento(id: string): Promise<void> {
    const elemento = await this.buscarPorId(id);
    if (!elemento) {
      throw new RecursoNoEncontradoError('Elemento de estructura no encontrado');
    }

    // Verificar si tiene hijos
    const hijos = await this.buscarHijos(id);
    if (hijos.length > 0) {
      throw new ValidacionError('No se puede eliminar un elemento que tiene elementos hijos');
    }

    await db.query(
      'UPDATE elementos_estructura SET activo = 0 WHERE id = ?',
      [id]
    );
  }

  /**
   * Actualizar orden de elementos
   */
  async actualizarOrden(id: string, nuevoOrden: number): Promise<void> {
    const elemento = await this.buscarPorId(id);
    if (!elemento) {
      throw new RecursoNoEncontradoError('Elemento de estructura no encontrado');
    }

    await db.query(
      'UPDATE elementos_estructura SET orden = ? WHERE id = ?',
      [nuevoOrden, id]
    );
  }

  /**
   * Obtener dependencias por estructura
   */
  async obtenerDependenciasPorEstructura(estructuraId: string): Promise<any[]> {
    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.nombre,
        d.descripcion
      FROM dependencias d
      INNER JOIN elementos_estructura ee ON d.id = ee.elemento_id
      WHERE ee.estructura_id = ? AND ee.tipo = 'dependencia' AND ee.activo = 1
      ORDER BY ee.orden
    `, [estructuraId]);

    return rows as any[];
  }
}

// Instancias de los modelos
export const estructuraModel = new EstructuraModel();
export const elementoEstructuraModel = new ElementoEstructuraModel(); 