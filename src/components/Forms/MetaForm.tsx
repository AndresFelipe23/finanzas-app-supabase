import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Target, DollarSign, Calendar, Type, Tag, Palette, AlertCircle } from 'lucide-react';
import { useMetas, ICONOS_META, COLORES_META } from '../../hooks/useMetas';
import { useCategorias } from '../../hooks/useCategorias';
import { CreateMetaDto, UpdateMetaDto, Meta } from '../../types';
import { IconRenderer } from '../IconRenderer';
import Swal from 'sweetalert2';
import { useTranslation } from '../../context/LanguageContext';

interface MetaFormProps {
  isOpen: boolean;
  onClose: () => void;
  meta?: Meta;
}

export function MetaForm({ isOpen, onClose, meta }: MetaFormProps) {
  const { t } = useTranslation();
  const { createMeta, updateMeta, refreshMetas } = useMetas();
  const { categorias } = useCategorias();

  const [formData, setFormData] = useState<CreateMetaDto>({
    nombre: '',
    descripcion: '',
    cantidad_objetivo: 0,
    fecha_limite: '',
    categoria: '',
    icono: 'Target',
    color: '#3b82f6'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'datos' | 'personalizacion'>('datos');

  useEffect(() => {
    if (meta) {
      setFormData({
        nombre: meta.nombre,
        descripcion: meta.descripcion || '',
        cantidad_objetivo: meta.cantidad_objetivo,
        fecha_limite: meta.fecha_limite,
        categoria: meta.categoria || '',
        icono: meta.icono || 'Target',
        color: meta.color || '#3b82f6'
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        cantidad_objetivo: 0,
        fecha_limite: '',
        categoria: '',
        icono: 'Target',
        color: '#3b82f6'
      });
    }
    setError('');
    setActiveTab('datos');
  }, [meta, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validaciones
      if (!formData.nombre.trim()) {
        setError(t('metas.nombreObligatorio'));
        return;
      }

      if (formData.cantidad_objetivo <= 0) {
        setError(t('metas.cantidadMayorCero'));
        return;
      }

      if (!formData.fecha_limite) {
        setError(t('metas.fechaLimiteObligatoria'));
        return;
      }

      // Verificar que la fecha límite sea futura
      const fechaLimite = new Date(formData.fecha_limite);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaLimite <= hoy) {
        setError(t('metas.fechaLimiteFutura'));
        return;
      }

      let result;
      if (meta) {
        result = await updateMeta(meta.id, formData);
      } else {
        result = await createMeta(formData);
      }

      if (result) {
        // Recargar datos
        await refreshMetas();

        onClose();
        setTimeout(() => {
          Swal.fire({
            title: meta ? `¡Meta ${t('metas.metaActualizada')}!` : `¡Meta ${t('metas.metaCreada')}!`,
            text: t('metas.metaGuardadaTexto').replace('{nombre}', formData.nombre).replace('{accion}', meta ? t('metas.metaActualizada') : t('metas.metaCreada')),
            icon: 'success',
            confirmButtonColor: '#059669',
            customClass: {
              popup: 'swal-z-index'
            }
          });
        }, 300);
      } else {
        setError(t('metas.errorGuardarMeta'));
      }
    } catch (err) {
      setError(t('metas.errorInesperado'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateMetaDto, value: any) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {meta ? t('metas.editarMeta') : t('metas.nuevaMeta')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {meta ? t('metas.modificarDatos') : t('metas.definirObjetivo')}
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

        {/* Tabs */}
        <div className="border-b border-gray-100 dark:border-dark-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('datos')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'datos'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t('metas.datosBasicos')}
            </button>
            <button
              onClick={() => setActiveTab('personalizacion')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'personalizacion'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t('metas.personalizacion')}
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === 'datos' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna izquierda */}
                <div className="space-y-6">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Type className="h-4 w-4 inline mr-2" />
                      {t('metas.nombreMeta')}
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                      placeholder={t('metas.nombrePlaceholder')}
                      required
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('metas.descripcionOpcional')}
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                      placeholder={t('metas.descripcionPlaceholder')}
                    />
                  </div>

                  {/* Cantidad objetivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <DollarSign className="h-4 w-4 inline mr-2" />
                      {t('metas.cantidadObjetivo')}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.cantidad_objetivo || ''}
                        onChange={(e) => handleInputChange('cantidad_objetivo', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 pr-20 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                        placeholder="0"
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                        COP
                      </div>
                    </div>
                    {formData.cantidad_objetivo > 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatCurrency(formData.cantidad_objetivo)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-6">
                  {/* Fecha límite */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      {t('metas.fechaLimite')}
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_limite}
                      onChange={(e) => handleInputChange('fecha_limite', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Tag className="h-4 w-4 inline mr-2" />
                      {t('metas.categoriaOpcional')}
                    </label>
                    <div className="relative">
                      <select
                        value={formData.categoria}
                        onChange={(e) => handleInputChange('categoria', e.target.value)}
                        className={`w-full py-3 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 ${
                          formData.categoria ? 'pl-10 pr-4' : 'px-4'
                        }`}
                      >
                        <option value="">{t('metas.seleccionarCategoria')}</option>
                        {categorias.map(categoria => (
                          <option key={categoria.id} value={categoria.nombre}>
                            {categoria.nombre}
                          </option>
                        ))}
                      </select>

                      {/* Mostrar icono de la categoría seleccionada */}
                      {formData.categoria && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <IconRenderer
                            iconName={categorias.find(c => c.nombre === formData.categoria)?.icono || 'Tag'}
                            size={16}
                            style={{ color: categorias.find(c => c.nombre === formData.categoria)?.color || '#6B7280' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vista previa */}
                  <div className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('metas.vistaPrevia')}</h4>
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: formData.color }}
                      >
                        <IconRenderer
                          iconName={formData.icono}
                          size={24}
                          className="text-white"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {formData.nombre || t('metas.nombreMeta')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formData.categoria && `${formData.categoria} • `}
                          {formData.cantidad_objetivo > 0 ? formatCurrency(formData.cantidad_objetivo) : t('metas.sinObjetivo')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Iconos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t('metas.icono')}
                  </label>
                  <div className="grid grid-cols-6 gap-3 max-h-60 overflow-y-auto p-1">
                    {ICONOS_META.map((icono) => (
                      <button
                        key={icono}
                        type="button"
                        onClick={() => handleInputChange('icono', icono)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          formData.icono === icono
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-500'
                        }`}
                      >
                        <IconRenderer iconName={icono} size={20} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colores */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Palette className="h-4 w-4 inline mr-2" />
                    {t('metas.color')}
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {COLORES_META.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleInputChange('color', color)}
                        className={`w-12 h-12 rounded-xl transition-all ${
                          formData.color === color
                            ? 'ring-2 ring-gray-400 dark:ring-gray-500 ring-offset-2 dark:ring-offset-dark-800'
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mt-6">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 p-6 border-t border-gray-100 dark:border-dark-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-xl font-medium transition-colors"
            >
              {t('metas.cancelar')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('metas.guardando') : (meta ? t('metas.actualizar') : t('metas.crearMeta'))}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}