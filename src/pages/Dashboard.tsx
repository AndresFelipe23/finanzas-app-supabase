import { useMemo, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BalanceCard } from '../components/Dashboard/BalanceCard';
import { RecentTransactions } from '../components/Dashboard/RecentTransactions';
import { ExpenseChart } from '../components/Charts/ExpenseChart';
import { PresupuestoResumen } from '../components/Dashboard/PresupuestoResumen';
import { useFinanceData } from '../hooks/useFinanceData';
import { useSidebar } from '../context/SidebarContext';
import { useTranslation } from '../context/LanguageContext';
import { useGuide } from '../hooks/useGuide';
import { useOnboarding } from '../context/OnboardingContext';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Target,
  DollarSign,
  PieChart,
  BarChart3,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  Plus,
  Activity,
  CreditCard,
  Percent,
  HelpCircle
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { NavLink } from 'react-router-dom';
import { IconRenderer } from '../components/IconRenderer';

export function Dashboard() {
  const { cuentas, transacciones, categorias, calcularProgresoPresupuestos, loading } = useFinanceData();
  const { isCollapsed } = useSidebar();
  const { t } = useTranslation();
  const { startGuide, guides, startFirstTimeGuide, triggerWelcomeGuide, isNewUser } = useGuide();
  const { shouldShowWelcomeGuide, clearWelcomeGuide } = useOnboarding();

  // Estados para funcionalidades adicionales
  const [showAmounts, setShowAmounts] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Períodos de tiempo disponibles
  const timePeriods = [
    { key: 'week', label: 'Esta semana', days: 7 },
    { key: 'month', label: 'Este mes', days: 30 },
    { key: 'quarter', label: 'Este trimestre', days: 90 }
  ];

  // Función para refrescar datos
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Función para iniciar la guía del dashboard
  const handleStartGuide = () => {
    startGuide('dashboard', guides.dashboard(), {}, true);
  };

  // Efecto para iniciar la guía de primera vez
  useEffect(() => {
    // Esperar un poco después de que se carguen los datos para iniciar la guía
    const timer = setTimeout(() => {
      if (!loading) {
        // Prioridad 1: Verificar si se marcó para mostrar guía de bienvenida (usuario recién registrado)
        const shouldShowWelcome = localStorage.getItem('financially_show_welcome_guide');
        if (shouldShowWelcome === 'true') {
          localStorage.removeItem('financially_show_welcome_guide'); // Limpiar la marca
          triggerWelcomeGuide();
          return;
        }

        // Prioridad 2: Si el contexto indica que debe mostrar guía de bienvenida
        if (shouldShowWelcomeGuide) {
          console.log('✨ Iniciando guía de bienvenida (contexto)');
          triggerWelcomeGuide();
          clearWelcomeGuide();
          return;
        }

        // Prioridad 3: Detectar si es un usuario nuevo
        const userIsNew = isNewUser();

        if (userIsNew) {
          console.log('✨ Iniciando guía de bienvenida (usuario nuevo detectado)');
          // Usuario completamente nuevo - mostrar guía de bienvenida
          triggerWelcomeGuide();
        } else if (cuentas.length === 0 && transacciones.length === 0) {
          
          // Usuario existente pero sin datos - mostrar guía básica
          startFirstTimeGuide();
        } else {
          console.log('ℹ️ No se inicia ninguna guía automática');
        }
      }
    }, 800); // Reducir aún más el tiempo de espera para usuarios recién registrados

    return () => clearTimeout(timer);
  }, [loading, cuentas.length, transacciones.length, startFirstTimeGuide, triggerWelcomeGuide, isNewUser, shouldShowWelcomeGuide, clearWelcomeGuide]);

  // Obtener rango de fechas según período seleccionado
  const getDateRange = useCallback(() => {
    const today = new Date();
    const period = timePeriods.find(p => p.key === selectedPeriod);

    if (selectedPeriod === 'month') {
      return {
        start: startOfMonth(today),
        end: endOfMonth(today)
      };
    }

    return {
      start: subDays(today, period?.days || 30),
      end: today
    };
  }, [selectedPeriod, timePeriods]);

  const formatCurrency = (value: number) => {
    if (!showAmounts) return '****';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Función helper para parsear fechas correctamente (evita problemas de zona horaria)
  const parseFecha = (fechaString: string) => {
    // Si es una fecha en formato YYYY-MM-DD, la parseamos como fecha local
    if (fechaString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = fechaString.split('-').map(Number);
      return new Date(year, month - 1, day); // Crear fecha local
    }
    // Si tiene tiempo, usar parseISO
    return parseISO(fechaString);
  };

  // Estadísticas calculadas con useMemo para optimización
  const statistics = useMemo(() => {
    if (!cuentas.length && !transacciones.length) {
      return {
        saldoTotal: 0,
        ingresosPeriodo: 0,
        gastosPeriodo: 0,
        balancePeriodo: 0,
        ingresosMes: 0,
        gastosMes: 0,
        balanceMes: 0,
        transaccionesHoy: 0,
        cuentasActivas: 0,
        tendenciaGastos: 0,
        promedioGastosDiarios: 0,
        topCategoria: null,
        transaccionesPeriodo: 0
      };
    }

    const dateRange = getDateRange();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filtrar transacciones por período
    const transaccionesPeriodo = transacciones.filter(t => {
      const fecha = parseFecha(t.fecha);
      return isWithinInterval(fecha, dateRange);
    });

    const transaccionesMesActual = transacciones.filter(t => {
      const fecha = parseFecha(t.fecha);
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
    });

    const saldoTotal = cuentas.reduce((sum, cuenta) => sum + cuenta.saldo, 0);

    const ingresosPeriodo = transaccionesPeriodo
      .filter(t => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + t.monto, 0);

    const gastosPeriodo = transaccionesPeriodo
      .filter(t => t.tipo === 'gasto')
      .reduce((sum, t) => sum + t.monto, 0);

    const ingresosMes = transaccionesMesActual
      .filter(t => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + t.monto, 0);

    const gastosMes = transaccionesMesActual
      .filter(t => t.tipo === 'gasto')
      .reduce((sum, t) => sum + t.monto, 0);

    const balancePeriodo = ingresosPeriodo - gastosPeriodo;
    const balanceMes = ingresosMes - gastosMes;

    // Estadísticas adicionales
    const hoy = new Date();
    const transaccionesDeHoy = transacciones.filter(t => {
      const fecha = parseFecha(t.fecha);
      return isSameDay(fecha, hoy);
    });

    const transaccionesHoy = transaccionesDeHoy.length;

    const cuentasActivas = cuentas.filter(c => c.activa || c.activa === undefined).length;

    // Tendencia comparativa (mes anterior)
    const mesAnterior = new Date();
    mesAnterior.setMonth(mesAnterior.getMonth() - 1);

    const gastosMesAnterior = transacciones
      .filter(t => {
        const fecha = parseFecha(t.fecha);
        return t.tipo === 'gasto' &&
               fecha.getMonth() === mesAnterior.getMonth() &&
               fecha.getFullYear() === mesAnterior.getFullYear();
      })
      .reduce((sum, t) => sum + t.monto, 0);

    const tendenciaGastos = gastosMesAnterior > 0 ?
      ((gastosMes - gastosMesAnterior) / gastosMesAnterior) * 100 : 0;

    // Promedio diario de gastos
    const diasTranscurridos = Math.max(1, Math.ceil((new Date().getTime() - startOfMonth(new Date()).getTime()) / (1000 * 60 * 60 * 24)));
    const promedioGastosDiarios = gastosMes / diasTranscurridos;

    // Categoría con más gastos
    const gastosPorCategoria = categorias.map(categoria => {
      const gastos = transaccionesMesActual
        .filter(t => t.tipo === 'gasto' && t.categoria_id === categoria.id)
        .reduce((sum, t) => sum + t.monto, 0);
      return { categoria, gastos };
    }).sort((a, b) => b.gastos - a.gastos);

    return {
      saldoTotal,
      ingresosPeriodo,
      gastosPeriodo,
      balancePeriodo,
      ingresosMes,
      gastosMes,
      balanceMes,
      transaccionesHoy,
      cuentasActivas,
      tendenciaGastos,
      promedioGastosDiarios,
      topCategoria: gastosPorCategoria[0] || null,
      transaccionesPeriodo: transaccionesPeriodo.length
    };
  }, [transacciones, cuentas, categorias, selectedPeriod, getDateRange]);

  // Transacciones recientes (últimas 8)
  const transaccionesRecientes = useMemo(() => {
    return transacciones
      .sort((a, b) => parseFecha(b.fecha).getTime() - parseFecha(a.fecha).getTime())
      .slice(0, 8);
  }, [transacciones]);

  // Presupuestos del mes actual
  const presupuestosMesActual = useMemo(() => {
    return calcularProgresoPresupuestos();
  }, [calcularProgresoPresupuestos]);

  // Cálculo mejorado de transacciones de hoy usando date-fns
  const hoy = new Date();
  const transaccionesHoySimple = transacciones.filter(t => {
    const fecha = parseFecha(t.fecha);
    return isSameDay(fecha, hoy);
  }).length;

  // Loading state debe estar después de todos los hooks
  if (loading) {
    return (
      <div className={`${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'} p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6 lg:pt-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800 transition-all duration-300`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'} p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6 lg:pt-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800 transition-all duration-300`}>
      {/* Header mejorado con controles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div data-guide="header-title">
            <h1 className="text-4xl font-light text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
              {t('dashboard.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-light">
              {format(new Date(), "EEEE, dd 'de' MMMM", { locale: es })} • {transaccionesHoySimple} {t('dashboard.movimientosHoy')}
            </p>
          </div>

          {/* Controles del dashboard */}
          <div className="flex items-center justify-end sm:justify-start space-x-2 sm:space-x-4">
            {/* Botón de ayuda/guía */}
            <motion.button
              onClick={handleStartGuide}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 sm:p-2.5 bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-dark-700/50 rounded-lg sm:rounded-xl hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-200"
              title="Iniciar guía"
            >
              <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
            </motion.button>

            {/* Toggle de visibilidad de montos */}
            <motion.button
              onClick={() => setShowAmounts(!showAmounts)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 sm:p-2.5 bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-dark-700/50 rounded-lg sm:rounded-xl hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-200"
            >
              {showAmounts ? (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
              )}
            </motion.button>

            {/* Botón de actualizar */}
            <motion.button
              onClick={handleRefresh}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 sm:p-2.5 bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-dark-700/50 rounded-lg sm:rounded-xl hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-200"
            >
              <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>

            {/* Selector de período */}
            <div className="hidden sm:flex items-center space-x-2 bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-dark-700/50 rounded-xl p-1">
              {timePeriods.map((period) => (
                <button
                  key={period.key}
                  onClick={() => setSelectedPeriod(period.key)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    selectedPeriod === period.key
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-dark-700/50'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            {/* Balance del período en el header */}
            <div className="hidden lg:block text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Balance {timePeriods.find(p => p.key === selectedPeriod)?.label.toLowerCase()}
              </p>
              <p className={`text-2xl font-light tracking-tight ${statistics.balancePeriodo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(statistics.balancePeriodo)}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4" data-guide="quick-actions">
          <NavLink
            to="/dashboard/transacciones"
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm sm:text-base">Nueva Transacción</span>
          </NavLink>

          <div className="flex items-center gap-3">
            <NavLink
              to="/dashboard/presupuestos"
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-dark-700/50 rounded-xl hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all text-gray-700 dark:text-gray-300 flex-1"
            >
              <Target className="h-4 w-4" />
              <span className="text-sm sm:text-base hidden sm:inline">Presupuestos</span>
              <span className="text-sm sm:text-base sm:hidden">Presup.</span>
            </NavLink>

            <NavLink
              to="/dashboard/reportes"
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-dark-700/50 rounded-xl hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all text-gray-700 dark:text-gray-300 flex-1"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm sm:text-base hidden sm:inline">Reportes</span>
              <span className="text-sm sm:text-base sm:hidden">Rep.</span>
            </NavLink>
          </div>
        </div>
      </motion.div>

      {/* Métricas principales mejoradas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12"
      >
        {/* Patrimonio Total */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4 sm:p-6 hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300 shadow-lg hover:shadow-xl"
          data-guide="balance-card"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Patrimonio</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {formatCurrency(statistics.saldoTotal)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {statistics.cuentasActivas} {statistics.cuentasActivas === 1 ? 'cuenta activa' : 'cuentas activas'}
            </p>
          </div>
        </motion.div>

        {/* Ingresos del período */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4 sm:p-6 hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300 shadow-lg hover:shadow-xl"
          data-guide="income-card"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3 w-3" />
                <span className="text-xs">+{statistics.ingresosPeriodo > 0 ? Math.round((statistics.ingresosPeriodo / Math.max(statistics.gastosPeriodo, 1)) * 100) : 0}%</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ingresos</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrency(statistics.ingresosPeriodo)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {timePeriods.find(p => p.key === selectedPeriod)?.label.toLowerCase()}
            </p>
          </div>
        </motion.div>

        {/* Gastos del período */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4 sm:p-6 hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300 shadow-lg hover:shadow-xl"
          data-guide="expense-card"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              {statistics.tendenciaGastos !== 0 && (
                <div className={`flex items-center space-x-1 ${statistics.tendenciaGastos > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {statistics.tendenciaGastos > 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownLeft className="h-3 w-3" />
                  )}
                  <span className="text-xs">{Math.abs(Math.round(statistics.tendenciaGastos))}%</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Gastos</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 tracking-tight">
              {formatCurrency(statistics.gastosPeriodo)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatCurrency(statistics.promedioGastosDiarios)}/día promedio
            </p>
          </div>
        </motion.div>

        {/* Categoría top */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4 sm:p-6 hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300 shadow-lg hover:shadow-xl"
          data-guide="top-category-card"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <PieChart className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-purple-600 dark:text-purple-400">
                <Activity className="h-3 w-3" />
                <span className="text-xs">{statistics.transaccionesPeriodo}</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Top Categoría</p>
            {statistics.topCategoria && statistics.topCategoria.gastos > 0 ? (
              <>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400 tracking-tight truncate">
                  {statistics.topCategoria.categoria.nombre}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {formatCurrency(statistics.topCategoria.gastos)} gastado
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-gray-400 dark:text-gray-500 tracking-tight">
                  Sin gastos
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  No hay movimientos
                </p>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Contenido principal */}
      <div className="space-y-6 sm:space-y-8">
        {/* Primera fila: Transacciones y Gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Transacciones recientes mejoradas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 xl:col-span-2"
          >
            <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4 sm:p-6 lg:p-8 shadow-lg" data-guide="recent-transactions">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Actividad Reciente</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-700 px-3 py-1 rounded-full">
                    Últimas {transaccionesRecientes.length} transacciones
                  </span>
                  <NavLink
                    to="/dashboard/transacciones"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Ver todas
                  </NavLink>
                </div>
              </div>

              {transaccionesRecientes.length > 0 ? (
                <div className="space-y-3">
                  {transaccionesRecientes.map((transaccion, index) => {
                    const categoria = categorias.find(c => c.id === transaccion.categoria_id);
                    const cuenta = cuentas.find(c => c.id === transaccion.cuenta_id);

                    return (
                      <motion.div
                        key={transaccion.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-dark-700/50 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                            categoria?.icono && categoria.icono.trim() !== ''
                              ? `text-white`
                              : transaccion.tipo === 'ingreso'
                              ? 'bg-emerald-100 dark:bg-emerald-900/20'
                              : 'bg-red-100 dark:bg-red-900/20'
                          }`}
                          style={categoria?.icono && categoria.icono.trim() !== '' ? { backgroundColor: categoria.color } : {}}
                          >
                            {categoria?.icono && categoria.icono.trim() !== '' ? (
                              <IconRenderer
                                iconName={categoria.icono}
                                className="text-white"
                                size={24}
                              />
                            ) : transaccion.tipo === 'ingreso' ? (
                              <ArrowUpRight className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <ArrowDownLeft className="h-6 w-6 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {transaccion.nombre || categoria?.nombre || 'Sin nombre'}
                              </p>
                              {transaccion.recurrente && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {categoria?.nombre} {transaccion.descripcion && ` • ${transaccion.descripcion}`}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500 mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(parseFecha(transaccion.fecha), 'dd MMM yyyy', { locale: es })}</span>
                              <span>•</span>
                              <CreditCard className="h-3 w-3" />
                              <span className="truncate">{cuenta?.nombre}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className={`text-lg font-bold ${
                            transaccion.tipo === 'ingreso'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {transaccion.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(transaccion.monto)}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {format(parseFecha(transaccion.fecha), 'HH:mm')}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-dark-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Activity className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No hay transacciones recientes
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Comienza agregando tu primera transacción
                  </p>
                  <NavLink
                    to="/dashboard/transacciones"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar Transacción</span>
                  </NavLink>
                </div>
              )}
            </div>
          </motion.div>

          {/* Gráfico de gastos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 xl:col-span-1"
            data-guide="expense-chart"
          >
            <ExpenseChart
              transacciones={transacciones}
              categorias={categorias}
            />
          </motion.div>
        </div>

        {/* Segunda fila: Presupuestos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          data-guide="budget-summary"
        >
          <PresupuestoResumen presupuestos={presupuestosMesActual} />
        </motion.div>

      </div>
    </div>
  );
}
