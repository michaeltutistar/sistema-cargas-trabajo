import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ChevronRight, 
  ChevronDown,
  FolderOpen,
  FileText,
  Users,
  Briefcase,
  Home
} from 'lucide-react';
import { apiService } from '@/services/api';
import { 
  Estructura, 
  ElementoEstructura, 
  EstructuraCompleta,
  CrearEstructuraDTO,
  CrearElementoEstructuraDTO
} from '@/types';
import { toast } from 'sonner';

// Esquemas de validación
const estructuraSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional()
});

const elementoEstructuraSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  orden: z.number().optional()
});

type EstructuraFormData = z.infer<typeof estructuraSchema>;
type ElementoEstructuraFormData = z.infer<typeof elementoEstructuraSchema>;

// Configuración de tipos de elementos
const TIPOS_ELEMENTOS = [
  { value: 'dependencia', label: 'Dependencia', icon: Building, color: 'bg-blue-100 text-blue-800' },
  { value: 'proceso', label: 'Proceso', icon: FolderOpen, color: 'bg-green-100 text-green-800' },
  { value: 'procedimiento', label: 'Procedimiento', icon: FileText, color: 'bg-purple-100 text-purple-800' },
  { value: 'actividad', label: 'Actividad', icon: FileText, color: 'bg-yellow-100 text-yellow-800' }
];

// Configuración de jerarquía
const JERARQUIA = {
  'estructura': ['dependencia'],
  'dependencia': ['proceso'],
  'proceso': ['procedimiento'],
  'procedimiento': ['actividad'],
  'actividad': []
};

