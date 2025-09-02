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


// Componente para redirigir según el rol del usuario
const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();
  
  // Si es usuario de tiempos, redirigir directamente a la página de tiempos
  if (user?.email === 'tiempos@cargas-trabajo.gov.co') {
    return <Navigate to="/tiempos" replace />;
  }
  
  // Para otros usuarios, ir al dashboard
  return <Navigate to="/dashboard" replace />;
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
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="estructura" element={<GestionEstructura />} />
              <Route path="tiempos" element={<IngresoTiempos />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="usuarios" element={<AdminUsuarios />} />

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
