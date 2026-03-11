import { usuarioModel } from '../models';
import { LoginDTO, AutenticacionRespuesta, CrearUsuarioDTO } from '../types';
import { AutenticacionError, ValidacionError } from '../types';
import { generarJWT } from '../utils/helpers';

export class AuthService {
  /**
   * Autenticar usuario y generar token
   */
  async login(datos: LoginDTO): Promise<AutenticacionRespuesta> {
    // Autenticar usuario
    const usuario = await usuarioModel.autenticar(datos.email, datos.password);

    // Generar token JWT
    const token = generarJWT({
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol
      }
    };
  }

  /**
   * Registrar nuevo usuario (solo admins pueden crear usuarios)
   */
  async registrar(datos: CrearUsuarioDTO): Promise<AutenticacionRespuesta> {
    // Crear usuario
    const usuario = await usuarioModel.crearUsuario(datos);

    // Generar token para el nuevo usuario
    const token = generarJWT({
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol
      }
    };
  }

  /**
   * Verificar si el token es válido y obtener información del usuario
   */
  async verificarToken(userId: string): Promise<{
    valido: boolean;
    usuario?: {
      id: string;
      email: string;
      nombre: string;
      apellido: string;
      rol: string;
      activo: boolean;
    };
  }> {
    try {
      const usuario = await usuarioModel.buscarPorId(userId);
      
      if (!usuario) {
        return { valido: false };
      }

      if (!usuario.activo) {
        return { valido: false };
      }

      return {
        valido: true,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rol: usuario.rol,
          activo: usuario.activo
        }
      };
    } catch (error) {
      return { valido: false };
    }
  }

  /**
   * Cambiar contraseña del usuario
   */
  async cambiarPassword(
    userId: string,
    passwordActual: string,
    passwordNueva: string
  ): Promise<void> {
    await usuarioModel.cambiarPassword(userId, passwordActual, passwordNueva);
  }

  /**
   * Actualizar perfil del usuario
   */
  async actualizarPerfil(
    userId: string,
    datos: { nombre?: string; apellido?: string; email?: string }
  ) {
    return usuarioModel.actualizarPerfil(userId, datos);
  }

  /**
   * Obtener perfil del usuario
   */
  async obtenerPerfil(userId: string) {
    const usuario = await usuarioModel.buscarPorId(userId);
    
    if (!usuario) {
      throw new AutenticacionError('Usuario no encontrado');
    }

    // No devolver la contraseña
    const { password, ...perfilUsuario } = usuario;
    return perfilUsuario;
  }

  /**
   * Resetear contraseña (generar nueva temporal)
   */
  async resetearPassword(email: string): Promise<string> {
    return usuarioModel.resetearPassword(email);
  }

  /**
   * Validar permisos del usuario para una acción
   */
  validarPermisos(
    usuarioRol: 'admin' | 'usuario' | 'consulta' | 'tiempos' | 'estructura',
    accionRequerida: 'leer' | 'escribir' | 'administrar'
  ): boolean {
    const permisos = {
      admin: ['leer', 'escribir', 'administrar'],
      usuario: ['leer', 'escribir'],
      consulta: ['leer'],
      tiempos: ['leer', 'escribir'], // Solo para módulo de tiempos
      estructura: ['leer', 'escribir'] // Solo para módulo de estructura
    };

    return permisos[usuarioRol].includes(accionRequerida);
  }

  /**
   * Verificar si el usuario puede acceder a un recurso específico
   */
  async verificarAccesoRecurso(
    userId: string,
    recursoId: string,
    tipoRecurso: 'usuario' | 'general'
  ): Promise<boolean> {
    const usuario = await usuarioModel.buscarPorId(userId);
    
    if (!usuario || !usuario.activo) {
      return false;
    }

    // Los admins pueden acceder a todo
    if (usuario.rol === 'admin') {
      return true;
    }

    // Para recursos de usuario, solo puede acceder a sus propios datos
    if (tipoRecurso === 'usuario') {
      return userId === recursoId;
    }

    // Para recursos generales, depende del rol
    return this.validarPermisos(usuario.rol, 'leer');
  }

  /**
   * Obtener estadísticas de autenticación
   */
  async obtenerEstadisticasAuth(): Promise<{
    totalUsuarios: number;
    usuariosActivos: number;
    usuariosPorRol: Record<string, number>;
    ultimoLogin?: string;
  }> {
    const estadisticas = await usuarioModel.obtenerEstadisticasUsuarios();
    
    return {
      totalUsuarios: estadisticas.total,
      usuariosActivos: estadisticas.activos,
      usuariosPorRol: estadisticas.porRol,
      ultimoLogin: estadisticas.ultimoRegistro || 'No disponible'
    };
  }

  /**
   * Validar fuerza de la contraseña
   */
  validarFortalezaPassword(password: string): {
    esValida: boolean;
    puntuacion: number;
    sugerencias: string[];
  } {
    let puntuacion = 0;
    const sugerencias: string[] = [];

    // Longitud mínima
    if (password.length >= 8) {
      puntuacion += 1;
    } else {
      sugerencias.push('Debe tener al menos 8 caracteres');
    }

    // Longitud ideal
    if (password.length >= 12) {
      puntuacion += 1;
    } else {
      sugerencias.push('Se recomienda al menos 12 caracteres');
    }

    // Mayúsculas
    if (/[A-Z]/.test(password)) {
      puntuacion += 1;
    } else {
      sugerencias.push('Incluir al menos una letra mayúscula');
    }

    // Minúsculas
    if (/[a-z]/.test(password)) {
      puntuacion += 1;
    } else {
      sugerencias.push('Incluir al menos una letra minúscula');
    }

    // Números
    if (/\d/.test(password)) {
      puntuacion += 1;
    } else {
      sugerencias.push('Incluir al menos un número');
    }

    // Caracteres especiales
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      puntuacion += 1;
    } else {
      sugerencias.push('Incluir al menos un carácter especial');
    }

    // Evitar patrones comunes
    const patronesComunes = ['123456', 'password', 'admin', 'qwerty', '111111'];
    const esPatronComun = patronesComunes.some(patron => 
      password.toLowerCase().includes(patron)
    );

    if (esPatronComun) {
      puntuacion -= 2;
      sugerencias.push('Evitar patrones comunes como "123456" o "password"');
    }

    const esValida = puntuacion >= 4 && password.length >= 6;

    return {
      esValida,
      puntuacion: Math.max(0, puntuacion),
      sugerencias
    };
  }

  /**
   * Generar token de recuperación (para funcionalidad futura)
   */
  async generarTokenRecuperacion(email: string): Promise<{
    token: string;
    expira: Date;
  }> {
    // Verificar que el usuario existe
    const usuario = await usuarioModel.buscarPorEmail(email);
    
    if (!usuario || !usuario.activo) {
      throw new AutenticacionError('Usuario no encontrado o inactivo');
    }

    // Generar token temporal (válido por 1 hora)
    const expira = new Date();
    expira.setHours(expira.getHours() + 1);

    const token = generarJWT({
      id: usuario.id,
      email: usuario.email,
      tipo: 'recuperacion',
      expira: expira.getTime()
    });

    return { token, expira };
  }

  /**
   * Verificar si un usuario es el último administrador
   */
  async esUltimoAdmin(userId: string): Promise<boolean> {
    return usuarioModel.esUltimoAdmin(userId);
  }

  /**
   * Desactivar usuario (soft delete)
   */
  async desactivarUsuario(userId: string, adminId: string): Promise<void> {
    // Verificar que no sea el último admin
    if (await this.esUltimoAdmin(userId)) {
      throw new ValidacionError('No se puede desactivar el último administrador del sistema');
    }

    // Verificar que no se esté desactivando a sí mismo
    if (userId === adminId) {
      throw new ValidacionError('No puedes desactivar tu propia cuenta');
    }

    await usuarioModel.cambiarEstado(userId, false);
  }

  /**
   * Activar usuario
   */
  async activarUsuario(userId: string): Promise<void> {
    await usuarioModel.cambiarEstado(userId, true);
  }
}

// Instancia singleton del servicio
export const authService = new AuthService();
