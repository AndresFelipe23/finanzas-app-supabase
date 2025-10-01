import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, ArrowUpRight, ArrowDownLeft, Trash2, Edit, TrendingUp, TrendingDown, Calendar, Search, HelpCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { TransactionForm } from '../components/Forms/TransactionForm';
import { useFinanceData } from '../hooks/useFinanceData';
import { useSidebar } from '../context/SidebarContext';
import { useTranslation } from '../context/LanguageContext';
import { useGuide } from '../hooks/useGuide';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2';
import '../components/Alerts/sweetalert.css';

export function Transacciones() {
  const {
    transacciones,
    cuentas,
    categorias,
    addTransaccion,
    deleteTransaccion,
    loading
  } = useFinanceData();
  const { isCollapsed } = useSidebar();
  const { t } = useTranslation();
  const { startGuide, guides } = useGuide();
  const [showForm, setShowForm] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [ordenamiento, setOrdenamiento] = useState<'desc' | 'asc'>('desc'); // desc = más recientes primero
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [cuentaFiltro, setCuentaFiltro] = useState('todas');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getCategoria = (categoriaId: string) => {
    return categorias.find(c => c.id === categoriaId);
  };

  const getCuenta = (cuentaId: string) => {
    return cuentas.find(c => c.id === cuentaId);
  };

  const handleAddTransaction = async (data: any) => {
    await addTransaccion(data);
  };

  // Función para iniciar la guía de transacciones
  const handleStartGuide = () => {
    startGuide('transacciones', guides.transacciones(), {}, true);
  };

  const handleDeleteTransaction = async (transaccion: any) => {
    const categoria = getCategoria(transaccion.categoria_id);
    const cuenta = getCuenta(transaccion.cuenta_id);

    const result = await Swal.fire({
      title: '¿Eliminar transacción?',
      html: `
        <div class="text-left">
          <p class="text-gray-600 mb-3">¿Estás seguro de que quieres eliminar esta transacción:</p>
          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="font-semibold text-gray-900">${transaccion.nombre || categoria?.nombre || 'Sin nombre'}</p>
            <p class="text-sm text-gray-600">${categoria?.nombre}${transaccion.descripcion ? ` • ${transaccion.descripcion}` : ''}</p>
            <p class="text-lg font-bold ${transaccion.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'} mt-2">
              ${transaccion.tipo === 'ingreso' ? '+' : '-'}${formatCurrency(transaccion.monto)}
            </p>
            <p class="text-xs text-gray-500 mt-1">${cuenta?.nombre} • ${format(new Date(transaccion.fecha), 'dd MMM yyyy', { locale: es })}</p>
          </div>
          <p class="text-red-600 text-sm mt-3">⚠️ Esta acción no se puede deshacer</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal2-popup',
        title: 'swal2-title',
        htmlContainer: 'swal2-html-container'
      }
    });

    if (result.isConfirmed) {
      const success = await deleteTransaccion(transaccion.id);

      if (success !== false) {
        await Swal.fire({
          title: '¡Eliminada!',
          text: 'La transacción ha sido eliminada correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'swal2-popup'
          }
        });
      } else {
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la transacción. Inténtalo de nuevo.',
          icon: 'error',
          confirmButtonColor: '#3b82f6',
          customClass: {
            popup: 'swal2-popup'
          }
        });
      }
    }
  };

  const transaccionesFiltradas = transacciones
    .filter(t => {
      const matchesFiltro = filtro === 'todos' || t.tipo === filtro;
      const matchesCategoria = categoriaFiltro === 'todas' || t.categoria_id === categoriaFiltro;
      const matchesCuenta = cuentaFiltro === 'todas' || t.cuenta_id === cuentaFiltro;
      const matchesSearch = searchTerm === '' ||
        t.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoria(t.categoria_id)?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCuenta(t.cuenta_id)?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFiltro && matchesCategoria && matchesCuenta && matchesSearch;
    })
    .sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      return ordenamiento === 'desc' ? fechaB - fechaA : fechaA - fechaB;
    });

  // Estadísticas de transacciones filtradas
  const totalIngresos = transaccionesFiltradas
    .filter(t => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + t.monto, 0);

  const totalGastos = transaccionesFiltradas
    .filter(t => t.tipo === 'gasto')
    .reduce((sum, t) => sum + t.monto, 0);

  const balance = totalIngresos - totalGastos;

  if (loading) {
    return (
      <div className="lg:ml-64 p-4 sm:p-6 pt-20 lg:pt-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'} p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6 lg:pt-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800 transition-all duration-300 overflow-x-hidden`}>
      {/* Header minimalista */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-4xl font-light text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
              {t('transacciones.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-light break-words">
              {transaccionesFiltradas.length} {transaccionesFiltradas.length !== 1 ? t('transacciones.movimientos') : t('transacciones.movimiento')} • {t('transacciones.balance')}: {formatCurrency(balance)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleStartGuide}
              className="p-3 bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-dark-700/50 rounded-xl hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-200"
              title="Iniciar guía"
            >
              <HelpCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="group relative inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
              data-guide="new-transaction-btn"
            >
              <Plus className="h-5 w-5" />
              <span>{t('transacciones.nueva')}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Resumen de transacciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
      >
        <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4 sm:p-6 lg:p-8 hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('transacciones.ingresos')}</p>
              <p className="text-3xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
                {formatCurrency(totalIngresos)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4 sm:p-6 lg:p-8 hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('transacciones.gastos')}</p>
              <p className="text-3xl font-light text-gray-900 dark:text-gray-100 tracking-tight">
                {formatCurrency(totalGastos)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4 sm:p-6 lg:p-8 hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-12 h-12 ${balance >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'} rounded-xl flex items-center justify-center`}>
              <ArrowUpRight className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</p>
              <p className={`text-3xl font-light tracking-tight ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filtros y búsqueda minimalistas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
        data-guide="transaction-filters"
      >
        <div className="flex flex-col gap-4">
          {/* Buscador */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar transacciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-dark-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Filtros de tipo */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-dark-700/50 rounded-xl p-1">
              <button
                onClick={() => setFiltro('todos')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  filtro === 'todos'
                    ? 'bg-gray-900 dark:bg-gray-700 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-dark-700/50'
                }`}
              >
                {t('transacciones.todos')}
              </button>
              <button
                onClick={() => setFiltro('ingreso')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  filtro === 'ingreso'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-dark-700/50'
                }`}
              >
                {t('transacciones.ingresos')}
              </button>
              <button
                onClick={() => setFiltro('gasto')}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  filtro === 'gasto'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-dark-700/50'
                }`}
              >
                {t('transacciones.gastos')}
              </button>
            </div>

            {/* Botón de ordenamiento */}
            <button
              onClick={() => setOrdenamiento(ordenamiento === 'desc' ? 'asc' : 'desc')}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-dark-700/50 rounded-xl hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-200"
              title={ordenamiento === 'desc' ? 'Más recientes primero' : 'Más antiguas primero'}
            >
              {ordenamiento === 'desc' ? (
                <ArrowDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ArrowUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {ordenamiento === 'desc' ? 'Recientes' : 'Antiguas'}
              </span>
            </button>
          </div>

          {/* Filtros adicionales */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Filtro por categoría */}
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-dark-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 text-sm text-gray-900 dark:text-gray-100"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>

            {/* Filtro por cuenta */}
            <select
              value={cuentaFiltro}
              onChange={(e) => setCuentaFiltro(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-dark-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 text-sm text-gray-900 dark:text-gray-100"
            >
              <option value="todas">Todas las cuentas</option>
              {cuentas.map(cuenta => (
                <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Lista de transacciones minimalista */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {transaccionesFiltradas.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ArrowUpRight className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-light text-gray-900 mb-3">
              {searchTerm ? 'No se encontraron transacciones' : 'No hay transacciones registradas'}
            </h3>
            <p className="text-gray-500 mb-8 font-light">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primera transacción'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
              >
                Agregar transacción
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3" data-guide="transactions-list">
            {transaccionesFiltradas.map((transaccion, index) => {
              const categoria = getCategoria(transaccion.categoria_id);
              const cuenta = getCuenta(transaccion.cuenta_id);

              return (
                <motion.div
                  key={transaccion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="group bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4 sm:p-6 hover:bg-white/80 dark:hover:bg-dark-800/80 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      {/* Icono de tipo de transacción */}
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        transaccion.tipo === 'ingreso'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30'
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {transaccion.tipo === 'ingreso' ? (
                          <ArrowUpRight className={`h-6 w-6 sm:h-7 sm:w-7 ${
                            transaccion.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'
                          }`} />
                        ) : (
                          <ArrowDownLeft className={`h-6 w-6 sm:h-7 sm:w-7 ${
                            transaccion.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'
                          }`} />
                        )}
                      </div>

                      {/* Información de la transacción */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-1">
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                            {transaccion.nombre || categoria?.nombre || 'Sin nombre'}
                          </h3>
                          {transaccion.es_recurrente && (
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-1 rounded-full font-medium">
                              Recurrente
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base truncate">
                          {categoria?.nombre}{transaccion.descripcion && ` • ${transaccion.descripcion}`}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <span className="truncate">{cuenta?.nombre}</span>
                          </div>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>{format(new Date(transaccion.fecha), "dd MMM yyyy 'a las' HH:mm", { locale: es })}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Monto y acciones */}
                    <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                      <div className="text-left sm:text-right">
                        <p className={`text-lg sm:text-2xl font-light tracking-tight ${
                          transaccion.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {transaccion.tipo === 'ingreso' ? '+' : '-'}
                          {formatCurrency(transaccion.monto)}
                        </p>
                      </div>

                      {/* Botón de eliminar */}
                      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeleteTransaction(transaccion)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg sm:rounded-xl transition-all"
                          title="Eliminar transacción"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      <TransactionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleAddTransaction}
        cuentas={cuentas}
        categorias={categorias}
      />
    </div>
  );
}
