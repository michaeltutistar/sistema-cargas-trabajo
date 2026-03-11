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
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../components/ui/dialog';
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
} from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Shield,
  Clock,
  FileText,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { Usuario, CrearUsuarioDTO } from '../types';
import { usuarioService } from '../services/api';

// Esquemas de validación
const crearUsuarioSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  rol: z.enum(['admin', 'usuario', 'consulta', 'tiempos', 'estructura'])
});

const actualizarUsuarioSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  rol: z.enum(['admin', 'usuario', 'consulta', 'tiempos', 'estructura'])
});

type CrearUsuarioFormData = z.infer<typeof crearUsuarioSchema>;
type ActualizarUsuarioFormData = z.infer<typeof actualizarUsuarioSchema>;

const AdminUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);

  // Formularios
  const crearForm = useForm<CrearUsuarioFormData>({
    resolver: zodResolver(crearUsuarioSchema),
    defaultValues: {
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      rol: 'usuario'
    }
  });

  const editarForm = useForm<ActualizarUsuarioFormData>({
    resolver: zodResolver(actualizarUsuarioSchema)
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await usuarioService.getUsuarios();
      
      // Manejar diferentes estructuras de respuesta
      let usuariosData: Usuario[] = [];
      
      if (response && typeof response === 'object') {
        if (response.datos && typeof response.datos === 'object') {
          if (response.datos.usuarios && Array.isArray(response.datos.usuarios)) {
            // Estructura: {datos: {usuarios: [...], total: 0, pagina: 1, limite: 10, totalPaginas: 0}}
            usuariosData = response.datos.usuarios;
          } else if (Array.isArray(response.datos)) {
            // Estructura: {datos: [...]}
            usuariosData = response.datos;
          }
        } else if (response.usuarios && Array.isArray(response.usuarios)) {
          // Estructura: {usuarios: [...], total: 0, pagina: 1, limite: 10, totalPaginas: 0}
          usuariosData = response.usuarios;
        } else if (response.data && Array.isArray(response.data)) {
          // Estructura: {data: [...]}
          usuariosData = response.data;
        } else if (Array.isArray(response)) {
          // Estructura: directamente un array
          usuariosData = response;
        }
      }
      
      // Validar que los datos existan y sean arrays
      if (!usuariosData) {
        setError('Error: La API no devolvió datos de usuarios. Verifica que estés autenticado.');
        setUsuarios([]);
        return;
      }
      
      if (!Array.isArray(usuariosData)) {
        setError(`Error: Los usuarios no son un array válido. Tipo recibido: ${typeof usuariosData}`);
        setUsuarios([]);
        return;
      }
      
      setUsuarios(usuariosData);
      
      if (usuariosData.length === 0) {
        setError('No se encontraron usuarios en la base de datos. Verifica que el servidor tenga datos.');
      }
      
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setError('Error al cargar los usuarios');
      toast.error('Error al cargar los usuarios');
      // En caso de error, establecer array vacío
      setUsuarios([]);
    } finally {
      setIsLoading(false);
    }
  };

  const crearUsuario = async (data: CrearUsuarioFormData) => {
    try {
      setIsLoading(true);
      
      const response = await usuarioService.crearUsuario(data);
      
      // Manejar diferentes estructuras de respuesta
      let nuevoUsuario: Usuario | null = null;
      
      if (response && typeof response === 'object') {
        if (response.usuario && typeof response.usuario === 'object') {
          // Estructura: {usuario: {...}}
          nuevoUsuario = response.usuario;
        } else if (response.data && typeof response.data === 'object') {
          // Estructura: {data: {...}}
          nuevoUsuario = response.data;
        } else if (response.datos && typeof response.datos === 'object') {
          // Estructura: {datos: {...}}
          nuevoUsuario = response.datos;
        } else if (response.id && response.email) {
          // Estructura: directamente el usuario
          nuevoUsuario = response as Usuario;
        }
      }
      
      if (!nuevoUsuario) {
        toast.error('Error: No se recibió confirmación del usuario creado');
        return;
      }
      
      // Agregar el nuevo usuario al estado local
      setUsuarios(prev => {
        const usuariosActualizados = [nuevoUsuario!, ...prev];
        return usuariosActualizados;
      });
      
      setMostrarCrear(false);
      crearForm.reset();
      toast.success('Usuario creado exitosamente');
      
      // Recargar usuarios para asegurar sincronización con el backend
      await cargarUsuarios();
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const actualizarUsuario = async (data: ActualizarUsuarioFormData) => {
    if (!usuarioSeleccionado) return;

    try {
      setIsLoading(true);
      
      const response = await usuarioService.actualizarUsuario(usuarioSeleccionado.id, data);
      const usuarioActualizado = response.data || response.datos;
      
      setUsuarios(prev => prev.map(u => 
        u.id === usuarioSeleccionado.id ? usuarioActualizado : u
      ));
      
      setMostrarEditar(false);
      setUsuarioSeleccionado(null);
      editarForm.reset();
      toast.success('Usuario actualizado exitosamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const cambiarEstadoUsuario = async (usuario: Usuario) => {
    try {
      setIsLoading(true);
      
      const response = await usuarioService.cambiarEstado(usuario.id, !usuario.activo);
      const usuarioActualizado = response.data || response.datos;
      
      setUsuarios(prev => prev.map(u => 
        u.id === usuario.id ? usuarioActualizado : u
      ));
      
      toast.success(`Usuario ${usuarioActualizado.activo ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cambiar el estado del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarUsuario = async (usuario: Usuario) => {
    try {
      setIsLoading(true);
      
      await usuarioService.eliminarUsuario(usuario.id);
      setUsuarios(prev => prev.filter(u => u.id !== usuario.id));
      
      toast.success('Usuario eliminado exitosamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const abrirEditar = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    editarForm.reset({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      rol: usuario.rol || 'usuario'
    });
    setMostrarEditar(true);
  };

  // Filtrar usuarios
  const usuariosFiltrados = Array.isArray(usuarios) ? usuarios.filter(usuario => {
    const cumpleBusqueda = !busqueda || 
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busqueda.toLowerCase());
    
    const cumpleRol = filtroRol === 'todos' || usuario.rol === filtroRol;
    const cumpleEstado = filtroEstado === 'todos' || 
      (filtroEstado === 'activos' && usuario.activo) ||
      (filtroEstado === 'inactivos' && !usuario.activo);
    
    return cumpleBusqueda && cumpleRol && cumpleEstado;
  }) : [];

  const getRolInfo = (rol: string) => {
    const roles = {
      admin: { label: 'Administrador', color: 'bg-red-100 text-red-800', icon: Shield },
      usuario: { label: 'Usuario', color: 'bg-blue-100 text-blue-800', icon: Users },
      consulta: { label: 'Consulta', color: 'bg-green-100 text-green-800', icon: Eye },
      tiempos: { label: 'Tiempos', color: 'bg-purple-100 text-purple-800', icon: Clock },
      estructura: { label: 'Solo Estructura', color: 'bg-amber-100 text-amber-800', icon: FileText }
    };
    return roles[rol as keyof typeof roles] || roles.usuario;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">Administra los usuarios del sistema y sus permisos</p>
        </div>
        <Dialog open={mostrarCrear} onOpenChange={setMostrarCrear}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Completa la información para crear un nuevo usuario en el sistema
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={crearForm.handleSubmit(crearUsuario)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    {...crearForm.register('nombre')}
                    placeholder="Nombre del usuario"
                  />
                  {crearForm.formState.errors.nombre && (
                    <p className="text-sm text-red-600">{crearForm.formState.errors.nombre.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    {...crearForm.register('apellido')}
                    placeholder="Apellido del usuario"
                  />
                  {crearForm.formState.errors.apellido && (
                    <p className="text-sm text-red-600">{crearForm.formState.errors.apellido.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...crearForm.register('email')}
                  placeholder="email@ejemplo.com"
                />
                {crearForm.formState.errors.email && (
                  <p className="text-sm text-red-600">{crearForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  {...crearForm.register('password')}
                  placeholder="Contraseña segura"
                />
                {crearForm.formState.errors.password && (
                  <p className="text-sm text-red-600">{crearForm.formState.errors.password.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <Select
                  value={crearForm.watch('rol')}
                  onValueChange={(value) => crearForm.setValue('rol', value as any)}
                >
                  <SelectTrigger id="rol">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">👑 Administrador</SelectItem>
                    <SelectItem value="usuario">👥 Usuario</SelectItem>
                    <SelectItem value="consulta">👁️ Consulta</SelectItem>
                    <SelectItem value="tiempos">⏰ Solo Tiempos</SelectItem>
                    <SelectItem value="estructura">🏗️ Solo Estructura</SelectItem>
                  </SelectContent>
                </Select>
                {crearForm.formState.errors.rol && (
                  <p className="text-sm text-red-600">{crearForm.formState.errors.rol.message}</p>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMostrarCrear(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creando...' : 'Crear Usuario'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="busqueda">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="busqueda"
                  placeholder="Nombre, apellido o email..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filtroRol">Filtrar por Rol</Label>
              <Select value={filtroRol} onValueChange={setFiltroRol}>
                <SelectTrigger id="filtroRol">
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="usuario">Usuario</SelectItem>
                  <SelectItem value="consulta">Consulta</SelectItem>
                  <SelectItem value="tiempos">Solo Tiempos</SelectItem>
                  <SelectItem value="estructura">Solo Estructura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filtroEstado">Filtrar por Estado</Label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger id="filtroEstado">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activos">Solo activos</SelectItem>
                  <SelectItem value="inactivos">Solo inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={() => {
                  setBusqueda('');
                  setFiltroRol('todos');
                  setFiltroEstado('todos');
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios del Sistema
          </CardTitle>
          <CardDescription>
            {usuariosFiltrados.length} usuario(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando usuarios...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={cargarUsuarios} variant="outline">
                Reintentar
              </Button>
            </div>
          ) : !Array.isArray(usuarios) ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Error: Los datos de usuarios no tienen el formato esperado</p>
              <Button onClick={cargarUsuarios} variant="outline">
                Reintentar
              </Button>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {usuarios.length === 0 
                  ? 'No hay usuarios en el sistema' 
                  : 'No se encontraron usuarios con los filtros aplicados'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {usuariosFiltrados.map((usuario) => {
                const rolInfo = getRolInfo(usuario.rol);
                const RolIcon = rolInfo.icon;
                
                return (
                  <div
                    key={usuario.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {(usuario.nombre || '').charAt(0)}{(usuario.apellido || '').charAt(0)}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {usuario.nombre || 'Sin nombre'} {usuario.apellido || 'Sin apellido'}
                          </h3>
                          <Badge className={rolInfo.color}>
                            <RolIcon className="h-3 w-3 mr-1" />
                            {rolInfo.label}
                          </Badge>
                          {usuario.activo ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              Inactivo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{usuario.email || 'Sin email'}</p>
                        <p className="text-xs text-gray-400">
                          Creado: {usuario.fechaCreacion ? new Date(usuario.fechaCreacion).toLocaleDateString() : 'Fecha desconocida'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirEditar(usuario)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cambiarEstadoUsuario(usuario)}
                      >
                        {usuario.activo ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario
                              "{usuario.nombre} {usuario.apellido}" del sistema.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => eliminarUsuario(usuario)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edición */}
      <Dialog open={mostrarEditar} onOpenChange={setMostrarEditar}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario seleccionado
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editarForm.handleSubmit(actualizarUsuario)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  {...editarForm.register('nombre')}
                  placeholder="Nombre del usuario"
                />
                {editarForm.formState.errors.nombre && (
                  <p className="text-sm text-red-600">{editarForm.formState.errors.nombre.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-apellido">Apellido</Label>
                <Input
                  id="edit-apellido"
                  {...editarForm.register('apellido')}
                  placeholder="Apellido del usuario"
                />
                {editarForm.formState.errors.apellido && (
                  <p className="text-sm text-red-600">{editarForm.formState.errors.apellido.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-rol">Rol</Label>
              <Select
                value={editarForm.watch('rol')}
                onValueChange={(value) => editarForm.setValue('rol', value as any)}
              >
                <SelectTrigger id="edit-rol">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">👑 Administrador</SelectItem>
                  <SelectItem value="usuario">👥 Usuario</SelectItem>
                  <SelectItem value="consulta">👁️ Consulta</SelectItem>
                  <SelectItem value="tiempos">⏰ Solo Tiempos</SelectItem>
                  <SelectItem value="estructura">🏗️ Solo Estructura</SelectItem>
                </SelectContent>
              </Select>
              {editarForm.formState.errors.rol && (
                <p className="text-sm text-red-600">{editarForm.formState.errors.rol.message}</p>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMostrarEditar(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Actualizando...' : 'Actualizar Usuario'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsuarios; 