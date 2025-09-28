import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Filter, DollarSign, RefreshCw } from 'lucide-react';
import { usePresupuestos } from '../hooks/usePresupuestos';
import { useFinanceData } from '../hooks/useFinanceData';
import { PresupuestoForm } from '../components/Forms/PresupuestoForm';
import { PresupuestoCard } from '../components/Dashboard/PresupuestoCard';
import { PresupuestoResumen } from '../components/Dashboard/PresupuestoResumen';
import { useSidebar } from '../context/SidebarContext';
import { useTranslation } from '../context/LanguageContext';
import { PresupuestoConProgreso } from '../types';
import Swal from 'sweetalert2';

export function Presupuestos() {
  const { isCollapsed } = useSidebar();
  const { t } = useTranslation();
  const { presupuestos, loading, deletePresupuesto, refreshPresupuestos } = usePresupuestos();
  const { categorias, transacciones } = useFinanceData();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPresupuesto, setEditingPresupuesto] = useState<PresupuestoConProgreso | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Obtener meses con fallback usando useMemo
  const meses = useMemo(() => {
    try {
      const mesesTranslated = t('presupuestos.meses');
      if (Array.isArray(mesesTranslated) && mesesTranslated.length === 12) {
        return mesesTranslated;
      }
      // Fallback a español si no es un array válido
      return [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
    } catch (error) {
      // Fallback en caso de error
      return [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
    }
  }, [t]);

  // Calcular presupuestos con progreso para el mes seleccionado
  const presupuestosConProgreso = presupuestos
    .filter(p => p.mes === selectedMonth && p.ano === selectedYear)
    .map(presupuesto => {
      const categoria = categorias.find(c => c.id === presupuesto.categoria_id);
      
      const gastado = transacciones
        .filter(t => {
          const fecha = new Date(t.fecha);
          return (
            t.categoria_id === presupuesto.categoria_id &&
            t.tipo === 'gasto' &&
            fecha.getMonth() + 1 === selectedMonth &&
            fecha.getFullYear() === selectedYear
          );
        })
        .reduce((sum, t) => sum + t.monto, 0);

      const porcentaje_usado = presupuesto.limite > 0 ? (gastado / presupuesto.limite) * 100 : 0;
      const restante = presupuesto.limite - gastado;

      let estado: 'dentro_presupuesto' | 'cerca_limite' | 'excedido';
      if (porcentaje_usado >= 100) {
        estado = 'excedido';
      } else if (porcentaje_usado >= 80) {
        estado = 'cerca_limite';
      } else {
        estado = 'dentro_presupuesto';
      }

      return {
        ...presupuesto,
        categoria: categoria || { id: '', usuario_id: '', nombre: 'Sin categoría', icono: '❓', color: '#6B7280', tipo: 'gasto' },
        gastado,
        porcentaje_usado,
        restante,
        estado
      };
    });

  const handleEdit = (presupuesto: PresupuestoConProgreso) => {
    setEditingPresupuesto(presupuesto);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const presupuesto = presupuestosConProgreso.find(p => p.id === id);

    const result = await Swal.fire({
      title: t('presupuestos.eliminarPresupuesto'),
      html: `<div class="text-left">
        <p class="mb-2">${t('presupuestos.eliminandoPresupuesto')}</p>
        <div class="bg-gray-50 p-3 rounded-lg mb-3">
          <p class="font-semibold text-gray-900">${presupuesto?.categoria.nombre || t('presupuestos.categoriaDesconocida')}</p>
          <p class="text-sm text-gray-600">Límite: ${new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
          }).format(presupuesto?.limite || 0)}</p>
        </div>
        <p class="text-red-600 font-medium">${t('presupuestos.accionNoDeshacer')}</p>
      </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('presupuestos.siEliminar'),
      cancelButtonText: t('formularios.cancelar'),
      customClass: {
        popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
        title: 'dark:text-gray-100',
        content: 'dark:text-gray-300',
        actions: 'dark:text-gray-100',
        confirmButton: 'dark:bg-green-600 dark:hover:bg-green-700',
        cancelButton: 'dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white'
      }
    });

    if (result.isConfirmed) {
      const deleteResult = await deletePresupuesto(id);

      if (deleteResult) {
        Swal.fire({
          title: t('presupuestos.presupuestoEliminado'),
          text: t('presupuestos.presupuestoEliminadoTexto'),
          icon: 'success',
          confirmButtonColor: '#059669',
          customClass: {
            popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
            title: 'dark:text-gray-100',
            content: 'dark:text-gray-300',
            actions: 'dark:text-gray-100',
            confirmButton: 'dark:bg-green-600 dark:hover:bg-green-700'
          }
        });
      } else {
        Swal.fire({
          title: t('mensajes.error'),
          text: t('presupuestos.errorEliminar'),
          icon: 'error',
          confirmButtonColor: '#dc2626',
          customClass: {
            popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
            title: 'dark:text-gray-100',
            content: 'dark:text-gray-300',
            actions: 'dark:text-gray-100',
            confirmButton: 'dark:bg-green-600 dark:hover:bg-green-700'
          }
        });
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPresupuesto(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPresupuestos();
    } catch (error) {
      console.error('Error refreshing presupuestos:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

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
    <div className={`${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'} p-6 sm:p-8 pt-4 sm:pt-6 lg:pt-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800 transition-all duration-300`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-light text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
              {t('presupuestos.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-light">
              {t('presupuestos.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center space-x-2 px-4 py-3 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('presupuestos.actualizar')}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t('presupuestos.actualizar')}</span>
            </button>

            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>{t('presupuestos.nuevoPresupuesto')}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Filter className="h-5 w-5" />
              <span className="font-medium text-sm sm:text-base">{t('presupuestos.filtrarPor')}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="flex-1 sm:w-auto px-3 py-2 border border-gray-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                  {meses.map((mes, index) => (
                    <option key={index + 1} value={index + 1}>
                      {mes}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="flex-1 sm:w-auto px-3 py-2 border border-gray-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenido */}
      <div className="space-y-8">
        {/* Resumen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PresupuestoResumen presupuestos={presupuestosConProgreso} />
        </motion.div>

        {/* Lista de Presupuestos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('presupuestos.presupuestosDe')} {meses[selectedMonth - 1]} {selectedYear}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {presupuestosConProgreso.length} {presupuestosConProgreso.length === 1 ? t('presupuestos.presupuestoActivo') : t('presupuestos.presupuestosActivos')}
            </p>
          </div>

          {presupuestosConProgreso.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presupuestosConProgreso.map((presupuesto, index) => (
                <motion.div
                  key={presupuesto.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <PresupuestoCard
                    presupuesto={presupuesto}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t('presupuestos.noHayPresupuestos')} {meses[selectedMonth - 1]} {selectedYear}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {t('presupuestos.crearPrimerPresupuesto')}
              </p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all"
              >
                {t('presupuestos.crearPresupuesto')}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Formulario */}
      <PresupuestoForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        presupuesto={editingPresupuesto}
        mes={selectedMonth}
        ano={selectedYear}
      />
    </div>
  );
}
