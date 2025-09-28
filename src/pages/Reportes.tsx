import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, RefreshCw, FileText, Calendar } from 'lucide-react';
import { useReportes } from '../hooks/useReportes';
import { FiltrosReporte } from '../components/Reports/FiltrosReporte';
import { EstadisticasReporte } from '../components/Reports/EstadisticasReporte';
import { ReporteChart, CategoriasChart } from '../components/Charts/ReporteChart';
import { useSidebar } from '../context/SidebarContext';
import { useTranslation } from '../context/LanguageContext';
import Swal from 'sweetalert2';

export function Reportes() {
  const { isCollapsed } = useSidebar();
  const { t } = useTranslation();
  const {
    filtros,
    estadisticas,
    datosGraficos,
    datosCategorias,
    loading,
    isGenerating,
    generarReporte,
    formatCurrency
  } = useReportes();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular recarga de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExportReport = async () => {
    try {
      const reporte = await generarReporte();

      await Swal.fire({
        title: t('reportes.reporteGenerado'),
        html: `
          <div class="text-left">
            <p class="mb-2">${t('reportes.reporteGeneradoTexto')}</p>
            <div class="bg-gray-50 p-3 rounded-lg mb-3">
              <p><strong>${t('reportes.periodo')}:</strong> ${filtros.fechaInicio} a ${filtros.fechaFin}</p>
              <p><strong>${t('reportes.totalIngresos')}:</strong> ${formatCurrency(estadisticas.totalIngresos)}</p>
              <p><strong>${t('reportes.totalGastos')}:</strong> ${formatCurrency(estadisticas.totalGastos)}</p>
              <p><strong>${t('reportes.balance')}:</strong> ${formatCurrency(estadisticas.balance)}</p>
            </div>
            <p class="text-sm text-gray-600">${t('reportes.funcionalidadDescarga')}</p>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#059669',
        customClass: {
          popup: 'swal-z-index'
        }
      });
    } catch (error) {
      Swal.fire({
        title: t('mensajes.error'),
        text: t('reportes.errorGenerarReporte'),
        icon: 'error',
        confirmButtonColor: '#dc2626',
        customClass: {
          popup: 'swal-z-index'
        }
      });
    }
  };

  const formatPeriod = () => {
    const fechaInicio = new Date(filtros.fechaInicio).toLocaleDateString('es-CO');
    const fechaFin = new Date(filtros.fechaFin).toLocaleDateString('es-CO');
    return `${fechaInicio} - ${fechaFin}`;
  };

  if (loading) {
    return (
      <div className={`${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'} p-6 sm:p-8 pt-4 sm:pt-6 lg:pt-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800 transition-all duration-300`}>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
              {t('reportes.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-light">
              {t('reportes.subtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center space-x-2 px-4 py-3 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              title="Actualizar datos"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t('reportes.actualizar')}</span>
            </button>

            <button
              onClick={handleExportReport}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-800 dark:hover:to-blue-900 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              <span>{isGenerating ? t('reportes.generando') : t('reportes.exportar')}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Información del período actual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('reportes.periodoAnalisis')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{formatPeriod()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">{t('reportes.transacciones')}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{estadisticas.transacciones}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">{t('reportes.balance')}</p>
                <p className={`font-semibold ${estadisticas.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(estadisticas.balance)}
                </p>
              </div>
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
        <FiltrosReporte />
      </motion.div>

      {/* Estadísticas principales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <EstadisticasReporte
          estadisticas={estadisticas}
          formatCurrency={formatCurrency}
        />
      </motion.div>

      {/* Gráficos y visualizaciones */}
      <div className="space-y-8">
        {/* Evolución temporal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mb-6">{t('reportes.evolucionTemporal')}</h2>
          <ReporteChart
            datosGraficos={datosGraficos}
            formatCurrency={formatCurrency}
          />
        </motion.div>

        {/* Análisis por categorías */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mb-6">{t('reportes.analisisCategorias')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoriasChart
              categorias={datosCategorias.ingresos}
              tipo="ingresos"
              formatCurrency={formatCurrency}
            />
            <CategoriasChart
              categorias={datosCategorias.gastos}
              tipo="gastos"
              formatCurrency={formatCurrency}
            />
          </div>
        </motion.div>

        {/* Resumen detallado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('reportes.resumenPeriodo')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{t('reportes.ingresos')}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('reportes.total')}</span>
                  <span className="font-medium text-green-600">{formatCurrency(estadisticas.totalIngresos)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('reportes.categoriasActivas')}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{datosCategorias.ingresos.length}</span>
                </div>
                {estadisticas.categoriaTopIngreso && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('reportes.principal')}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{estadisticas.categoriaTopIngreso.nombre}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{t('reportes.gastos')}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('reportes.total')}</span>
                  <span className="font-medium text-red-600">{formatCurrency(estadisticas.totalGastos)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('reportes.categoriasActivas')}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{datosCategorias.gastos.length}</span>
                </div>
                {estadisticas.categoriaTopGasto && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('reportes.principal')}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{estadisticas.categoriaTopGasto.nombre}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{t('reportes.actividad')}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('reportes.transacciones')}:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{estadisticas.transacciones}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('reportes.promedioDiario')}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(estadisticas.promedioGastosDiario)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t('reportes.tasaAhorro')}</span>
                  <span className={`font-medium ${
                    estadisticas.totalIngresos > 0 && ((estadisticas.balance / estadisticas.totalIngresos) * 100) >= 10
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {estadisticas.totalIngresos > 0
                      ? `${((estadisticas.balance / estadisticas.totalIngresos) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}