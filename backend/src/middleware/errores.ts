import { Request, Response, NextFunction } from 'express';
import { 
  ValidacionError, 
  AutenticacionError, 
  AutorizacionError, 
  RecursoNoEncontradoError 
} from '../types';
import { generarRespuestaError } from '../utils/helpers';

/**
 * Middleware para manejo centralizado de errores
 */
export function manejarErrores() {
  return (error: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error(`Error en ${req.method} ${req.path}:`, error);

    // Errores personalizados de la aplicación
    if (error instanceof ValidacionError) {
      return res.status(400).json(generarRespuestaError(
        error.message,
        400,
        { tipo: 'ValidacionError' }
      ));
    }

    if (error instanceof AutenticacionError) {
      return res.status(401).json(generarRespuestaError(
        error.message,
        401,
        { tipo: 'AutenticacionError' }
      ));
    }

    if (error instanceof AutorizacionError) {
      return res.status(403).json(generarRespuestaError(
        error.message,
        403,
        { tipo: 'AutorizacionError' }
      ));
    }

    if (error instanceof RecursoNoEncontradoError) {
      return res.status(404).json(generarRespuestaError(
        error.message,
        404,
        { tipo: 'RecursoNoEncontradoError' }
      ));
    }

    // Errores de base de datos SQLite
    if (error.message.includes('SQLITE_CONSTRAINT')) {
      if (error.message.includes('UNIQUE')) {
        return res.status(409).json(generarRespuestaError(
          'Ya existe un registro con estos datos únicos',
          409,
          { tipo: 'ConflictoUnicidad' }
        ));
      }
      
      if (error.message.includes('FOREIGN KEY')) {
        return res.status(400).json(generarRespuestaError(
          'Referencia a un registro que no existe',
          400,
          { tipo: 'ReferenciaInvalida' }
        ));
      }
      
      return res.status(400).json(generarRespuestaError(
        'Violación de restricción de base de datos',
        400,
        { tipo: 'RestriccionBD' }
      ));
    }

    // Errores de JSON malformado
    if (error instanceof SyntaxError && 'body' in error) {
      return res.status(400).json(generarRespuestaError(
        'JSON malformado en la solicitud',
        400,
        { tipo: 'JSONInvalido' }
      ));
    }

    // Errores de límite de tamaño de archivo
    if (error.message.includes('File too large')) {
      return res.status(413).json(generarRespuestaError(
        'El archivo es demasiado grande',
        413,
        { tipo: 'ArchivoMuyGrande' }
      ));
    }

    // Errores de conexión de base de datos
    if (error.message.includes('ENOENT') || error.message.includes('SQLITE_CANTOPEN')) {
      console.error('Error de base de datos:', error);
      return res.status(503).json(generarRespuestaError(
        'Servicio de base de datos no disponible',
        503,
        { tipo: 'ErrorBaseDatos' }
      ));
    }

    // Error por defecto del servidor
    const esProduccion = process.env['NODE_ENV'] === 'production';
    
    return res.status(500).json(generarRespuestaError(
      'Error interno del servidor',
      500,
      esProduccion ? undefined : {
        tipo: 'ErrorInterno',
        stack: error.stack,
        mensaje: error.message
      }
    ));
  };
}

/**
 * Middleware para capturar rutas no encontradas
 */
export function rutaNoEncontrada() {
  return (_req: Request, res: Response) => {
    return res.status(404).json(generarRespuestaError(
      `Ruta ${_req.method} ${_req.path} no encontrada`,
      404,
      { tipo: 'RutaNoEncontrada' }
    ));
  };
}

/**
 * Middleware para manejar promesas rechazadas no capturadas
 */
export function manejarPromesasRechazadas() {
  return (_req: Request, _res: Response, next: NextFunction) => {
    // Envolver el siguiente middleware en un try-catch para promesas
    return Promise.resolve(next()).catch(next);
  };
}

/**
 * Wrapper para funciones async que maneja automáticamente los errores
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Middleware para logging de errores específicos
 */
export function logearError() {
  return (error: Error, req: Request, _res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const metodo = req.method;
    const ruta = req.originalUrl;
    const usuario = req.usuario ? `${req.usuario.email} (${req.usuario.id})` : 'Anónimo';
    const userAgent = req.get('User-Agent') || 'Desconocido';
    const ip = req.ip || req.connection.remoteAddress;

    console.error(`
=== ERROR DETALLADO ===
Timestamp: ${timestamp}
Ruta: ${metodo} ${ruta}
Usuario: ${usuario}
IP: ${ip}
User-Agent: ${userAgent}
Error: ${error.name} - ${error.message}
Stack: ${error.stack}
======================
    `);

    next(error);
  };
}

/**
 * Middleware para validar que el contenido sea JSON cuando se requiera
 */
export function validarContentType(tiposPermitidos: string[] = ['application/json']) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.get('Content-Type');
      
      if (!contentType || !tiposPermitidos.some(tipo => contentType.includes(tipo))) {
        return res.status(415).json(generarRespuestaError(
          'Tipo de contenido no soportado',
          415,
          { 
            tiposPermitidos,
            tipoRecibido: contentType 
          }
        ));
      }
    }
    
    return next();
  };
}

/**
 * Middleware para sanitizar entrada de datos
 */
export function sanitizarEntrada() {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Función recursiva para limpiar objetos
    function limpiarObjeto(obj: any): any {
      if (typeof obj === 'string') {
        // Remover caracteres potencialmente peligrosos
        return obj.trim()
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
      
      if (Array.isArray(obj)) {
        return obj.map(limpiarObjeto);
      }
      
      if (obj && typeof obj === 'object') {
        const objetoLimpio: any = {};
        for (const [key, value] of Object.entries(obj)) {
          objetoLimpio[key] = limpiarObjeto(value);
        }
        return objetoLimpio;
      }
      
      return obj;
    }

    // Limpiar body, query y params
    if (req.body) {
      req.body = limpiarObjeto(req.body);
    }
    
    if (req.query) {
      req.query = limpiarObjeto(req.query);
    }
    
    if (req.params) {
      req.params = limpiarObjeto(req.params);
    }

    return next();
  };
}

/**
 * Middleware para establecer timeout en las requests
 */
export function establecerTimeout(timeoutMs: number = 30000) {
  return (req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        res.status(408).json(generarRespuestaError(
          'Tiempo de espera agotado',
          408,
          { timeoutMs }
        ));
      }
    });
    
    return next();
  };
}
