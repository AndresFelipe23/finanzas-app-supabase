import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Wallet, PiggyBank, TrendingUp, Building, Hash, Percent, Calendar } from 'lucide-react';
import { Cuenta, UpdateCuentaDto } from '../../types';

interface EditCuentaFormProps {
  isOpen: boolean;
  cuenta: Cuenta | null;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateCuentaDto) => Promise<boolean>;
}

const tiposCuenta = [
  {
    tipo: 'efectivo' as const,
    label: 'Efectivo',
    description: 'Dinero en efectivo, billetera',
    icon: Wallet,
    color: 'bg-green-100 text-green-600'
  },
  {
    tipo: 'ahorro' as const,
    label: 'Ahorro',
    description: 'Cuenta de ahorros bancaria',
    icon: PiggyBank,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    tipo: 'credito' as const,
    label: 'Crédito',
    description: 'Tarjeta de crédito, línea de crédito',
    icon: CreditCard,
    color: 'bg-red-100 text-red-600'
  },
  {
    tipo: 'inversion' as const,
    label: 'Inversión',
    description: 'CDT, fondos de inversión',
    icon: TrendingUp,
    color: 'bg-purple-100 text-purple-600'
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

export function EditCuentaForm({ isOpen, cuenta, onClose, onSubmit }: EditCuentaFormProps) {
  const [formData, setFormData] = useState<UpdateCuentaDto>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cuenta) {
      setFormData({
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        saldo: cuenta.saldo,
        descripcion: cuenta.descripcion || '',
        banco: cuenta.banco || '',
        numero_cuenta: cuenta.numero_cuenta || '',
        limite_credito: cuenta.limite_credito,
        interes: cuenta.interes,
        fecha_vencimiento: cuenta.fecha_vencimiento || '',
        activa: cuenta.activa
      });
    }
  }, [cuenta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuenta) return;

    // Validaciones
    const newErrors: Record<string, string> = {};

    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (formData.tipo === 'credito' && !formData.limite_credito) {
      newErrors.limite_credito = 'El límite de crédito es requerido para tarjetas de crédito';
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

      const success = await onSubmit(cuenta.id, cleanedData);
      if (success) {
        setErrors({});
        onClose();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateCuentaDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!cuenta) return null;

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
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Editar Cuenta</h2>
                  <p className="text-gray-600 dark:text-gray-400">Modifica la información de tu cuenta</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de cuenta
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {tiposCuenta.map((tipo) => {
                      const Icon = tipo.icon;
                      return (
                        <button
                          key={tipo.tipo}
                          type="button"
                          onClick={() => handleInputChange('tipo', tipo.tipo)}
                          className={`p-4 border rounded-lg text-left transition-all ${
                            formData.tipo === tipo.tipo
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${tipo.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{tipo.label}</p>
                              <p className="text-xs text-gray-500">{tipo.description}</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la cuenta *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre || ''}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.nombre ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Ej: Cuenta Corriente Bancolombia"
                    />
                    {errors.nombre && (
                      <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Saldo actual
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.saldo || 0}
                        onChange={(e) => handleInputChange('saldo', Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Información bancaria */}
                {formData.tipo !== 'efectivo' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Building className="inline h-4 w-4 mr-1" />
                        Banco
                      </label>
                      <select
                        value={formData.banco || ''}
                        onChange={(e) => handleInputChange('banco', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar banco</option>
                        {bancosComunes.map((banco) => (
                          <option key={banco} value={banco}>{banco}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Hash className="inline h-4 w-4 mr-1" />
                        Número de cuenta
                      </label>
                      <input
                        type="text"
                        value={formData.numero_cuenta || ''}
                        onChange={(e) => handleInputChange('numero_cuenta', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="****1234"
                      />
                    </div>
                  </div>
                )}

                {/* Información específica para crédito */}
                {formData.tipo === 'credito' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Límite de crédito *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.limite_credito || ''}
                          onChange={(e) => handleInputChange('limite_credito', Number(e.target.value))}
                          className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.limite_credito ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="3000000"
                        />
                      </div>
                      {errors.limite_credito && (
                        <p className="text-red-600 text-sm mt-1">{errors.limite_credito}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Percent className="inline h-4 w-4 mr-1" />
                        Tasa de interés
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.interes || ''}
                          onChange={(e) => handleInputChange('interes', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="2.5"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Campos adicionales opcionales */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Información adicional (opcional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Límite de crédito - siempre disponible */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Límite de crédito
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.limite_credito || ''}
                          onChange={(e) => handleInputChange('limite_credito', Number(e.target.value) || undefined)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="3000000"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Para tarjetas de crédito o líneas de crédito</p>
                    </div>

                    {/* Tasa de interés - siempre disponible */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Percent className="inline h-4 w-4 mr-1" />
                        Tasa de interés anual
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.interes || ''}
                          onChange={(e) => handleInputChange('interes', Number(e.target.value) || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="4.2"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Para créditos, inversiones o ahorros</p>
                    </div>

                    {/* Fecha de vencimiento - siempre disponible */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Fecha de vencimiento
                      </label>
                      <input
                        type="date"
                        value={formData.fecha_vencimiento || ''}
                        onChange={(e) => handleInputChange('fecha_vencimiento', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Para CDTs, tarjetas de crédito o productos con vencimiento</p>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={formData.descripcion || ''}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción adicional de la cuenta..."
                  />
                </div>

                {/* Estado de la cuenta */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.activa || false}
                      onChange={(e) => handleInputChange('activa', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Cuenta activa</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Las cuentas inactivas no se incluyen en los cálculos del dashboard
                  </p>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
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