import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from './ui/sidebar';
import { 
  LayoutDashboard, 
  Clock, 
  BarChart3, 
  Settings, 
  LogOut, 
  User,
  FileText,
  Menu,
  Building
} from 'lucide-react';
import logoTAC from '../assets/TAC.png';

// Configuración de menús por rol
const menuConfig = {
  admin: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      id: 'estructura',
      label: 'Gestión de Estructura',
      icon: Building,
      path: '/estructura'
    },
    {
      id: 'tiempos',
      label: 'Ingreso de Tiempos',
      icon: Clock,
      path: '/tiempos'
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: BarChart3,
      path: '/reportes'
    },
    {
      id: 'usuarios',
      label: 'Gestión de Usuarios',
      icon: User,
      path: '/usuarios'
    }
  ],
  usuario: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      id: 'estructura',
      label: 'Gestión de Estructura',
      icon: Building,
      path: '/estructura'
    },
    {
      id: 'tiempos',
      label: 'Ingreso de Tiempos',
      icon: Clock,
      path: '/tiempos'
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: BarChart3,
      path: '/reportes'
    }
  ],
  consulta: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: BarChart3,
      path: '/reportes'
    }
  ],
  tiempos: [
    {
      id: 'tiempos',
      label: 'Ingreso de Tiempos',
      icon: Clock,
      path: '/tiempos'
    }
  ]
};

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (nombre: string, apellido: string) => {
    const nombreSeguro = nombre || 'U';
    const apellidoSeguro = apellido || 'S';
    return `${nombreSeguro.charAt(0)}${apellidoSeguro.charAt(0)}`.toUpperCase();
  };

  // Obtener menú según el rol del usuario
  const getMenuItems = () => {
    if (!user) return [];
    
    // Si el email es específico para tiempos, usar menú restrictivo
    if (user.email === 'tiempos@cargas-trabajo.gov.co') {
      return menuConfig.tiempos;
    }
    
    // Para otros usuarios, usar configuración por rol
    return menuConfig[user.rol as keyof typeof menuConfig] || menuConfig.consulta;
  };

  const menuItems = getMenuItems();

  const AppSidebar = () => (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <img src={logoTAC} alt="Logo TAC" className="h-10 w-10 object-contain" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Sistema de Cargas</span>
            <span className="truncate text-xs text-sidebar-foreground/70">
              {user?.email === 'tiempos@cargas-trabajo.gov.co' ? 'Ingreso de Tiempos' : 'Tutistar Acosta Consultores'}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => navigate(item.path)}
                  isActive={isActive}
                  className="w-full justify-start"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-background px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold text-foreground">
                  {user?.email === 'tiempos@cargas-trabajo.gov.co' 
                    ? 'Sistema de Ingreso de Tiempos' 
                    : 'Sistema de Gestión de Cargas de Trabajo'
                  }
                </h1>
              </div>
              
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user ? getInitials(user.nombre, '') : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.nombre}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email === 'tiempos@cargas-trabajo.gov.co' ? 'Acceso Solo Tiempos' : `Rol: ${user?.rol}`}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user?.email !== 'tiempos@cargas-trabajo.gov.co' && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/perfil')}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Perfil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/configuracion')}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Configuración</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6 bg-gray-50">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="border-t border-border bg-background px-6 py-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Diseñado y desarrollado por: <a href="https://www.tutistaracostaconsultores.com/" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-blue-700">Tutistar Acosta Consultores</a> - 
                Todos los derechos reservados © - 2025 - prohibida su reproducción total o parcial
              </p>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
