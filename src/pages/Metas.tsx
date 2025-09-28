import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Filter, TrendingUp, CheckCircle, Clock, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import { useMetas } from '../hooks/useMetas';
import { MetaForm } from '../components/Forms/MetaForm';
import { MetaCard } from '../components/Dashboard/MetaCard';
import { useSidebar } from '../context/SidebarContext';
import { useTranslation } from '../context/LanguageContext';
import { MetaConProgreso, Meta } from '../types';
import Swal from 'sweetalert2';

type FiltroEstado = 'todas' | 'activas' | 'completadas' | 'vencidas';

export function Metas() {
  const { isCollapsed } = useSidebar();
  const { t } = useTranslation();
  const { metas, loading, deleteMeta, calcularProgresoMetas, stats, refreshMetas } = useMetas();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todas');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Calcular metas con progreso
  const metasConProgreso = calcularProgresoMetas();

  // Filtrar metas según el estado seleccionado
  const metasFiltradas = metasConProgreso.filter(meta => {
    switch (filtroEstado) {
      case 'activas':
        return !meta.es_completada && meta.estado !== 'vencida';
      case 'completadas':
        return meta.es_completada;
      case 'vencidas':
        return meta.estado === 'vencida';
      default:
        return true;
    }
  });

  const handleEdit = (meta: MetaConProgreso) => {
    setEditingMeta(meta);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const meta = metasConProgreso.find(m => m.id === id);

    const result = await Swal.fire({
      title: t('metas.eliminarMeta'),
      html: `<div class="text-left">
        <p class="mb-2 dark:text-gray-300">${t('metas.eliminandoMeta')}</p>
        <div class="bg-gray-50 dark:bg-dark-700 p-3 rounded-lg mb-3">
          <p class="font-semibold text-gray-900 dark:text-gray-100">${meta?.nombre || t('metas.metaDesconocida')}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">${t('metas.objetivo')} ${formatCurrency(meta?.cantidad_objetivo || 0)}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">${t('metas.ahorrado')} ${formatCurrency(meta?.cantidad_actual || 0)}</p>
        </div>
        <p class="text-red-600 dark:text-red-400 font-medium">${t('metas.accionNoDeshacer')}</p>
      </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('metas.siEliminar'),
      cancelButtonText: t('formularios.cancelar'),
      customClass: {
        popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
        title: 'dark:text-gray-100',
        content: 'dark:text-gray-300',
        actions: 'dark:text-gray-100',
        confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700',
        cancelButton: 'dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white'
      }
    });

    if (result.isConfirmed) {
      const deleteResult = await deleteMeta(id);

      if (deleteResult) {
        // Recargar datos después de eliminar
        await refreshMetas();

        Swal.fire({
          title: t('metas.metaEliminada'),
          text: t('metas.metaEliminadaTexto'),
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
          text: t('metas.errorEliminarMeta'),
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
    setEditingMeta(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshMetas();
    setIsRefreshing(false);
  };

  const getFiltroInfo = (filtro: FiltroEstado) => {
    switch (filtro) {
      case 'activas':
        return {
          count: metasConProgreso.filter(m => !m.es_completada && m.estado !== 'vencida').length,
          icon: Clock,
          color: 'text-blue-600'
        };
      case 'completadas':
        return {
          count: stats.completadas,
          icon: CheckCircle,
          color: 'text-green-600'
        };
      case 'vencidas':
        return {
          count: metasConProgreso.filter(m => m.estado === 'vencida').length,
          icon: AlertTriangle,
          color: 'text-red-600'
        };
      default:
        return {
          count: stats.total,
          icon: Target,
          color: 'text-gray-600'
        };
    }
  };

  if (loading) {
    return (
      <div className={`${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'} p-6 sm:p-8 pt-4 sm:pt-6 lg:pt-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800 transition-all duration-300 overflow-x-hidden`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'} p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6 lg:pt-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800 transition-all duration-300 overflow-x-hidden`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-light text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
              {t('metas.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-light">
              {t('metas.subtitle')}
            </p>
          </div>

          <div className="flex items-center justify-end sm:justify-start space-x-2 sm:space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              title="Actualizar datos"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-sm sm:text-base">{t('metas.actualizar')}</span>
            </button>

            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg sm:rounded-xl font-medium transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{t('metas.nuevaMeta')}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
      >
        <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4 sm:p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('metas.totalMetas')}</p>
              <p className="text-2xl font-light text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4 sm:p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('metas.completadas')}</p>
              <p className="text-2xl font-light text-gray-900 dark:text-gray-100">{stats.completadas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4 sm:p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('metas.objetivoTotal')}</p>
              <p className="text-xl font-light text-gray-900 dark:text-gray-100">{formatCurrency(stats.dinero_total_objetivo)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4 sm:p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('metas.totalAhorrado')}</p>
              <p className="text-xl font-light text-gray-900 dark:text-gray-100">{formatCurrency(stats.dinero_total_ahorrado)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Filter className="h-5 w-5" />
              <span className="font-medium text-sm sm:text-base">{t('metas.filtrarPorEstado')}</span>
            </div>

            <div className="flex flex-wrap gap-2 sm:flex-nowrap overflow-x-auto pb-2 sm:pb-0">
              {(['todas', 'activas', 'completadas', 'vencidas'] as FiltroEstado[]).map((filtro) => {
                const info = getFiltroInfo(filtro);
                const IconComponent = info.icon;
                const isActive = filtroEstado === filtro;

                return (
                  <button
                    key={filtro}
                    onClick={() => setFiltroEstado(filtro)}
                    className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-600'
                    }`}
                  >
                    <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="capitalize text-xs sm:text-sm">{t(`metas.${filtro}`)}</span>
                    <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                      isActive ? 'bg-white/20' : 'bg-gray-200 dark:bg-dark-600'
                    }`}>
                      {info.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lista de Metas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-gray-100 mb-2">
            {filtroEstado === 'todas' ? t('metas.todasLasMetas') :
             filtroEstado === 'activas' ? t('metas.metasActivas') :
             filtroEstado === 'completadas' ? t('metas.metasCompletadas') :
             t('metas.metasVencidas')}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {metasFiltradas.length} {metasFiltradas.length === 1 ? t('metas.meta') : t('metas.metasPlural')} {
              filtroEstado === 'todas' ? t('metas.enTotal') :
              filtroEstado === 'activas' ? (metasFiltradas.length === 1 ? t('metas.activa') : t('metas.activasPlural')) :
              filtroEstado === 'completadas' ? (metasFiltradas.length === 1 ? t('metas.completada') : t('metas.completadasPlural')) :
              (metasFiltradas.length === 1 ? t('metas.vencida') : t('metas.vencidasPlural'))
            }
          </p>
        </div>

        {metasFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {metasFiltradas.map((meta, index) => (
              <motion.div
                key={meta.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <MetaCard
                  meta={meta}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-8 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {filtroEstado === 'todas' ? t('metas.noTienesMetas') :
               filtroEstado === 'activas' ? t('metas.noTienesMetasActivas') :
               filtroEstado === 'completadas' ? t('metas.noTienesMetasCompletadas') :
               t('metas.noTienesMetasVencidas')}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6">
              {filtroEstado === 'todas' ? t('metas.crearPrimeraMeta') :
               filtroEstado === 'activas' ? t('metas.todasCompletadasVencidas') :
               filtroEstado === 'completadas' ? t('metas.felicitacionesCompletadas') :
               t('metas.noMetasVencidas')}
            </p>
            {(filtroEstado === 'todas' || filtroEstado === 'activas') && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all text-sm sm:text-base"
              >
                {t('metas.crearMiPrimeraMeta')}
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Formulario */}
      <MetaForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        meta={editingMeta}
      />
    </div>
  );
}