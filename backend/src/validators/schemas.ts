import Joi from 'joi';
import { NivelJerarquico } from '../types';

// Esquemas base
const idSchema = Joi.alternatives().try(
  Joi.string().uuid(),
  Joi.number().integer().positive()
).required();
const fechaSchema = Joi.date().iso();
const emailSchema = Joi.string().email().required();
const passwordSchema = Joi.string().min(6).max(50).required();
const nombreSchema = Joi.string().min(2).max(100).required();
const codigoSchema = Joi.string().min(2).max(50).required();
const descripcionSchema = Joi.string().max(500).allow('').optional();
const nombreActividadSchema = Joi.string().min(2).required();

// Esquemas de validación para usuarios
export const loginSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema
});

export const crearUsuarioSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  nombre: nombreSchema,
  apellido: nombreSchema,
  rol: Joi.string().valid('admin', 'usuario', 'consulta', 'tiempos', 'estructura').required()
});

export const actualizarUsuarioSchema = Joi.object({
  email: emailSchema.optional(),
  nombre: nombreSchema.optional(),
  apellido: nombreSchema.optional(),
  rol: Joi.string().valid('admin', 'usuario', 'consulta', 'tiempos', 'estructura').optional(),
  activo: Joi.boolean().optional()
});

// Esquemas para dependencias
export const crearDependenciaSchema = Joi.object({
  nombre: nombreSchema
});

export const actualizarDependenciaSchema = Joi.object({
  nombre: nombreSchema.optional(),
  descripcion: descripcionSchema,
  codigo: codigoSchema.optional(),
  activa: Joi.boolean().optional()
});

// Esquemas para procesos
export const crearProcesoSchema = Joi.object({
  dependenciaId: idSchema,
  nombre: nombreSchema,
  descripcion: descripcionSchema,
  orden: Joi.number().integer().min(1).required()
});

export const actualizarProcesoSchema = Joi.object({
  dependenciaId: idSchema.optional(),
  nombre: nombreSchema.optional(),
  descripcion: descripcionSchema,
  codigo: codigoSchema.optional(),
  orden: Joi.number().integer().min(1).optional(),
  activo: Joi.boolean().optional()
});

// Esquemas para actividades
export const crearActividadSchema = Joi.object({
  procesoId: idSchema.optional(),
  procedimientoId: idSchema.optional(),
  nombre: nombreActividadSchema,
  descripcion: descripcionSchema,
  orden: Joi.number().integer().min(1).required()
}).custom((value, helpers) => {
  // Validar que se proporcione al menos uno de los dos IDs
  if (!value.procesoId && !value.procedimientoId) {
    return helpers.error('any.custom', {
      message: 'Debe proporcionar un procesoId o un procedimientoId'
    });
  }
  return value;
});

export const actualizarActividadSchema = Joi.object({
  procesoId: idSchema.optional(),
  procedimientoId: idSchema.optional(),
  nombre: nombreActividadSchema.optional(),
  descripcion: descripcionSchema,
  codigo: codigoSchema.optional(),
  orden: Joi.number().integer().min(1).optional(),
  activa: Joi.boolean().optional()
});

// Esquemas para procedimientos
export const crearProcedimientoSchema = Joi.object({
  actividadId: idSchema,
  nombre: nombreSchema,
  descripcion: descripcionSchema,
  codigo: Joi.string().max(50).allow('').optional(),
  requisitos: Joi.string().max(1000).allow('').optional(),
  nivelJerarquico: Joi.string().valid(...Object.values(NivelJerarquico)).required(),
  orden: Joi.number().integer().min(1).required()
});

export const actualizarProcedimientoSchema = Joi.object({
  actividadId: idSchema.optional(),
  nombre: nombreSchema.optional(),
  descripcion: descripcionSchema,
  codigo: codigoSchema.optional(),
  requisitos: Joi.string().min(10).max(1000).optional(),
  nivelJerarquico: Joi.string().valid(...Object.values(NivelJerarquico)).optional(),
  orden: Joi.number().integer().min(1).optional(),
  activo: Joi.boolean().optional()
});

// Esquemas para empleos
export const crearEmpleoSchema = Joi.object({
  nivelJerarquico: Joi.string().valid(...Object.values(NivelJerarquico)).required(),
  denominacion: nombreSchema,
  codigo: codigoSchema,
  grado: Joi.number().integer().min(1).max(30).required(),
  descripcion: descripcionSchema
});

export const actualizarEmpleoSchema = Joi.object({
  nivelJerarquico: Joi.string().valid(...Object.values(NivelJerarquico)).optional(),
  denominacion: nombreSchema.optional(),
  codigo: codigoSchema.optional(),
  grado: Joi.number().integer().min(1).max(30).optional(),
  descripcion: descripcionSchema,
  activo: Joi.boolean().optional()
});

