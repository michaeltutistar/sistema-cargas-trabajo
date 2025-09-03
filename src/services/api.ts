import { 
  Usuario, 
  AuthResponse, 
  ApiResponse, 
  Dependencia, 
  Proceso, 
  Actividad, 
  Procedimiento, 
  Empleo, 
  TiempoProcedimiento,
  TiempoProcedimientoForm,
  CargaTrabajo,
  EstadisticaGeneral,
  Estructura,
  ElementoEstructura,
  EstructuraCompleta,
  CrearEstructuraDTO,
  CrearElementoEstructuraDTO,
  CrearActividadDTO
} from '../types';


// Detectar entorno automáticamente
const getApiBaseUrl = (): string => {
  console.log('🔍 getApiBaseUrl() - Detectando URL base...');
  console.log('🔍 window.location.hostname:', window.location.hostname);
  console.log('🔍 window.location.port:', window.location.port);
  
  // Si estamos en desarrollo con Vite (puertos 5173, 5174)
  if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && 
      (window.location.port === '5173' || window.location.port === '5174')) {
    const url = 'http://localhost:3001/api';
    console.log('🔍 Usando URL de desarrollo:', url);
    return url;
  }
  
  // En cualquier otro caso (producción o servidor integrado), usar rutas relativas
  const url = '/api';
  console.log('🔍 Usando URL relativa:', url);
  return url;
};

