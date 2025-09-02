import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { generarRespuestaError } from '../utils/helpers';

/**
 * Middleware para validar datos usando esquemas de Joi
 */
export function validar(schema: Joi.ObjectSchema, propiedad: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const datos = req[propiedad];
    
    console.log(`🔍 Validación ${propiedad}:`, datos);
    console.log(`🔍 Schema a validar:`, schema.describe());
    
    const { error, value } = schema.validate(datos, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: true
    });

    if (error) {
      console.log(`❌ Errores de validación en ${propiedad}:`, error.details);
      const errores = error.details.map(detalle => ({
        campo: detalle.path.join('.'),
        mensaje: detalle.message,
        valorRecibido: detalle.context?.value
      }));

      return res.status(400).json(generarRespuestaError(
        'Errores de validación en los datos enviados',
        400,
        { errores }
      ));
    }

    console.log(`✅ Validación ${propiedad} exitosa:`, value);
    // Reemplazar los datos validados y limpiados
    req[propiedad] = value;
    return next();
  };
}

/**
 * Middleware para validar parámetros de ID (UUID o número)
 */
export function validarId(nombreParametro: string = 'id') {
  const schema = Joi.object({
    [nombreParametro]: Joi.alternatives().try(
      Joi.string().uuid(),
      Joi.number().integer().positive()
    ).required()
  });

  return validar(schema, 'params');
}

/**
 * Middleware para validar múltiples IDs (UUID o número)
 */
export function validarIds(...nombresParametros: string[]) {
  const schemaObj: Record<string, Joi.AnySchema> = {};
  
  nombresParametros.forEach(nombre => {
    schemaObj[nombre] = Joi.alternatives().try(
      Joi.string().uuid(),
      Joi.number().integer().positive()
    ).required();
  });

  const schema = Joi.object(schemaObj);
  return validar(schema, 'params');
}

/**
 * Middleware para validar parámetros de consulta opcionales
 */
export function validarConsulta(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: true,
      convert: true
    });

    if (error) {
      const errores = error.details.map(detalle => ({
        parametro: detalle.path.join('.'),
        mensaje: detalle.message,
        valorRecibido: detalle.context?.value
      }));

      return res.status(400).json(generarRespuestaError(
        'Errores en los parámetros de consulta',
        400,
        { errores }
      ));
    }

    req.query = value;
    return next();
  };
}

/**
 * Middleware para validar archivos subidos
 */
export function validarArchivo(
  campoArchivo: string,
  tiposPermitidos: string[] = ['application/json', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  tamaño_maxMB: number = 10
) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const archivo = (req as any).file;

    if (!archivo) {
      return res.status(400).json(generarRespuestaError(
        `El archivo ${campoArchivo} es requerido`,
        400
      ));
    }

    // Validar tipo de archivo
    if (!tiposPermitidos.includes(archivo.mimetype)) {
      return res.status(400).json(generarRespuestaError(
        `Tipo de archivo no permitido. Tipos permitidos: ${tiposPermitidos.join(', ')}`,
        400,
        { tipoRecibido: archivo.mimetype }
      ));
    }

    // Validar tamaño
    const tamañoMaxBytes = tamaño_maxMB * 1024 * 1024;
    if (archivo.size > tamañoMaxBytes) {
      return res.status(400).json(generarRespuestaError(
        `El archivo es demasiado grande. Tamaño máximo permitido: ${tamaño_maxMB}MB`,
        400,
        { tamañoRecibido: `${(archivo.size / 1024 / 1024).toFixed(2)}MB` }
      ));
    }

    next();
  };
}

/**
 * Middleware para validar que el contenido JSON sea válido
 */
export function validarJSON() {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (req.is('application/json')) {
      try {
        // Si llegamos aquí, express ya parseó el JSON correctamente
        next();
      } catch (error) {
        return res.status(400).json(generarRespuestaError(
          'El JSON enviado no es válido',
          400,
          { error: error instanceof Error ? error.message : 'Error desconocido' }
        ));
      }
    } else {
      next();
    }
  };
}

/**
 * Middleware para validar campos requeridos específicos
 */
export function validarCamposRequeridos(campos: string[]) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const camposFaltantes: string[] = [];
    
    campos.forEach(campo => {
      if (req.body[campo] === undefined || req.body[campo] === null || req.body[campo] === '') {
        camposFaltantes.push(campo);
      }
    });

    if (camposFaltantes.length > 0) {
      return res.status(400).json(generarRespuestaError(
        'Campos requeridos faltantes',
        400,
        { camposFaltantes }
      ));
    }

    next();
  };
}

/**
 * Middleware para validar que un valor esté dentro de opciones permitidas
 */
export function validarOpciones(campo: string, opciones: any[], requerido: boolean = true) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const valor = req.body[campo];

    if (!requerido && (valor === undefined || valor === null)) {
      return next();
    }

    if (requerido && (valor === undefined || valor === null)) {
      return res.status(400).json(generarRespuestaError(
        `El campo ${campo} es requerido`,
        400
      ));
    }

    if (!opciones.includes(valor)) {
      return res.status(400).json(generarRespuestaError(
        `Valor no válido para ${campo}`,
        400,
        { 
          valorRecibido: valor, 
          opcionesPermitidas: opciones 
        }
      ));
    }

    next();
  };
}

/**
 * Middleware para validar rangos numéricos
 */
export function validarRango(campo: string, min: number, max: number, requerido: boolean = true) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const valor = req.body[campo];

    if (!requerido && (valor === undefined || valor === null)) {
      return next();
    }

    if (requerido && (valor === undefined || valor === null)) {
      return res.status(400).json(generarRespuestaError(
        `El campo ${campo} es requerido`,
        400
      ));
    }

    const numero = parseFloat(valor);
    if (isNaN(numero) || numero < min || numero > max) {
      return res.status(400).json(generarRespuestaError(
        `El campo ${campo} debe estar entre ${min} y ${max}`,
        400,
        { valorRecibido: valor }
      ));
    }

    // Reemplazar con el número parseado
    req.body[campo] = numero;
    next();
  };
}
