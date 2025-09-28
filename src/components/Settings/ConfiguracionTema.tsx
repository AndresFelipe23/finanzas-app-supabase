import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Palette, Layout } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useConfig } from '../../hooks/useConfig';
import { useLanguage } from '../../context/LanguageContext';

export function ConfiguracionTema() {
  const { theme, setTheme } = useTheme();
  const { preferences, updatePreferences } = useConfig();
  const { language, setLanguage, t } = useLanguage();

  const temas = [
    {
      value: 'light' as const,
      label: t('interfaz.claro'),
      description: t('interfaz.temaClaroDesc'),
      icon: Sun,
      preview: 'bg-white border-gray-200'
    },
    {
      value: 'dark' as const,
      label: t('interfaz.oscuro'),
      description: t('interfaz.temaOscuroDesc'),
      icon: Moon,
      preview: 'bg-gray-900 border-gray-700'
    },
    {
      value: 'system' as const,
      label: t('interfaz.sistema'),
      description: t('interfaz.temaSistemaDesc'),
      icon: Monitor,
      preview: 'bg-gradient-to-r from-white to-gray-900 border-gray-400'
    }
  ];

  const idiomas = [
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'en', label: 'English', flag: '🇺🇸' }
  ];


  return (
    <div className="space-y-8">
      {/* Configuración de Tema */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Palette className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('interfaz.temaAplicacion')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {temas.map((temaOption) => {
            const IconComponent = temaOption.icon;
            const isSelected = theme === temaOption.value;

            return (
              <motion.button
                key={temaOption.value}
                onClick={() => setTheme(temaOption.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                    : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 bg-white dark:bg-dark-700'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300'
                  }`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`font-medium ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                      {temaOption.label}
                    </h4>
                  </div>
                </div>

                {/* Preview del tema */}
                <div className={`w-full h-16 rounded-lg border-2 mb-3 ${temaOption.preview}`} />

                <p className={`text-sm ${isSelected ? 'text-blue-700 dark:text-blue-200' : 'text-gray-600 dark:text-gray-400'}`}>
                  {temaOption.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Configuraciones de Interfaz */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Layout className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('interfaz.preferenciasInterfaz')}</h3>
        </div>

        {/* Idioma */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('interfaz.idiomaAplicacion')}
          </label>
          <div className="space-y-2">
            {idiomas.map((idioma) => (
              <button
                key={idioma.value}
                onClick={() => {
                  setLanguage(idioma.value as any);
                  updatePreferences({ idioma: idioma.value as any });
                }}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  language === idioma.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                <span className="text-lg">{idioma.flag}</span>
                <span>{idioma.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>


      {/* Vista previa */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('interfaz.vistaPrevia')}</h3>
        <div className="text-sm">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{t('interfaz.configuracionActual')}</h4>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>• Tema: {temas.find(t => t.value === theme)?.label}</li>
            <li>• Idioma: {idiomas.find(i => i.value === preferences.idioma)?.label}</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}