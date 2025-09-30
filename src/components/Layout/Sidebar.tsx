import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  CreditCard,
  Receipt,
  PieChart,
  Target,
  Settings,
  LogOut,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Tag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../hooks/useConfig';
import { useSidebar } from '../../context/SidebarContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useTranslation } from '../../context/LanguageContext';

// Los menuItems se definirán dentro del componente para usar las traducciones

export function Sidebar() {
  const { logout, user, isDemo } = useAuth();
  const { profile } = useConfig();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { t } = useTranslation();

  // Componente auxiliar para el avatar del usuario
  const UserAvatar = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12'
    };
    
    const textSizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-lg'
    };
    
    return (
      <motion.div
        className={`bg-gradient-to-br from-blue-500 to-purple-600 text-white ${sizeClasses[size]} rounded-lg sm:rounded-xl shadow-md flex items-center justify-center overflow-hidden`}
        whileHover={{ scale: 1.05 }}
      >
        {profile?.foto_perfil ? (
          <img
            src={profile.foto_perfil}
            alt="Foto de perfil"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Si la imagen falla al cargar, mostrar la inicial
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<span class="${textSizeClasses[size]} font-bold">${profile?.nombre?.charAt(0)?.toUpperCase() || user?.nombre?.charAt(0)?.toUpperCase() || 'U'}</span>`;
              }
            }}
          />
        ) : (
          <span className={`${textSizeClasses[size]} font-bold`}>
            {profile?.nombre?.charAt(0)?.toUpperCase() || user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        )}
      </motion.div>
    );
  };

  const menuItems = [
    { to: '/dashboard', icon: Home, label: t('navigation.dashboard'), color: 'from-blue-500 to-blue-600' },
    { to: '/dashboard/transacciones', icon: Receipt, label: t('navigation.transacciones'), color: 'from-emerald-500 to-emerald-600' },
    { to: '/dashboard/cuentas', icon: CreditCard, label: t('navigation.cuentas'), color: 'from-purple-500 to-purple-600' },
    { to: '/dashboard/categorias', icon: Tag, label: t('navigation.categorias'), color: 'from-pink-500 to-pink-600' },
    { to: '/dashboard/reportes', icon: PieChart, label: t('navigation.reportes'), color: 'from-orange-500 to-orange-600' },
    { to: '/dashboard/presupuestos', icon: Target, label: t('navigation.presupuestos'), color: 'from-red-500 to-red-600' },
    { to: '/dashboard/metas', icon: TrendingUp, label: t('navigation.metas'), color: 'from-indigo-500 to-indigo-600' },
    { to: '/dashboard/configuracion', icon: Settings, label: t('navigation.configuracion'), color: 'from-gray-500 to-gray-600' }
  ];

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className={`bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg border-r border-gray-200/50 dark:border-dark-700/50 h-screen fixed left-0 top-0 z-30 hidden lg:block transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Botón de toggle mejorado */}
      <motion.button
        onClick={toggleSidebar}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="absolute -right-3 top-6 bg-white/90 dark:bg-dark-700/90 backdrop-blur-sm border border-gray-200/50 dark:border-dark-600/50 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 z-40"
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          )}
        </motion.div>
      </motion.button>

      <div className={`${isCollapsed ? 'p-3' : 'p-6'} h-full flex flex-col`}>
        {/* Logo y título */}
        <motion.div
          className={`flex items-center mb-8 ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
          layout
        >
          <motion.div
            className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-3 rounded-2xl shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Wallet className="h-6 w-6" />
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Financially</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Gestión Personal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Modo Demo Alert */}
        <AnimatePresence>
          {!isSupabaseConfigured && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl backdrop-blur-sm"
            >
              <div className="flex items-center space-x-2 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-semibold">Modo Demo</span>
              </div>
              <p className="text-xs text-amber-700 mt-1 font-medium">
                Configura Supabase para datos reales
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navegación */}
        <nav className="space-y-1 flex-1">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-100 dark:border-blue-800'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-dark-700/60 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-sm'
                  }`
                }
                title={isCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    {/* Indicador activo */}
                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full"
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* Icono con gradiente */}
                    <motion.div
                      className={`relative ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {isActive && (
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-20 rounded-lg blur-sm`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      <item.icon className="h-5 w-5 relative z-10" />
                    </motion.div>

                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className={`font-medium tracking-tight ${
                            isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                          }`}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Usuario y logout */}
        <div className={`border-t border-gray-200/50 dark:border-dark-700/50 pt-4 ${isCollapsed ? '' : ''}`}>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex items-center space-x-3 mb-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-dark-700 dark:to-blue-900/20 rounded-xl"
              >
                <UserAvatar size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user?.nombre || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
                    {user?.email}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={logout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center w-full py-3 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200 group ${
              isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'
            }`}
            title={isCollapsed ? 'Cerrar Sesión' : undefined}
          >
            <LogOut className="h-4 w-4 group-hover:text-red-600" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm font-medium"
                >
                  Cerrar Sesión
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}