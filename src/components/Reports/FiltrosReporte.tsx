import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, X, RotateCcw } from 'lucide-react';
import { useReportes } from '../../hooks/useReportes';
import { useCategorias } from '../../hooks/useCategorias';
import { useFinanceData } from '../../hooks/useFinanceData';
import { IconRenderer } from '../IconRenderer';
import { useTranslation } from '../../context/LanguageContext';

export function FiltrosReporte() {
  const { t } = useTranslation();
  const { filtros, updateFiltros, aplicarRangoFecha, resetFiltros, rangosDisponibles } = useReportes();
  const { categorias } = useCategorias();
  const { cuentas } = useFinanceData();

  const handleCategoriaToggle = (categoriaId: string) => {
    const categorias = filtros.categorias || [];
    const isSelected = categorias.includes(categoriaId);

    if (isSelected) {
      updateFiltros({
        categorias: categorias.filter(id => id !== categoriaId)
      });
    } else {
      updateFiltros({
        categorias: [...categorias, categoriaId]
      });
    }
  };

  const handleCuentaToggle = (cuentaId: string) => {
    const cuentas = filtros.cuentas || [];
    const isSelected = cuentas.includes(cuentaId);

    if (isSelected) {
      updateFiltros({
        cuentas: cuentas.filter(id => id !== cuentaId)
      });
    } else {
      updateFiltros({
        cuentas: [...cuentas, cuentaId]
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('reportes.filtrosReporte')}</h3>
        </div>
        <button
          onClick={resetFiltros}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{t('reportes.resetear')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Rango de Fechas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Calendar className="h-4 w-4 inline mr-2" />
            {t('reportes.periodo')}
          </label>
          <div className="space-y-2">
            {Object.entries(rangosDisponibles).map(([key, rango]) => (
              <button
                key={key}
                onClick={() => aplicarRangoFecha(key as any)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  filtros.fechaInicio === rango.fechaInicio && filtros.fechaFin === rango.fechaFin
                    ? 'bg-blue-500 dark:bg-blue-700 text-white'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                {rango.label}
              </button>
            ))}
          </div>

          {/* Fechas personalizadas */}
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('reportes.fechaInicio')}</label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => updateFiltros({ fechaInicio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('reportes.fechaFin')}</label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => updateFiltros({ fechaFin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Tipo de Transacción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('reportes.tipoTransaccion')}
          </label>
          <div className="space-y-2">
            {[
              { value: 'todos', label: t('reportes.todos'), color: 'bg-gray-500' },
              { value: 'ingreso', label: t('reportes.ingresos'), color: 'bg-green-500' },
              { value: 'gasto', label: t('reportes.gastos'), color: 'bg-red-500' }
            ].map((tipo) => (
              <button
                key={tipo.value}
                onClick={() => updateFiltros({ tipo: tipo.value as any })}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  filtros.tipo === tipo.value
                    ? 'bg-blue-500 dark:bg-blue-700 text-white'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${tipo.color}`} />
                <span>{tipo.label}</span>
              </button>
            ))}
          </div>

          {/* Período de agrupación */}
          <div className="mt-4">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">{t('reportes.agruparPor')}</label>
            <select
              value={filtros.periodo}
              onChange={(e) => updateFiltros({ periodo: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-dark-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
            >
              <option value="dia">{t('reportes.dia')}</option>
              <option value="semana">{t('reportes.semana')}</option>
              <option value="mes">{t('reportes.mes')}</option>
              <option value="trimestre">{t('reportes.trimestre')}</option>
              <option value="ano">{t('reportes.ano')}</option>
            </select>
          </div>
        </div>

        {/* Categorías y Cuentas */}
        <div className="space-y-6">
          {/* Categorías */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('reportes.categorias')}
              {filtros.categorias && filtros.categorias.length > 0 && (
                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                  {filtros.categorias.length} {t('reportes.seleccionadas')}
                </span>
              )}
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {categorias.map((categoria) => {
                const isSelected = filtros.categorias?.includes(categoria.id) || false;
                return (
                  <button
                    key={categoria.id}
                    onClick={() => handleCategoriaToggle(categoria.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-blue-500 dark:bg-blue-700 text-white'
                        : 'bg-gray-50 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : categoria.color }}
                    >
                      <IconRenderer
                        iconName={categoria.icono}
                        size={14}
                        className={isSelected ? 'text-white' : 'text-white'}
                      />
                    </div>
                    <span className="text-sm">{categoria.nombre}</span>
                    {isSelected && <X className="h-4 w-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cuentas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('reportes.cuentas')}
              {filtros.cuentas && filtros.cuentas.length > 0 && (
                <span className="ml-2 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  {filtros.cuentas.length} {t('reportes.seleccionadas')}
                </span>
              )}
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {cuentas.map((cuenta) => {
                const isSelected = filtros.cuentas?.includes(cuenta.id) || false;
                return (
                  <button
                    key={cuenta.id}
                    onClick={() => handleCuentaToggle(cuenta.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-green-500 dark:bg-green-700 text-white'
                        : 'bg-gray-50 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        cuenta.tipo === 'efectivo' ? 'bg-green-500' :
                        cuenta.tipo === 'ahorro' ? 'bg-blue-500' :
                        cuenta.tipo === 'credito' ? 'bg-red-500' :
                        'bg-purple-500'
                      }`} />
                      <span className="text-sm">{cuenta.nombre}</span>
                    </div>
                    {isSelected && <X className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}