// Esquemas para tiempos de procedimientos
export const crearTiempoProcedimientoSchema = Joi.object({
  procedimientoId: idSchema,
  empleoId: idSchema,
  estructuraId: idSchema.optional(),
  procesoId: idSchema.optional(),
  actividadId: idSchema.optional(),
  frecuenciaMensual: Joi.number().min(0).max(1000).required(),
  tiempoMinimo: Joi.number().min(0).max(9999).required(),
  tiempoPromedio: Joi.number().min(0).max(9999).required(),
  tiempoMaximo: Joi.number().min(0).max(9999).required(),
  observaciones: Joi.string().max(500).allow('').optional()
}).custom((value, helpers) => {
  // Validar que Tmin <= Tprom <= Tmax
  if (value.tiempoMinimo > value.tiempoPromedio) {
    return helpers.error('any.custom', {
      message: 'El tiempo mínimo no puede ser mayor al tiempo promedio'
    });
  }
  if (value.tiempoPromedio > value.tiempoMaximo) {
    return helpers.error('any.custom', {
      message: 'El tiempo promedio no puede ser mayor al tiempo máximo'
    });
  }
  return value;
});

export const actualizarTiempoProcedimientoSchema = Joi.object({
  estructuraId: idSchema.optional(),
  frecuenciaMensual: Joi.number().min(0).max(1000).optional(),
  tiempoMinimo: Joi.number().min(0).max(9999).optional(),
  tiempoPromedio: Joi.number().min(0).max(9999).optional(),
  tiempoMaximo: Joi.number().min(0).max(9999).optional(),
  observaciones: Joi.string().max(500).allow('').optional(),
  activo: Joi.boolean().optional()
}).custom((value, helpers) => {
  // Solo validar si están presentes los tres tiempos
  const { tiempoMinimo, tiempoPromedio, tiempoMaximo } = value;
  
  if (tiempoMinimo !== undefined && tiempoPromedio !== undefined) {
    if (tiempoMinimo > tiempoPromedio) {
      return helpers.error('any.custom', {
        message: 'El tiempo mínimo no puede ser mayor al tiempo promedio'
      });
    }
  }
  
  if (tiempoPromedio !== undefined && tiempoMaximo !== undefined) {
    if (tiempoPromedio > tiempoMaximo) {
      return helpers.error('any.custom', {
        message: 'El tiempo promedio no puede ser mayor al tiempo máximo'
      });
    }
  }
  
  return value;
});

// Esquemas para consultas
export const consultaPaginacionSchema = Joi.object({
  pagina: Joi.number().integer().min(1).default(1),
  limite: Joi.number().integer().min(1).max(100).default(10),
  ordenarPor: Joi.string().optional(),
  direccion: Joi.string().valid('ASC', 'DESC').default('ASC'),
  buscar: Joi.string().max(100).optional()
});

export const consultaReporteSchema = Joi.object({
  dependenciaId: idSchema.optional(),
  procesoId: idSchema.optional(),
  nivelJerarquico: Joi.string().valid(...Object.values(NivelJerarquico)).optional(),
  fechaInicio: fechaSchema.optional(),
  fechaFin: fechaSchema.optional(),
  formato: Joi.string().valid('json', 'csv', 'excel').default('json')
});

// Esquemas para filtros
export const filtroTiemposSchema = Joi.object({
  dependenciaId: idSchema.optional(),
  procesoId: idSchema.optional(),
  actividadId: idSchema.optional(),
  procedimientoId: idSchema.optional(),
  empleoId: idSchema.optional(),
  nivelJerarquico: Joi.string().valid(...Object.values(NivelJerarquico)).optional(),
  activo: Joi.boolean().optional()
});

// Esquema para cambio de contraseña
export const cambiarPasswordSchema = Joi.object({
  passwordActual: passwordSchema,
  passwordNuevo: passwordSchema,
  confirmarPassword: Joi.string().valid(Joi.ref('passwordNuevo')).required()
});

// Esquema para recuperar contraseña
export const recuperarPasswordSchema = Joi.object({
  email: emailSchema
});

// Validador personalizado para archivos de importación
export const importacionSchema = Joi.object({
  tipo: Joi.string().valid('dependencias', 'procesos', 'actividades', 'procedimientos', 'empleos', 'tiempos').required(),
  validarSoloFormato: Joi.boolean().default(false),
  reemplazar: Joi.boolean().default(false)
});

// Esquemas auxiliares exportados
export { idSchema };

export const reordenarSchema = Joi.object({
  ordenes: Joi.array().items(Joi.object({ id: idSchema, orden: Joi.number().integer().min(1).required() })).min(1).required()
});

export const duplicarSchema = Joi.object({
  cantidad: Joi.number().integer().min(1).max(100).default(1)
});
