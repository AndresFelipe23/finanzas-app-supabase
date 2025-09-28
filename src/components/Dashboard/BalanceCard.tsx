import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

interface BalanceCardProps {
  title: string;
  amount: number;
  change?: number;
  icon: 'wallet' | 'up' | 'down';
  color: 'blue' | 'green' | 'red';
}

export function BalanceCard({ title, amount, change, icon, color }: BalanceCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const iconMap = {
    wallet: Wallet,
    up: TrendingUp,
    down: TrendingDown
  };

  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500'
  };

  const IconComponent = iconMap[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1 truncate">
            {formatCurrency(amount)}
          </p>
          {change !== undefined && (
            <p className={`text-xs sm:text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}% vs mes anterior
            </p>
          )}
        </div>
        <div className={`${colorMap[color]} p-2 sm:p-3 rounded-lg flex-shrink-0 ml-3`}>
          <IconComponent className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
