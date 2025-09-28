import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Calendar, Tag, AlertCircle } from 'lucide-react';
import { usePresupuestos } from '../../hooks/usePresupuestos';
import { useFinanceData } from '../../hooks/useFinanceData';
import { CreatePresupuestoDto, UpdatePresupuestoDto } from '../../types';
import { IconRenderer } from '../IconRenderer';
import Swal from 'sweetalert2';
import { useTranslation } from '../../context/LanguageContext';

interface PresupuestoFormProps {
  isOpen: boolean;
  onClose: () => void;
  presupuesto?: any; // Para edición
  mes?: number;
  ano?: number;
}

export function PresupuestoForm({ isOpen, onClose, presupuesto, mes, ano }: PresupuestoFormProps) {
  const { t } = useTranslation();
  const { addPresupuesto, updatePresupuesto, existePresupuesto } = usePresupuestos();
  const { categorias } = useFinanceData();
  
  const [formData, setFormData] = useState<CreatePresupuestoDto>({
    categoria_id: '',
    limite: 0,
    mes: mes || new Date().getMonth() + 1,
    ano: ano || new Date().getFullYear()
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtrar solo categorías de gasto
  const categoriasGasto = categorias.filter(c => c.tipo === 'gasto');

  useEffect(() => {
    if (presupuesto) {
      setFormData({
        categoria_id: presupuesto.categoria_id,
        limite: presupuesto.limite,
        mes: presupuesto.mes,
        ano: presupuesto.ano
      });
    } else {
      setFormData({
        categoria_id: '',
        limite: 0,
        mes: mes || new Date().getMonth() + 1,
        ano: ano || new Date().getFullYear()
      });
    }
    setError('');
  }, [presupuesto, mes, ano, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validaciones
      if (!formData.categoria_id) {
        setError(t('presupuestos.seleccionaCategoria'));
        return;
      }

      if (formData.limite <= 0) {
        setError(t('presupuestos.limiteMayorCero'));
        return;
      }

      // Verificar si ya existe presupuesto para esta categoría en este mes
      if (!presupuesto && existePresupuesto(formData.categoria_id, formData.mes, formData.ano)) {
        setError(t('presupuestos.presupuestoExiste'));
        return;
      }

      let result;
      if (presupuesto) {
        result = await updatePresupuesto(presupuesto.id, formData);
      } else {
        result = await addPresupuesto(formData);
      }

      if (result) {
        // Cerrar formulario primero
        onClose();
        
        // Mostrar éxito después de cerrar
        setTimeout(() => {
          Swal.fire({
            title: t('presupuestos.presupuestoCreado'),
            text: t('presupuestos.presupuestoGuardadoTexto').replace('{accion}', presupuesto ? t('presupuestos.presupuestoActualizado') : t('presupuestos.presupuestoCreado2')),
            icon: 'success',
            confirmButtonColor: '#059669',
            customClass: {
              popup: 'swal-z-index'
            }
          });
        }, 300);
      } else {
        setError(t('presupuestos.errorGuardar'));
      }
    } catch (err) {
      setError(t('presupuestos.errorInesperado'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreatePresupuestoDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {presupuesto ? t('presupuestos.editarPresupuesto') : t('presupuestos.nuevoPresupuesto')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {presupuesto ? t('presupuestos.modificarDatos') : t('presupuestos.establecerLimite')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag className="h-4 w-4 inline mr-2" />
              {t('presupuestos.categoria')}
            </label>
            <div className="relative">
              <select
                value={formData.categoria_id}
                onChange={(e) => handleInputChange('categoria_id', e.target.value)}
                className={`w-full py-3 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 ${
                  formData.categoria_id ? 'pl-10 pr-4' : 'px-4'
                }`}
                required
              >
                <option value="">{t('presupuestos.seleccionarCategoria')}</option>
                {categoriasGasto.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>

              {/* Mostrar icono de la categoría seleccionada */}
              {formData.categoria_id && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <IconRenderer
                    iconName={categoriasGasto.find(c => c.id === formData.categoria_id)?.icono || 'Tag'}
                    size={16}
                    style={{ color: categoriasGasto.find(c => c.id === formData.categoria_id)?.color || '#6B7280' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Límite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="h-4 w-4 inline mr-2" />
              {t('presupuestos.limiteMensual')}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.limite || ''}
                onChange={(e) => handleInputChange('limite', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-20 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                placeholder="0"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                COP
              </div>
            </div>
            {formData.limite > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatCurrency(formData.limite)}
              </p>
            )}
          </div>

          {/* Mes y Año */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                {t('presupuestos.mes')}
              </label>
              <select
                value={formData.mes}
                onChange={(e) => handleInputChange('mes', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                required
              >
                {meses.map((mes, index) => (
                  <option key={index + 1} value={index + 1}>
                    {mes}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('presupuestos.ano')}
              </label>
              <select
                value={formData.ano}
                onChange={(e) => handleInputChange('ano', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                required
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

          {/* Error */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-xl font-medium transition-colors"
            >
              {t('presupuestos.cancelar')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('presupuestos.guardando') : (presupuesto ? t('presupuestos.actualizar') : t('presupuestos.crear'))}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
