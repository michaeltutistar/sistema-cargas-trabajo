import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { 
  BarChart3, 
  Download, 
  Filter, 
  TrendingUp,
  Users,
  Building,
  Clock,
  AlertTriangle,
  Printer,
  FileSpreadsheet,
  Calendar,
  Search
} from 'lucide-react';
import { apiService } from '../services/api';
import * as XLSX from 'xlsx';

interface EstructuraReporte {
  id: string;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  usuarioCreadorId: string;
}

interface DependenciaReporte {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface ProcedimientoReporte {
  id: string;
  tiempo_id?: number; // ID del registro en tiempos_procedimientos
  nombre: string;
  descripcion?: string;
  frecuencia_mensual: string | number;
  tiempo_estandar: string | number;
  tiempo_minimo: string | number;
  tiempo_promedio: string | number;
  tiempo_maximo: string | number;
  horas_directivo: string | number;
  horas_asesor: string | number;
  horas_profesional: string | number;
  horas_tecnico: string | number;
  horas_asistencial: string | number;
  grado?: number;
  horas_contratista: string | number;
  horas_trabajador_oficial: string | number;
  observaciones?: string;
  proceso_id?: number;
  proceso_nombre?: string;
  proceso_descripcion?: string;
  actividad_id?: number;
  actividad_nombre?: string;
  actividad_descripcion?: string;
  usuario_registra?: string;
  fecha_registro?: string;
}

interface TotalesPorNivel {
  nivel_jerarquico: string;
  total_horas: number;
}

interface ReporteData {
  estructura: EstructuraReporte;
  dependencia: DependenciaReporte;
  fecha_generacion: string;
  totales_por_nivel: TotalesPorNivel[];
  procedimientos: ProcedimientoReporte[];
}

const Reportes: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [estructuras, setEstructuras] = useState<EstructuraReporte[]>([]);
  const [dependencias, setDependencias] = useState<DependenciaReporte[]>([]);
  const [estructuraSeleccionada, setEstructuraSeleccionada] = useState<string>('');
  
  // Función para validar si un ID es un GUID válido
  const esGuidValido = (id: string): boolean => {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return guidRegex.test(id);
  };
  const [dependenciaSeleccionada, setDependenciaSeleccionada] = useState<string>('');
  const [reporteData, setReporteData] = useState<ReporteData | null>(null);
  const [mostrarReporte, setMostrarReporte] = useState(false);

  // Cargar estructuras al montar el componente
  useEffect(() => {
    cargarEstructuras();
  }, []);

  // Cargar dependencias cuando se selecciona una estructura
  useEffect(() => {
    if (estructuraSeleccionada && estructuraSeleccionada !== 'estructura_default' && esGuidValido(estructuraSeleccionada)) {
      cargarDependencias(estructuraSeleccionada);
    } else {
      setDependencias([]);
      setDependenciaSeleccionada('');
    }
  }, [estructuraSeleccionada]);

