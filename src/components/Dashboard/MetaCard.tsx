import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Plus, Minus, Calendar, TrendingUp, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { MetaConProgreso } from '../../types';
import { IconRenderer } from '../IconRenderer';
import { useMetas } from '../../hooks/useMetas';
import Swal from 'sweetalert2';
import { useTranslation } from '../../context/LanguageContext';

interface MetaCardProps {
  meta: MetaConProgreso;
  onEdit: (meta: MetaConProgreso) => void;
  onDelete: (id: string) => void;
}

export function MetaCard({ meta, onEdit, onDelete }: MetaCardProps) {
  const { t } = useTranslation();
  const { actualizarProgreso, refreshMetas } = useMetas();
  const [isUpdating, setIsUpdating] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'vencida':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'atrasada':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'en_tiempo':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'completada':
        return <CheckCircle className="h-4 w-4" />;
      case 'vencida':
        return <AlertTriangle className="h-4 w-4" />;
      case 'atrasada':
        return <Clock className="h-4 w-4" />;
      case 'en_tiempo':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'completada':
        return t('metas.estadoCompletada');
      case 'vencida':
        return t('metas.estadoVencida');
      case 'atrasada':
        return t('metas.estadoAtrasada');
      case 'en_tiempo':
        return t('metas.estadoEnTiempo');
      default:
        return t('metas.sinEstado');
    }
  };

  const getBarraColor = (porcentaje: number, estado: string) => {
    if (estado === 'completada') return 'bg-green-500';
    if (estado === 'vencida') return 'bg-red-500';
    if (estado === 'atrasada') return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const handleAgregarDinero = async () => {
    const { value: amount } = await Swal.fire({
      title: t('metas.agregarDineroTitulo'),
      html: `
        <div class="text-left mb-4">
          <p class="text-gray-600 dark:text-gray-400 mb-2">${t('metas.metaLabel')} <strong>${meta.nombre}</strong></p>
          <p class="text-gray-600 dark:text-gray-400">${t('metas.progresoActual')} <strong>${formatCurrency(meta.cantidad_actual)}</strong></p>
        </div>
      `,
      input: 'number',
      inputLabel: t('metas.cantidadAgregar'),
      inputPlaceholder: '50000',
      inputAttributes: {
        min: '1000',
        step: '1000'
      },
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('metas.agregar'),
      cancelButtonText: t('formularios.cancelar'),
      customClass: {
        popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
        title: 'dark:text-gray-100',
        content: 'dark:text-gray-300',
        input: 'dark:bg-dark-700 dark:border-dark-600 dark:text-gray-100',
        actions: 'dark:text-gray-100',
        confirmButton: 'dark:bg-green-600 dark:hover:bg-green-700',
        cancelButton: 'dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white'
      },
      inputValidator: (value) => {
        if (!value || parseFloat(value) <= 0) {
          return t('metas.cantidadValidaMayorCero');
        }
        if (parseFloat(value) < 1000) {
          return t('metas.cantidadMinima');
        }
      }
    });

    if (amount) {
      setIsUpdating(true);
      const success = await actualizarProgreso(meta.id, parseFloat(amount));

      if (success) {
        // Recargar datos para reflejar cambios
        await refreshMetas();

        Swal.fire({
          title: t('metas.dineroAgregado'),
          text: t('metas.dineroAgregadoTexto').replace('{cantidad}', formatCurrency(parseFloat(amount))),
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
          text: t('metas.errorAgregarDinero'),
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

      setIsUpdating(false);
    }
  };

  const handleRetirarDinero = async () => {
    const { value: amount } = await Swal.fire({
      title: t('metas.retirarDineroTitulo'),
      html: `
        <div class="text-left mb-4">
          <p class="text-gray-600 dark:text-gray-400 mb-2">${t('metas.metaLabel')} <strong>${meta.nombre}</strong></p>
          <p class="text-gray-600 dark:text-gray-400">${t('metas.progresoActual')} <strong>${formatCurrency(meta.cantidad_actual)}</strong></p>
        </div>
      `,
      input: 'number',
      inputLabel: t('metas.cantidadRetirar'),
      inputPlaceholder: '50000',
      inputAttributes: {
        min: '1000',
        step: '1000',
        max: meta.cantidad_actual.toString()
      },
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('metas.retirar'),
      cancelButtonText: t('formularios.cancelar'),
      customClass: {
        popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
        title: 'dark:text-gray-100',
        content: 'dark:text-gray-300',
        input: 'dark:bg-dark-700 dark:border-dark-600 dark:text-gray-100',
        actions: 'dark:text-gray-100',
        confirmButton: 'dark:bg-green-600 dark:hover:bg-green-700',
        cancelButton: 'dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white'
      },
      inputValidator: (value) => {
        if (!value || parseFloat(value) <= 0) {
          return t('metas.cantidadValidaMayorCero');
        }
        if (parseFloat(value) > meta.cantidad_actual) {
          return t('metas.noRetirarMas');
        }
      }
    });

    if (amount) {
      setIsUpdating(true);
      const success = await actualizarProgreso(meta.id, -parseFloat(amount));

      if (success) {
        // Recargar datos para reflejar cambios
        await refreshMetas();

        Swal.fire({
          title: t('metas.dineroRetirado'),
          text: t('metas.dineroRetiradoTexto').replace('{cantidad}', formatCurrency(parseFloat(amount))),
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
          text: t('metas.errorRetirarDinero'),
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

      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      key={`${meta.id}-${meta.cantidad_actual}-${meta.es_completada}`} // Key único para forzar re-render
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 ${
        isUpdating ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: meta.color }}
          >
            <IconRenderer
              iconName={meta.icono}
              className="text-white"
              size={20}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">{meta.nombre}</h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
              {meta.categoria && `${meta.categoria} • `}
              {t('metas.hasta')} {formatDate(meta.fecha_limite)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {!meta.es_completada && (
            <>
              <button
                onClick={handleAgregarDinero}
                disabled={isUpdating}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center justify-center transition-colors"
                title={t('metas.agregarDinero')}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              </button>
              <button
                onClick={handleRetirarDinero}
                disabled={isUpdating || meta.cantidad_actual <= 0}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('metas.retirarDinero')}
              >
                <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
              </button>
            </>
          )}
          <button
            onClick={() => onEdit(meta)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center justify-center transition-colors"
          >
            <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(meta.id)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors"
          >
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Estado */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 gap-2">
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{t('metas.progreso')}</span>
          <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full border ${getEstadoColor(meta.estado)} flex-shrink-0`}>
            <div className="flex items-center space-x-1">
              {getEstadoIcon(meta.estado)}
              <span className="hidden sm:inline">{getEstadoTexto(meta.estado)}</span>
            </div>
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-3 mb-2">
          <motion.div
            key={`progress-${meta.id}-${meta.cantidad_actual}`} // Key único para re-animar
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(meta.porcentaje_completado, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className={`h-3 rounded-full ${getBarraColor(meta.porcentaje_completado, meta.estado)}`}
          />
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <span>{meta.porcentaje_completado.toFixed(1)}% {t('metas.completado')}</span>
          <span className="truncate ml-2">{formatCurrency(meta.cantidad_actual)} / {formatCurrency(meta.cantidad_objetivo)}</span>
        </div>
      </div>

      {/* Descripción */}
      {meta.descripcion && (
        <div className="mb-4">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{meta.descripcion}</p>
        </div>
      )}

      {/* Detalles */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-gray-100 dark:border-dark-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('metas.restante')}</p>
          <p className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {formatCurrency(meta.dinero_restante)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {meta.tiempo_restante_dias > 0 ? t('metas.diasRestantes') : t('metas.diasVencidos')}
          </p>
          <p className={`text-sm sm:text-lg font-semibold flex items-center space-x-1 ${
            meta.tiempo_restante_dias < 0 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'
          }`}>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>{Math.abs(meta.tiempo_restante_dias)}</span>
          </p>
        </div>
      </div>

      {/* Recomendación diaria */}
      {!meta.es_completada && meta.tiempo_restante_dias > 0 && (
        <div className="mt-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">
            {t('metas.metaDiariaRecomendada')}
          </p>
          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 font-semibold truncate">
            {formatCurrency(meta.progreso_diario_requerido)}
          </p>
        </div>
      )}
    </motion.div>
  );
}