const API_BASE_URL = getApiBaseUrl();
console.log('🔍 API_BASE_URL inicializada:', API_BASE_URL);

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
    console.log('🔍 ApiService constructor - Token cargado:', !!this.token);
    if (this.token) {
      console.log('🔍 Token (primeros 20 chars):', this.token.substring(0, 20) + '...');
    }
    

  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    console.log('🔑 Token presente:', !!this.token);
    console.log('📋 Headers:', headers);

    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        console.log(`📡 Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ API Error Response:', errorData);
          console.error('❌ API Error Details:', errorData.detalles);
          console.error('❌ API Error Message:', errorData.mensaje);
          
          // Si es un error 429 y no es el último intento, esperar y reintentar
          if (response.status === 429 && attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 1000; // Backoff exponencial: 1s, 2s, 4s
            console.log(`⏳ Rate limit alcanzado. Esperando ${waitTime}ms antes del reintento ${attempt + 1}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          // Mostrar errores específicos si existen
          if (errorData.detalles && errorData.detalles.errores) {
            console.error('❌ Errores específicos:');
            errorData.detalles.errores.forEach((error: any, index: number) => {
              console.error(`  ${index + 1}. Campo: ${error.campo}`);
              console.error(`     Mensaje: ${error.mensaje}`);
              console.error(`     Valor recibido: ${error.valorRecibido}`);
            });
          }
          
          throw new Error(errorData.mensaje || errorData.message || `Error ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ API Response data:', data);
        console.log('📊 Tipo de respuesta:', typeof data);
        console.log('📊 Es objeto?', typeof data === 'object');
        console.log('📊 Tiene propiedad data?', data && 'data' in data);
        console.log('📊 Tiene propiedad success?', data && 'success' in data);
        console.log('📊 Tiene propiedad datos?', data && 'datos' in data);
        
        // Manejar ambas estructuras de respuesta del backend
        if (data && 'datos' in data) {
          // Estructura: {error: false, mensaje: '...', datos: {...}}
          return { success: !data.error, data: data.datos, message: data.mensaje } as T;
        } else if (data && 'data' in data) {
          // Estructura: {success: true, data: {...}, message: '...'}
          return data as T;
        } else {
          // Estructura simple: directamente los datos
          return { success: true, data: data } as T;
        }
      } catch (error) {
        lastError = error;
        console.error(`❌ API Error (intento ${attempt + 1}/${maxRetries + 1}):`, error);
        
        // Si no es el último intento y es un error de red, reintentar
        if (attempt < maxRetries && error instanceof TypeError) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Error de red. Esperando ${waitTime}ms antes del reintento ${attempt + 1}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // Si es el último intento o no es un error de red, lanzar el error
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  // Autenticación
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<ApiResponse<AuthResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.data;
  }

  async getProfile(): Promise<Usuario> {
    const response = await this.request<ApiResponse<Usuario>>('/auth/profile');
    return response.data;
  }

  // Dependencias - Usar API real
  async getDependencias(): Promise<Dependencia[]> {
    console.log('🔍 getDependencias() - Llamando API real');
    const response = await this.request<ApiResponse<Dependencia[]>>('/dependencias');
    console.log('📊 getDependencias response:', response);
    console.log('📊 response.data:', response.data);
    console.log('📊 Tipo de response.data:', typeof response.data);
    console.log('📊 Es array?', Array.isArray(response.data));
    
    // Manejar respuesta paginada del backend
    if (response.data && typeof response.data === 'object' && 'dependencias' in response.data) {
      console.log('📊 Extrayendo dependencias de respuesta paginada');
      return (response.data as any).dependencias;
    }
    
    // Si es directamente un array, devolverlo
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    console.error('❌ Formato de respuesta inesperado:', response.data);
    return [];
  }

  async getDependencia(id: number): Promise<Dependencia> {
    const response = await this.request<ApiResponse<Dependencia>>(`/dependencias/${id}`);
    return response.data;
  }

  async createDependencia(data: { nombre: string; descripcion?: string }): Promise<Dependencia> {
    console.log('🔍 createDependencia() - Llamando API real');
    const response = await this.request<ApiResponse<Dependencia>>('/dependencias', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateDependencia(id: string, data: { nombre?: string; descripcion?: string }): Promise<Dependencia> {
    const response = await this.request<ApiResponse<Dependencia>>(`/dependencias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Procesos - Usar API real
  async getProcesos(dependenciaId?: number): Promise<Proceso[]> {
    console.log('🔍 getProcesos() - Llamando API real');
    let endpoint = '/procesos';
    if (dependenciaId) {
      endpoint += `?dependenciaId=${dependenciaId}`;
    }
    const response = await this.request<ApiResponse<Proceso[]>>(endpoint);
    
    // Manejar respuesta paginada del backend
    if (response.data && typeof response.data === 'object' && 'procesos' in response.data) {
      return (response.data as any).procesos;
    }
    
    // Si es directamente un array, devolverlo
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  }

  async createProceso(data: { nombre: string; descripcion?: string; dependenciaId: number }): Promise<Proceso> {
    console.log('🔍 createProceso() - Llamando API real');
    const response = await this.request<ApiResponse<Proceso>>('/procesos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateProceso(id: string, data: { nombre?: string; descripcion?: string; dependenciaId?: string }): Promise<Proceso> {
    const response = await this.request<ApiResponse<Proceso>>(`/procesos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async getProceso(id: number): Promise<Proceso> {
    const response = await this.request<ApiResponse<Proceso>>(`/procesos/${id}`);
    return response.data;
  }

  // Actividades - Usar API real
  async getActividades(procesoId?: number): Promise<Actividad[]> {
    console.log('🔍 getActividades() - Llamando API real');
    let endpoint = '/actividades';
    if (procesoId) {
      endpoint += `?procesoId=${procesoId}`;
    }
    const response = await this.request<ApiResponse<Actividad[]>>(endpoint);
    
    // Manejar respuesta paginada del backend
    if (response.data && typeof response.data === 'object' && 'actividades' in response.data) {
      return (response.data as any).actividades;
    }
    
    // Si es directamente un array, devolverlo
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  }

  async createActividad(data: CrearActividadDTO): Promise<Actividad> {
    console.log('🔍 createActividad() - Llamando API real');
    const response = await this.request<ApiResponse<Actividad>>('/actividades', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateActividad(id: string, data: { nombre?: string; descripcion?: string; procesoId?: string }): Promise<Actividad> {
    const response = await this.request<ApiResponse<Actividad>>(`/actividades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async getActividad(id: number): Promise<Actividad> {
    const response = await this.request<ApiResponse<Actividad>>(`/actividades/${id}`);
    return response.data;
  }

  // Procedimientos - Usar API real
  async getProcedimientos(actividadId?: number): Promise<Procedimiento[]> {
    console.log('🔍 getProcedimientos() - Llamando API real');
    let endpoint = '/procedimientos';
    if (actividadId) {
      endpoint += `?actividadId=${actividadId}`;
    }
    const response = await this.request<ApiResponse<Procedimiento[]>>(endpoint);
    
    // Manejar respuesta paginada del backend
    if (response.data && typeof response.data === 'object' && 'procedimientos' in response.data) {
      return (response.data as any).procedimientos;
    }
    
    // Si es directamente un array, devolverlo
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  }

  async createProcedimiento(data: { nombre: string; descripcion?: string; actividadId: string; nivelJerarquico?: string; orden?: number }): Promise<Procedimiento> {
    console.log('🔍 createProcedimiento() - Llamando API real');
    const response = await this.request<ApiResponse<Procedimiento>>('/procedimientos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateProcedimiento(id: string, data: { nombre?: string; descripcion?: string; actividadId?: string; nivelJerarquico?: string }): Promise<Procedimiento> {
    const response = await this.request<ApiResponse<Procedimiento>>(`/procedimientos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async getProcedimiento(id: number): Promise<Procedimiento> {
    const response = await this.request<ApiResponse<Procedimiento>>(`/procedimientos/${id}`);
    return response.data;
  }

  // Empleos - Usar API real
  async getEmpleos(): Promise<Empleo[]> {
    console.log('🔍 getEmpleos() - Llamando API real');
    const response = await this.request<ApiResponse<Empleo[]>>('/empleos');
    
    // Manejar respuesta paginada del backend
    if (response.data && typeof response.data === 'object' && 'empleos' in response.data) {
      return (response.data as any).empleos;
    }
    
    // Si es directamente un array, devolverlo
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  }



  async getEmpleosPorNivel(nivel: string): Promise<Empleo[]> {
    console.log('🔍 getEmpleosPorNivel() - Llamando API específica por nivel');
    const response = await this.request<ApiResponse<Empleo[]>>(`/empleos/nivel/${nivel}`);
    
    // Manejar respuesta paginada del backend
    let empleos: Empleo[] = [];
    if (response.data && typeof response.data === 'object' && 'empleos' in response.data) {
      empleos = (response.data as any).empleos;
    } else if (Array.isArray(response.data)) {
      empleos = response.data;
    }
    
    console.log(`📋 Empleos ${nivel} obtenidos:`, empleos.length);
    return empleos;
  }

  async getEmpleo(id: number): Promise<Empleo> {
    console.log('🔍 getEmpleo() - Llamando API real');
    const response = await this.request<ApiResponse<Empleo>>(`/empleos/${id}`);
    return response.data;
  }

  // Tiempos de Procedimientos - Mantener API original
  async getTiemposProcedimientos(params?: {
    procedimientoId?: number;
    empleoId?: number;
  }): Promise<TiempoProcedimiento[]> {
    console.log('🔍 getTiemposProcedimientos() - Iniciando llamada...');
    console.log('📋 Parámetros recibidos:', params);
    
    let endpoint = '/cargas/tiempos';
    const searchParams = new URLSearchParams();
    
    if (params?.procedimientoId) {
      searchParams.append('procedimientoId', params.procedimientoId.toString());
    }
    if (params?.empleoId) {
      searchParams.append('empleoId', params.empleoId.toString());
    }
    
    if (searchParams.toString()) {
      endpoint += `?${searchParams.toString()}`;
    }
    
    console.log('🌐 Endpoint final:', endpoint);
    
    try {
      const response = await this.request<ApiResponse<TiempoProcedimiento[]>>(endpoint);
      console.log('📋 getTiemposProcedimientos() - Respuesta completa:', response);
      console.log('📋 getTiemposProcedimientos() - response.data:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ getTiemposProcedimientos() - Error:', error);
      throw error;
    }
  }

  async createTiempoProcedimiento(data: TiempoProcedimientoForm): Promise<TiempoProcedimiento> {
    console.log('🔍 createTiempoProcedimiento() - Datos a enviar:', data);
    console.log('🔍 createTiempoProcedimiento() - Tipo de procedimientoId:', typeof data.procedimientoId);
    console.log('🔍 createTiempoProcedimiento() - Tipo de empleoId:', typeof data.empleoId);
    console.log('🔍 createTiempoProcedimiento() - estructuraId:', data.estructuraId);
    console.log('🔍 createTiempoProcedimiento() - Tipo de estructuraId:', typeof data.estructuraId);
    console.log('🔍 createTiempoProcedimiento() - Token presente:', !!this.token);
    if (this.token) {
      console.log('🔍 createTiempoProcedimiento() - Token (primeros 20 chars):', this.token.substring(0, 20) + '...');
    }
    
    const body = JSON.stringify(data);
    console.log('🔍 createTiempoProcedimiento() - Body a enviar:', body);
    
    const response = await this.request<ApiResponse<TiempoProcedimiento>>('/cargas/tiempos', {
      method: 'POST',
      body: body,
    });
    return response.data;
  }

  async createMultiplesTiemposProcedimiento(tiempos: TiempoProcedimientoForm[]): Promise<{
    totalProcesados: number;
    exitosos: number;
    errores: number;
    tiemposCreados: TiempoProcedimiento[];
    erroresDetalle: Array<{
      indice: number;
      error: string;
      datos: TiempoProcedimientoForm;
    }>;
  }> {
    console.log('🔍 createMultiplesTiemposProcedimiento() - Datos a enviar:', tiempos);
    
    const response = await this.request<ApiResponse<{
      totalProcesados: number;
      exitosos: number;
      errores: number;
      tiemposCreados: TiempoProcedimiento[];
      erroresDetalle: Array<{
        indice: number;
        error: string;
        datos: TiempoProcedimientoForm;
      }>;
    }>>('/cargas/tiempos/multiples', {
      method: 'POST',
      body: JSON.stringify({ tiempos }),
    });
    return response.data;
  }

  async finalizarRegistroTiempos(tiempos: TiempoProcedimientoForm[]): Promise<{
    totalProcesados: number;
    exitosos: number;
    errores: number;
    tiemposProcesados: TiempoProcedimiento[];
    erroresDetalle: Array<{
      indice: number;
      error: string;
      datos: TiempoProcedimientoForm;
    }>;
  }> {
    console.log('🔍 finalizarRegistroTiempos() - Datos a enviar:', tiempos);
    
    const response = await this.request<ApiResponse<{
      totalProcesados: number;
      exitosos: number;
      errores: number;
      tiemposProcesados: TiempoProcedimiento[];
      erroresDetalle: Array<{
        indice: number;
        error: string;
        datos: TiempoProcedimientoForm;
      }>;
    }>>('/cargas/tiempos/finalizar-registro', {
      method: 'POST',
      body: JSON.stringify({ tiempos }),
    });
    return response.data;
  }

  async updateTiempoProcedimiento(id: string, data: Partial<TiempoProcedimientoForm>): Promise<TiempoProcedimiento> {
    const response = await this.request<ApiResponse<TiempoProcedimiento>>(`/cargas/tiempos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteTiempoProcedimiento(id: string): Promise<void> {
    await this.request<ApiResponse<void>>(`/cargas/tiempos/${id}`, {
      method: 'DELETE',
    });
  }

  // Análisis de Cargas de Trabajo - Usar datos de ejemplo
  async getCargasTrabajo(filtros?: {
    dependenciaId?: number;
    nivel?: string;
  }): Promise<CargaTrabajo[]> {
    console.log('🔍 getCargasTrabajo() - Llamando API real');
    let endpoint = '/cargas/consolidadas';
    const params = new URLSearchParams();
    
    if (filtros?.dependenciaId) params.append('dependenciaId', filtros.dependenciaId.toString());
    if (filtros?.nivel) params.append('nivelJerarquico', filtros.nivel);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const response = await this.request<ApiResponse<CargaTrabajo[]>>(endpoint);
    return response.data;
  }

  async getEstadisticas(): Promise<EstadisticaGeneral> {
    console.log('🔍 getEstadisticas() - Llamando API real');
    const response = await this.request<ApiResponse<EstadisticaGeneral>>('/cargas/stats');
    return response.data;
  }

  // Health Check
  async healthCheck(): Promise<any> {
    return await this.request('/health');
  }

  // Gestión de Estructura
  async getEstructuras(): Promise<Estructura[]> {
    const response = await this.request<ApiResponse<Estructura[]>>('/estructura');
    return response.data;
  }

  async getEstructura(id: string): Promise<Estructura> {
    const response = await this.request<ApiResponse<Estructura>>(`/estructura/${id}`);
    return response.data;
  }

  async createEstructura(data: CrearEstructuraDTO): Promise<Estructura> {
    const response = await this.request<ApiResponse<Estructura>>('/estructura', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateEstructura(id: string, data: Partial<CrearEstructuraDTO>): Promise<Estructura> {
    const response = await this.request<ApiResponse<Estructura>>(`/estructura/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async desactivarEstructura(id: string): Promise<void> {
    await this.request<ApiResponse<void>>(`/estructura/${id}/desactivar`, {
      method: 'DELETE',
    });
  }

  async activarEstructura(id: string): Promise<void> {
    await this.request<ApiResponse<void>>(`/estructura/${id}/activar`, {
      method: 'PUT',
    });
  }

  async getEstructuraCompleta(id: string): Promise<EstructuraCompleta> {
    const response = await this.request<ApiResponse<EstructuraCompleta>>(`/estructura/${id}/completa`);
    return response.data;
  }

  async agregarElementoEstructura(data: CrearElementoEstructuraDTO): Promise<ElementoEstructura> {
    const response = await this.request<ApiResponse<ElementoEstructura>>('/estructura/elemento', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async eliminarElementoEstructura(id: string): Promise<void> {
    await this.request<ApiResponse<void>>(`/estructura/elemento/${id}`, {
      method: 'DELETE',
    });
  }

  async getElementosPorTipo(estructuraId: string, tipo: string): Promise<ElementoEstructura[]> {
    const response = await this.request<ApiResponse<ElementoEstructura[]>>(`/estructura/${estructuraId}/elementos/${tipo}`);
    return response.data;
  }

  // Métodos para crear elementos individuales
  async crearDependencia(nombre: string): Promise<any> {
    const response = await this.request<ApiResponse<any>>('/dependencias', {
      method: 'POST',
      body: JSON.stringify({ nombre }),
    });
    return response.data;
  }

  async crearProceso(data: { nombre: string; dependenciaId: string; orden: number }): Promise<any> {
    const response = await this.request<ApiResponse<any>>('/procesos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }





  async crearNivelEmpleo(nombre: string): Promise<any> {
    // TODO: Implementar cuando se cree el endpoint
    throw new Error('Endpoint de niveles de empleo no implementado aún');
  }

  async crearEmpleo(data: { 
    denominacion: string; 
    nivelJerarquico: string; 
    codigo: string; 
    grado: number 
  }): Promise<any> {
    const response = await this.request<ApiResponse<any>>('/empleos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Métodos para reportes
  async getDependenciasPorEstructura(estructuraId: string): Promise<Dependencia[]> {
    const response = await this.request<ApiResponse<Dependencia[]>>(`/estructura/${estructuraId}/dependencias`);
    return response.data;
  }

  async getTotalesPorNiveles(dependenciaId: string): Promise<ApiResponse<any[]>> {
    return await this.request<ApiResponse<any[]>>(`/cargas/tiempos/totales-por-niveles/${dependenciaId}`);
  }

  async getProcedimientosPorDependencia(dependenciaId: string): Promise<ApiResponse<any[]>> {
    return await this.request<ApiResponse<any[]>>(`/cargas/tiempos/procedimientos-por-dependencia/${dependenciaId}`);
  }
}

export const apiService = new ApiService();

// Gestión de Usuarios
export const usuarioService = {
  // Obtener todos los usuarios con filtros
  async getUsuarios(filtros: any = {}, pagina: number = 1, limite: number = 10) {
    const params = new URLSearchParams({
      pagina: pagina.toString(),
      limite: limite.toString(),
      ...filtros
    });
    
    const response = await fetch(`${API_BASE_URL}/usuarios?${params}`, {
      headers: {
        'Authorization': `Bearer ${apiService.getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }
    
    return response.json();
  },

  // Crear nuevo usuario
  async crearUsuario(datos: any) {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiService.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al crear usuario');
    }
    
    return response.json();
  },

  // Actualizar usuario
  async actualizarUsuario(id: string, datos: any) {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiService.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al actualizar usuario');
    }
    
    return response.json();
  },

  // Cambiar rol de usuario
  async cambiarRol(id: string, rol: string) {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}/rol`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiService.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rol })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al cambiar rol');
    }
    
    return response.json();
  },

  // Cambiar estado de usuario
  async cambiarEstado(id: string, activo: boolean) {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}/estado`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiService.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ activo })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al cambiar estado');
    }
    
    return response.json();
  },

  // Eliminar usuario
  async eliminarUsuario(id: string) {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiService.getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al eliminar usuario');
    }
    
    return response.json();
  },

  // Obtener estadísticas de usuarios
  async getEstadisticasUsuarios() {
    const response = await fetch(`${API_BASE_URL}/usuarios/stats/estadisticas`, {
      headers: {
        'Authorization': `Bearer ${apiService.getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener estadísticas de usuarios');
    }
    
    return response.json();
  }
};
