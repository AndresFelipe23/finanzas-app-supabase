import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { Cuenta, Categoria } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  cuentas: Cuenta[];
  categorias: Categoria[];
}

export function TransactionForm({ isOpen, onClose, onSubmit, cuentas, categorias }: TransactionFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    tipo: 'gasto' as 'ingreso' | 'gasto',
    nombre: '',
    monto: '',
    descripcion: '',
    categoria_id: '',
    cuenta_id: '',
    fecha: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Corrige el manejo de la fecha para evitar problemas de zona horaria.
      // El input 'date' devuelve 'YYYY-MM-DD'. Al crear un new Date() con esto,
      // algunos navegadores lo interpretan como UTC, causando que se guarde el día anterior.
      // Para asegurar que se interprete en la zona horaria local, añadimos la hora.
      const fechaSeleccionada = new Date(`${formData.fecha}T00:00:00`);

      const ahora = new Date();
      // Combina la fecha seleccionada por el usuario con la hora actual
      fechaSeleccionada.setHours(ahora.getHours());
      fechaSeleccionada.setMinutes(ahora.getMinutes());
      fechaSeleccionada.setSeconds(ahora.getSeconds());

      await onSubmit({
        ...formData,
        monto: parseFloat(formData.monto),
        // Envía la fecha como un string ISO completo. Supabase lo manejará correctamente.
        fecha: fechaSeleccionada.toISOString()
      });

      // Resetear formulario
      setFormData({
        tipo: 'gasto',
        nombre: '',
        monto: '',
        descripcion: '',
        categoria_id: '',
        cuenta_id: '',
        fecha: new Date().toISOString().split('T')[0]
      });
      onClose();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const categoriasFiltradas = categorias.filter(c => c.tipo === formData.tipo);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('transacciones.nueva')} {t('transacciones.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('formularios.tipo')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setFormData({ ...formData, tipo: 'gasto', categoria_id: '' })}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  formData.tipo === 'gasto'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {t('formularios.gasto')}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => setFormData({ ...formData, tipo: 'ingreso', categoria_id: '' })}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  formData.tipo === 'ingreso'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {t('formularios.ingreso')}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('formularios.nombre')}
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              placeholder={t('formularios.nombreTransaccion')}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('formularios.monto')}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.monto}
              onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              placeholder="0.00"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('formularios.categoria')}
            </label>
            <select
              value={formData.categoria_id}
              onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              required
              disabled={loading}
            >
              <option value="">{t('formularios.seleccionarCategoria')}</option>
              {categoriasFiltradas.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('formularios.cuenta')}
            </label>
            <select
              value={formData.cuenta_id}
              onChange={(e) => setFormData({ ...formData, cuenta_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              required
              disabled={loading}
            >
              <option value="">{t('formularios.seleccionarCuenta')}</option>
              {cuentas.map(cuenta => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('formularios.fecha')}
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('formularios.descripcion')}
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              rows={3}
              placeholder={t('formularios.descripcionOpcional')}
              disabled={loading}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700"
              disabled={loading}
            >
              {t('formularios.cancelar')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>{t('formularios.guardar')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
