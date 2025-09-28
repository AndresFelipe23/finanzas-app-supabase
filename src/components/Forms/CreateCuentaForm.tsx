import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Wallet, PiggyBank, TrendingUp, Building, Hash, Percent, Calendar } from 'lucide-react';
import { CreateCuentaDto } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

interface CreateCuentaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCuentaDto) => Promise<void>;
}

const getTiposCuenta = (t: any) => [
  {
    tipo: 'efectivo' as const,
    label: t('cuentas.efectivo'),
    description: t('cuentas.dineroEfectivo'),
    icon: Wallet,
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
  },
  {
    tipo: 'ahorro' as const,
    label: t('cuentas.ahorro'),
    description: t('cuentas.cuentaAhorros'),
    icon: PiggyBank,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
  },
  {
    tipo: 'credito' as const,
    label: t('cuentas.credito'),
    description: t('cuentas.tarjetaCredito'),
    icon: CreditCard,
    color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
  },
  {
    tipo: 'inversion' as const,
    label: t('cuentas.inversion'),
    description: t('cuentas.cdtFondos'),
    icon: TrendingUp,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
  }
];

const bancosComunes = [
  'Bancolombia',
  'Banco de Bogotá',
  'Davivienda',
  'BBVA',
  'Banco Popular',
  'Banco de Occidente',
  'Banco AV Villas',
  'Banco Caja Social',
  'Banco Pichincha',
  'Banco Falabella',
  'Nequi',
  'Daviplata',
  'Otro'
];

export function CreateCuentaForm({ isOpen, onClose, onSubmit }: CreateCuentaFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateCuentaDto>({
    nombre: '',
    tipo: 'ahorro',
    saldo: 0,
    descripcion: '',
    banco: '',
    numero_cuenta: '',
    limite_credito: undefined,
    interes: undefined,
    fecha_vencimiento: undefined
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = t('cuentas.nombreRequerido');
    }

    if (formData.tipo === 'credito' && !formData.limite_credito) {
      newErrors.limite_credito = t('cuentas.limiteCreditoRequerido');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Limpiar campos vacíos antes de enviar
      const cleanedData = {
        ...formData,
        descripcion: formData.descripcion?.trim() || undefined,
        banco: formData.banco?.trim() || undefined,
        numero_cuenta: formData.numero_cuenta?.trim() || undefined,
        fecha_vencimiento: formData.fecha_vencimiento?.trim() || undefined
      };

      await onSubmit(cleanedData);
      // Reset form
      setFormData({
        nombre: '',
        tipo: 'ahorro',
        saldo: 0,
        descripcion: '',
        banco: '',
        numero_cuenta: '',
        limite_credito: undefined,
        interes: undefined,
        fecha_vencimiento: undefined
      });
      setErrors({});
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateCuentaDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-dark-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('cuentas.nuevaCuenta')}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{t('cuentas.agregarNuevaCuenta')}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                {/* Tipo de cuenta */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t('cuentas.tipoCuenta')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {getTiposCuenta(t).map((tipo) => {
                      const Icon = tipo.icon;
                      return (
                        <button
                          key={tipo.tipo}
                          type="button"
                          onClick={() => handleInputChange('tipo', tipo.tipo)}
                          className={`p-4 border rounded-lg text-left transition-all ${
                            formData.tipo === tipo.tipo
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                              : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${tipo.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{tipo.label}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{tipo.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('cuentas.nombreCuenta')} *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 ${
                        errors.nombre ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                      }`}
                      placeholder="Ej: Cuenta Corriente Bancolombia"
                    />
                    {errors.nombre && (
                      <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('cuentas.saldoInicial')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                      <input
                        type="number"
                        value={formData.saldo}
                        onChange={(e) => handleInputChange('saldo', Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Información bancaria */}
                {formData.tipo !== 'efectivo' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Building className="inline h-4 w-4 mr-1" />
                        {t('cuentas.banco')}
                      </label>
                      <select
                        value={formData.banco}
                        onChange={(e) => handleInputChange('banco', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">{t('cuentas.seleccionarBanco')}</option>
                        {bancosComunes.map((banco) => (
                          <option key={banco} value={banco}>{banco}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Hash className="inline h-4 w-4 mr-1" />
                        {t('cuentas.numeroCuenta')}
                      </label>
                      <input
                        type="text"
                        value={formData.numero_cuenta}
                        onChange={(e) => handleInputChange('numero_cuenta', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                        placeholder="****1234"
                      />
                    </div>
                  </div>
                )}

                {/* Información específica para crédito */}
                {formData.tipo === 'credito' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('cuentas.limiteCredito')} *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                        <input
                          type="number"
                          value={formData.limite_credito || ''}
                          onChange={(e) => handleInputChange('limite_credito', Number(e.target.value))}
                          className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 ${
                            errors.limite_credito ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-dark-600'
                          }`}
                          placeholder="3000000"
                        />
                      </div>
                      {errors.limite_credito && (
                        <p className="text-red-600 text-sm mt-1">{errors.limite_credito}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Percent className="inline h-4 w-4 mr-1" />
                        {t('cuentas.tasaInteres')}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.interes || ''}
                          onChange={(e) => handleInputChange('interes', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                          placeholder="2.5"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Campos adicionales opcionales */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('cuentas.informacionAdicional')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Límite de crédito - siempre disponible */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('cuentas.limiteCredito')}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                        <input
                          type="number"
                          value={formData.limite_credito || ''}
                          onChange={(e) => handleInputChange('limite_credito', Number(e.target.value) || undefined)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                          placeholder="3000000"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('cuentas.paraTarjetasCredito')}</p>
                    </div>

                    {/* Tasa de interés - siempre disponible */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Percent className="inline h-4 w-4 mr-1" />
                        {t('cuentas.tasaInteres')}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.interes || ''}
                          onChange={(e) => handleInputChange('interes', Number(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                          placeholder="4.2"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">%</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('cuentas.paraCreditosInversiones')}</p>
                    </div>

                    {/* Fecha de vencimiento - siempre disponible */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        {t('cuentas.fechaVencimiento')}
                      </label>
                      <input
                        type="date"
                        value={formData.fecha_vencimiento || ''}
                        onChange={(e) => handleInputChange('fecha_vencimiento', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('cuentas.paraCDTsProductos')}</p>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('cuentas.descripcion')} (opcional)
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder={t('cuentas.descripcionAdicional')}
                  />
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-lg transition-colors"
                  >
                    {t('cuentas.cancelar')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Guardando...' : t('cuentas.crear')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}