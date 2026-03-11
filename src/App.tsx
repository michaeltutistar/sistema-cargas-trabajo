import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IngresoTiempos from './pages/IngresoTiempos';
import GestionEstructura from './pages/GestionEstructura';
import Reportes from './pages/Reportes';
import AdminUsuarios from './pages/AdminUsuarios';


const getEffectiveRole = (user: { email: string; rol: string } | null) => {
  if (!user) return null;
  if (user.email === 'tiempos@cargas-trabajo.gov.co') return 'tiempos';
  return user.rol;
};

// Componente para redirigir según el rol del usuario
const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();

  const role = getEffectiveRole(user);

  if (role === 'tiempos') {
    return <Navigate to="/tiempos" replace />;
  }

  if (role === 'estructura') {
    return <Navigate to="/estructura" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const role = getEffectiveRole(user);

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <RoleBasedRedirect />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Ruta pública - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rutas protegidas */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<RoleBasedRedirect />} />
              <Route path="dashboard" element={<RoleGuard allowedRoles={['admin', 'usuario', 'consulta']}><Dashboard /></RoleGuard>} />
              <Route path="estructura" element={<RoleGuard allowedRoles={['admin', 'usuario', 'estructura']}><GestionEstructura /></RoleGuard>} />
              <Route path="tiempos" element={<RoleGuard allowedRoles={['admin', 'usuario', 'tiempos']}><IngresoTiempos /></RoleGuard>} />
              <Route path="reportes" element={<RoleGuard allowedRoles={['admin', 'usuario', 'consulta']}><Reportes /></RoleGuard>} />
              <Route path="usuarios" element={<RoleGuard allowedRoles={['admin']}><AdminUsuarios /></RoleGuard>} />

            </Route>

            {/* Ruta por defecto - redirigir según rol */}
            <Route path="*" element={<RoleBasedRedirect />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster position="top-right" richColors />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
