import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Mail, Lock, Eye, EyeOff, AlertCircle, Send, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

export function Login() {
  const { login, logout, resendConfirmationEmail } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleResendEmail = async () => {
    setResendStatus('sending');
    const { success } = await resendConfirmationEmail(formData.email);
    if (success) {
      setResendStatus('sent');
    } else {
      setResendStatus('idle');
      // Opcional: mostrar un error si el reenvío falla
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNeedsConfirmation(false);
    setResendStatus('idle');

    // Limpiar sesión anterior
    if (isSupabaseConfigured) {
      try {
        await logout();
        // Esperar un poco para que se limpie
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        // Error ignorado
      }
    }

    const { success, error: apiError } = await login(formData.email, formData.password);

    if (success) {
      // Login exitoso - redirigir al dashboard
      navigate('/dashboard', { replace: true });
    } else if (isSupabaseConfigured) {
      if (apiError === 'Email not confirmed') {
        setError('Tu cuenta no ha sido confirmada. Por favor, revisa tu correo electrónico.');
        setNeedsConfirmation(true);
      } else if (apiError?.includes('timeout')) {
        setError('Tiempo de espera agotado. Verifica tu conexión a internet.');
      } else {
        setError(apiError || 'Credenciales inválidas. Revisa tu correo y contraseña.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -z-10">
        <div className="w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-0 left-0 -z-10">
        <div className="w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Back to landing page */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Volver al inicio</span>
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-6"
            >
              <CreditCard className="h-8 w-8 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Bienvenido de vuelta
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600"
            >
              Inicia sesión para continuar gestionando tus finanzas
            </motion.p>
          </div>

          {/* Demo mode alert */}
          {!isSupabaseConfigured && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <div className="font-semibold text-amber-800">Modo Demo Activo</div>
                  <div className="text-sm text-amber-700">
                    La aplicación funciona con datos de demostración
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                  {needsConfirmation && (
                    <div className="mt-3">
                      {resendStatus === 'sent' ? (
                        <p className="text-sm text-green-700 font-medium">¡Correo de confirmación reenviado!</p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendEmail}
                          disabled={resendStatus === 'sending'}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1 disabled:opacity-50 transition-colors"
                        >
                          <Send className="h-4 w-4" />
                          <span>{resendStatus === 'sending' ? 'Reenviando...' : 'Reenviar correo de confirmación'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="tu@email.com"
                    required={isSupabaseConfigured}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="••••••••"
                    required={isSupabaseConfigured}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </motion.button>

              {/* Demo mode info */}
              {!isSupabaseConfigured && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Modo Demo:</span> Haz clic en "Iniciar Sesión" para acceder con datos de ejemplo
                  </p>
                </div>
              )}
            </form>
          </motion.div>

          {/* Footer links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center space-y-4"
          >
            {isSupabaseConfigured && (
              <p className="text-gray-600">
                ¿No tienes cuenta?{' '}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Regístrate aquí
                </Link>
              </p>
            )}
            
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <Link to="/" className="hover:text-gray-700 transition-colors">
                Inicio
              </Link>
              <span>•</span>
              <Link to="/register" className="hover:text-gray-700 transition-colors">
                Registro
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
