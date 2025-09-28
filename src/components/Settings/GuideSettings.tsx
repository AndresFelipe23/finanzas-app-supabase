import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, RefreshCw, Play, CheckCircle, Trash2 } from 'lucide-react';
import { useGuide } from '../../hooks/useGuide';
import Swal from 'sweetalert2';

export function GuideSettings() {
  const {
    startGuide,
    guides,
    isGuideCompleted,
    resetCompletedGuides,
    completedGuides,
    startFirstTimeGuide
  } = useGuide();

  const guideOptions = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Conoce las funcionalidades principales del panel de control',
      icon: '📊',
      guide: guides.dashboard
    },
    {
      id: 'transacciones',
      title: 'Transacciones',
      description: 'Aprende a gestionar tus ingresos y gastos',
      icon: '💰',
      guide: guides.transacciones
    },
    {
      id: 'cuentas',
      title: 'Cuentas',
      description: 'Administra tus cuentas bancarias y métodos de pago',
      icon: '🏦',
      guide: guides.cuentas
    },
    {
      id: 'presupuestos',
      title: 'Presupuestos',
      description: 'Controla tus gastos con límites mensuales',
      icon: '🎯',
      guide: guides.presupuestos
    },
    {
      id: 'reportes',
      title: 'Reportes',
      description: 'Analiza tus datos financieros con gráficos',
      icon: '📈',
      guide: guides.reportes
    }
  ];

  const handleStartGuide = (guideId: string, guideFunction: () => any) => {
    startGuide(guideId, guideFunction(), {}, true);
  };

  const handleResetGuides = async () => {
    const result = await Swal.fire({
      title: '¿Resetear todas las guías?',
      text: 'Esto marcará todas las guías como no completadas y volverás a verlas la próxima vez que visites cada sección.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, resetear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
      resetCompletedGuides();
      Swal.fire({
        title: '¡Guías reseteadas!',
        text: 'Todas las guías han sido marcadas como no completadas.',
        icon: 'success',
        confirmButtonText: 'Entendido'
      });
    }
  };

  const handleStartFirstTimeGuide = () => {
    startFirstTimeGuide();
  };

  return (
    <div className="bg-gradient-to-br from-white/80 via-white/60 to-blue-50/40 dark:from-dark-800/80 dark:via-dark-800/60 dark:to-blue-900/20 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-dark-700/30 p-8 lg:p-10 shadow-2xl">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <HelpCircle className="h-7 w-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ✨ Guías Interactivas
          </h3>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Domina Financially con nuestros tutoriales paso a paso
          </p>
        </div>
      </div>

      {/* Estadísticas de guías mejoradas */}
      <div className="relative bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 mb-8 border border-blue-100/50 dark:border-blue-800/30 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2">
              Tu Progreso
            </p>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {completedGuides.length} / {guideOptions.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {completedGuides.length === guideOptions.length
                ? '🎉 ¡Todas las guías completadas!'
                : `${guideOptions.length - completedGuides.length} guías restantes`
              }
            </p>
          </div>
          <div className="w-20 h-20 relative">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-gray-200 dark:text-gray-600"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                className="transition-all duration-1000"
                strokeDasharray={`${(completedGuides.length / guideOptions.length) * 175.929} 175.929`}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {Math.round((completedGuides.length / guideOptions.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de guías mejorada */}
      <div className="space-y-4 mb-8">
        {guideOptions.map((guide, index) => {
          const isCompleted = isGuideCompleted(guide.id);

          return (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`relative overflow-hidden flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                isCompleted
                  ? 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700/50 shadow-green-100/50 dark:shadow-green-900/20'
                  : 'bg-gradient-to-r from-gray-50/80 to-slate-50/80 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-200/50 dark:border-gray-600/50 hover:border-blue-300/50 dark:hover:border-blue-500/50 hover:shadow-xl'
              } shadow-lg`}
            >
              {/* Fondo decorativo */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-xl"></div>

              <div className="flex items-center space-x-5 flex-1 relative z-10">
                <div className="text-3xl">{guide.icon}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-1">
                    {guide.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {guide.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 relative z-10">
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-full"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                      ✓ Completada
                    </span>
                  </motion.div>
                )}

                <motion.button
                  onClick={() => handleStartGuide(guide.id, guide.guide)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-3 rounded-xl transition-all duration-200 shadow-md ${
                    isCompleted
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                  }`}
                  title={isCompleted ? 'Ver guía nuevamente' : 'Iniciar guía'}
                >
                  <Play className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Acciones mejoradas */}
      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          onClick={handleStartFirstTimeGuide}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 font-semibold flex-1 shadow-lg hover:shadow-xl"
        >
          <Play className="h-5 w-5" />
          <span>🚀 Guía de Bienvenida</span>
        </motion.button>

        <motion.button
          onClick={handleResetGuides}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-700 dark:text-gray-300 rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
        >
          <RefreshCw className="h-5 w-5" />
          <span>🔄 Resetear todas</span>
        </motion.button>
      </div>

      {/* Información adicional mejorada */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/30 dark:border-blue-700/30 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl"></div>

        <div className="flex items-start space-x-4 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
            <HelpCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h5 className="font-bold text-blue-900 dark:text-blue-100 mb-2 text-lg">
              💡 Consejos para aprovechar las guías
            </h5>
            <div className="space-y-2 text-blue-700 dark:text-blue-300">
              <p className="text-sm leading-relaxed">
                • <strong>Síguelas paso a paso</strong> para dominar cada funcionalidad
              </p>
              <p className="text-sm leading-relaxed">
                • <strong>Haz clic en el ícono (?)</strong> en cualquier página para ver la guía específica
              </p>
              <p className="text-sm leading-relaxed">
                • <strong>Completa todas las guías</strong> para convertirte en un experto en Financially
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}