import { BaseModel } from './BaseModel';
import { Usuario, CrearUsuarioDTO } from '../types';
import { encriptarPassword, compararPassword, validarEmail } from '../utils/helpers';
import { ValidacionError, AutenticacionError } from '../types';
import { db } from '../database/mysql';

export class UsuarioModel extends BaseModel<Usuario> {
  constructor() {
    super('usuarios');
  }

  protected mapearResultado(row: any): Usuario {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      nombre: row.nombre,
      apellido: row.apellido,
      rol: row.rol,
      activo: Boolean(row.activo),
      fechaCreacion: new Date(row.fecha_creacion),
      fechaActualizacion: new Date(row.fecha_actualizacion)
    };
  }

  protected override validarDatos(datos: Partial<Usuario>): void {
    if (datos.email && !validarEmail(datos.email)) {
      throw new ValidacionError('Email no válido');
    }

    if (datos.password && datos.password.length < 6) {
      throw new ValidacionError('La contraseña debe tener al menos 6 caracteres');
    }

    if (datos.rol && !['admin', 'usuario', 'consulta', 'tiempos', 'estructura'].includes(datos.rol)) {
      throw new ValidacionError('Rol no válido');
    }

    if (datos.nombre && datos.nombre.length < 2) {
      throw new ValidacionError('El nombre debe tener al menos 2 caracteres');
    }

    if (datos.apellido && datos.apellido.length < 2) {
      throw new ValidacionError('El apellido debe tener al menos 2 caracteres');
    }
  }

  /**
   * Crear un nuevo usuario con contraseña encriptada
   */
  async crearUsuario(datos: CrearUsuarioDTO): Promise<Usuario> {
    this.validarDatos(datos);

    // Verificar que el email no exista
    const emailExiste = await this.existe('email', datos.email);
    if (emailExiste) {
      throw new ValidacionError('Ya existe un usuario con este email');
    }

    // Encriptar contraseña
    const passwordEncriptada = await encriptarPassword(datos.password);

    const usuarioData = {
      email: datos.email.toLowerCase().trim(),
      password: passwordEncriptada,
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      rol: datos.rol,
      activo: true
    };

    return this.crear(usuarioData);
  }

  /**
   * Buscar usuario por email
   */
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.buscarUnoPorCampo('email', email.toLowerCase().trim());
  }

  /**
   * Autenticar usuario con email y contraseña
   */
  async autenticar(email: string, password: string): Promise<Usuario> {
    const usuario = await this.buscarPorEmail(email);
    console.log('Usuario encontrado:', usuario);

    if (!usuario) {
      console.log('No existe usuario');
      throw new AutenticacionError('Credenciales inválidas');
    }

    if (!usuario.activo) {
      console.log('Usuario inactivo');
      throw new AutenticacionError('Usuario inactivo');
    }

    const passwordValida = await compararPassword(password, usuario.password);
    console.log('Password válida:', passwordValida);

    if (!passwordValida) {
      console.log('Contraseña incorrecta');
      throw new AutenticacionError('Credenciales inválidas');
    }

    return usuario;
  }

  /**
   * Cambiar contraseña de un usuario
   */
  async cambiarPassword(id: string, passwordActual: string, passwordNueva: string): Promise<void> {
    const usuario = await this.buscarPorId(id);
    
    if (!usuario) {
      throw new AutenticacionError('Usuario no encontrado');
    }

    const passwordValida = await compararPassword(passwordActual, usuario.password);
    
    if (!passwordValida) {
      throw new AutenticacionError('Contraseña actual incorrecta');
    }

    if (passwordNueva.length < 6) {
      throw new ValidacionError('La nueva contraseña debe tener al menos 6 caracteres');
    }

    const passwordEncriptada = await encriptarPassword(passwordNueva);
    
    await this.actualizar(id, { password: passwordEncriptada });
  }

  /**
   * Actualizar perfil de usuario (sin contraseña)
   */
  async actualizarPerfil(
    id: string, 
    datos: { nombre?: string; apellido?: string; email?: string }
  ): Promise<Usuario> {
    this.validarDatos(datos);

    // Si se actualiza el email, verificar que no exista
    if (datos.email) {
      const emailExiste = await this.existe('email', datos.email, id);
      if (emailExiste) {
        throw new ValidacionError('Ya existe un usuario con este email');
      }
      datos.email = datos.email.toLowerCase().trim();
    }

    // Limpiar datos
    const datosLimpios: any = {};
    if (datos.nombre) datosLimpios.nombre = datos.nombre.trim();
    if (datos.apellido) datosLimpios.apellido = datos.apellido.trim();
    if (datos.email) datosLimpios.email = datos.email;

    return this.actualizar(id, datosLimpios);
  }

  /**
   * Cambiar rol de un usuario (solo admin)
   */
  async cambiarRol(id: string, nuevoRol: 'admin' | 'usuario' | 'consulta' | 'tiempos' | 'estructura'): Promise<Usuario> {
    if (!['admin', 'usuario', 'consulta', 'tiempos', 'estructura'].includes(nuevoRol)) {
      throw new ValidacionError('Rol no válido');
    }

    return this.actualizar(id, { rol: nuevoRol });
  }

  /**
   * Activar/desactivar usuario
   */
  async cambiarEstado(id: string, activo: boolean): Promise<Usuario> {
    return this.actualizar(id, { activo });
  }

  /**
   * Buscar usuarios por rol
   */
  async buscarPorRol(rol: 'admin' | 'usuario' | 'consulta' | 'tiempos' | 'estructura'): Promise<Usuario[]> {
    return this.buscarPorCampo('rol', rol);
  }

  /**
   * Buscar usuarios activos
   */
  async buscarActivos(): Promise<Usuario[]> {
    return this.buscarPorCampo('activo', 1);
  }

  /**
   * Buscar usuarios con filtros y búsqueda de texto
   */
  async buscarConFiltros(
    filtros: {
      rol?: 'admin' | 'usuario' | 'consulta' | 'tiempos' | 'estructura';
      activo?: boolean;
      busqueda?: string;
    } = {},
    pagina: number = 1,
    limite: number = 10
  ): Promise<{
    usuarios: Usuario[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }> {
    let condiciones: string[] = [];
    let parametros: any[] = [];

    // Filtro por rol
    if (filtros.rol) {
      condiciones.push('rol = ?');
      parametros.push(filtros.rol);
    }

    // Filtro por estado
    if (filtros.activo !== undefined) {
      condiciones.push('activo = ?');
      parametros.push(filtros.activo ? 1 : 0);
    }

    // Búsqueda por texto en nombre, apellido o email
    if (filtros.busqueda) {
      condiciones.push('(nombre LIKE ? OR apellido LIKE ? OR email LIKE ?)');
      const busqueda = `%${filtros.busqueda}%`;
      parametros.push(busqueda, busqueda, busqueda);
    }

    const offset = (pagina - 1) * limite;
    
    let sqlBase = `FROM ${this.tabla}`;
    if (condiciones.length > 0) {
      sqlBase += ` WHERE ${condiciones.join(' AND ')}`;
    }

    // Contar total
    const sqlCount = `SELECT COUNT(*) as total ${sqlBase}`;
    const resultadoCount = await db.query(sqlCount, parametros);
    // MySQL devuelve [rows, fields] - necesitamos solo los rows
    const countRows = Array.isArray(resultadoCount) && resultadoCount.length > 0 ? resultadoCount[0] : resultadoCount;
    const total = (countRows as any[])[0]?.total || 0;

    // Obtener registros
    const sqlSelect = `
      SELECT * ${sqlBase} 
      ORDER BY fecha_creacion DESC 
      LIMIT ? OFFSET ?
    `;
    
    const resultado = await db.query(sqlSelect, [...parametros, limite, offset]);
    
    // MySQL devuelve [rows, fields] - necesitamos solo los rows
    const rows = Array.isArray(resultado) && resultado.length > 0 ? resultado[0] : resultado;
    
    const usuarios = (rows as any[]).map(row => this.mapearResultado(row));
    
    const totalPaginas = Math.ceil(total / limite);

    return {
      usuarios,
      total,
      pagina,
      limite,
      totalPaginas
    };
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async obtenerEstadisticasUsuarios(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    porRol: {
      admin: number;
      usuario: number;
      consulta: number;
      tiempos: number;
      estructura: number;
    };
    ultimoRegistro: string | null;
  }> {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as inactivos,
        SUM(CASE WHEN rol = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN rol = 'usuario' THEN 1 ELSE 0 END) as usuarios,
        SUM(CASE WHEN rol = 'consulta' THEN 1 ELSE 0 END) as consultas,
        SUM(CASE WHEN rol = 'tiempos' THEN 1 ELSE 0 END) as tiempos,
        SUM(CASE WHEN rol = 'estructura' THEN 1 ELSE 0 END) as estructuras,
        MAX(fecha_creacion) as ultimo_registro
      FROM ${this.tabla}
    `;

    const resultado = await db.query(sql);
    // MySQL devuelve [rows, fields] - necesitamos solo los rows
    const statsRows = Array.isArray(resultado) && resultado.length > 0 ? resultado[0] : resultado;
    const stats = (statsRows as any[])[0];

    return {
      total: stats.total || 0,
      activos: stats.activos || 0,
      inactivos: stats.inactivos || 0,
      porRol: {
        admin: stats.admins || 0,
        usuario: stats.usuarios || 0,
        consulta: stats.consultas || 0,
        tiempos: stats.tiempos || 0,
        estructura: stats.estructuras || 0
      },
      ultimoRegistro: stats.ultimo_registro || null
    };
  }

  /**
   * Obtener resumen para dashboard
   */
  async obtenerResumenDashboard(): Promise<{
    totalUsuarios: number;
    usuariosActivos: number;
    nuevoUsuariosEsteMes: number;
    ultimaActividad: string | null;
  }> {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN fecha_creacion >= ? THEN 1 ELSE 0 END) as nuevos_mes,
        MAX(fecha_actualizacion) as ultima_actividad
      FROM ${this.tabla}
    `;

    const resultado = await db.query(sql, [inicioMes.toISOString()]);
    const stats = (resultado[0] as any)!;

    return {
      totalUsuarios: stats.total || 0,
      usuariosActivos: stats.activos || 0,
      nuevoUsuariosEsteMes: stats.nuevos_mes || 0,
      ultimaActividad: stats.ultima_actividad || null
    };
  }

  /**
   * Verificar si un usuario es el último administrador
   */
  async esUltimoAdmin(id: string): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as total 
      FROM ${this.tabla} 
      WHERE rol = 'admin' AND activo = 1 AND id != ?
    `;
    
    const resultado = await db.query(sql, [id]);
    return ((resultado[0] as any)?.total || 0) === 0;
  }

  /**
   * Resetear contraseña (generar temporal)
   */
  async resetearPassword(email: string): Promise<string> {
    const usuario = await this.buscarPorEmail(email);
    
    if (!usuario || !usuario.activo) {
      throw new AutenticacionError('Usuario no encontrado o inactivo');
    }

    // Generar contraseña temporal
    const passwordTemporal = Math.random().toString(36).slice(-8);
    const passwordEncriptada = await encriptarPassword(passwordTemporal);
    
    await this.actualizar(usuario.id, { password: passwordEncriptada });
    
    return passwordTemporal;
  }
}
