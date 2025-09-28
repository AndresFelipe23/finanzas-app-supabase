import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { OnboardingProvider } from './context/OnboardingContext';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './pages/Dashboard';
import { Transacciones } from './pages/Transacciones';
import { Cuentas } from './pages/Cuentas';
import { Categorias } from './pages/Categorias';
import { Presupuestos } from './pages/Presupuestos';
import { Metas } from './pages/Metas';
import { Reportes } from './pages/Reportes';
import { Configuracion } from './pages/Configuracion';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { AwaitingConfirmation } from './pages/Auth/AwaitingConfirmation';
import { testSupabaseConnection } from './lib/supabase';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppLayout() {
  return (
    <OnboardingProvider>
      <LanguageProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
            <Sidebar />
            <Header />
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="transacciones" element={<Transacciones />} />
              <Route path="cuentas" element={<Cuentas />} />
              <Route path="categorias" element={<Categorias />} />
              <Route path="presupuestos" element={<Presupuestos />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="metas" element={<Metas />} />
              <Route path="configuracion" element={<Configuracion />} />
            </Routes>
          </div>
        </SidebarProvider>
      </LanguageProvider>
    </OnboardingProvider>
  );
}

function App() {
  useEffect(() => {
    // Ejecutar diagnóstico de Supabase al iniciar la aplicación
    testSupabaseConnection();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/awaiting-confirmation" element={
              <PublicRoute>
                <AwaitingConfirmation />
              </PublicRoute>
            } />
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
