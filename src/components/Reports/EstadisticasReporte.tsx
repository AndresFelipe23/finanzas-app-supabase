import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  Award,
  AlertCircle
} from 'lucide-react';
import { EstadisticaReporte } from '../../types';
import { IconRenderer } from '../IconRenderer';
import { useTranslation } from '../../context/LanguageContext';

interface EstadisticasReporteProps {
  estadisticas: EstadisticaReporte;
  formatCurrency: (value: number) => string;
}

export function EstadisticasReporte({ estadisticas, formatCurrency }: EstadisticasReporteProps) {
  const { t } = useTranslation();
  const porcentajeAhorro = estadisticas.totalIngresos > 0
    ? ((estadisticas.balance / estadisticas.totalIngresos) * 100)
    : 0;

  const estadisticasCards = [
    {
      title: t('reportes.totalIngresos'),
      value: estadisticas.totalIngresos,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600',
      description: t('reportes.dineroRecibido')
    },
    {
      title: t('reportes.totalGastos'),
      value: estadisticas.totalGastos,
      icon: TrendingDown,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600',
      description: t('reportes.dineroGastado')
    },
    {
      title: t('reportes.balance'),
      value: estadisticas.balance,
      icon: DollarSign,
      color: estadisticas.balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600',
      bgColor: estadisticas.balance >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20',
      textColor: estadisticas.balance >= 0 ? 'text-blue-600' : 'text-orange-600',
      description: estadisticas.balance >= 0 ? t('reportes.superavitPeriodo') : t('reportes.deficitPeriodo')
    },
    {
      title: t('reportes.transacciones'),
      value: estadisticas.transacciones,
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600',
      description: t('reportes.numeroMovimientos'),
      isCount: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {estadisticasCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {stat.title}
                </p>
                <p className={`text-2xl font-light ${stat.textColor} tracking-tight`}>
                  {stat.isCount ? stat.value.toLocaleString() : formatCurrency(stat.value)}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">{stat.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análisis de ahorro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Target className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('reportes.analisisAhorro')}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('reportes.porcentajeAhorro')}</span>
                <span className={`text-lg font-semibold ${
                  porcentajeAhorro >= 20 ? 'text-green-600' :
                  porcentajeAhorro >= 10 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {porcentajeAhorro.toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(Math.abs(porcentajeAhorro), 100)}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className={`h-3 rounded-full ${
                    porcentajeAhorro >= 20 ? 'bg-green-500' :
                    porcentajeAhorro >= 10 ? 'bg-yellow-500' :
                    porcentajeAhorro >= 0 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                />
              </div>

              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {porcentajeAhorro >= 20 ? t('reportes.excelente') :
                 porcentajeAhorro >= 10 ? t('reportes.buenTrabajo') :
                 porcentajeAhorro >= 0 ? t('reportes.puedesMejorar') :
                 t('reportes.enDeficit')}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-dark-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('reportes.promedioGastosDiarios')}</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(estadisticas.promedioGastosDiario)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top categorías */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Award className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('reportes.topCategorias')}</h3>
          </div>

          <div className="space-y-4">
            {/* Top gasto */}
            {estadisticas.categoriaTopGasto ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">{t('reportes.mayorGasto')}</span>
                  </div>
                  <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                    {estadisticas.categoriaTopGasto.porcentaje.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-red-900 dark:text-red-100">
                    {estadisticas.categoriaTopGasto.nombre}
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(estadisticas.categoriaTopGasto.monto)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-xl text-center">
                <AlertCircle className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('reportes.sinGastosRegistrados')}</span>
              </div>
            )}

            {/* Top ingreso */}
            {estadisticas.categoriaTopIngreso ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">{t('reportes.mayorIngreso')}</span>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    {estadisticas.categoriaTopIngreso.porcentaje.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-green-900 dark:text-green-100">
                    {estadisticas.categoriaTopIngreso.nombre}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(estadisticas.categoriaTopIngreso.monto)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-xl text-center">
                <AlertCircle className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('reportes.sinIngresosRegistrados')}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Indicadores de salud financiera */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('reportes.saludFinanciera')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Indicador de balance */}
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-dark-700">
            <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
              estadisticas.balance >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {estadisticas.balance >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {estadisticas.balance >= 0 ? t('reportes.superavit') : t('reportes.deficit')}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {estadisticas.balance >= 0
                ? t('reportes.tusIngresosSuperan')
                : t('reportes.tusGastosSuperan')
              }
            </p>
          </div>

          {/* Indicador de ahorro */}
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-dark-700">
            <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
              porcentajeAhorro >= 20 ? 'bg-green-100 dark:bg-green-900/30' :
              porcentajeAhorro >= 10 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
              'bg-red-100 dark:bg-red-900/30'
            }`}>
              <Target className={`h-8 w-8 ${
                porcentajeAhorro >= 20 ? 'text-green-600' :
                porcentajeAhorro >= 10 ? 'text-yellow-600' :
                'text-red-600'
              }`} />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {porcentajeAhorro >= 20 ? t('reportes.excelente') :
               porcentajeAhorro >= 10 ? t('reportes.bueno') :
               t('reportes.mejorable')}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('reportes.capacidadAhorro')} {porcentajeAhorro.toFixed(1)}%
            </p>
          </div>

          {/* Indicador de actividad */}
          <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-dark-700">
            <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
              estadisticas.transacciones >= 30 ? 'bg-blue-100 dark:bg-blue-900/30' :
              estadisticas.transacciones >= 10 ? 'bg-purple-100 dark:bg-purple-900/30' :
              'bg-gray-100 dark:bg-gray-800'
            }`}>
              <BarChart3 className={`h-8 w-8 ${
                estadisticas.transacciones >= 30 ? 'text-blue-600' :
                estadisticas.transacciones >= 10 ? 'text-purple-600' :
                'text-gray-600 dark:text-gray-400'
              }`} />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {estadisticas.transacciones >= 30 ? t('reportes.muyActivo') :
               estadisticas.transacciones >= 10 ? t('reportes.activo') :
               t('reportes.pocoActivo')}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {estadisticas.transacciones} {t('reportes.transaccionesRegistradas')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}