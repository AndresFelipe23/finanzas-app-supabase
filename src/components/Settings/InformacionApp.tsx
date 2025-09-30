import React from 'react';
import { motion } from 'framer-motion';
import {
  Info,
  User,
  Mail,
  Github,
  Linkedin,
  Coffee,
  Instagram,
  Bug,
  Lightbulb,
  Heart,
  Code,
  Calendar,
  Cpu,
  ExternalLink
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export function InformacionApp() {
  const { t } = useTranslation();

  const technologies = [
    'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Supabase', 'Vite'
  ];

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/AndresFelipe23/',
      color: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://www.linkedin.com/in/andres-espitia-b0ba0421a',
      color: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/a_espitias/',
      color: 'text-blue-400 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-500'
    }
  ];

  const supportActions = [
    {
      title: t('informacionApp.regalameCafe'),
      description: t('informacionApp.regalameCafeDesc'),
      icon: Coffee,
      color: 'bg-amber-500 hover:bg-amber-600',
      action: () => window.open('https://regalameuncafe.com/andresespitia', '_blank')
    },
    {
      title: t('informacionApp.reportarError'),
      description: t('informacionApp.reportarErrorDesc'),
      icon: Bug,
      color: 'bg-red-500 hover:bg-red-600',
      action: () => window.open(`mailto:andresfelipeespitiasanchez@gmail.com?subject=Reporte de Error - Finanzas Personal&body=Describe el error que encontraste:`, '_blank')
    },
    {
      title: t('informacionApp.sugerirMejora'),
      description: t('informacionApp.sugerirMejoraDesc'),
      icon: Lightbulb,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => window.open(`mailto:andresfelipeespitiasanchez@gmail.com?subject=Sugerencia - Finanzas Personal&body=Mi sugerencia es:`, '_blank')
    }
  ];

  return (
    <div className="space-y-8">
      {/* App Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Info className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('informacionApp.title')}</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* App Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{t('informacionApp.nombreApp')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('informacionApp.descripcionApp')}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Cpu className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-gray-600 dark:text-gray-400">{t('informacionApp.version')}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{t('informacionApp.versionActual')}</span>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-600 dark:text-gray-400">{t('informacionApp.fechaLanzamiento')}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">Septiembre 2025</span>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Code className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-gray-600 dark:text-gray-400">{t('informacionApp.codigoAbierto')}</span>
              </div>
            </div>
          </div>

          {/* Developer Photo */}
          <div className="flex items-center justify-center">
            <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl ring-4 ring-blue-500/20">
              <img
                src="https://cehnragsjtdsozetngex.supabase.co/storage/v1/object/public/foto/IMG_20250517_190300.jpg"
                alt={t('informacionApp.nombreDesarrollador')}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback en caso de error cargando la imagen
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <div class="text-white text-4xl font-bold">AE</div>
                    </div>
                  `;
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Developer Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('informacionApp.desarrollador')}</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Developer Photo */}
          <div className="flex items-center justify-center lg:justify-start">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg ring-2 ring-gray-200 dark:ring-gray-700">
              <img
                src="https://cehnragsjtdsozetngex.supabase.co/storage/v1/object/public/foto/IMG_20250517_190300.jpg"
                alt={t('informacionApp.nombreDesarrollador')}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <div class="text-white text-lg font-bold">AE</div>
                    </div>
                  `;
                }}
              />
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{t('informacionApp.nombreDesarrollador')}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('informacionApp.descripcionDesarrollador')}
            </p>

            <div className="space-y-3">
              <a
                href="mailto:andresfelipeespitiasanchez@gmail.com"
                className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>andresfelipeespitiasanchez@gmail.com</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">{t('informacionApp.redesSociales')}</h4>
            <div className="space-y-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center space-x-3 text-sm transition-colors ${social.color}`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{social.name}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Technologies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Code className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('informacionApp.tecnologias')}</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Heart className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('informacionApp.soporte')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {supportActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="p-4 border border-gray-200 dark:border-dark-700 rounded-xl hover:border-gray-300 dark:hover:border-dark-600 transition-all text-left group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 ${action.color} text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{action.title}</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Acknowledgments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Heart className="h-5 w-5 text-pink-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('informacionApp.agradecimientos')}</h3>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('informacionApp.agradecimientosTexto')}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {t('informacionApp.comunidad')}
          </p>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              {t('informacionApp.licenciaTexto')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}