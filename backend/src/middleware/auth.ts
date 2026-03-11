import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import { AutenticacionError, AutorizacionError } from '../types';
import { generarRespuestaError } from '../utils/helpers';

// Extender el tipo Request para incluir información del usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        email: string;
        nombre: string;
        apellido: string;
        rol: 'admin' | 'usuario' | 'consulta' | 'tiempos' | 'estructura';
      };
    }
  }
}

/**
 * Middleware para autenticar usuarios mediante JWT
 */
export function autenticar() {
  return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      // Obtener token del header Authorization
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(generarRespuestaError(
          'Token de acceso requerido',
          401
        ));
      }

      const token = authHeader.substring(7); // Remover 'Bearer '

      if (!token) {
        return res.status(401).json(generarRespuestaError(
          'Token de acceso no válido',
          401
        ));
      }

      // Verificar el token
      const secret = process.env['JWT_SECRET'] || 'fallback_secret';
      
      try {
        const payload = jwt.verify(token, secret) as any;
        
        // Agregar información del usuario a la request
        req.usuario = {
          id: payload.id,
          email: payload.email,
          nombre: payload.nombre,
          apellido: payload.apellido,
          rol: payload.rol
        };

        next();
      } catch (jwtError) {
        if (jwtError instanceof jwt.TokenExpiredError) {
          return res.status(401).json(generarRespuestaError(
            'Token expirado',
            401
          ));
        } else if (jwtError instanceof jwt.JsonWebTokenError) {
          return res.status(401).json(generarRespuestaError(
            'Token no válido',
            401
          ));
        } else {
          throw jwtError;
        }
      }

    } catch (error) {
      console.error('Error en autenticación:', error);
      return res.status(500).json(generarRespuestaError(
        'Error interno del servidor',
        500
      ));
    }
  };
}

/**
 * Middleware para autorizar usuarios según roles específicos
 */
export function autorizar(...rolesPermitidos: Array<'admin' | 'usuario' | 'consulta' | 'tiempos' | 'estructura'>) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.usuario) {
      return res.status(401).json(generarRespuestaError(
        'Usuario no autenticado',
        401
      ));
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json(generarRespuestaError(
        'No tienes permisos para realizar esta acción',
        403,
        { 
          rolRequerido: rolesPermitidos,
          rolActual: req.usuario.rol 
        }
      ));
    }

    next();
  };
}

/**
 * Middleware para verificar que el usuario sea administrador
 */
export function esAdmin() {
  return autorizar('admin');
}

/**
 * Middleware para verificar que el usuario pueda modificar datos
 */
export function puedeModificar() {
  return autorizar('admin', 'usuario', 'tiempos');
}

/**
 * Middleware para verificar que el usuario pueda consultar datos
 */
export function puedeConsultar() {
  return autorizar('admin', 'usuario', 'consulta', 'tiempos');
}

/**
 * Middleware para sección de estructura (incluye rol dedicado)
 */
export function puedeGestionarEstructura() {
  return autorizar('admin', 'usuario', 'estructura');
}

export function puedeConsultarEstructura() {
  return autorizar('admin', 'usuario', 'consulta', 'estructura');
}

/**
 * Middleware para verificar que el usuario pueda acceder a sus propios datos
 */
export function esPropietarioOAdmin(campoUsuarioId: string = 'usuarioId') {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.usuario) {
      return res.status(401).json(generarRespuestaError(
        'Usuario no autenticado',
        401
      ));
    }

    // Si es admin, puede acceder a cualquier recurso
    if (req.usuario.rol === 'admin') {
      return next();
    }

    // Verificar si es el propietario del recurso
    const usuarioId = req.params[campoUsuarioId] || req.body[campoUsuarioId];
    
    if (usuarioId !== req.usuario.id) {
      return res.status(403).json(generarRespuestaError(
        'Solo puedes acceder a tus propios datos',
        403
      ));
    }

    next();
  };
}

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export function autenticacionOpcional() {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // Continuar sin autenticación
      }

      const token = authHeader.substring(7);
      
      if (!token) {
        return next();
      }

      const secret = process.env['JWT_SECRET'] || 'fallback_secret';
      
      try {
        const payload = jwt.verify(token, secret) as any;
        
        req.usuario = {
          id: payload.id,
          email: payload.email,
          nombre: payload.nombre,
          apellido: payload.apellido,
          rol: payload.rol
        };
      } catch (jwtError) {
        // Ignorar errores de JWT en autenticación opcional
      }

      next();
    } catch (error) {
      // En caso de error, continuar sin autenticación
      next();
    }
  };
}

/**
 * Middleware para verificar que el token no esté en lista negra
 * (Para implementar logout)
 */
export function verificarTokenActivo() {
  // TODO: Implementar lista negra de tokens
  // Por ahora, solo retorna next()
  return (_req: Request, _res: Response, next: NextFunction) => {
    // Aquí se podría verificar contra una base de datos o Redis
    // si el token está en la lista negra
    next();
  };
}

/**
 * Middleware para logging de accesos
 */
export function logAcceso() {
  return (req: Request, _res: Response, next: NextFunction): Response | void => {
    const timestamp = new Date().toISOString();
    const usuario = req.usuario ? `${req.usuario.email} (${req.usuario.rol})` : 'Anónimo';
    const metodo = req.method;
    const ruta = req.originalUrl;
    const ip = req.ip || req.connection.remoteAddress;
    
    console.log(`[${timestamp}] ${metodo} ${ruta} - Usuario: ${usuario} - IP: ${ip}`);
    
    next();
  };
}

/**
 * Middleware para rate limiting por usuario
 */
export function limitarSolicitudes(maxSolicitudes: number = 100, ventanaTiempo: number = 900000) {
  const solicitudes = new Map<string, { cantidad: number; ultimaVentana: number }>();
  
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const identificador = req.usuario?.id || req.ip || 'anonimo';
    const ahora = Date.now();
    const ventanaActual = Math.floor(ahora / ventanaTiempo);
    
    const registro = solicitudes.get(identificador);
    
    if (!registro || registro.ultimaVentana < ventanaActual) {
      // Nueva ventana de tiempo
      solicitudes.set(identificador, {
        cantidad: 1,
        ultimaVentana: ventanaActual
      });
      return next();
    }
    
    if (registro.cantidad >= maxSolicitudes) {
      return res.status(429).json(generarRespuestaError(
        'Demasiadas solicitudes. Intenta de nuevo más tarde.',
        429,
        { 
          maxSolicitudes,
          ventanaTiempo: ventanaTiempo / 1000 // en segundos
        }
      ));
    }
    
    registro.cantidad++;
    next();
  };
}
