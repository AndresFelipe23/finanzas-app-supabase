import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  Receipt,
  CreditCard,
  PieChart,
  Target,
  TrendingUp,
  Settings,
  Wallet,
  LogOut,
  Tag,
  User,
  ChevronDown
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { useTranslation } from '../../context/LanguageContext';

// Los mobileMenuItems se definirán dentro del componente para usar las traducciones

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isCollapsed } = useSidebar();
  const { logout, user } = useAuth();
  const { t } = useTranslation();

  // Cerrar menú del usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const mobileMenuItems = [
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
    <>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`header-background backdrop-blur-lg border-b border-gray-200/50 dark:border-dark-700/50 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'} px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 transition-all duration-300 sticky top-0 z-20`}
      >
        <div className="flex items-center justify-between">
          {/* Botón hamburguesa para móvil mejorado */}
          <motion.button
            onClick={() => setMobileMenuOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden p-2 sm:p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/80 dark:hover:bg-dark-700/80 rounded-lg sm:rounded-xl shadow-sm transition-all duration-200"
          >
            <Menu className="h-6 w-6" />
          </motion.button>

          {/* Logo/título en móvil mejorado */}
          <div className="lg:hidden flex items-center space-x-3">
            <motion.div
              className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-2 rounded-xl shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Wallet className="h-5 w-5" />
            </motion.div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">Financially</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:block">Gestión Personal</p>
            </div>
          </div>

          {/* Título de la aplicación (hidden on mobile) */}
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="flex items-center space-x-3">
              <motion.div
                className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-2 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Wallet className="h-5 w-5" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Financially</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Gestión Personal</p>
              </div>
            </div>
          </div>

          {/* Área de acciones */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Toggle de tema */}
            <ThemeToggle variant="compact" />

            {/* Información del usuario mejorada */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 hover:bg-white/80 dark:hover:bg-dark-700/80 rounded-lg sm:rounded-xl transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="bg-gradient-to-br from-blue-500 to-purple-600 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl shadow-md flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-xs sm:text-sm font-bold">
                      {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </motion.div>
                  <div className="hidden sm:block text-left min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-36">
                      {user?.nombre || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-36">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 hidden sm:block" />
                </div>
              </motion.button>

              {/* Menú desplegable del usuario */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-72 max-w-[90vw] bg-white/95 dark:bg-dark-800/95 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/50 dark:border-dark-700/50 z-50"
                  >
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white w-12 h-12 rounded-xl shadow-md flex items-center justify-center">
                          <span className="text-lg font-bold">
                            {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {user?.nombre || 'Usuario'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate break-all">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200/50 dark:border-dark-700/50 pt-3">
                        <NavLink
                          to="/dashboard/configuracion"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-3 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-dark-700/50 rounded-lg transition-all duration-200"
                        >
                          <User className="h-4 w-4" />
                          <span className="text-sm">Mi Perfil</span>
                        </NavLink>

                        <motion.button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center space-x-3 w-full p-2 mt-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="text-sm">Cerrar Sesión</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Menú móvil mejorado */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            {/* Overlay con animación */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sidebar móvil mejorado */}
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 mobile-menu-background backdrop-blur-lg shadow-2xl z-50 border-r border-gray-200/50 dark:border-dark-700/50"
            >
              <div className="p-6 h-full flex flex-col">
                {/* Header del menú mejorado */}
                <div className="flex items-center justify-between mb-8">
                  <motion.div
                    className="flex items-center space-x-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div
                      className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-2.5 rounded-2xl shadow-lg"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Wallet className="h-6 w-6" />
                    </motion.div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Financially</h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Gestión Personal</p>
                    </div>
                  </motion.div>
                  <motion.button
                    onClick={() => setMobileMenuOpen(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/60 dark:hover:bg-dark-700/60 rounded-xl transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                </div>

                {/* Información del usuario */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-dark-700 dark:to-blue-900/20 rounded-xl mb-6"
                >
                  <motion.div
                    className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-2.5 rounded-xl shadow-md"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-sm font-bold">
                      {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {user?.nombre || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
                      {user?.email}
                    </p>
                  </div>
                </motion.div>

                {/* Navegación móvil mejorada */}
                <nav className="space-y-1 flex-1">
                  {mobileMenuItems.map((item, index) => (
                    <motion.div
                      key={item.to}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * (index + 3) }}
                    >
                      <NavLink
                        to={item.to}
                        end={item.to === '/dashboard'}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-100 dark:border-blue-800'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-dark-700/60 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-sm'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* Indicador activo */}
                            {isActive && (
                              <motion.div
                                className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full"
                                layoutId="mobileActiveIndicator"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}

                            {/* Icono con efecto */}
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

                            <span className={`font-medium text-sm tracking-tight ${
                              isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                            }`}>
                              {item.label}
                            </span>
                          </>
                        )}
                      </NavLink>
                    </motion.div>
                  ))}
                </nav>

                {/* Botón de logout */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="border-t border-gray-200/50 dark:border-dark-700/50 pt-4"
                >
                  <motion.button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-3 w-full py-3 px-4 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200 group"
                  >
                    <LogOut className="h-5 w-5 group-hover:text-red-600" />
                    <span className="text-sm font-medium">Cerrar Sesión</span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
