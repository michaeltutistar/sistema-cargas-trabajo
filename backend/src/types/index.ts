// Tipos de datos para el Sistema de Gestión de Cargas de Trabajo

export enum NivelJerarquico {
  DIRECTIVO = 'DIRECTIVO',
  ASESOR = 'ASESOR',
  PROFESIONAL = 'PROFESIONAL',
  TECNICO = 'TECNICO',
  ASISTENCIAL = 'ASISTENCIAL',
  CONTRATISTA = 'CONTRATISTA',
  TRABAJADOR_OFICIAL = 'TRABAJADOR_OFICIAL'
}

export interface Usuario {
  id: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'usuario' | 'consulta' | 'tiempos' | 'estructura';
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface Dependencia {
  id: string;
  nombre: string;
  descripcion?: string;
  codigo: string;
  activa: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface Proceso {
  id: string;
  dependenciaId: string;
  nombre: string;
  descripcion?: string;
  codigo: string;
  orden: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface Actividad {
  id: string;
  procesoId: string;
  procedimientoId?: string;
  nombre: string;
  descripcion?: string;
  codigo: string;
  orden: number;
  activa: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface Procedimiento {
  id: string;
  actividadId: string;
  nombre: string;
  descripcion?: string;
  codigo: string;
  requisitos: string;
  nivelJerarquico: NivelJerarquico;
  orden: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface Empleo {
  id: string;
  nivelJerarquico: NivelJerarquico;
  denominacion: string;
  codigo: string;
  grado: number;
  descripcion?: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface TiempoProcedimiento {
  id: string;
  procedimientoId: string;
  empleoId: string;
  estructuraId?: string;
  procesoId?: string;
  actividadId?: string;
  usuarioId: string;
  grado?: number;
  frecuenciaMensual: number;
  tiempoMinimo: number;
  tiempoPromedio: number;
  tiempoMaximo: number;
  tiempoEstandar: number;
  horasDirectivo: number;
  horasAsesor: number;
  horasProfesional: number;
  horasTecnico: number;
  horasAsistencial: number;
  horasContratista: number;
  horasTrabajadorOficial: number;
  observaciones?: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface CargaTrabajo {
  id: string;
  dependenciaId: string;
  procesoId: string;
  actividadId: string;
  procedimientoId: string;
  empleoId: string;
  nivelJerarquico: NivelJerarquico;
  denominacionEmpleo: string;
  horasMensual: number;
  fechaCalculo: Date;
}

export interface TotalesPorNiveles {
  nivelJerarquico: NivelJerarquico;
  totalHoras: number;
}

export interface ResumenTiempos {
  dependenciaId: string;
  dependenciaNombre: string;
  totalProcedimientos: number;
  totalHoras: number;
  porNivelJerarquico: {
    DIRECTIVO: number;
    ASESOR: number;
    PROFESIONAL: number;
    TECNICO: number;
    ASISTENCIAL: number;
  };
}

// DTOs para API
export interface CrearUsuarioDTO {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'usuario' | 'consulta' | 'tiempos' | 'estructura';
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface CrearDependenciaDTO {
  nombre: string;
  descripcion?: string;
  codigo: string;
}

export interface CrearProcesoDTO {
  dependenciaId: string;
  nombre: string;
  descripcion?: string;
  codigo: string;
  orden: number;
}

export interface CrearActividadDTO {
  procesoId?: string;
  procedimientoId?: string;
  nombre: string;
  descripcion?: string;
  codigo: string;
  orden: number;
}

export interface CrearProcedimientoDTO {
  actividadId: string;
  nombre: string;
  descripcion?: string;
  nivelJerarquico: NivelJerarquico;
  orden: number;
}

export interface CrearEmpleoDTO {
  nivelJerarquico: NivelJerarquico;
  denominacion: string;
  codigo: string;
  grado: number;
  descripcion?: string;
}

export interface CrearTiempoProcedimientoDTO {
  procedimientoId: string;
  empleoId: string;
  estructuraId?: string;
  procesoId?: string;
  actividadId?: string;
  grado?: number;
  frecuenciaMensual: number;
  tiempoMinimo: number;
  tiempoPromedio: number;
  tiempoMaximo: number;
  horasDirectivo?: number;
  horasAsesor?: number;
  horasProfesional?: number;
  horasTecnico?: number;
  horasAsistencial?: number;
  horasContratista?: number;
  horasTrabajadorOficial?: number;
  observaciones?: string;
}

export interface ActualizarTiempoProcedimientoDTO {
  frecuenciaMensual?: number;
  tiempoMinimo?: number;
  tiempoPromedio?: number;
  tiempoMaximo?: number;
  horasDirectivo?: number;
  horasAsesor?: number;
  horasProfesional?: number;
  horasTecnico?: number;
  horasAsistencial?: number;
  horasContratista?: number;
  horasTrabajadorOficial?: number;
  observaciones?: string;
}

// Respuestas de API
export interface AutenticacionRespuesta {
  token: string;
  usuario: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: string;
  };
}

export interface ReporteCargas {
  dependencia: string;
  totalHoras: number;
  procesos: Array<{
    nombre: string;
    horas: number;
    actividades: Array<{
      nombre: string;
      horas: number;
      procedimientos: Array<{
        nombre: string;
        horas: number;
        empleos: Array<{
          denominacion: string;
          nivel: NivelJerarquico;
          horas: number;
        }>;
      }>;
    }>;
  }>;
}

export interface ResumenEmpleos {
  nivelJerarquico: NivelJerarquico;
  empleos: Array<{
    denominacion: string;
    codigo: string;
    grado: number;
    totalHoras: number;
    cantidad: number;
  }>;
}

// Errores personalizados
export class ValidacionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidacionError';
  }
}

export class AutenticacionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AutenticacionError';
  }
}

export class AutorizacionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AutorizacionError';
  }
}

export class RecursoNoEncontradoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RecursoNoEncontradoError';
  }
}
