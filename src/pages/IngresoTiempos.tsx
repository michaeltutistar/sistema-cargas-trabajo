import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Clock, 
  Calculator, 
  Save, 
  AlertTriangle, 
  CheckCircle,
  Info,
  Building,
  Settings,
  FileText,
  Users,
  Activity
} from 'lucide-react';
import { apiService } from '../services/api';
import { 
  Dependencia, 
  Proceso, 
  Actividad, 
  Procedimiento, 
  Empleo, 
  TiempoProcedimientoForm,
  Estructura,
  EstructuraCompleta
} from '../types';


// Schema de validación
const tiempoSchema = z.object({
  dependenciaId: z.number().min(1, 'Selecciona una dependencia'),
  procesoId: z.number().min(1, 'Selecciona un proceso'),
  procedimientoId: z.number().min(1, 'Selecciona un procedimiento'),
  actividadId: z.number().refine((val) => val === 0 || val >= 1, {
    message: 'Ingresar nuevo valor'
  }),
  nivelEmpleo: z.string().min(1, 'Selecciona un nivel de empleo'),
  empleoId: z.number().min(1, 'Selecciona un empleo'),
  grado: z.number().optional().refine((val) => !val || (val >= 1 && val <= 40), {
    message: 'El grado debe estar entre 1 y 40'
  }),
  frecuenciaMensual: z.number().refine((val) => {
    if (val === 0) return false; // Mostrar mensaje personalizado para valor 0
    return !isNaN(val) && [20, 8, 4, 2, 1, 0.5, 0.33, 0.25, 0.17, 0.083, 0.042].includes(val);
  }, {
    message: 'Ingresar nuevo valor'
  }),
  tiempoMinimo: z.number().optional().refine((val) => !val || (!isNaN(val) && val >= 0.001), {
    message: 'El tiempo mínimo debe ser mayor a 0'
  }),
  tiempoPromedio: z.number().optional().refine((val) => !val || (!isNaN(val) && val >= 0.001), {
    message: 'El tiempo promedio debe ser mayor a 0'
  }),
  tiempoMaximo: z.number().optional().refine((val) => !val || (!isNaN(val) && val >= 0.001), {
    message: 'El tiempo máximo debe ser mayor a 0'
  }),
  observaciones: z.string().optional()
}).refine((data) => {
  // Solo validar si todos los campos de tiempo están presentes
  if (!data.tiempoMinimo || !data.tiempoPromedio || !data.tiempoMaximo) {
    return true; // No validar si algún campo está vacío
  }
  return !isNaN(data.tiempoMinimo) && !isNaN(data.tiempoPromedio) && !isNaN(data.tiempoMaximo) &&
         data.tiempoMinimo <= data.tiempoPromedio && data.tiempoPromedio <= data.tiempoMaximo;
}, {
  message: "Debe cumplirse: Tiempo Mínimo ≤ Tiempo Promedio ≤ Tiempo Máximo",
  path: ["tiempoPromedio"]
});

type TiempoFormData = z.infer<typeof tiempoSchema>;