export default function GestionEstructura() {
  const [estructuras, setEstructuras] = useState<Estructura[]>([]);
  const [estructuraSeleccionada, setEstructuraSeleccionada] = useState<Estructura | null>(null);
  const [estructuraCompleta, setEstructuraCompleta] = useState<EstructuraCompleta | null>(null);
  const [loading, setLoading] = useState(false);
  const [elementosExpandidos, setElementosExpandidos] = useState<Set<string>>(new Set());
  const [elementoParaAgregar, setElementoParaAgregar] = useState<{
    tipo: string;
    padreId?: string;
    padreTipo?: string;
  } | null>(null);

  const [elementoParaEditar, setElementoParaEditar] = useState<{
    id: string;
    tipo: string;
    nombre: string;
    elementoId: string;
  } | null>(null);

  // Formularios
  const estructuraForm = useForm<EstructuraFormData>({
    resolver: zodResolver(estructuraSchema)
  });

  const elementoForm = useForm<ElementoEstructuraFormData>({
    resolver: zodResolver(elementoEstructuraSchema)
  });

  const editarElementoForm = useForm<ElementoEstructuraFormData>({
    resolver: zodResolver(elementoEstructuraSchema)
  });

  // Cargar estructuras al montar el componente
  useEffect(() => {
    cargarEstructuras();
  }, []);

  // Cargar estructura completa cuando se selecciona una
  useEffect(() => {
    if (estructuraSeleccionada) {
      cargarEstructuraCompleta(estructuraSeleccionada.id);
    }
  }, [estructuraSeleccionada]);

  const cargarEstructuras = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEstructuras();
      setEstructuras(data);
    } catch (error) {
      console.error('Error cargando estructuras:', error);
      toast.error('Error al cargar las estructuras');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstructuraCompleta = async (estructuraId: string) => {
    try {
      setLoading(true);
      const data = await apiService.getEstructuraCompleta(estructuraId);
      setEstructuraCompleta(data);
    } catch (error) {
      console.error('Error cargando estructura completa:', error);
      toast.error('Error al cargar la estructura completa');
    } finally {
      setLoading(false);
    }
  };

  const crearEstructura = async (data: EstructuraFormData) => {
    try {
      setLoading(true);
      const nuevaEstructura = await apiService.createEstructura({
        nombre: data.nombre,
        descripcion: data.descripcion
      });
      setEstructuras(prev => [nuevaEstructura, ...prev]);
      toast.success('Estructura creada exitosamente');
      estructuraForm.reset();
    } catch (error: any) {
      console.error('Error creando estructura:', error);
      const mensajeError = error?.message || error?.response?.data?.mensaje || 'Error al crear la estructura';
      toast.error(mensajeError);
    } finally {
      setLoading(false);
    }
  };

    const agregarElemento = async (data: ElementoEstructuraFormData) => {
    if (!estructuraSeleccionada || !elementoParaAgregar) {
      toast.error('Debe seleccionar una estructura primero');
      return;
    }

    try {
      setLoading(true);
      
      // Primero crear el elemento en su tabla correspondiente
      let elementoCreado;
      console.log('🔍 Creando elemento de tipo:', elementoParaAgregar.tipo);
      switch (elementoParaAgregar.tipo) {
        case 'dependencia':
          elementoCreado = await apiService.crearDependencia(data.nombre);
          break;
        case 'proceso':
          // Para procesos, necesitamos dependenciaId, codigo y orden
          if (!elementoParaAgregar.padreId) {
            throw new Error('Para crear un proceso se necesita una dependencia padre');
          }
          // Buscar el elemento de estructura de la dependencia padre para obtener su elementoId (ID numérico)
          const dependenciaPadre = estructuraCompleta?.elementos.find(e => e.id === elementoParaAgregar.padreId);
          if (!dependenciaPadre) {
            throw new Error('No se encontró la dependencia padre');
          }
          elementoCreado = await apiService.crearProceso({
            nombre: data.nombre,
            dependenciaId: dependenciaPadre.elementoId,
            orden: data.orden || 1
          });
          break;
        case 'procedimiento':
          // Para procedimientos, necesitamos procesoId, requisitos, nivelJerarquico, codigo y orden
          if (!elementoParaAgregar.padreId) {
            throw new Error('Para crear un procedimiento se necesita un proceso padre');
          }
          // Buscar el elemento de estructura del proceso padre para obtener su elementoId
          const procesoPadre = estructuraCompleta?.elementos.find(e => e.id === elementoParaAgregar.padreId);
          if (!procesoPadre) {
            throw new Error('No se encontró el proceso padre');
          }
          elementoCreado = await apiService.createProcedimiento({
            nombre: data.nombre,
            actividadId: procesoPadre.elementoId, // Usar procesoId como actividadId (temporal)
            nivelJerarquico: 'TECNICO',
            orden: data.orden || 1
          });
          break;
        case 'actividad':
          // Para actividades, necesitamos procedimientoId, codigo y orden
          if (!elementoParaAgregar.padreId) {
            throw new Error('Para crear una actividad se necesita un procedimiento padre');
          }
          // Buscar el elemento de estructura del procedimiento padre para obtener su elementoId
          const procedimientoPadre = estructuraCompleta?.elementos.find(e => e.id === elementoParaAgregar.padreId);
          if (!procedimientoPadre) {
            throw new Error('No se encontró el procedimiento padre');
          }
          console.log('🔍 Procedimiento padre encontrado:', procedimientoPadre);
          console.log('🔍 Elemento ID del procedimiento:', procedimientoPadre.elementoId);
          
          elementoCreado = await apiService.createActividad({
            nombre: data.nombre,
            procedimientoId: procedimientoPadre.elementoId, // Usar el ID numérico del procedimiento
            orden: data.orden || 1
          });
          break;
        default:
          throw new Error('Tipo de elemento no válido');
      }

      console.log('✅ Elemento creado:', elementoCreado);

      // Luego agregar el elemento a la estructura
      const nuevoElemento = await apiService.agregarElementoEstructura({
        estructuraId: estructuraSeleccionada.id,
        tipo: elementoParaAgregar.tipo as 'dependencia' | 'proceso' | 'actividad' | 'procedimiento',
        elementoId: elementoCreado.id,
        padreId: elementoParaAgregar.padreId,
        orden: data.orden
      });
      
      console.log('✅ Elemento agregado a estructura:', nuevoElemento);

      // Recargar la estructura completa
      await cargarEstructuraCompleta(estructuraSeleccionada.id);
      toast.success('Elemento agregado exitosamente');
      elementoForm.reset();
      setElementoParaAgregar(null);
    } catch (error) {
      console.error('Error agregando elemento:', error);
      toast.error('Error al agregar el elemento');
    } finally {
      setLoading(false);
    }
  };

  const eliminarElemento = async (elementoId: string) => {
    try {
      setLoading(true);
      await apiService.eliminarElementoEstructura(elementoId);
      
      if (estructuraSeleccionada) {
        await cargarEstructuraCompleta(estructuraSeleccionada.id);
      }
      toast.success('Elemento eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando elemento:', error);
      toast.error('Error al eliminar el elemento');
    } finally {
      setLoading(false);
    }
  };

  const editarElemento = async (data: ElementoEstructuraFormData) => {
    if (!elementoParaEditar) {
      toast.error('No hay elemento seleccionado para editar');
      return;
    }

    try {
      setLoading(true);
      
      // Actualizar el elemento en su tabla correspondiente
      switch (elementoParaEditar.tipo) {
        case 'dependencia':
          await apiService.updateDependencia(elementoParaEditar.elementoId, {
            nombre: data.nombre
          });
          break;
        case 'proceso':
          await apiService.updateProceso(elementoParaEditar.elementoId, {
            nombre: data.nombre
          });
          break;
        case 'procedimiento':
          await apiService.updateProcedimiento(elementoParaEditar.elementoId, {
            nombre: data.nombre
          });
          break;
        case 'actividad':
          await apiService.updateActividad(elementoParaEditar.elementoId, {
            nombre: data.nombre
          });
          break;
        default:
          throw new Error('Tipo de elemento no válido');
      }

      // Recargar la estructura completa
      if (estructuraSeleccionada) {
        await cargarEstructuraCompleta(estructuraSeleccionada.id);
      }
      toast.success('Elemento actualizado exitosamente');
      editarElementoForm.reset();
      setElementoParaEditar(null);
    } catch (error) {
      console.error('Error actualizando elemento:', error);
      toast.error('Error al actualizar el elemento');
    } finally {
      setLoading(false);
    }
  };

  const toggleElementoExpandido = (elementoId: string) => {
    const nuevosExpandidos = new Set(elementosExpandidos);
    if (nuevosExpandidos.has(elementoId)) {
      nuevosExpandidos.delete(elementoId);
    } else {
      nuevosExpandidos.add(elementoId);
    }
    setElementosExpandidos(nuevosExpandidos);
  };

  const abrirDialogoAgregarElemento = (tipo: string, padreId?: string, padreTipo?: string) => {
    console.log('🔍 Abriendo diálogo para agregar:', { tipo, padreId, padreTipo });
    setElementoParaAgregar({ tipo, padreId, padreTipo });
  };

  const abrirDialogoEditarElemento = (elemento: ElementoEstructura) => {
    console.log('🔍 Abriendo diálogo para editar:', elemento);
    setElementoParaEditar({
      id: elemento.id,
      tipo: elemento.tipo,
      nombre: elemento.nombreReal || '',
      elementoId: elemento.elementoId
    });
    editarElementoForm.setValue('nombre', elemento.nombreReal || '');
  };

  const renderElemento = (elemento: ElementoEstructura, nivel: number = 0) => {
    const hijos = estructuraCompleta?.elementos.filter(e => e.padreId === elemento.id) || [];
    const tieneHijos = hijos.length > 0;
    const estaExpandido = elementosExpandidos.has(elemento.id);
    const tipoConfig = TIPOS_ELEMENTOS.find(t => t.value === elemento.tipo);
    const elementosHijosPermitidos = JERARQUIA[elemento.tipo as keyof typeof JERARQUIA] || [];

    return (
      <div key={elemento.id} className="ml-4">
        <div className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded border">
          {tieneHijos && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleElementoExpandido(elemento.id)}
              className="h-6 w-6 p-0"
            >
              {estaExpandido ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}
          
          <Badge className={tipoConfig?.color}>
            {tipoConfig?.icon && <tipoConfig.icon className="h-3 w-3 mr-1" />}
            {tipoConfig?.label}
          </Badge>
          
          <span className="text-sm font-medium flex-1">
            {elemento.nombreReal || `ID: ${elemento.elementoId}`}
          </span>
          
          <div className="flex gap-1">
            {/* Botón para editar elemento */}
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-blue-600"
                  onClick={() => abrirDialogoEditarElemento(elemento)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Editar {tipoConfig?.label}
                  </DialogTitle>
                  <DialogDescription>
                    Modifica el nombre del {tipoConfig?.label?.toLowerCase()}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={editarElementoForm.handleSubmit(editarElemento)} className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre del {tipoConfig?.label?.toLowerCase()} *</Label>
                    <Input
                      id="nombre"
                      {...editarElementoForm.register('nombre')}
                      placeholder={`Ingrese el nombre del ${tipoConfig?.label?.toLowerCase()}`}
                    />
                    {editarElementoForm.formState.errors.nombre && (
                      <p className="text-sm text-red-500 mt-1">
                        {editarElementoForm.formState.errors.nombre.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Actualizando...' : `Actualizar ${tipoConfig?.label}`}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Botón para agregar elemento hijo */}
            {elementosHijosPermitidos.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-green-600"
                    onClick={() => abrirDialogoAgregarElemento(elementosHijosPermitidos[0], elemento.id, elemento.tipo)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Agregar {TIPOS_ELEMENTOS.find(t => t.value === elementosHijosPermitidos[0])?.label}
                    </DialogTitle>
                    <DialogDescription>
                      Agrega un nuevo {TIPOS_ELEMENTOS.find(t => t.value === elementosHijosPermitidos[0])?.label?.toLowerCase()} 
                      dentro de este {tipoConfig?.label?.toLowerCase()}
                    </DialogDescription>
                  </DialogHeader>
                                      <form onSubmit={elementoForm.handleSubmit(agregarElemento)} className="space-y-4">
                      <div>
                        <Label htmlFor="nombre">Nombre del {TIPOS_ELEMENTOS.find(t => t.value === elementosHijosPermitidos[0])?.label?.toLowerCase()} *</Label>
                        <Input
                          id="nombre"
                          {...elementoForm.register('nombre')}
                          placeholder={`Ingrese el nombre del ${TIPOS_ELEMENTOS.find(t => t.value === elementosHijosPermitidos[0])?.label?.toLowerCase()}`}
                        />
                        {elementoForm.formState.errors.nombre && (
                          <p className="text-sm text-red-500 mt-1">
                            {elementoForm.formState.errors.nombre.message}
                          </p>
                        )}
                      </div>



                    {/* Solo mostrar orden para elementos que no son dependencias */}
                    {elementoParaAgregar?.tipo !== 'dependencia' && (
                      <div>
                        <Label htmlFor="orden">Orden (Opcional)</Label>
                        <Input
                          id="orden"
                          type="number"
                          {...elementoForm.register('orden', { valueAsNumber: true })}
                          placeholder="Orden de aparición"
                        />
                      </div>
                    )}

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Agregando...' : `Agregar ${TIPOS_ELEMENTOS.find(t => t.value === elementosHijosPermitidos[0])?.label}`}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar elemento</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Está seguro de que desea eliminar este elemento? Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => eliminarElemento(elemento.id)}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {tieneHijos && estaExpandido && (
          <div className="ml-4">
            {hijos.map(hijo => renderElemento(hijo, nivel + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Estructura</h1>
          <p className="text-muted-foreground">
            Administra la estructura organizacional jerárquica
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo - Lista de estructuras */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Estructuras
              </CardTitle>
              <CardDescription>
                Lista de estructuras organizacionales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulario para crear estructura */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Estructura
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Estructura</DialogTitle>
                    <DialogDescription>
                      Define una nueva estructura organizacional
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={estructuraForm.handleSubmit(crearEstructura)} className="space-y-4">
                    <div>
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        {...estructuraForm.register('nombre')}
                        placeholder="Ej: Estructura Principal 2025"
                      />
                      {estructuraForm.formState.errors.nombre && (
                        <p className="text-sm text-red-500 mt-1">
                          {estructuraForm.formState.errors.nombre.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        {...estructuraForm.register('descripcion')}
                        placeholder="Descripción de la estructura..."
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Creando...' : 'Crear Estructura'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Separator />

              {/* Lista de estructuras */}
              <div className="space-y-2">
                {estructuras.map(estructura => (
                  <div
                    key={estructura.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      estructuraSeleccionada?.id === estructura.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setEstructuraSeleccionada(estructura)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{estructura.nombre}</h4>
                        <p className="text-sm text-muted-foreground">
                          {estructura.descripcion || 'Sin descripción'}
                        </p>
                      </div>
                      <Badge variant={estructura.activa ? 'default' : 'secondary'}>
                        {estructura.activa ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel derecho - Estructura seleccionada */}
        <div className="lg:col-span-2">
          {estructuraSeleccionada ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {estructuraSeleccionada.nombre}
                </CardTitle>
                <CardDescription>
                  {estructuraSeleccionada.descripcion || 'Sin descripción'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Botón para agregar dependencia (elemento raíz) */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => abrirDialogoAgregarElemento('dependencia')}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Dependencia
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Dependencia</DialogTitle>
                      <DialogDescription>
                        Agrega una nueva dependencia a la estructura
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={elementoForm.handleSubmit(agregarElemento)} className="space-y-4">
                      <div>
                        <Label htmlFor="nombre">Nombre de la Dependencia *</Label>
                        <Input
                          id="nombre"
                          {...elementoForm.register('nombre')}
                          placeholder="Ingrese el nombre de la dependencia"
                        />
                        {elementoForm.formState.errors.nombre && (
                          <p className="text-sm text-red-500 mt-1">
                            {elementoForm.formState.errors.nombre.message}
                          </p>
                        )}
                      </div>



                      {/* Solo mostrar orden para elementos que no son dependencias */}
                      {elementoParaAgregar?.tipo !== 'dependencia' && (
                        <div>
                          <Label htmlFor="orden">Orden (Opcional)</Label>
                          <Input
                            id="orden"
                            type="number"
                            {...elementoForm.register('orden', { valueAsNumber: true })}
                            placeholder="Orden de aparición"
                          />
                        </div>
                      )}

                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Agregando...' : 'Agregar Dependencia'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Separator />

                {/* Visualización de la estructura */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Estructura Jerárquica</h3>
                  {loading ? (
                    <div className="text-center py-8">
                      <p>Cargando estructura...</p>
                    </div>
                  ) : estructuraCompleta ? (
                    <div className="space-y-2">
                      {estructuraCompleta.elementos
                        .filter(elemento => !elemento.padreId) // Solo elementos raíz
                        .map(elemento => renderElemento(elemento))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay elementos en esta estructura</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona una estructura para ver su contenido</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 