import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'full';
  showLabel?: boolean;
}

export function ThemeToggle({ variant = 'compact', showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme, actualTheme } = useTheme();

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Claro' },
    { value: 'dark' as const, icon: Moon, label: 'Oscuro' },
    { value: 'system' as const, icon: Monitor, label: 'Sistema' }
  ];

  const currentTheme = themes.find(t => t.value === theme);
  const IconComponent = currentTheme?.icon || Sun;

  if (variant === 'compact') {
    return (
      <div className="relative">
        <motion.button
          onClick={() => {
            // Ciclar entre los temas
            const currentIndex = themes.findIndex(t => t.value === theme);
            const nextIndex = (currentIndex + 1) % themes.length;
            setTheme(themes[nextIndex].value);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          title={`Tema actual: ${currentTheme?.label}`}
        >
          <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </motion.button>

        {/* Indicador del tema actual */}
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-dark-800" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {themes.map((themeOption) => {
        const Icon = themeOption.icon;
        const isSelected = theme === themeOption.value;

        return (
          <motion.button
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-lg transition-all ${
              isSelected
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
            }`}
            title={themeOption.label}
          >
            <Icon className="h-4 w-4" />
            {showLabel && (
              <span className="ml-2 text-sm font-medium">{themeOption.label}</span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
