import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { PresupuestoConProgreso } from '../../types';
import { IconRenderer } from '../IconRenderer';
import { useTranslation } from '../../context/LanguageContext';

interface PresupuestoCardProps {
  presupuesto: PresupuestoConProgreso;
  onEdit: (presupuesto: PresupuestoConProgreso) => void;
  onDelete: (id: string) => void;
}

export function PresupuestoCard({ presupuesto, onEdit, onDelete }: PresupuestoCardProps) {
  const { t } = useTranslation();
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'excedido':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'cerca_limite':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'dentro_presupuesto':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'excedido':
        return <AlertTriangle className="h-4 w-4" />;
      case 'cerca_limite':
        return <TrendingUp className="h-4 w-4" />;
      case 'dentro_presupuesto':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'excedido':
        return t('presupuestos.excedido');
      case 'cerca_limite':
        return t('presupuestos.cercaLimite');
      case 'dentro_presupuesto':
        return t('presupuestos.dentroPresupuesto');
      default:
        return t('presupuestos.sinEstado');
    }
  };

  const getBarraColor = (porcentaje: number) => {
    if (porcentaje >= 100) return 'bg-red-500';
    if (porcentaje >= 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-6 hover:shadow-lg transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: presupuesto.categoria.color }}
          >
            <IconRenderer
              iconName={presupuesto.categoria.icono}
              className="text-white"
              size={24}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{presupuesto.categoria.nombre}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('presupuestos.limite')} {formatCurrency(presupuesto.limite)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(presupuesto)}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center justify-center transition-colors"
          >
            <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(presupuesto.id)}
            className="w-8 h-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Progreso */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('presupuestos.progreso')}</span>
          <span className={`text-sm font-medium px-2 py-1 rounded-full border ${getEstadoColor(presupuesto.estado)}`}>
            <div className="flex items-center space-x-1">
              {getEstadoIcon(presupuesto.estado)}
              <span>{getEstadoTexto(presupuesto.estado)}</span>
            </div>
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-3 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(presupuesto.porcentaje_usado, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-3 rounded-full ${getBarraColor(presupuesto.porcentaje_usado)}`}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{presupuesto.porcentaje_usado.toFixed(1)}% {t('presupuestos.usado')}</span>
          <span>{formatCurrency(presupuesto.gastado)} / {formatCurrency(presupuesto.limite)}</span>
        </div>
      </div>

      {/* Detalles */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-dark-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('presupuestos.gastado')}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(presupuesto.gastado)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('presupuestos.restante')}</p>
          <p className={`text-lg font-semibold ${
            presupuesto.restante >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(presupuesto.restante)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
