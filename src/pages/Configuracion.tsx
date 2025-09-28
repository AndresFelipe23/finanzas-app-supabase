import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Palette,
  Database,
  Shield,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { PerfilUsuario } from '../components/Settings/PerfilUsuario';
import { ConfiguracionTema } from '../components/Settings/ConfiguracionTema';
import { InformacionApp } from '../components/Settings/InformacionApp';
import { GuideSettings } from '../components/Settings/GuideSettings';
import { useConfig } from '../hooks/useConfig';
import { useSidebar } from '../context/SidebarContext';
import { useTranslation } from '../context/LanguageContext';
import Swal from 'sweetalert2';

type SeccionActiva = 'perfil' | 'interfaz' | 'datos' | 'seguridad' | 'informacion' | 'guias';

export function Configuracion() {
  const { isCollapsed } = useSidebar();
  const { t } = useTranslation();
  const {
    exportUserData,
    resetPreferences,
    deleteAccount,
    isDemo
  } = useConfig();

  const [seccionActiva, setSeccionActiva] = useState<SeccionActiva>('perfil');
  const [loading, setLoading] = useState(false);

  const secciones = [
    {
      id: 'perfil' as const,
      label: t('configuracion.miPerfil'),
      icon: User,
      description: 'Información personal y configuración de cuenta'
    },
    {
      id: 'interfaz' as const,
      label: t('configuracion.interfaz'),
      icon: Palette,
      description: 'Tema, idioma y preferencias visuales'
    },
    {
      id: 'datos' as const,
      label: t('configuracion.datos'),
      icon: Database,
      description: 'Exportar, importar y gestionar datos'
    },
    {
      id: 'guias' as const,
      label: 'Guías y Ayuda',
      icon: HelpCircle,
      description: 'Tutoriales interactivos y ayuda'
    },
    {
      id: 'seguridad' as const,
      label: t('configuracion.seguridad'),
      icon: Shield,
      description: 'Privacidad y seguridad de la cuenta'
    },
    {
      id: 'informacion' as const,
      label: t('configuracion.informacion'),
      icon: Settings,
      description: 'Información de la app y desarrollador'
    }
  ];

  const handleExportData = async () => {
    setLoading(true);

    try {
      const success = await exportUserData();

      if (success) {
        Swal.fire({
          title: '¡Datos exportados!',
          text: 'El archivo de respaldo se ha descargado correctamente.',
          icon: 'success',
          confirmButtonColor: '#059669',
          customClass: {
            popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
            title: 'dark:text-gray-100',
            content: 'dark:text-gray-300',
            actions: 'dark:text-gray-100',
            confirmButton: 'dark:bg-green-600 dark:hover:bg-green-700'
          }
        });
      } else {
        throw new Error('Error al exportar');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron exportar los datos. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        customClass: {
          popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
          title: 'dark:text-gray-100',
          content: 'dark:text-gray-300',
          actions: 'dark:text-gray-100',
          confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700',
          cancelButton: 'dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);

            Swal.fire({
              title: 'Importar datos',
              html: `
                <div class="text-left">
                  <p class="mb-2">Se han detectado los siguientes datos:</p>
                  <div class="bg-gray-50 p-3 rounded-lg mb-3">
                    <p><strong>Perfil:</strong> ${data.profile?.nombre || 'No disponible'}</p>
                    <p><strong>Fecha:</strong> ${data.exportDate ? new Date(data.exportDate).toLocaleDateString() : 'No disponible'}</p>
                    <p><strong>Versión:</strong> ${data.version || 'No disponible'}</p>
                  </div>
                  <p class="text-sm text-gray-600">Funcionalidad de importación en desarrollo...</p>
                </div>
              `,
              icon: 'info',
              confirmButtonColor: '#059669',
              customClass: {
                popup: 'swal-z-index'
              }
            });
          } catch (error) {
            Swal.fire({
              title: 'Error',
              text: 'El archivo no es válido o está corrupto.',
              icon: 'error',
              confirmButtonColor: '#dc2626',
              customClass: {
                popup: 'swal-z-index'
              }
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleResetPreferences = async () => {
    const result = await Swal.fire({
      title: '¿Resetear preferencias?',
      text: 'Esto restaurará todas las configuraciones a sus valores por defecto.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, resetear',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-z-index'
      }
    });

    if (result.isConfirmed) {
      resetPreferences();
      Swal.fire({
        title: '¡Preferencias reseteadas!',
        text: 'Todas las configuraciones han sido restauradas.',
        icon: 'success',
        confirmButtonColor: '#059669',
        customClass: {
          popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
          title: 'dark:text-gray-100',
          content: 'dark:text-gray-300',
          actions: 'dark:text-gray-100',
          confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700',
          cancelButton: 'dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white'
        }
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (isDemo) {
      Swal.fire({
        title: 'No disponible en demo',
        text: 'Esta funcionalidad no está disponible en el modo de demostración.',
        icon: 'info',
        confirmButtonColor: '#059669',
        customClass: {
          popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
          title: 'dark:text-gray-100',
          content: 'dark:text-gray-300',
          actions: 'dark:text-gray-100',
          confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700',
          cancelButton: 'dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white'
        }
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Eliminar cuenta?',
      html: `
        <div class="text-left">
          <p class="mb-3 text-red-600 font-medium">⚠️ Esta acción es irreversible</p>
          <p class="mb-2">Al eliminar tu cuenta:</p>
          <ul class="text-sm text-gray-600 mb-3 list-disc list-inside">
            <li>Se borrarán todos tus datos</li>
            <li>No podrás acceder más a la aplicación</li>
            <li>Los respaldos no se restaurarán automáticamente</li>
          </ul>
          <p class="text-sm text-gray-600">Considera exportar tus datos antes de proceder.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar cuenta',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-z-index'
      }
    });

    if (result.isConfirmed) {
      const success = await deleteAccount();
      if (success) {
        Swal.fire({
          title: 'Cuenta eliminada',
          text: 'Tu cuenta ha sido eliminada correctamente.',
          icon: 'success',
          confirmButtonColor: '#059669',
          customClass: {
            popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
            title: 'dark:text-gray-100',
            content: 'dark:text-gray-300',
            actions: 'dark:text-gray-100',
            confirmButton: 'dark:bg-green-600 dark:hover:bg-green-700'
          }
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la cuenta. Contacta soporte si el problema persiste.',
          icon: 'error',
          confirmButtonColor: '#dc2626',
          customClass: {
            popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
            title: 'dark:text-gray-100',
            content: 'dark:text-gray-300',
            actions: 'dark:text-gray-100',
            confirmButton: 'dark:bg-green-600 dark:hover:bg-green-700'
          }
        });
      }
    }
  };

  const renderSeccionContent = () => {
    switch (seccionActiva) {
      case 'perfil':
        return <PerfilUsuario />;
      case 'interfaz':
        return <ConfiguracionTema />;
      case 'guias':
        return <GuideSettings />;
      case 'informacion':
        return <InformacionApp />;
      case 'datos':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Gestión de datos */}
            <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Database className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gestión de Datos</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Exportar datos */}
                <div className="p-4 border border-gray-200 dark:border-dark-700 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <Download className="h-6 w-6 text-blue-500" />
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Exportar Datos</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Descarga una copia de seguridad de todos tus datos en formato JSON.
                  </p>
                  <button
                    onClick={handleExportData}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Exportando...' : 'Exportar Datos'}
                  </button>
                </div>

                {/* Importar datos */}
                <div className="p-4 border border-gray-200 dark:border-dark-700 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <Upload className="h-6 w-6 text-green-500" />
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Importar Datos</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Restaura datos desde un archivo de respaldo previamente exportado.
                  </p>
                  <button
                    onClick={handleImportData}
                    className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    Importar Datos
                  </button>
                </div>
              </div>
            </div>

            {/* Resetear configuración */}
            <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Resetear Configuración</h3>
              </div>

              <div className="p-4 border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                  <h4 className="font-medium text-orange-900 dark:text-orange-300">Restaurar Valores por Defecto</h4>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                  Esto restaurará todas las preferencias de interfaz a sus valores originales.
                  Tu perfil y datos no se verán afectados.
                </p>
                <button
                  onClick={handleResetPreferences}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  Resetear Preferencias
                </button>
              </div>
            </div>
          </motion.div>
        );
      case 'seguridad':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Información de seguridad */}
            <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Seguridad y Privacidad</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">🔒 Datos Seguros</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Todos tus datos se almacenan de forma segura y encriptada.
                    Solo tú tienes acceso a tu información financiera.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">🔐 Autenticación</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Tu cuenta está protegida con autenticación segura.
                    Puedes cambiar tu contraseña desde la sección de perfil.
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                  <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">💾 Respaldos</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Recomendamos exportar tus datos regularmente como medida de seguridad adicional.
                  </p>
                </div>
              </div>
            </div>

            {/* Zona de peligro */}
            <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-red-200/50 dark:border-red-800/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Trash2 className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-300">Zona de Peligro</h3>
              </div>

              <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <h4 className="font-medium text-red-900 dark:text-red-300">Eliminar Cuenta</h4>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  Esta acción eliminará permanentemente tu cuenta y todos los datos asociados.
                  No podrás recuperar la información una vez eliminada.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Eliminar Cuenta
                </button>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'} p-6 sm:p-8 pt-4 sm:pt-6 lg:pt-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800 transition-all duration-300`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          <div>
            <h1 className="text-4xl font-light text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
              {t('configuracion.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-light">
              {t('configuracion.subtitle')}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de navegación */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-4">
            <nav className="space-y-2">
              {secciones.map((seccion) => {
                const IconComponent = seccion.icon;
                const isActive = seccionActiva === seccion.id;

                return (
                  <button
                    key={seccion.id}
                    onClick={() => setSeccionActiva(seccion.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">{seccion.label}</div>
                      <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {seccion.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Contenido principal */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          {renderSeccionContent()}
        </motion.div>
      </div>
    </div>
  );
}