const IngresoTiempos: React.FC = () => {
  const [estructuras, setEstructuras] = useState<Estructura[]>([]);
  const [estructuraSeleccionada, setEstructuraSeleccionada] = useState<Estructura | null>(null);
  
  // Debug: Log cuando cambia estructuraSeleccionada
  useEffect(() => {
    console.log('🔍 useEffect - estructuraSeleccionada cambió:', estructuraSeleccionada);
    console.log('🔍 useEffect - estructuraSeleccionada?.id:', estructuraSeleccionada?.id);
    console.log('🔍 useEffect - estructuraSeleccionada?.nombre:', estructuraSeleccionada?.nombre);
    console.log('🔍 useEffect - estructuraSeleccionada es null?', estructuraSeleccionada === null);
    console.log('🔍 useEffect - estructuraSeleccionada es undefined?', estructuraSeleccionada === undefined);
  }, [estructuraSeleccionada]);
  const [estructuraCompleta, setEstructuraCompleta] = useState<EstructuraCompleta | null>(null);
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [procedimientos, setProcedimientos] = useState<Procedimiento[]>([]);
  const [empleos, setEmpleos] = useState<Empleo[]>([]);
  const [nivelesEmpleo] = useState<string[]>([
    'DIRECTIVO',
    'ASESOR',
    'PROFESIONAL',
    'TECNICO',
    'ASISTENCIAL',
    'CONTRATISTA',
    'TRABAJADOR_OFICIAL'
  ]);
  const [empleosPorNivel, setEmpleosPorNivel] = useState<Empleo[]>([]);
  
  // Estados de entrada (string) para permitir coma y escritura parcial
  const [tiempoMinimoStr, setTiempoMinimoStr] = useState<string>('');
  const [tiempoPromedioStr, setTiempoPromedioStr] = useState<string>('');
  const [tiempoMaximoStr, setTiempoMaximoStr] = useState<string>('');
  
  // Estado para los tiempos guardados en la sesión
  const [tiemposGuardados, setTiemposGuardados] = useState<Array<{
    id: string;
    procedimientoId: string;
    empleoId: string;
    actividadNombre: string;
    procedimientoNombre: string;
    empleoNombre: string;
    tiempoCalculadoPERT: number;
    frecuenciaMensual: number;
    cargaTotal: number;
    fechaCreacion: string;
    // Datos originales para edición
    tiempoMinimo: number;
    tiempoPromedio: number;
    tiempoMaximo: number;
    observaciones?: string;
  }>>([]);

  // Estado para el modal de edición
  const [tiempoEditando, setTiempoEditando] = useState<{
    id: string;
    tiempoMinimo: number;
    tiempoPromedio: number;
    tiempoMaximo: number;
    frecuenciaMensual: number;
    observaciones?: string;
  } | null>(null);
  const [isEditando, setIsEditando] = useState(false);
  const [isFinalizando, setIsFinalizando] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Debug: Log estado de error y éxito (solo cuando cambia)
  useEffect(() => {
    if (error) {
      console.log('🔍 Estado actual - error:', error);
    }
    if (success) {
      console.log('🔍 Estado actual - success:', success);
    }
  }, [error, success]);
  
  const form = useForm<TiempoFormData>({
    resolver: zodResolver(tiempoSchema),
    defaultValues: {
      dependenciaId: 0,
      procesoId: 0,
      procedimientoId: 0,
      actividadId: 0,
      nivelEmpleo: '',
      empleoId: 0,
      grado: undefined as any,
      frecuenciaMensual: 0,
      tiempoMinimo: undefined as any,
      tiempoPromedio: undefined as any,
      tiempoMaximo: undefined as any,
      observaciones: ''
    }
  });

  const watchedValues = form.watch();

  // Sincronizar estados string cuando se hace reset del formulario
  useEffect(() => {
    if (watchedValues.tiempoMinimo == null && tiempoMinimoStr !== '') setTiempoMinimoStr('');
    if (watchedValues.tiempoPromedio == null && tiempoPromedioStr !== '') setTiempoPromedioStr('');
    if (watchedValues.tiempoMaximo == null && tiempoMaximoStr !== '') setTiempoMaximoStr('');
  }, [watchedValues.tiempoMinimo, watchedValues.tiempoPromedio, watchedValues.tiempoMaximo]);

  // Función para determinar si mostrar el campo de grado
  const mostrarCampoGrado = (nivelEmpleo: string): boolean => {
    return ['DIRECTIVO', 'ASESOR', 'PROFESIONAL', 'TECNICO', 'ASISTENCIAL'].includes(nivelEmpleo);
  };

  // Calcular tiempo estándar usando fórmula PERT
  const calcularTiempoEstandar = (tMin: number | undefined, tProm: number | undefined, tMax: number | undefined): number => {
    if (!tMin || !tProm || !tMax || tMin <= 0 || tProm <= 0 || tMax <= 0) return 0;
    return ((tMin + 4 * tProm + tMax) / 6) * 1.07;
  };

  const tiempoEstandar = calcularTiempoEstandar(
    watchedValues.tiempoMinimo,
    watchedValues.tiempoPromedio,
    watchedValues.tiempoMaximo
  );



  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(''); // Limpiar errores previos
        
        // Debug: Verificar autenticación
        const token = localStorage.getItem('token');
        console.log('🔐 Token en localStorage:', token ? 'Presente' : 'Ausente');
        if (token) {
          console.log('🔐 Token (primeros 20 chars):', token.substring(0, 20) + '...');
        }
        
        console.log('🔄 Cargando estructuras, dependencias y empleos...');
        
        // Cargar estructuras
        console.log('📡 Llamando a getEstructuras()...');
        const estructurasData = await apiService.getEstructuras();
        console.log('📋 Respuesta raw de estructuras:', estructurasData);
        
        // Cargar dependencias primero para debug
        console.log('📡 Llamando a getDependencias()...');
        const depData = await apiService.getDependencias();
        console.log('📋 Respuesta raw de dependencias:', depData);
        console.log('📋 Tipo de depData:', typeof depData);
        console.log('📋 Es array?', Array.isArray(depData));
        
        // Cargar empleos
        console.log('📡 Llamando a getEmpleos()...');
        const empData = await apiService.getEmpleos();
        console.log('📋 Respuesta raw de empleos:', empData);
        
        // Verificar que los datos existan y sean arrays
        if (!depData) {
          console.error('❌ depData es null/undefined');
          setError('Error: La API no devolvió datos de dependencias. Verifica que estés autenticado.');
          return;
        }
        
        console.log('📊 depData completo:', JSON.stringify(depData, null, 2));
        
        if (!Array.isArray(depData)) {
          console.error('❌ depData no es un array:', depData);
          console.error('❌ Tipo de depData:', typeof depData);
          console.error('❌ Estructura de depData:', Object.keys(depData || {}));
          setError(`Error: Las dependencias no son un array válido. Tipo recibido: ${typeof depData}`);
          return;
        }
        
        if (!empData || !Array.isArray(empData)) {
          console.error('❌ empData no es un array válido:', empData);
          setError('Error: Los empleos no tienen el formato esperado');
          return;
        }
        
        setEstructuras(estructurasData);
        setDependencias(depData);
        setEmpleos(empData);
        
        console.log('✅ Dependencias cargadas:', depData.length, 'elementos');
        console.log('✅ Empleos cargados:', empData.length, 'elementos');
        
        if (depData.length === 0) {
          console.warn('⚠️ No se encontraron dependencias');
          setError('No se encontraron dependencias en la base de datos. Verifica que el servidor tenga datos.');
        }
        
      } catch (err) {
        console.error('❌ Error al cargar datos iniciales:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(`Error al cargar datos iniciales: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []); // Volver a las dependencias originales

  // Cargar estructura completa cuando se selecciona una estructura
  useEffect(() => {
    const cargarEstructuraCompleta = async () => {
      if (estructuraSeleccionada) {
        try {
          const data = await apiService.getEstructuraCompleta(estructuraSeleccionada.id);
          console.log('📋 Estructura completa recibida:', data);
          setEstructuraCompleta(data);
          
          // Extraer dependencias, procesos, actividades y procedimientos de la estructura
          const dependenciasEstructura = data.elementos.filter(e => e.tipo === 'dependencia');
          const procesosEstructura = data.elementos.filter(e => e.tipo === 'proceso');
          const actividadesEstructura = data.elementos.filter(e => e.tipo === 'actividad');
          const procedimientosEstructura = data.elementos.filter(e => e.tipo === 'procedimiento');
          
          console.log('📋 Elementos extraídos:', {
            dependencias: dependenciasEstructura.length,
            procesos: procesosEstructura.length,
            actividades: actividadesEstructura.length,
            procedimientos: procedimientosEstructura.length
          });
          
          if (dependenciasEstructura.length > 0) {
            console.log('📋 Ejemplo de dependencia:', dependenciasEstructura[0]);
          }
          
          // Crear objetos con los datos disponibles
          const dependenciasData = dependenciasEstructura.map(e => ({
            id: parseInt(e.elementoId),
            nombre: e.nombreReal || `Dependencia ${e.elementoId}`,
            descripcion: '',
            activa: e.activo,
            createdAt: typeof e.fechaCreacion === 'string' ? e.fechaCreacion : e.fechaCreacion.toISOString(),
            updatedAt: typeof e.fechaActualizacion === 'string' ? e.fechaActualizacion : e.fechaActualizacion.toISOString()
          }));
          
          const procesosData = procesosEstructura.map(e => ({
            id: parseInt(e.elementoId),
            nombre: e.nombreReal || `Proceso ${e.elementoId}`,
            descripcion: '',
            dependenciaId: parseInt(e.padreId || '0'),
            activo: e.activo,
            orden: e.orden,
            createdAt: typeof e.fechaCreacion === 'string' ? e.fechaCreacion : e.fechaCreacion.toISOString(),
            updatedAt: typeof e.fechaActualizacion === 'string' ? e.fechaActualizacion : e.fechaActualizacion.toISOString()
          }));
          
          const actividadesData = actividadesEstructura.map(e => ({
            id: parseInt(e.elementoId),
            nombre: e.nombreReal || `Actividad ${e.elementoId}`,
            descripcion: '',
            procesoId: parseInt(e.padreId || '0'),
            activa: e.activo,
            orden: e.orden,
            createdAt: typeof e.fechaCreacion === 'string' ? e.fechaCreacion : e.fechaCreacion.toISOString(),
            updatedAt: typeof e.fechaActualizacion === 'string' ? e.fechaActualizacion : e.fechaActualizacion.toISOString()
          }));
          
          const procedimientosData = procedimientosEstructura.map(e => ({
            id: parseInt(e.elementoId),
            nombre: e.nombreReal || `Procedimiento ${e.elementoId}`,
            descripcion: '',
            actividadId: parseInt(e.padreId || '0'),
            activo: e.activo,
            orden: e.orden,
            codigo: '',
            requisitos: '',
            nivelJerarquico: 'TECNICO',
            createdAt: typeof e.fechaCreacion === 'string' ? e.fechaCreacion : e.fechaCreacion.toISOString(),
            updatedAt: typeof e.fechaActualizacion === 'string' ? e.fechaActualizacion : e.fechaActualizacion.toISOString()
          }));
          
          // Solo cargar las dependencias de la estructura, no todas las dependencias del sistema
          setDependencias(dependenciasData);
          // Los procesos, actividades y procedimientos se cargarán dinámicamente según la selección
          setProcesos([]);
          setActividades([]);
          setProcedimientos([]);
          
          // Resetear el formulario
          form.reset();
        } catch (error) {
          console.error('Error cargando estructura completa:', error);
          setError('Error al cargar la estructura seleccionada');
        }
      }
    };

    cargarEstructuraCompleta();
  }, [estructuraSeleccionada, form]);

  // Filtrar procesos cuando cambia la dependencia (solo si hay estructura seleccionada)
  useEffect(() => {
    if (estructuraCompleta && watchedValues.dependenciaId > 0) {
      // Filtrar procesos que pertenezcan a la dependencia seleccionada
      const procesosFiltrados = estructuraCompleta.elementos
        .filter(e => e.tipo === 'proceso')
        .filter(e => {
          // Buscar el elemento padre (dependencia) del proceso
          const procesoElement = estructuraCompleta.elementos.find(el => el.id === e.padreId);
          return procesoElement && parseInt(procesoElement.elementoId) === watchedValues.dependenciaId;
        })
        .map(e => ({
          id: parseInt(e.elementoId),
          nombre: e.nombreReal || `Proceso ${e.elementoId}`,
          descripcion: '',
          dependenciaId: watchedValues.dependenciaId,
          activo: e.activo,
          orden: e.orden,
          createdAt: typeof e.fechaCreacion === 'string' ? e.fechaCreacion : e.fechaCreacion.toISOString(),
          updatedAt: typeof e.fechaActualizacion === 'string' ? e.fechaActualizacion : e.fechaActualizacion.toISOString()
        }));
      
      console.log('📋 Procesos filtrados para dependencia', watchedValues.dependenciaId, ':', procesosFiltrados);
      setProcesos(procesosFiltrados);
      // Reset campos dependientes
      form.setValue('procesoId', 0);
      form.setValue('procedimientoId', 0);
      form.setValue('actividadId', 0);
      setProcedimientos([]);
      setActividades([]);
    } else if (!estructuraCompleta) {
      setProcesos([]);
      setActividades([]);
      setProcedimientos([]);
    }
  }, [watchedValues.dependenciaId, estructuraCompleta, form]);

  // Filtrar procedimientos cuando cambia el proceso (solo si hay estructura seleccionada)
  useEffect(() => {
    if (estructuraCompleta && watchedValues.procesoId > 0) {
      // Filtrar procedimientos que pertenezcan al proceso seleccionado
      const procedimientosFiltrados = estructuraCompleta.elementos
        .filter(e => e.tipo === 'procedimiento')
        .filter(e => {
          // Buscar el elemento padre (proceso) del procedimiento
          const procedimientoElement = estructuraCompleta.elementos.find(el => el.id === e.padreId);
          return procedimientoElement && parseInt(procedimientoElement.elementoId) === watchedValues.procesoId;
        })
        .map(e => ({
          id: parseInt(e.elementoId),
          nombre: e.nombreReal || `Procedimiento ${e.elementoId}`,
          descripcion: '',
          actividadId: watchedValues.procesoId, // Usar procesoId como actividadId temporal
          activo: e.activo,
          orden: e.orden,
          codigo: '',
          requisitos: '',
          nivelJerarquico: 'TECNICO',
          createdAt: typeof e.fechaCreacion === 'string' ? e.fechaCreacion : e.fechaCreacion.toISOString(),
          updatedAt: typeof e.fechaActualizacion === 'string' ? e.fechaActualizacion : e.fechaActualizacion.toISOString()
        }));
      
      console.log('📋 Procedimientos filtrados para proceso', watchedValues.procesoId, ':', procedimientosFiltrados);
      setProcedimientos(procedimientosFiltrados);
      // Reset campos dependientes
      form.setValue('procedimientoId', 0);
      form.setValue('actividadId', 0);
      setActividades([]);
    } else if (!estructuraCompleta) {
      setProcedimientos([]);
      setActividades([]);
    }
  }, [watchedValues.procesoId, estructuraCompleta, form]);

  // Filtrar actividades cuando cambia el procedimiento (solo si hay estructura seleccionada)
  useEffect(() => {
    if (estructuraCompleta && watchedValues.procedimientoId > 0) {
      // Filtrar actividades que pertenezcan al procedimiento seleccionado
      const actividadesFiltradas = estructuraCompleta.elementos
        .filter(e => e.tipo === 'actividad')
        .filter(e => {
          // Buscar el elemento padre (procedimiento) de la actividad
          const actividadElement = estructuraCompleta.elementos.find(el => el.id === e.padreId);
          return actividadElement && parseInt(actividadElement.elementoId) === watchedValues.procedimientoId;
        })
        .map(e => ({
          id: parseInt(e.elementoId),
          nombre: e.nombreReal || `Actividad ${e.elementoId}`,
          descripcion: '',
          procesoId: watchedValues.procedimientoId, // Usar procedimientoId como procesoId temporal
          activa: e.activo,
          orden: e.orden,
          createdAt: typeof e.fechaCreacion === 'string' ? e.fechaCreacion : e.fechaCreacion.toISOString(),
          updatedAt: typeof e.fechaActualizacion === 'string' ? e.fechaActualizacion : e.fechaActualizacion.toISOString()
        }));
      
      console.log('📋 Actividades filtradas para procedimiento', watchedValues.procedimientoId, ':', actividadesFiltradas);
      setActividades(actividadesFiltradas);
      // Reset campo dependiente
      form.setValue('actividadId', 0);
    } else if (!estructuraCompleta) {
      setActividades([]);
    }
  }, [watchedValues.procedimientoId, estructuraCompleta, form]);

  // Cargar empleos por nivel cuando cambia el nivel seleccionado
  useEffect(() => {
    const loadEmpleosPorNivel = async () => {
      if (watchedValues.nivelEmpleo && watchedValues.nivelEmpleo !== '') {
        try {
          const data = await apiService.getEmpleosPorNivel(watchedValues.nivelEmpleo);
          setEmpleosPorNivel(data);
          // Reset campo dependiente
          form.setValue('empleoId', 0);
        } catch (err) {
          console.error('Error al cargar empleos por nivel:', err);
          setError('Error al cargar empleos por nivel');
        }
      } else {
        setEmpleosPorNivel([]);
      }
    };

    loadEmpleosPorNivel();
  }, [watchedValues.nivelEmpleo, form]);

  const onSubmit = async (data: TiempoFormData) => {
    // Protección contra múltiples clics mejorada
    if (isSubmitting) {
      console.log('⚠️ Ya hay una operación en progreso, ignorando clic adicional');
      return;
    }

    // Establecer isSubmitting inmediatamente para prevenir clics adicionales
    setIsSubmitting(true);
    console.log('🔒 isSubmitting establecido en true');

    console.log('🔍 onSubmit - estructuraSeleccionada:', estructuraSeleccionada);
    console.log('🔍 onSubmit - estructuraSeleccionada?.id:', estructuraSeleccionada?.id);
    console.log('🔍 onSubmit - estructuraSeleccionada?.nombre:', estructuraSeleccionada?.nombre);
    console.log('🔍 onSubmit - estructuras disponibles:', estructuras);
    console.log('🔍 onSubmit - estructuraSeleccionada?.id tipo:', typeof estructuraSeleccionada?.id);
    console.log('🔍 onSubmit - estructuraSeleccionada completo:', JSON.stringify(estructuraSeleccionada, null, 2));
    console.log('🔍 onSubmit - estructuraSeleccionada es null?', estructuraSeleccionada === null);
    console.log('🔍 onSubmit - estructuraSeleccionada es undefined?', estructuraSeleccionada === undefined);
    
    // Validar que se haya seleccionado una estructura
    if (!estructuraSeleccionada) {
      setError('Debe seleccionar una estructura antes de guardar un tiempo');
      console.log('❌ Error: No se ha seleccionado una estructura');
      console.log('❌ Error: estructuraSeleccionada es null o undefined');
      return;
    }

    if (!estructuraSeleccionada.id) {
      setError('La estructura seleccionada no tiene un ID válido');
      console.log('❌ Error: La estructura seleccionada no tiene ID');
      console.log('❌ Error: estructuraSeleccionada.id es:', estructuraSeleccionada.id);
      return;
    }

    console.log('✅ Validación de estructura pasada - estructuraSeleccionada.id:', estructuraSeleccionada.id);
    console.log('✅ Validación de estructura pasada - estructuraSeleccionada:', estructuraSeleccionada);

    try {
      setError('');
      setSuccess('');

      console.log('📊 Datos del formulario:', data);
      console.log('📊 empleoId:', data.empleoId, 'tipo:', typeof data.empleoId);
      console.log('📊 procedimientoId:', data.procedimientoId, 'tipo:', typeof data.procedimientoId);
      
      const formData: TiempoProcedimientoForm = {
        procedimientoId: data.procedimientoId.toString(),
        empleoId: data.empleoId.toString(),
        estructuraId: estructuraSeleccionada?.id,
        procesoId: data.procesoId.toString(),
        actividadId: data.actividadId.toString(),
        grado: data.grado,
        frecuenciaMensual: data.frecuenciaMensual,
        tiempoMinimo: data.tiempoMinimo,
        tiempoPromedio: data.tiempoPromedio,
        tiempoMaximo: data.tiempoMaximo,
        observaciones: data.observaciones
      };

      console.log('📊 formData a enviar:', formData);
      console.log('📊 Estructura seleccionada:', estructuraSeleccionada?.nombre, 'ID:', estructuraSeleccionada?.id);
      console.log('🔍 Debug estructuraSeleccionada:', {
        estructuraSeleccionada,
        id: estructuraSeleccionada?.id,
        nombre: estructuraSeleccionada?.nombre,
        tipo: typeof estructuraSeleccionada?.id
      });
      console.log('🔍 formData.estructuraId:', formData.estructuraId);
      console.log('🔍 formData.estructuraId tipo:', typeof formData.estructuraId);
      console.log('🔍 formData.estructuraId es undefined?', formData.estructuraId === undefined);
      console.log('🔍 formData.estructuraId es null?', formData.estructuraId === null);
      console.log('🔍 formData.estructuraId es string vacío?', formData.estructuraId === '');

      console.log('🚀 Enviando request al backend...');
      
      // Pequeño delay para evitar race conditions
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const tiempoGuardado = await apiService.createTiempoProcedimiento(formData);
      
      console.log('✅ Respuesta exitosa del backend:', tiempoGuardado);
      setSuccess('Tiempo registrado exitosamente');
      console.log('✅ Mensaje de éxito establecido');
      
      // Obtener información de la actividad y empleo para mostrar en la lista
      const actividadSeleccionada = actividades.find(a => a.id === data.actividadId);
      const procedimientoSeleccionado = procedimientos.find(p => p.id === data.procedimientoId);
      const empleoSeleccionado = empleosPorNivel.find(e => e.id === data.empleoId);
      
      // Calcular tiempo PERT y carga total
      const tiempoPERT = ((data.tiempoMinimo || 0) + 4 * (data.tiempoPromedio || 0) + (data.tiempoMaximo || 0)) / 6 * 1.07;
      const cargaTotal = tiempoPERT * data.frecuenciaMensual;
      
      // Agregar el tiempo guardado a la lista de la sesión
      const nuevoTiempo = {
        id: tiempoGuardado.id.toString(),
        procedimientoId: data.procedimientoId.toString(),
        empleoId: data.empleoId.toString(),
        actividadNombre: actividadSeleccionada?.nombre || 'Actividad no encontrada',
        procedimientoNombre: procedimientoSeleccionado?.nombre || 'Procedimiento no encontrado',
        empleoNombre: empleoSeleccionado?.denominacion || 'Empleo no encontrado',
        tiempoCalculadoPERT: tiempoPERT,
        frecuenciaMensual: data.frecuenciaMensual,
        cargaTotal: cargaTotal,
        fechaCreacion: new Date().toISOString(),
        // Datos originales para edición
        tiempoMinimo: data.tiempoMinimo,
        tiempoPromedio: data.tiempoPromedio,
        tiempoMaximo: data.tiempoMaximo,
        observaciones: data.observaciones
      };
      
      setTiemposGuardados(prev => [nuevoTiempo, ...prev]); // Agregar al inicio de la lista
      
      // Reset parcial del formulario (solo campos específicos)
      resetForm();
      
    } catch (err) {
      console.error('❌ Error capturado en onSubmit:', err);
      console.error('❌ Tipo de error:', typeof err);
      console.error('❌ Error instanceof Error:', err instanceof Error);
      if (err instanceof Error) {
        console.error('❌ Error message:', err.message);
        console.error('❌ Error stack:', err.stack);
      }
      setError(err instanceof Error ? err.message : 'Error al guardar el tiempo');
      console.log('❌ Mensaje de error establecido');
    } finally {
      setIsSubmitting(false);
      console.log('🏁 setIsSubmitting(false) ejecutado');
    }
  };

  const resetForm = () => {
    // Obtener los valores actuales de los campos que queremos mantener
    const currentValues = form.getValues();
    
    // Reset completo del formulario
    form.reset();
    
    // Restaurar los valores de los campos que queremos mantener
    form.setValue('dependenciaId', currentValues.dependenciaId);
    form.setValue('procesoId', currentValues.procesoId);
    form.setValue('procedimientoId', currentValues.procedimientoId);
    form.setValue('nivelEmpleo', currentValues.nivelEmpleo);
    form.setValue('empleoId', currentValues.empleoId);
    form.setValue('grado', currentValues.grado);
    
    // Limpiar solo los campos específicos
    form.setValue('actividadId', 0);
    form.setValue('frecuenciaMensual', 0);
    form.setValue('observaciones', '');
    
    // Limpiar campos de tiempo para que aparezcan vacíos
    form.setValue('tiempoMinimo', undefined as any);
    form.setValue('tiempoPromedio', undefined as any);
    form.setValue('tiempoMaximo', undefined as any);
    
    // Recargar actividades para el procedimiento seleccionado
    if (estructuraCompleta && currentValues.procedimientoId) {
      const actividadesFiltradas = estructuraCompleta.elementos
        .filter(e => e.tipo === 'actividad')
        .filter(e => {
          // Buscar el elemento padre (procedimiento) de la actividad
          const actividadElement = estructuraCompleta.elementos.find(el => el.id === e.padreId);
          return actividadElement && parseInt(actividadElement.elementoId) === currentValues.procedimientoId;
        })
        .map(e => ({
          id: parseInt(e.elementoId),
          nombre: e.nombreReal || `Actividad ${e.elementoId}`,
          descripcion: '',
          procesoId: currentValues.procedimientoId, // Usar procedimientoId como procesoId temporal
          activa: e.activo,
          orden: e.orden,
          createdAt: typeof e.fechaCreacion === 'string' ? e.fechaCreacion : e.fechaCreacion.toISOString(),
          updatedAt: typeof e.fechaActualizacion === 'string' ? e.fechaActualizacion : e.fechaActualizacion.toISOString()
        }));
      
      console.log('🔄 Recargando actividades después del reset para procedimiento', currentValues.procedimientoId, ':', actividadesFiltradas);
      setActividades(actividadesFiltradas);
    } else {
      setActividades([]);
    }
    
    setError('');
    // No limpiar el mensaje de éxito aquí para que se mantenga visible
  };

  const limpiarTiemposGuardados = () => {
    setTiemposGuardados([]);
  };

  const editarTiempo = (tiempo: any) => {
    setTiempoEditando({
      id: tiempo.id,
      tiempoMinimo: tiempo.tiempoMinimo,
      tiempoPromedio: tiempo.tiempoPromedio,
      tiempoMaximo: tiempo.tiempoMaximo,
      frecuenciaMensual: tiempo.frecuenciaMensual,
      observaciones: tiempo.observaciones
    });
  };

  const guardarEdicion = async () => {
    if (!tiempoEditando) return;

    try {
      setIsEditando(true);
      setError('');

      // Calcular nuevo tiempo PERT
      const nuevoTiempoPERT = ((tiempoEditando.tiempoMinimo + 4 * tiempoEditando.tiempoPromedio + tiempoEditando.tiempoMaximo) / 6) * 1.07;
      const nuevaCargaTotal = nuevoTiempoPERT * tiempoEditando.frecuenciaMensual;

      // Actualizar en la lista local
      setTiemposGuardados(prev => prev.map(tiempo => 
        tiempo.id === tiempoEditando.id 
          ? {
              ...tiempo,
              tiempoMinimo: tiempoEditando.tiempoMinimo,
              tiempoPromedio: tiempoEditando.tiempoPromedio,
              tiempoMaximo: tiempoEditando.tiempoMaximo,
              frecuenciaMensual: tiempoEditando.frecuenciaMensual,
              observaciones: tiempoEditando.observaciones,
              tiempoCalculadoPERT: nuevoTiempoPERT,
              cargaTotal: nuevaCargaTotal
            }
          : tiempo
      ));

      setSuccess('Tiempo actualizado exitosamente');
      setTiempoEditando(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el tiempo');
    } finally {
      setIsEditando(false);
    }
  };

  const cancelarEdicion = () => {
    setTiempoEditando(null);
    setError('');
  };

  const finalizarRegistroTiempos = async () => {
    if (tiemposGuardados.length === 0) {
      setError('No hay tiempos para guardar en la base de datos');
      return;
    }

    if (!estructuraSeleccionada) {
      setError('Debe seleccionar una estructura antes de finalizar el registro');
      return;
    }

    try {
      setIsFinalizando(true);
      setError('');
      setSuccess('');
      
      // Limpiar errores del formulario para evitar mensajes de validación
      form.clearErrors();

      // Convertir los tiempos guardados al formato esperado por la API
      const tiemposParaGuardar = tiemposGuardados.map(tiempo => {
        if (!tiempo.procedimientoId || !tiempo.empleoId) {
          console.error('❌ Error: tiempo.procedimientoId o tiempo.empleoId es undefined/null:', {
            procedimientoId: tiempo.procedimientoId,
            empleoId: tiempo.empleoId,
            tiempo: tiempo
          });
          throw new Error('Datos de tiempo incompletos');
        }
        
        return {
          procedimientoId: tiempo.procedimientoId,
          empleoId: tiempo.empleoId,
          estructuraId: estructuraSeleccionada?.id,
          frecuenciaMensual: tiempo.frecuenciaMensual,
          tiempoMinimo: tiempo.tiempoMinimo,
          tiempoPromedio: tiempo.tiempoPromedio,
          tiempoMaximo: tiempo.tiempoMaximo,
          observaciones: tiempo.observaciones
        };
      });

      console.log('📊 Tiempos a guardar en BD:', tiemposParaGuardar);

      const resultado = await apiService.finalizarRegistroTiempos(tiemposParaGuardar);

      console.log('✅ Resultado del guardado:', resultado);

      if (resultado.errores > 0) {
        setError(`Se procesaron ${resultado.exitosos} de ${resultado.totalProcesados} tiempos. ${resultado.errores} errores.`);
      } else {
        setSuccess(`¡Éxito! Se finalizó el registro de todos los ${resultado.exitosos} tiempos en la base de datos.`);
        // Limpiar la lista de tiempos guardados en la sesión
        setTiemposGuardados([]);
      }
    } catch (err) {
      console.error('❌ Error finalizando registro:', err);
      setError(err instanceof Error ? err.message : 'Error al finalizar el registro de tiempos');
    } finally {
      setIsFinalizando(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ingreso de Tiempos</h1>
          <p className="text-muted-foreground">
            Registra los tiempos estimados para procedimientos usando metodología PERT
          </p>
        </div>
        <Button variant="outline" onClick={resetForm}>
          Limpiar Formulario
        </Button>
      </div>

      {/* Información sobre la fórmula PERT */}
    

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Registro de Tiempo de Procedimiento
              </CardTitle>
              <CardDescription>
                Completa todos los campos para registrar un nuevo tiempo de procedimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Selección de estructura */}
                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Estructura Organizacional
                      </Label>
                      <Select
                        value={estructuraSeleccionada?.id || ''}
                        onValueChange={(value) => {
                          console.log('🔍 onValueChange - value recibido:', value);
                          console.log('🔍 onValueChange - estructuras disponibles:', estructuras);
                          const estructura = estructuras.find(e => e.id === value);
                          console.log('🔍 Estructura encontrada:', estructura);
                          console.log('🔍 Estructura ID:', estructura?.id);
                          console.log('🔍 Estructura ID tipo:', typeof estructura?.id);
                          setEstructuraSeleccionada(estructura || null);
                          console.log('🔍 setEstructuraSeleccionada llamado con:', estructura || null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una estructura para trabajar" />
                        </SelectTrigger>
                        <SelectContent>
                          {(estructuras || []).map((estructura) => (
                            <SelectItem key={estructura.id} value={estructura.id}>
                              {estructura.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Selección jerárquica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dependenciaId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Dependencia
                          </FormLabel>
                          <Select
                            value={field.value.toString()}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            disabled={!estructuraSeleccionada}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una dependencia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(dependencias || []).map((dep) => (
                                <SelectItem key={dep.id} value={dep.id.toString()}>
                                  {dep.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="procesoId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Proceso
                          </FormLabel>
                          <Select
                            value={field.value.toString()}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            disabled={!estructuraSeleccionada || (procesos || []).length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un proceso" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(procesos || []).map((proceso) => (
                                <SelectItem key={proceso.id} value={proceso.id.toString()}>
                                  {proceso.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="procedimientoId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Procedimiento
                          </FormLabel>
                          <Select
                            value={field.value.toString()}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            disabled={!estructuraSeleccionada || (procedimientos || []).length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un procedimiento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(procedimientos || []).map((proc) => (
                                <SelectItem key={proc.id} value={proc.id.toString()}>
                                  {proc.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="actividadId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Actividad
                          </FormLabel>
                          <Select
                            value={field.value ? field.value.toString() : ''}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            disabled={!estructuraSeleccionada || (actividades || []).length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una actividad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(actividades || []).map((actividad) => (
                                <SelectItem key={actividad.id} value={actividad.id.toString()}>
                                  {actividad.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nivelEmpleo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Nivel de Empleo
                          </FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Reset empleo cuando cambia el nivel
                              form.setValue('empleoId', 0);
                            }}
                            disabled={!estructuraSeleccionada}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un nivel" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {nivelesEmpleo.map((nivel) => (
                                <SelectItem key={nivel} value={nivel}>
                                  {nivel}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="empleoId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Empleo/Cargo
                          </FormLabel>
                          <Select
                            value={field.value ? field.value.toString() : ''}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            disabled={!estructuraSeleccionada || (empleosPorNivel || []).length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un empleo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(empleosPorNivel || []).map((empleo) => (
                                <SelectItem key={empleo.id} value={empleo.id.toString()}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{empleo.codigo} - {empleo.denominacion}</span>
                                    <Badge variant="outline" className="ml-2">
                                      {empleo.nivelJerarquico}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Campo de Grado - Solo visible para ciertos niveles */}
                    {mostrarCampoGrado(watchedValues.nivelEmpleo) && (
                      <FormField
                        control={form.control}
                        name="grado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              Grado
                            </FormLabel>
                            <Select
                              value={field.value?.toString() || ''}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              disabled={!watchedValues.empleoId}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona el grado (01-40)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 40 }, (_, i) => i + 1).map((grado) => (
                                  <SelectItem key={grado} value={grado.toString()}>
                                    {grado.toString().padStart(2, '0')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Grado del empleo (solo aplica para Directivo, Asesor, Profesional, Técnico y Asistencial)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* Datos de tiempo */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="frecuenciaMensual"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frecuencia Mensual</FormLabel>
                          <Select
                            value={field.value ? field.value.toString() : ''}
                            onValueChange={(value) => field.onChange(parseFloat(value))}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona la frecuencia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="20">Diario (20.0)</SelectItem>
                              <SelectItem value="8">Dos veces x semana (8.0)</SelectItem>
                              <SelectItem value="4">Semanal (4.0)</SelectItem>
                              <SelectItem value="2">Quincenal (2.0)</SelectItem>
                              <SelectItem value="1">Mensual (1.0)</SelectItem>
                              <SelectItem value="0.5">Bimestral (0.5)</SelectItem>
                              <SelectItem value="0.33">Trimestral (0.33)</SelectItem>
                              <SelectItem value="0.25">Cuatrimestral (0.25)</SelectItem>
                              <SelectItem value="0.17">Semestral (0.17)</SelectItem>
                              <SelectItem value="0.083">Anual (0.083)</SelectItem>
                              <SelectItem value="0.042">Bianual (0.042)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Frecuencia con la que se ejecuta este procedimiento
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="tiempoMinimo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tiempo Mínimo (horas)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                inputMode="decimal"
                                pattern="[0-9]*[.,]?[0-9]{0,3}"
                                placeholder="0,083"
                                value={tiempoMinimoStr}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  setTiempoMinimoStr(raw);
                                  const normalized = raw.replace(',', '.');
                                  const fullMatch = /^\d+(?:[.,]\d{1,3})?$/.test(raw);
                                  const intOnly = /^\d+$/.test(raw);
                                  if (fullMatch || intOnly) {
                                    const parsed = parseFloat(normalized);
                                    field.onChange(Number.isFinite(parsed) ? parsed : undefined);
                                  }
                                }}
                                onBlur={() => {
                                  if (tiempoMinimoStr === '') {
                                    field.onChange(undefined);
                                    return;
                                  }
                                  const normalized = tiempoMinimoStr.replace(',', '.');
                                  const parsed = parseFloat(normalized);
                                  field.onChange(Number.isFinite(parsed) ? parsed : undefined);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tiempoPromedio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tiempo Promedio (horas)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                inputMode="decimal"
                                pattern="[0-9]*[.,]?[0-9]{0,3}"
                                placeholder="1,000"
                                value={tiempoPromedioStr}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  setTiempoPromedioStr(raw);
                                  const normalized = raw.replace(',', '.');
                                  const fullMatch = /^\d+(?:[.,]\d{1,3})?$/.test(raw);
                                  const intOnly = /^\d+$/.test(raw);
                                  if (fullMatch || intOnly) {
                                    const parsed = parseFloat(normalized);
                                    field.onChange(Number.isFinite(parsed) ? parsed : undefined);
                                  }
                                }}
                                onBlur={() => {
                                  if (tiempoPromedioStr === '') {
                                    field.onChange(undefined);
                                    return;
                                  }
                                  const normalized = tiempoPromedioStr.replace(',', '.');
                                  const parsed = parseFloat(normalized);
                                  field.onChange(Number.isFinite(parsed) ? parsed : undefined);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tiempoMaximo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tiempo Máximo (horas)</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                inputMode="decimal"
                                pattern="[0-9]*[.,]?[0-9]{0,3}"
                                placeholder="2,000"
                                value={tiempoMaximoStr}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  setTiempoMaximoStr(raw);
                                  const normalized = raw.replace(',', '.');
                                  const fullMatch = /^\d+(?:[.,]\d{1,3})?$/.test(raw);
                                  const intOnly = /^\d+$/.test(raw);
                                  if (fullMatch || intOnly) {
                                    const parsed = parseFloat(normalized);
                                    field.onChange(Number.isFinite(parsed) ? parsed : undefined);
                                  }
                                }}
                                onBlur={() => {
                                  if (tiempoMaximoStr === '') {
                                    field.onChange(undefined);
                                    return;
                                  }
                                  const normalized = tiempoMaximoStr.replace(',', '.');
                                  const parsed = parseFloat(normalized);
                                  field.onChange(Number.isFinite(parsed) ? parsed : undefined);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="observaciones"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Notas adicionales sobre el procedimiento..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Tiempo
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Cálculo */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Cálculo PERT
              </CardTitle>
              <CardDescription>
                Tiempo estándar calculado automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tiempo Mínimo:</span>
                  <span className="font-mono">{watchedValues.tiempoMinimo ? watchedValues.tiempoMinimo.toFixed(3) : '0.000'}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tiempo Promedio:</span>
                  <span className="font-mono">{watchedValues.tiempoPromedio ? watchedValues.tiempoPromedio.toFixed(3) : '0.000'}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tiempo Máximo:</span>
                  <span className="font-mono">{watchedValues.tiempoMaximo ? watchedValues.tiempoMaximo.toFixed(3) : '0.000'}h</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Tiempo Estándar:</span>
                    <span className="font-mono text-lg text-blue-600">
                      {tiempoEstandar.toFixed(2)}h
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                
              </div>
            </CardContent>
          </Card>

          {/* Instrucciones de Frecuencia */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Instrucciones de Frecuencias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Si la actividad se realiza todos los dias seleccionar Diario (20)</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Si la actividad se realiza 2 veces por semana seleccionar Dos veces x semana (8)</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Si la actividad se realiza 1 vez por semana seleccionar Semanal (4)</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Si la actividad se realiza 2 veces por mes seleccionar Quincenal (2)</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Si la actividad se realiza 1 vez por mes seleccionar Mensual (1)</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Si la actividad se realiza cada 2 meses seleccionar Bimestral (0.5)</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Si la actividad se realiza cada 3 meses seleccionar Trimestral (0.33)</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Si la actividad se realiza cada 4 meses seleccionar Cuatrimestral (0.25)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Si la actividad se realiza cada 6 meses seleccionar Semestral (0.17)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Si la actividad se realiza cada año seleccionar Anual (0.083)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Si la actividad se realiza cada 2 años seleccionar Bianual (0.042)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cuadro de Tiempos Guardados en la Sesión */}
        {tiemposGuardados.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Tiempos Guardados en esta Sesión
                  </CardTitle>
                  <CardDescription>
                    Lista de tiempos registrados durante esta sesión de trabajo
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={limpiarTiemposGuardados}
                  className="text-xs"
                >
                  Limpiar Lista
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tiemposGuardados.map((tiempo, index) => (
                  <div key={tiempo.id} className="border rounded-lg p-4 bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {index + 1}
                          </Badge>
                          <h4 className="font-semibold text-sm text-primary">
                            {tiempo.actividadNombre}
                          </h4>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Actividad:</strong> {tiempo.actividadNombre}</p>
                          <div className="flex gap-4 text-xs">
                            <span><strong>Tiempo PERT:</strong> {tiempo.tiempoCalculadoPERT.toFixed(2)}h</span>
                            <span><strong>Frecuencia:</strong> {tiempo.frecuenciaMensual}/mes</span>
                            <span><strong>Carga Total:</strong> {tiempo.cargaTotal.toFixed(2)}h/mes</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          {new Date(tiempo.fechaCreacion).toLocaleTimeString()}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editarTiempo(tiempo)}
                          className="h-6 px-2 text-xs"
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Total de tiempos registrados:</span>
                  <Badge variant="outline">{tiemposGuardados.length}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="font-medium">Carga total acumulada:</span>
                  <span className="font-mono text-blue-600">
                    {tiemposGuardados.reduce((total, tiempo) => total + tiempo.cargaTotal, 0).toFixed(2)}h/mes
                  </span>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      finalizarRegistroTiempos();
                    }}
                    disabled={isFinalizando}
                    className="flex-1"
                    variant="default"
                    type="button"
                  >
                    {isFinalizando ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Finalizar registro de tiempos
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal de Edición */}
        {tiempoEditando && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Editar Tiempo</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-tiempo-minimo">Tiempo Mínimo (horas)</Label>
                  <Input
                    id="edit-tiempo-minimo"
                    type="number"
                    step="0.001"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]{0,3}"
                    value={tiempoEditando.tiempoMinimo}
                    onChange={(e) => setTiempoEditando({
                      ...tiempoEditando,
                      tiempoMinimo: parseFloat(e.target.value.replace(',', '.')) || 0
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-tiempo-promedio">Tiempo Promedio (horas)</Label>
                  <Input
                    id="edit-tiempo-promedio"
                    type="number"
                    step="0.001"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]{0,3}"
                    value={tiempoEditando.tiempoPromedio}
                    onChange={(e) => setTiempoEditando({
                      ...tiempoEditando,
                      tiempoPromedio: parseFloat(e.target.value.replace(',', '.')) || 0
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-tiempo-maximo">Tiempo Máximo (horas)</Label>
                  <Input
                    id="edit-tiempo-maximo"
                    type="number"
                    step="0.001"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]{0,3}"
                    value={tiempoEditando.tiempoMaximo}
                    onChange={(e) => setTiempoEditando({
                      ...tiempoEditando,
                      tiempoMaximo: parseFloat(e.target.value.replace(',', '.')) || 0
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-frecuencia">Frecuencia Mensual</Label>
                  <Select
                    value={tiempoEditando.frecuenciaMensual.toString()}
                    onValueChange={(value) => setTiempoEditando({
                      ...tiempoEditando,
                      frecuenciaMensual: parseFloat(value)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">Diario (20)</SelectItem>
                      <SelectItem value="8">Dos veces x semana (8)</SelectItem>
                      <SelectItem value="4">Semanal (4)</SelectItem>
                      <SelectItem value="2">Quincenal (2)</SelectItem>
                      <SelectItem value="1">Mensual (1)</SelectItem>
                      <SelectItem value="0.5">Bimestral (0.5)</SelectItem>
                      <SelectItem value="0.33">Trimestral (0.33)</SelectItem>
                      <SelectItem value="0.25">Cuatrimestral (0.25)</SelectItem>
                      <SelectItem value="0.17">Semestral (0.17)</SelectItem>
                      <SelectItem value="0.083">Anual (0.083)</SelectItem>
                      <SelectItem value="0.042">Bienal (0.042)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-observaciones">Observaciones</Label>
                  <Textarea
                    id="edit-observaciones"
                    value={tiempoEditando.observaciones || ''}
                    onChange={(e) => setTiempoEditando({
                      ...tiempoEditando,
                      observaciones: e.target.value
                    })}
                    placeholder="Observaciones opcionales..."
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={guardarEdicion}
                  disabled={isEditando}
                  className="flex-1"
                >
                  {isEditando ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelarEdicion}
                  disabled={isEditando}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngresoTiempos;
