import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  Building, 
  Clock, 
  TrendingUp, 
  Activity,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import { EstadisticaGeneral, CargaTrabajo, Dependencia } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState<EstadisticaGeneral | null>(null);
  const [cargas, setCargas] = useState<CargaTrabajo[]>([]);
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Dashboard - Iniciando carga de datos...');
        
        const [depData] = await Promise.all([
          apiService.getDependencias()
        ]);
        
        // Crear estadísticas básicas basadas en los datos disponibles
        const statsData = {
          dependencias: depData?.length || 0,
          procesos: 0,
          actividades: 0,
          procedimientos: 0,
          empleos: 0,
          tiemposRegistrados: 0,
          cargaTotalSistema: 0,
          empleadosNecesarios: 0,
          porcentajeComplecion: 0
        };
        
        // Crear cargas vacías por ahora
        const cargasData: any[] = [];
        
        console.log('✅ Dashboard - Estadísticas cargadas:', statsData);
        console.log('✅ Dashboard - Cargas cargadas:', cargasData);
        console.log('✅ Dashboard - Dependencias cargadas:', depData);
        console.log('📊 Tipo de depData:', typeof depData);
        console.log('📊 Es array?', Array.isArray(depData));
        console.log('📊 Longitud:', depData?.length);
        console.log('📊 depData completo:', JSON.stringify(depData, null, 2));
        
        // Asegurar que dependencias sea siempre un array
        const dependenciasArray = Array.isArray(depData) ? depData : [];
        console.log('📊 dependenciasArray:', dependenciasArray);
        
        setEstadisticas(statsData);
        setCargas(cargasData);
        setDependencias(dependenciasArray);
      } catch (err) {
        console.error('❌ Dashboard - Error al cargar datos:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Datos para el gráfico de barras de cargas por dependencia
  const dependenciasArray = Array.isArray(dependencias) ? dependencias : [];
  console.log('🔍 dependencias en mapeo:', dependenciasArray);
  
  const datosCargasDependencia = dependenciasArray.map(dep => {
    const cargasDep = (cargas || []).filter(c => c.dependenciaId === dep.id);
    const totalCarga = cargasDep.reduce((sum, c) => sum + c.totalTiempoEstandar, 0);
    const totalProcedimientos = cargasDep.reduce((sum, c) => sum + c.totalProcedimientos, 0);
    
    // Protección contra nombres undefined
    const nombreDep = dep.nombre || 'Sin nombre';
    
    return {
      nombre: nombreDep.length > 20 ? nombreDep.substring(0, 20) + '...' : nombreDep,
      carga: Math.round(totalCarga),
      procedimientos: totalProcedimientos
    };
  });

  // Datos para el gráfico circular de distribución por nivel
  const nivelesDistribucion = ['Directivo', 'Asesor', 'Profesional', 'Técnico', 'Asistencial', 'Contratista', 'Trabajador Oficial'];
  const datosPorNivel = (nivelesDistribucion || []).map(nivel => {
    const cargasNivel = (cargas || []).filter(c => c.empleoNivel === nivel);
    const totalCarga = cargasNivel.reduce((sum, c) => sum + c.totalTiempoEstandar, 0);
    
    return {
      name: nivel,
      value: Math.round(totalCarga),
      count: cargasNivel.length
    };
  }).filter(item => item.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#4ECDC4'];

  const StatCard = ({ title, value, description, icon: Icon, isLoading }: {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    isLoading: boolean;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar el dashboard: {error}
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general del sistema de gestión de cargas de trabajo
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/tiempos')}>
            <Clock className="mr-2 h-4 w-4" />
            Ingresar Tiempos
          </Button>
          <Button variant="outline" onClick={() => navigate('/reportes')}>
            <BarChart className="mr-2 h-4 w-4" />
            Ver Reportes
          </Button>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Dependencias"
          value={estadisticas?.dependencias || 0}
          description="Unidades organizacionales"
          icon={Building}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Procedimientos"
          value={estadisticas?.procedimientos || 0}
          description="Procedimientos definidos"
          icon={Activity}
          isLoading={isLoading}
        />
        <StatCard
          title="Tiempos Registrados"
          value={estadisticas?.tiemposRegistrados || 0}
          description="Registros de tiempo PERT"
          icon={Clock}
          isLoading={isLoading}
        />
        <StatCard
          title="Empleos Definidos"
          value={estadisticas?.empleos || 0}
          description="Perfiles de cargo"
          icon={Users}
          isLoading={isLoading}
        />
      </div>

      {/* Gráficos y Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Cargas por Dependencia */}
        <Card>
          <CardHeader>
            <CardTitle>Cargas de Trabajo por Dependencia</CardTitle>
            <CardDescription>
              Tiempo estándar total (horas) por unidad organizacional
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datosCargasDependencia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="nombre" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} horas`, 
                      name === 'carga' ? 'Tiempo Estándar' : 'Procedimientos'
                    ]}
                  />
                  <Bar dataKey="carga" fill="#3b82f6" name="carga" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gráfico Circular de Distribución por Nivel */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Nivel Jerárquico</CardTitle>
            <CardDescription>
              Cargas de trabajo distribuidas por nivel de empleo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datosPorNivel}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {datosPorNivel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} horas`, 'Tiempo Estándar']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => navigate('/tiempos')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Registrar Tiempos
            </CardTitle>
            <CardDescription>
              Ingresa nuevos tiempos para procedimientos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Ir al formulario
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>



        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => navigate('/reportes')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Generar Reportes
            </CardTitle>
            <CardDescription>
              Análisis detallado y exportación de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Ver reportes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de Dependencias */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen por Dependencias</CardTitle>
          <CardDescription>
            Estado actual de cargas de trabajo por unidad organizacional
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(dependencias || []).map(dep => {
                const cargasDep = (cargas || []).filter(c => c.dependenciaId === dep.id);
                const totalProcedimientos = cargasDep.reduce((sum, c) => sum + c.totalProcedimientos, 0);
                const totalCarga = cargasDep.reduce((sum, c) => sum + c.totalTiempoEstandar, 0);
                
                return (
                  <div key={dep.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{dep.nombre}</h4>
                      <p className="text-sm text-muted-foreground">
                        {totalProcedimientos} procedimientos
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {Math.round(totalCarga)} horas
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Tiempo estándar
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
