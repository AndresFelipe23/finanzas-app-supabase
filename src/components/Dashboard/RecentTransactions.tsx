import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Transaccion, Categoria } from '../../types';
import { useTranslation } from '../../context/LanguageContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecentTransactionsProps {
  transacciones: Transaccion[];
  categorias: Categoria[];
}

export function RecentTransactions({ transacciones, categorias }: RecentTransactionsProps) {
  const { t } = useTranslation();
  const recentTransactions = transacciones
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 8);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getCategoria = (categoriaId: string) => {
    return categorias.find(c => c.id === categoriaId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 sm:p-6 h-fit"
    >
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {t('dashboard.transaccionesRecientes')}
      </h3>

      <div className="space-y-3 sm:space-y-4">
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaccion, index) => {
            const categoria = getCategoria(transaccion.categoria_id);
            return (
              <motion.div
                key={transaccion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                    transaccion.tipo === 'ingreso' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {transaccion.tipo === 'ingreso' ? (
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    ) : (
                      <ArrowDownLeft className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                      {transaccion.nombre || categoria?.nombre || 'Sin nombre'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(transaccion.fecha), 'dd MMM', { locale: es })} • {categoria?.nombre}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`font-semibold text-sm sm:text-base ${
                    transaccion.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaccion.tipo === 'ingreso' ? '+' : '-'}
                    {formatCurrency(transaccion.monto)}
                  </p>
                  {transaccion.descripcion && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate max-w-20 sm:max-w-32">
                      {transaccion.descripcion}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No hay transacciones recientes</p>
          </div>
        )}
      </div>

      {recentTransactions.length > 0 && (
        <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-2 text-sm sm:text-base transition-colors duration-200">
          {t('dashboard.verTodas')}
        </button>
      )}
    </motion.div>
  );
}