  const cargarEstructuras = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getEstructuras();
      setEstructuras(response || []);
    } catch (error) {
      console.error('Error cargando estructuras:', error);
      setError('Error al cargar las estructuras');
    } finally {
      setIsLoading(false);
    }
  };

  const cargarDependencias = async (estructuraId: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.getDependenciasPorEstructura(estructuraId);
      setDependencias(response || []);
    } catch (error) {
      console.error('Error cargando dependencias:', error);
      setError('Error al cargar las dependencias');
    } finally {
      setIsLoading(false);
    }
  };

  const generarReporte = async () => {
    if (!estructuraSeleccionada || !dependenciaSeleccionada) {
      setError('Por favor selecciona una estructura y dependencia');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const estructura = estructuras.find(e => e.id === estructuraSeleccionada);
      
      // Manejar el caso de "Todas las dependencias"
      if (dependenciaSeleccionada === 'todas') {
        // Crear una dependencia virtual para "Todas las dependencias"
        const dependenciaVirtual: DependenciaReporte = {
          id: 0,
          nombre: 'Todas las dependencias',
          descripcion: 'Reporte consolidado de todas las dependencias de la estructura'
        };

        // Obtener datos de todas las dependencias
        const todasLasDependencias = dependencias.map(d => d.id.toString());
        
        // Obtener totales y procedimientos de todas las dependencias
        const totalesPromises = todasLasDependencias.map(id => apiService.getTotalesPorNiveles(id));
        const procedimientosPromises = todasLasDependencias.map(id => apiService.getProcedimientosPorDependencia(id));
        
        const [totalesResponses, procedimientosResponses] = await Promise.all([
          Promise.all(totalesPromises),
          Promise.all(procedimientosPromises)
        ]);
        
        // Obtener tiempos sin proceso/actividad directamente de la estructura
        // Estos tiempos no aparecen en las consultas por dependencia específica
        // pero sí deben aparecer en el reporte de "todas las dependencias"
        let tiemposSinDependenciaData: ProcedimientoReporte[] = [];
        try {
          console.log(`🔍 Obteniendo tiempos sin dependencia para estructura: ${estructuraSeleccionada}`);
          const tiemposSinDependencia = await apiService.getProcedimientosSinDependencia(estructuraSeleccionada);
          console.log(`🔍 Respuesta tiempos sin dependencia:`, tiemposSinDependencia);
          
          tiemposSinDependenciaData = (tiemposSinDependencia as any).datos || tiemposSinDependencia.data || [];
          console.log(`🔍 Datos extraídos de tiempos sin dependencia:`, tiemposSinDependenciaData);
          console.log(`🔍 Cantidad de tiempos sin dependencia:`, tiemposSinDependenciaData.length);
          
          if (tiemposSinDependenciaData && tiemposSinDependenciaData.length > 0) {
            // Agregar como respuesta con la misma estructura que las otras respuestas
            procedimientosResponses.push({ success: true, data: tiemposSinDependenciaData });
            console.log(`➕ Agregados ${tiemposSinDependenciaData.length} tiempos sin dependencia asignada como respuesta estructurada`);
          } else {
            console.log(`⚠️ No se encontraron tiempos sin dependencia asignada`);
          }
        } catch (error) {
          console.error('❌ Error obteniendo tiempos sin dependencia asignada:', error);
        }

        // Combinar totales de todas las dependencias
        const totalesCombinados = new Map<string, number>();
        for (const totalesResponse of totalesResponses) {
          const totalesData = (totalesResponse as any).datos || totalesResponse.data || [];
          totalesData.forEach((total: TotalesPorNivel) => {
            const nivel = total.nivel_jerarquico;
            const horas = parseFloat(String(total.total_horas)) || 0;
            totalesCombinados.set(nivel, (totalesCombinados.get(nivel) || 0) + horas);
          });
        }

        // Combinar procedimientos de todas las dependencias, evitando duplicados por tiempo_id
        const procedimientosCombinados: ProcedimientoReporte[] = [];
        const tiemposVistos = new Map<string | number, any>(); // Usar Map para mantener el primer elemento
        
        let totalAntesDedup = 0;
        let totalAgregados = 0;
        let totalDuplicados = 0;
        
        console.log(`📊 Total de respuestas de procedimientos: ${procedimientosResponses.length}`);
        
        for (let i = 0; i < procedimientosResponses.length; i++) {
          const procedimientosResponse = procedimientosResponses[i];
          
          // Manejar tanto respuestas estructuradas como arrays directos
          let procedimientosData: any[] = [];
          if (Array.isArray(procedimientosResponse)) {
            procedimientosData = procedimientosResponse;
          } else {
            procedimientosData = (procedimientosResponse as any).datos || procedimientosResponse.data || [];
          }
          
          totalAntesDedup += procedimientosData.length;
          
          console.log(`📊 Procesando respuesta ${i + 1}/${procedimientosResponses.length} con ${procedimientosData.length} items`);
          
          for (const proc of procedimientosData) {
            // Usar tiempo_id si existe (es el campo más confiable), o generar un ID único
            const tiempoId = proc.tiempo_id 
              ? String(proc.tiempo_id)
              : proc.id 
                ? String(proc.id)
                : `${proc.procedimiento_id || ''}_${proc.proceso_id || ''}_${proc.actividad_id || ''}_${proc.empleo_id || ''}_${proc.frecuencia_mensual || ''}_${proc.tiempo_estandar || ''}`;
            
            // Si no existe, agregarlo
            if (!tiemposVistos.has(tiempoId)) {
              tiemposVistos.set(tiempoId, proc);
              procedimientosCombinados.push(proc);
              totalAgregados++;
            } else {
              // Si existe un duplicado, verificar si el nuevo tiene proceso/actividad y el existente no
              const existente = tiemposVistos.get(tiempoId);
              const existenteIndex = procedimientosCombinados.findIndex(p => {
                const pTiempoId = p.tiempo_id ? String(p.tiempo_id) : p.id ? String(p.id) : '';
                return pTiempoId === tiempoId;
              });
              
              // Verificar si el nuevo tiene proceso/actividad y el existente no
              const nuevoTieneProceso = proc.proceso_id || proc.proceso_nombre;
              const nuevoTieneActividad = proc.actividad_id || proc.actividad_nombre;
              const existenteTieneProceso = existente?.proceso_id || existente?.proceso_nombre;
              const existenteTieneActividad = existente?.actividad_id || existente?.actividad_nombre;
              
              const nuevoTieneInfo = nuevoTieneProceso || nuevoTieneActividad;
              const existenteTieneInfo = existenteTieneProceso || existenteTieneActividad;
              
              // Si el nuevo tiene proceso/actividad y el existente no, reemplazar
              if (nuevoTieneInfo && !existenteTieneInfo) {
                if (existenteIndex !== -1) {
                  procedimientosCombinados[existenteIndex] = proc;
                  tiemposVistos.set(tiempoId, proc);
                  console.log('✅ Reemplazado registro sin proceso/actividad por uno con proceso/actividad:', {
                    tiempoId,
                    procedimiento: proc.nombre
                  });
                }
              } else {
                // Si ambos tienen o ambos no tienen, mantener el primero (omitir el nuevo)
                totalDuplicados++;
                console.log('⚠️ Duplicado detectado y omitido:', {
                  tiempoId,
                  nuevo: {
                    procedimiento: proc.nombre,
                    proceso: proc.proceso_nombre || 'Sin proceso',
                    actividad: proc.actividad_nombre || 'Sin actividad'
                  },
                  existente: {
                    procedimiento: existente?.nombre,
                    proceso: existente?.proceso_nombre || 'Sin proceso',
                    actividad: existente?.actividad_nombre || 'Sin actividad'
                  }
                });
              }
            }
          }
        }
        
        // Filtro final: eliminar registros sin proceso/actividad si hay otro con el mismo tiempo_id que sí tiene
        const tiemposConInfo = new Map<string | number, any>();
        const tiemposSinInfo: any[] = [];
        
        for (const proc of procedimientosCombinados) {
          const tiempoId = proc.tiempo_id ? String(proc.tiempo_id) : proc.id ? String(proc.id) : '';
          const tieneProceso = proc.proceso_id || proc.proceso_nombre;
          const tieneActividad = proc.actividad_id || proc.actividad_nombre;
          const tieneInfo = tieneProceso || tieneActividad;
          
          if (tieneInfo) {
            tiemposConInfo.set(tiempoId, proc);
          } else {
            tiemposSinInfo.push({ tiempoId, proc });
          }
        }
        
        // Filtrar: mantener solo los que tienen info, o los que no tienen info pero no hay otro con el mismo tiempo_id que sí tenga
        const procedimientosFinales = procedimientosCombinados.filter(proc => {
          const tiempoId = proc.tiempo_id ? String(proc.tiempo_id) : proc.id ? String(proc.id) : '';
          const tieneProceso = proc.proceso_id || proc.proceso_nombre;
          const tieneActividad = proc.actividad_id || proc.actividad_nombre;
          const tieneInfo = tieneProceso || tieneActividad;
          
          // Si tiene info, mantenerlo
          if (tieneInfo) {
            return true;
          }
          
          // Si no tiene info, mantenerlo solo si no hay otro con el mismo tiempo_id que sí tenga info
          // PERO si hay otro con el mismo tiempo_id que sí tiene info, eliminar este
          if (tiemposConInfo.has(tiempoId)) {
            return false;
          }
          
          // Si no hay otro con el mismo tiempo_id, mantenerlo solo si realmente no tiene proceso/actividad
          // (esto puede pasar si el tiempo realmente no tiene proceso/actividad asignado)
          return true;
        });
        
        const eliminadosSinInfo = procedimientosCombinados.length - procedimientosFinales.length;
        if (eliminadosSinInfo > 0) {
          console.log(`🧹 Filtro final: eliminados ${eliminadosSinInfo} registros sin proceso/actividad que tenían duplicados con info`);
        }
        
        console.log(`📊 Deduplicación completa:`);
        console.log(`   - Total items antes: ${totalAntesDedup}`);
        console.log(`   - Total agregados: ${totalAgregados}`);
        console.log(`   - Total duplicados omitidos: ${totalDuplicados}`);
        console.log(`   - Total después de deduplicación: ${procedimientosCombinados.length}`);
        console.log(`   - Total después de filtro final: ${procedimientosFinales.length}`);
        console.log(`   - Registros eliminados sin proceso/actividad: ${eliminadosSinInfo}`);
        console.log(`📊 Tiempos únicos por tiempo_id:`, Array.from(tiemposVistos.keys()).slice(0, 20), `... (total: ${tiemposVistos.size})`);
        
        // Actualizar la lista final
        procedimientosCombinados.length = 0;
        procedimientosCombinados.push(...procedimientosFinales);
        
        // Verificar si hay tiempos sin dependencia que se perdieron
        if (tiemposSinDependenciaData && tiemposSinDependenciaData.length > 0) {
          const tiemposSinDepIds = tiemposSinDependenciaData.map(t => String((t as any).tiempo_id || t.id || 'unknown'));
          const tiemposEnFinal = procedimientosCombinados.map(t => String(t.tiempo_id || t.id || 'unknown'));
          const tiemposPerdidos = tiemposSinDepIds.filter(id => !tiemposEnFinal.includes(id));
          
          if (tiemposPerdidos.length > 0) {
            console.warn(`⚠️ Tiempos sin dependencia que se perdieron en deduplicación:`, tiemposPerdidos);
            console.warn(`⚠️ Estos tiempos deberían aparecer pero no están en el resultado final`);
          } else {
            console.log(`✅ Todos los tiempos sin dependencia están en el resultado final`);
          }
        }

        const reporteData: ReporteData = {
          estructura,
          dependencia: dependenciaVirtual,
          fecha_generacion: new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          totales_por_nivel: Array.from(totalesCombinados.entries()).map(([nivel, horas]) => ({
            nivel_jerarquico: nivel,
            total_horas: horas
          })),
          procedimientos: procedimientosCombinados
        };

        setReporteData(reporteData);
        setMostrarReporte(true);
        return;
      }

      // Caso normal: dependencia específica
      const dependencia = dependencias.find(d => d.id === parseInt(dependenciaSeleccionada, 10));
      
      if (!estructura || !dependencia) {
        setError('No se encontró la estructura o dependencia seleccionada');
        return;
      }

      // Obtener datos del reporte
      const [totalesResponse, procedimientosResponse] = await Promise.all([
        apiService.getTotalesPorNiveles(dependenciaSeleccionada),
        apiService.getProcedimientosPorDependencia(dependenciaSeleccionada)
      ]);

      console.log('🔍 Respuesta totales:', totalesResponse);
      console.log('🔍 Respuesta procedimientos:', procedimientosResponse);

      // Manejar ambas estructuras de respuesta (data y datos)
      const totalesData = (totalesResponse as any).datos || totalesResponse.data || [];
      
      // Extraer procedimientos correctamente
      let procedimientosData = [];
      if ((procedimientosResponse as any).datos) {
        procedimientosData = (procedimientosResponse as any).datos;
      } else if ((procedimientosResponse as any).data) {
        procedimientosData = (procedimientosResponse as any).data;
      } else if (Array.isArray(procedimientosResponse)) {
        procedimientosData = procedimientosResponse;
      }
      
      // Eliminar duplicados también en el caso de dependencia única
      const tiemposUnicos = new Map<string | number, any>();
      for (const proc of procedimientosData) {
        const tiempoId = proc.tiempo_id 
          ? String(proc.tiempo_id)
          : proc.id 
            ? String(proc.id)
            : `${proc.procedimiento_id || ''}_${proc.proceso_id || ''}_${proc.actividad_id || ''}_${proc.empleo_id || ''}_${proc.frecuencia_mensual || ''}_${proc.tiempo_estandar || ''}`;
        
        // Si ya existe, mantener el primero (o podrías usar el último)
        if (!tiemposUnicos.has(tiempoId)) {
          tiemposUnicos.set(tiempoId, proc);
        }
      }
      procedimientosData = Array.from(tiemposUnicos.values());
      
      // Log detallado para debug
      console.log('🔍 DEBUG Procedimientos:', {
        responseType: typeof procedimientosResponse,
        hasDatos: !!(procedimientosResponse as any).datos,
        hasData: !!(procedimientosResponse as any).data,
        isArray: Array.isArray(procedimientosResponse),
        dataLength: procedimientosData?.length,
        firstItem: procedimientosData?.[0],
        firstItemGrado: procedimientosData?.[0]?.grado,
        firstItemKeys: procedimientosData?.[0] ? Object.keys(procedimientosData[0]) : []
      });
      
      console.log('🔍 Totales data procesados:', totalesData);
      console.log('🔍 Procedimientos data procesados:', procedimientosData);
      console.log('🔍 Primer procedimiento completo:', procedimientosData[0]);
      console.log('🔍 Primer procedimiento grado:', procedimientosData[0]?.grado);
      console.log('🔍 Tipos de respuesta:', {
        totalesTieneDatos: !!(totalesResponse as any).datos,
        totalesTieneData: !!(totalesResponse as any).data,
        procedimientosTieneDatos: !!(procedimientosResponse as any).datos,
        procedimientosTieneData: !!(procedimientosResponse as any).data
      });

      const reporteData: ReporteData = {
        estructura,
        dependencia,
        fecha_generacion: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        totales_por_nivel: totalesData,
        procedimientos: procedimientosData
      };

      console.log('🔍 Reporte data:', reporteData);

      setReporteData(reporteData);
      setMostrarReporte(true);
    } catch (error) {
      console.error('Error generando reporte:', error);
      setError('Error al generar el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  const exportarAExcel = () => {
    if (!reporteData) {
      alert('No hay datos de reporte para exportar. Por favor, genera un reporte primero.');
      return;
    }

    if (!reporteData.procedimientos || reporteData.procedimientos.length === 0) {
      alert('No hay procedimientos en el reporte para exportar.');
      return;
    }

    try {
      // Crear un nuevo libro de trabajo
      const workbook = XLSX.utils.book_new();
      
      // Preparar datos para la hoja de procedimientos
      const procedimientosData = reporteData.procedimientos.map(proc => ({
        'Proceso': proc.proceso_nombre || 'Sin proceso',
        'Procedimiento': proc.nombre,
        'Actividad': proc.actividad_nombre || 'Sin actividad',
        'Frecuencia Mensual': parseFloat(String(proc.frecuencia_mensual)) || 0,
        'Tiempo Mínimo (hrs)': parseFloat(String(proc.tiempo_minimo)) || 0,
        'Tiempo Promedio (hrs)': parseFloat(String(proc.tiempo_promedio)) || 0,
        'Tiempo Máximo (hrs)': parseFloat(String(proc.tiempo_maximo)) || 0,
        'Tiempo Estándar (hrs)': parseFloat(String(proc.tiempo_estandar)) || 0,
        'Horas Directivo': parseFloat(String(proc.horas_directivo)) || 0,
        'Horas Asesor': parseFloat(String(proc.horas_asesor)) || 0,
        'Horas Profesional': parseFloat(String(proc.horas_profesional)) || 0,
        'Horas Técnico': parseFloat(String(proc.horas_tecnico)) || 0,
        'Horas Asistencial': parseFloat(String(proc.horas_asistencial)) || 0,
        'Grado': proc.grado || '',
        'Horas Contratista': parseFloat(String(proc.horas_contratista)) || 0,
        'Horas Trabajador Oficial': parseFloat(String(proc.horas_trabajador_oficial)) || 0,
        'Observaciones': proc.observaciones || '',
        'Usuario': proc.usuario_registra || '',
        'Fecha Registro': proc.fecha_registro || ''
      }));

      // Agregar fila de totales
      const totalesHoras = reporteData.procedimientos.reduce((totales, proc) => {
        totales.directivo += parseFloat(String(proc.horas_directivo)) || 0;
        totales.asesor += parseFloat(String(proc.horas_asesor)) || 0;
        totales.profesional += parseFloat(String(proc.horas_profesional)) || 0;
        totales.tecnico += parseFloat(String(proc.horas_tecnico)) || 0;
        totales.asistencial += parseFloat(String(proc.horas_asistencial)) || 0;
        totales.contratista += parseFloat(String(proc.horas_contratista)) || 0;
        totales.trabajadorOficial += parseFloat(String(proc.horas_trabajador_oficial)) || 0;
        return totales;
      }, {
        directivo: 0,
        asesor: 0,
        profesional: 0,
        tecnico: 0,
        asistencial: 0,
        contratista: 0,
        trabajadorOficial: 0
      });

      // Calcular personal requerido
      const personalRequerido = {
        directivo: Math.round(totalesHoras.directivo / 167),
        asesor: Math.round(totalesHoras.asesor / 167),
        profesional: Math.round(totalesHoras.profesional / 167),
        tecnico: Math.round(totalesHoras.tecnico / 167),
        asistencial: Math.round(totalesHoras.asistencial / 167),
        contratista: Math.round(totalesHoras.contratista / 167),
        trabajadorOficial: Math.round(totalesHoras.trabajadorOficial / 167)
      };

      // Agregar fila de totales
      procedimientosData.push({
        'Proceso': 'TOTALES',
        'Procedimiento': '',
        'Actividad': '',
        'Frecuencia Mensual': 0,
        'Tiempo Mínimo (hrs)': 0,
        'Tiempo Promedio (hrs)': 0,
        'Tiempo Máximo (hrs)': 0,
        'Tiempo Estándar (hrs)': 0,
        'Horas Directivo': totalesHoras.directivo,
        'Horas Asesor': totalesHoras.asesor,
        'Horas Profesional': totalesHoras.profesional,
        'Horas Técnico': totalesHoras.tecnico,
        'Horas Asistencial': totalesHoras.asistencial,
        'Grado': '',
        'Horas Contratista': totalesHoras.contratista,
        'Horas Trabajador Oficial': totalesHoras.trabajadorOficial,
        'Observaciones': '',
        'Usuario': '',
        'Fecha Registro': ''
      });

      // Agregar fila de personal requerido
      procedimientosData.push({
        'Proceso': 'PERSONAL REQUERIDO',
        'Procedimiento': '',
        'Actividad': '',
        'Frecuencia Mensual': 0,
        'Tiempo Mínimo (hrs)': 0,
        'Tiempo Promedio (hrs)': 0,
        'Tiempo Máximo (hrs)': 0,
        'Tiempo Estándar (hrs)': 0,
        'Horas Directivo': personalRequerido.directivo,
        'Horas Asesor': personalRequerido.asesor,
        'Horas Profesional': personalRequerido.profesional,
        'Horas Técnico': personalRequerido.tecnico,
        'Horas Asistencial': personalRequerido.asistencial,
        'Grado': '',
        'Horas Contratista': personalRequerido.contratista,
        'Horas Trabajador Oficial': personalRequerido.trabajadorOficial,
        'Observaciones': '',
        'Usuario': '',
        'Fecha Registro': ''
      });

      // Crear hoja de procedimientos
      const procedimientosSheet = XLSX.utils.json_to_sheet(procedimientosData);
      
      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 20 }, // Proceso
        { wch: 30 }, // Procedimiento
        { wch: 20 }, // Actividad
        { wch: 15 }, // Frecuencia
        { wch: 15 }, // Tiempo Mínimo
        { wch: 15 }, // Tiempo Promedio
        { wch: 15 }, // Tiempo Máximo
        { wch: 15 }, // Tiempo Estándar
        { wch: 15 }, // Horas Directivo
        { wch: 15 }, // Horas Asesor
        { wch: 15 }, // Horas Profesional
        { wch: 15 }, // Horas Técnico
        { wch: 15 }, // Horas Asistencial
        { wch: 12 }, // Grado
        { wch: 15 }, // Horas Contratista
        { wch: 15 }, // Horas Trabajador Oficial
        { wch: 30 }, // Observaciones
        { wch: 25 }, // Usuario
        { wch: 15 }  // Fecha Registro
      ];
      procedimientosSheet['!cols'] = columnWidths;

      // Crear hoja de resumen
      const resumenData = [
        { 'Campo': 'Estructura', 'Valor': reporteData.estructura.nombre },
        { 'Campo': 'Dependencia', 'Valor': reporteData.dependencia.nombre },
        { 'Campo': 'Fecha de Generación', 'Valor': reporteData.fecha_generacion },
        { 'Campo': '', 'Valor': '' },
        { 'Campo': 'Totales por Nivel Jerárquico', 'Valor': '' },
        ...reporteData.totales_por_nivel.map(total => ({
          'Campo': total.nivel_jerarquico,
          'Valor': `${total.total_horas.toFixed(2)} horas`
        })),
        { 'Campo': '', 'Valor': '' },
        { 'Campo': 'Resumen de Personal', 'Valor': '' },
        { 'Campo': 'Total Horas Directivo', 'Valor': `${totalesHoras.directivo.toFixed(2)} horas` },
        { 'Campo': 'Total Horas Asesor', 'Valor': `${totalesHoras.asesor.toFixed(2)} horas` },
        { 'Campo': 'Total Horas Profesional', 'Valor': `${totalesHoras.profesional.toFixed(2)} horas` },
        { 'Campo': 'Total Horas Técnico', 'Valor': `${totalesHoras.tecnico.toFixed(2)} horas` },
        { 'Campo': 'Total Horas Asistencial', 'Valor': `${totalesHoras.asistencial.toFixed(2)} horas` },
        { 'Campo': 'Total Horas Contratista', 'Valor': `${totalesHoras.contratista.toFixed(2)} horas` },
        { 'Campo': 'Total Horas Trabajador Oficial', 'Valor': `${totalesHoras.trabajadorOficial.toFixed(2)} horas` },
        { 'Campo': '', 'Valor': '' },
        { 'Campo': 'Personal Requerido (167 hrs/mes)', 'Valor': '' },
        { 'Campo': 'Directivos', 'Valor': personalRequerido.directivo },
        { 'Campo': 'Asesores', 'Valor': personalRequerido.asesor },
        { 'Campo': 'Profesionales', 'Valor': personalRequerido.profesional },
        { 'Campo': 'Técnicos', 'Valor': personalRequerido.tecnico },
        { 'Campo': 'Asistenciales', 'Valor': personalRequerido.asistencial },
        { 'Campo': 'Contratistas', 'Valor': personalRequerido.contratista },
        { 'Campo': 'Trabajadores oficiales', 'Valor': personalRequerido.trabajadorOficial }
      ];

      const resumenSheet = XLSX.utils.json_to_sheet(resumenData);
      resumenSheet['!cols'] = [{ wch: 30 }, { wch: 40 }];

      // Agregar hojas al libro
      XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen');
      XLSX.utils.book_append_sheet(workbook, procedimientosSheet, 'Procedimientos');

      // Generar nombre del archivo
      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Reporte_Tiempos_${reporteData.dependencia.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${fecha}.xlsx`;

      // Descargar el archivo
      XLSX.writeFile(workbook, nombreArchivo);

      // Mostrar mensaje de éxito
      alert(`✅ Reporte exportado exitosamente como: ${nombreArchivo}`);

    } catch (error) {
      console.error('Error exportando a Excel:', error);
      alert('❌ Error al exportar a Excel. Por favor, inténtalo de nuevo.\n\nDetalles del error: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const limpiarSeleccion = () => {
    setEstructuraSeleccionada('');
    setDependenciaSeleccionada('');
    setReporteData(null);
    setMostrarReporte(false);
    setError('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes de Tiempos</h1>
          <p className="text-gray-600 mt-2">Genera reportes detallados de tiempos por estructura y dependencia</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={limpiarSeleccion}>
            <Search className="h-4 w-4 mr-2" />
            Nueva Consulta
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Parámetros del Reporte
          </CardTitle>
          <CardDescription>
            Selecciona la estructura y dependencia para generar el reporte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estructura">Estructura</Label>
              <Select 
                value={estructuraSeleccionada} 
                onValueChange={(value) => {
                  if (value && value !== 'estructura_default' && esGuidValido(value)) {
                    setEstructuraSeleccionada(value);
                  } else {
                    setEstructuraSeleccionada('');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una estructura" />
                </SelectTrigger>
                <SelectContent>
                  {estructuras.map((estructura) => (
                    <SelectItem key={estructura.id} value={estructura.id}>
                      {estructura.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dependencia">Dependencia</Label>
              <Select 
                value={dependenciaSeleccionada} 
                onValueChange={setDependenciaSeleccionada}
                disabled={!estructuraSeleccionada}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una dependencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="todas" value="todas">
                    📊 Todas las dependencias
                  </SelectItem>
                  <Separator />
                  {dependencias.map((dependencia) => (
                    <SelectItem key={dependencia.id} value={dependencia.id.toString()}>
                      {dependencia.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
             
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={generarReporte} 
              disabled={!estructuraSeleccionada || !dependenciaSeleccionada || isLoading}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {isLoading ? 'Generando...' : 'Generar Reporte'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mensaje de error */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Reporte Generado */}
      {mostrarReporte && reporteData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Reporte de Tiempos</CardTitle>
                <CardDescription>
                  Generado el {reporteData.fecha_generacion}
                </CardDescription>
              </div>
              <Button onClick={exportarAExcel} className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Exportar a Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ReporteContent data={reporteData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Componente para mostrar el contenido del reporte
const ReporteContent: React.FC<{ data: ReporteData }> = ({ data }) => {
  // Validar que los datos existan
  if (!data || !data.totales_por_nivel || !data.procedimientos) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay datos disponibles para mostrar</p>
      </div>
    );
  }

  // Calcular totales de horas por nivel jerárquico
  const totalesHoras = data.procedimientos.reduce((totales, proc) => {
    totales.directivo += parseFloat(String(proc.horas_directivo)) || 0;
    totales.asesor += parseFloat(String(proc.horas_asesor)) || 0;
    totales.profesional += parseFloat(String(proc.horas_profesional)) || 0;
    totales.tecnico += parseFloat(String(proc.horas_tecnico)) || 0;
    totales.asistencial += parseFloat(String(proc.horas_asistencial)) || 0;
    totales.contratista += parseFloat(String(proc.horas_contratista)) || 0;
    totales.trabajadorOficial += parseFloat(String(proc.horas_trabajador_oficial)) || 0;
    return totales;
  }, {
    directivo: 0,
    asesor: 0,
    profesional: 0,
    tecnico: 0,
    asistencial: 0,
    contratista: 0,
    trabajadorOficial: 0
  });

  // Calcular personal requerido (totales / 167 horas mensuales)
  const personalRequerido = {
    directivo: Math.round(totalesHoras.directivo / 167),
    asesor: Math.round(totalesHoras.asesor / 167),
    profesional: Math.round(totalesHoras.profesional / 167),
    tecnico: Math.round(totalesHoras.tecnico / 167),
    asistencial: Math.round(totalesHoras.asistencial / 167),
    contratista: Math.round(totalesHoras.contratista / 167),
    trabajadorOficial: Math.round(totalesHoras.trabajadorOficial / 167)
  };

  return (
    <div className="space-y-6">
      {/* Información del Reporte */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <Label className="text-sm font-medium text-gray-500">Estructura</Label>
          <p className="text-lg font-semibold">{data.estructura.nombre}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Dependencia</Label>
          <p className="text-lg font-semibold">{data.dependencia.nombre}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Fecha de Generación</Label>
          <p className="text-lg font-semibold">{data.fecha_generacion}</p>
        </div>
      </div>



      {/* Tabla de Procedimientos */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Detalle de Procedimientos</h3>
        {data.procedimientos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay procedimientos registrados para esta dependencia</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Proceso</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Procedimiento</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Actividad</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Frecuencia</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Tiempo Mínimo</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Tiempo Promedio</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Tiempo Máximo</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Tiempo Estándar</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Directivo</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Asesor</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Profesional</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Técnico</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Asistencial</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Grado</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Contratista</th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Trabajador oficial</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Observaciones</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Usuario</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                {data.procedimientos.map((proc, index) => (
                  <tr key={`${proc.id}-${index}`} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2 text-sm">{proc.proceso_nombre || 'Sin proceso'}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">{proc.nombre}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">{proc.actividad_nombre || 'Sin actividad'}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">{(parseFloat(String(proc.frecuencia_mensual)) || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">{(parseFloat(String(proc.tiempo_minimo)) || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">{(parseFloat(String(proc.tiempo_promedio)) || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">{(parseFloat(String(proc.tiempo_maximo)) || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">{(parseFloat(String(proc.tiempo_estandar)) || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">{(parseFloat(String(proc.horas_directivo)) || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">{(parseFloat(String(proc.horas_asesor)) || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">{(parseFloat(String(proc.horas_profesional)) || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">{(parseFloat(String(proc.horas_tecnico)) || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">{(parseFloat(String(proc.horas_asistencial)) || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">{proc.grado ? proc.grado.toString().padStart(2, '0') : '-'}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">{(parseFloat(String(proc.horas_contratista)) || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">{(parseFloat(String(proc.horas_trabajador_oficial)) || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">{proc.observaciones || '-'}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">{proc.usuario_registra || '-'}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">{proc.fecha_registro || '-'}</td>
                  </tr>
                ))}
                {/* Fila de totales */}
                <tr className="bg-blue-50 font-semibold">
                  <td className="border border-gray-300 px-3 py-2 text-sm font-bold" colSpan={8}>
                    <span className="text-blue-700">TOTALES</span>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center font-bold text-blue-700">
                    {totalesHoras.directivo.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center font-bold text-blue-700">
                    {totalesHoras.asesor.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center font-bold text-blue-700">
                    {totalesHoras.profesional.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center font-bold text-blue-700">
                    {totalesHoras.tecnico.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center font-bold text-blue-700">
                    {totalesHoras.asistencial.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm"></td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center font-bold text-blue-700">
                    {totalesHoras.contratista.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center font-bold text-blue-700">
                    {totalesHoras.trabajadorOficial.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm"></td>
                </tr>
                {/* Fila de personal requerido */}
                <tr className="bg-green-50 font-semibold">
                  <td className="border border-gray-300 px-3 py-2 text-sm font-bold" colSpan={8}>
                    <span className="text-green-700">Total Personal Requerido</span>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center font-bold text-green-700">
                    {personalRequerido.directivo}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center font-bold text-green-700">
                    {personalRequerido.asesor}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center font-bold text-green-700">
                    {personalRequerido.profesional}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center font-bold text-green-700">
                    {personalRequerido.tecnico}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center font-bold text-green-700">
                    {personalRequerido.asistencial}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm"></td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center font-bold text-green-700">
                    {personalRequerido.contratista}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center font-bold text-green-700">
                    {personalRequerido.trabajadorOficial}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reportes;
