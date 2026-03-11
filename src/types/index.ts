// Tipos base del sistema
export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'usuario' | 'consulta' | 'tiempos' | 'estructura';
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Entidades principales
export interface Dependencia {
  id: number;
  nombre: string;
  descripcion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Proceso {
  id: number;
  nombre: string;
  descripcion?: string;
  dependenciaId: number;
  dependencia?: Dependencia;
  createdAt: string;
  updatedAt: string;
}

export interface Actividad {
  id: number;
  nombre: string;
  descripcion?: string;
  procesoId: number;
  proceso?: Proceso;
  createdAt: string;
  updatedAt: string;
}

export interface Procedimiento {
  id: number;
  nombre: string;
  descripcion?: string;
  actividadId: number;
  actividad?: Actividad;
  createdAt: string;
  updatedAt: string;
}

export interface Empleo {
  id: number;
  codigo: string;
  denominacion: string;
  nivelJerarquico: 'DIRECTIVO' | 'PROFESIONAL' | 'TECNICO' | 'ASISTENCIAL' | 'CONTRATISTA' | 'TRABAJADOR_OFICIAL';
  grado?: number;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TiempoProcedimiento {
  id: number;
  procedimientoId: number;
  empleoId: number;
  frecuenciaMensual: number;
  tiempoMinimo: number;
  tiempoPromedio: number;
  tiempoMaximo: number;
  tiempoEstandar: number;
  factorCorrection: number;
  observaciones?: string;
  procedimiento?: Procedimiento;
  empleo?: Empleo;
  createdAt: string;
  updatedAt: string;
}

// Tipos para análisis y reportes
export interface CargaTrabajo {
  dependenciaId: number;
  dependenciaNombre: string;
  empleoId: number;
  empleoNombre: string;
  empleoNivel: string;
  totalTiempoEstandar: number;
  totalProcedimientos: number;
  porcentajeCarga: number;
}

export interface EstadisticaGeneral {
  dependencias: number;
  procesos: number;
  actividades: number;
  procedimientos: number;
  empleos: number;
  tiemposRegistrados: number;
  cargaTotalSistema: number;
  empleadosNecesarios: number;
  porcentajeComplecion: number;
}

// Tipos para formularios
export interface TiempoProcedimientoForm {
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
  observaciones?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: Usuario;
}

// Tipos para filtros y paginación
export interface FiltrosReporte {
  dependenciaId?: number;
  nivel?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface PaginacionParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Tipos para navegación
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  requiredRole?: string[];
}

// Tipos para manejo de errores
export interface ApiError {
  message: string;
  status: number;
  field?: string;
}

// Tipos para gestión de estructura
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
  tipo: 'dependencia' | 'proceso' | 'actividad' | 'procedimiento';
  elementoId: string;
  padreId?: string;
  orden: number;
  activo: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  nombreReal?: string;
}

export interface EstructuraCompleta {
  estructura: Estructura;
  elementos: ElementoEstructura[];
}

export interface CrearEstructuraDTO {
  nombre: string;
  descripcion?: string;
}

export interface CrearElementoEstructuraDTO {
  estructuraId: string;
  tipo: 'dependencia' | 'proceso' | 'actividad' | 'procedimiento';
  elementoId: string;
  padreId?: string;
  orden?: number;
}

export interface CrearProcedimientoDTO {
  actividadId: string;
  nombre: string;
  descripcion?: string;
  nivelJerarquico: string;
  orden: number;
}

export interface CrearActividadDTO {
  nombre: string;
  descripcion?: string;
  procesoId?: string;
  procedimientoId?: string;
  orden: number;
}

export interface CrearUsuarioDTO {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'usuario' | 'consulta' | 'tiempos' | 'estructura';
}


