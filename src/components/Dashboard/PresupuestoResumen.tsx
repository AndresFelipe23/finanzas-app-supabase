import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { PresupuestoConProgreso } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

interface PresupuestoResumenProps {
  presupuestos: PresupuestoConProgreso[];
}

export function PresupuestoResumen({ presupuestos }: PresupuestoResumenProps) {
  const { t } = useTranslation();
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Calcular estadísticas
  const totalLimite = presupuestos.reduce((sum, p) => sum + p.limite, 0);
  const totalGastado = presupuestos.reduce((sum, p) => sum + p.gastado, 0);
  const totalRestante = totalLimite - totalGastado;
  const porcentajeTotal = totalLimite > 0 ? (totalGastado / totalLimite) * 100 : 0;

  const presupuestosExcedidos = presupuestos.filter(p => p.estado === 'excedido').length;
  const presupuestosCercaLimite = presupuestos.filter(p => p.estado === 'cerca_limite').length;
  const presupuestosDentro = presupuestos.filter(p => p.estado === 'dentro_presupuesto').length;

  const getEstadoGeneral = () => {
    if (presupuestosExcedidos > 0) return 'excedido';
    if (presupuestosCercaLimite > 0) return 'cerca_limite';
    return 'dentro_presupuesto';
  };

  const estadoGeneral = getEstadoGeneral();

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'excedido':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'cerca_limite':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'dentro_presupuesto':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'excedido':
        return <AlertTriangle className="h-5 w-5" />;
      case 'cerca_limite':
        return <TrendingUp className="h-5 w-5" />;
      case 'dentro_presupuesto':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'excedido':
        return t('presupuestos.presupuestoExcedido');
      case 'cerca_limite':
        return t('presupuestos.cercaDelLimite');
      case 'dentro_presupuesto':
        return t('presupuestos.dentroDelPresupuesto');
      default:
        return t('presupuestos.sinEstado');
    }
  };

  const getBarraColor = (porcentaje: number) => {
    if (porcentaje >= 100) return 'bg-red-500';
    if (porcentaje >= 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  if (presupuestos.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('dashboard.sinPresupuestos')}</h3>
          <p className="text-gray-500 dark:text-gray-400 font-light">
            {t('dashboard.crearPrimerPresupuesto')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">{t('dashboard.resumenPresupuestos')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {presupuestos.length} {presupuestos.length === 1 ? t('presupuestos.categoriaConPresupuesto') : t('presupuestos.categoriasConPresupuesto')}
          </p>
        </div>
        <div className={`px-3 py-2 rounded-full border ${getEstadoColor(estadoGeneral)}`}>
          <div className="flex items-center space-x-2">
            {getEstadoIcon(estadoGeneral)}
            <span className="text-sm font-medium">{getEstadoTexto(estadoGeneral)}</span>
          </div>
        </div>
      </div>

      {/* Progreso General */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('presupuestos.progresoGeneral')}</span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {porcentajeTotal.toFixed(1)}% {t('presupuestos.usado')}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-4 mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(porcentajeTotal, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-4 rounded-full ${getBarraColor(porcentajeTotal)}`}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{formatCurrency(totalGastado)} {t('presupuestos.gastado')}</span>
          <span>{formatCurrency(totalLimite)} {t('presupuestos.limiteTotal')}</span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{presupuestosDentro}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('presupuestos.dentro')}</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{presupuestosCercaLimite}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('presupuestos.cerca')}</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{presupuestosExcedidos}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('presupuestos.excedidos')}</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{presupuestos.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('presupuestos.total')}</p>
        </div>
      </div>

      {/* Balance */}
      <div className="pt-4 border-t border-gray-100 dark:border-dark-700">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('presupuestos.balanceRestante')}</span>
          <span className={`text-lg font-semibold ${
            totalRestante >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(totalRestante)}
          </span>
        </div>
      </div>
    </div>
  );
}
