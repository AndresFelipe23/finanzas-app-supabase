import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import { DatoGrafico, DatoCategoria } from '../../types';

interface ReporteChartProps {
  datosGraficos: DatoGrafico[];
  formatCurrency: (value: number) => string;
  tipo?: 'lineal' | 'barras';
}

export function ReporteChart({ datosGraficos, formatCurrency, tipo = 'barras' }: ReporteChartProps) {
  if (!datosGraficos || datosGraficos.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-8">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Sin datos para mostrar</h3>
          <p className="text-gray-500 dark:text-gray-400">Ajusta los filtros para ver el gráfico</p>
        </div>
      </div>
    );
  }

  const maxIngresos = Math.max(...datosGraficos.map(d => d.ingresos));
  const maxGastos = Math.max(...datosGraficos.map(d => d.gastos));
  const maxValor = Math.max(maxIngresos, maxGastos);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Evolución Financiera</h3>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">Ingresos</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">Gastos</span>
          </div>
        </div>
      </div>

      {/* Gráfico de barras simple */}
      <div className="space-y-4">
        {datosGraficos.map((dato, index) => {
          const fechaFormateada = new Date(dato.fecha + (dato.fecha.length === 7 ? '-01' : '')).toLocaleDateString('es-CO', {
            day: dato.fecha.length > 7 ? 'numeric' : undefined,
            month: 'short',
            year: dato.fecha.length === 7 ? 'numeric' : undefined
          });

          const porcentajeIngresos = maxValor > 0 ? (dato.ingresos / maxValor) * 100 : 0;
          const porcentajeGastos = maxValor > 0 ? (dato.gastos / maxValor) * 100 : 0;

          return (
            <motion.div
              key={dato.fecha}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{fechaFormateada}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-green-600">{formatCurrency(dato.ingresos)}</span>
                  <span className="text-red-600">{formatCurrency(dato.gastos)}</span>
                  <span className={`font-medium ${dato.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {dato.balance >= 0 ? '+' : ''}{formatCurrency(dato.balance)}
                  </span>
                </div>
              </div>

              <div className="relative">
                {/* Barra de ingresos */}
                <div className="relative h-6 bg-gray-100 dark:bg-dark-700 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${porcentajeIngresos}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="absolute top-0 left-0 h-full bg-green-500 rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {dato.ingresos > 0 && formatCurrency(dato.ingresos)}
                    </span>
                  </div>
                </div>

                {/* Barra de gastos */}
                <div className="relative h-6 bg-gray-100 rounded-lg overflow-hidden mt-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${porcentajeGastos}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                    className="absolute top-0 left-0 h-full bg-red-500 rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {dato.gastos > 0 && formatCurrency(dato.gastos)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Resumen del período */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Ingresos</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(datosGraficos.reduce((sum, d) => sum + d.ingresos, 0))}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Gastos</p>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(datosGraficos.reduce((sum, d) => sum + d.gastos, 0))}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Balance Total</p>
            <p className={`text-lg font-semibold ${
              datosGraficos.reduce((sum, d) => sum + d.balance, 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(datosGraficos.reduce((sum, d) => sum + d.balance, 0))}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface CategoriasChartProps {
  categorias: DatoCategoria[];
  tipo: 'ingresos' | 'gastos';
  formatCurrency: (value: number) => string;
}

export function CategoriasChart({ categorias, tipo, formatCurrency }: CategoriasChartProps) {
  if (!categorias || categorias.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-8">
        <div className="text-center">
          <PieChart className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Sin {tipo} para mostrar</h3>
          <p className="text-gray-500 dark:text-gray-400">No hay datos en el período seleccionado</p>
        </div>
      </div>
    );
  }

  const total = categorias.reduce((sum, cat) => sum + cat.monto, 0);
  const colorTipo = tipo === 'ingresos' ? 'text-green-600' : 'text-red-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <PieChart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">{tipo} por Categoría</h3>
        </div>
        <div className={`text-lg font-semibold ${colorTipo}`}>
          {formatCurrency(total)}
        </div>
      </div>

      <div className="space-y-3">
        {categorias.slice(0, 8).map((categoria, index) => (
          <motion.div
            key={categoria.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: categoria.color }}
                >
                  <span className="text-white text-xs">📊</span>
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{categoria.nombre}</span>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${colorTipo}`}>
                  {formatCurrency(categoria.monto)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {categoria.porcentaje.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="relative h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${categoria.porcentaje}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ backgroundColor: categoria.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {categorias.length > 8 && (
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Y {categorias.length - 8} categorías más...
          </span>
        </div>
      )}
    </motion.div>
  );
}