import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Mail, Phone, Calendar, Briefcase, FileText, Eye, EyeOff, Lock } from 'lucide-react';
import { useConfig } from '../../hooks/useConfig';
import Swal from 'sweetalert2';

export function PerfilUsuario() {
  const { profile, updateProfile, changePassword, uploadProfilePhoto, isDemo } = useConfig();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: profile?.nombre || '',
    telefono: profile?.telefono || '',
    fecha_nacimiento: profile?.fecha_nacimiento || '',
    ocupacion: profile?.ocupacion || '',
    biografia: profile?.biografia || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Actualizar formData cuando profile cambie
  React.useEffect(() => {
    if (profile) {
      setFormData({
        nombre: profile.nombre || '',
        telefono: profile.telefono || '',
        fecha_nacimiento: profile.fecha_nacimiento || '',
        ocupacion: profile.ocupacion || '',
        biografia: profile.biografia || ''
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);

    try {
      const success = await updateProfile(formData);

      if (success) {
        setIsEditing(false);
        Swal.fire({
          title: '¡Perfil actualizado!',
          text: 'Los cambios han sido guardados correctamente.',
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
        throw new Error('Error al actualizar perfil');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el perfil. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        customClass: {
          popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
          title: 'dark:text-gray-100',
          content: 'dark:text-gray-300',
          actions: 'dark:text-gray-100',
          confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        title: 'Error',
        text: 'Las contraseñas no coinciden.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        customClass: {
          popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
          title: 'dark:text-gray-100',
          content: 'dark:text-gray-300',
          actions: 'dark:text-gray-100',
          confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700'
        }
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Swal.fire({
        title: 'Error',
        text: 'La contraseña debe tener al menos 6 caracteres.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        customClass: {
          popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
          title: 'dark:text-gray-100',
          content: 'dark:text-gray-300',
          actions: 'dark:text-gray-100',
          confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700'
        }
      });
      return;
    }

    setLoading(true);

    try {
      const success = await changePassword(passwordData.currentPassword, passwordData.newPassword);

      if (success) {
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        Swal.fire({
          title: '¡Contraseña actualizada!',
          text: 'Tu contraseña ha sido cambiada correctamente.',
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
        throw new Error('Error al cambiar contraseña');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cambiar la contraseña. Verifica que la contraseña actual sea correcta.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        customClass: {
          popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
          title: 'dark:text-gray-100',
          content: 'dark:text-gray-300',
          actions: 'dark:text-gray-100',
          confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB límite
      Swal.fire({
        title: 'Archivo muy grande',
        text: 'La imagen debe ser menor a 5MB.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        customClass: {
          popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
          title: 'dark:text-gray-100',
          content: 'dark:text-gray-300',
          actions: 'dark:text-gray-100',
          confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700'
        }
      });
      return;
    }

    try {
      const photoUrl = await uploadProfilePhoto(file);
      if (photoUrl) {
        await updateProfile({ foto_perfil: photoUrl });
        Swal.fire({
          title: '¡Foto actualizada!',
          text: 'Tu foto de perfil ha sido actualizada.',
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
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo subir la foto. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        customClass: {
          popup: 'swal-z-index dark:bg-dark-800 dark:text-gray-100',
          title: 'dark:text-gray-100',
          content: 'dark:text-gray-300',
          actions: 'dark:text-gray-100',
          confirmButton: 'dark:bg-red-600 dark:hover:bg-red-700'
        }
      });
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-dark-700/50 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Perfil de Usuario</h3>
        </div>
        {!isEditing && !isChangingPassword && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Editar Perfil
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Foto de perfil */}
        <div className="lg:col-span-1">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-semibold mx-auto mb-4">
                {profile.foto_perfil ? (
                  <img
                    src={profile.foto_perfil}
                    alt="Foto de perfil"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profile.nombre.charAt(0).toUpperCase()
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-white dark:bg-dark-700 border-2 border-gray-200 dark:border-dark-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors">
                  <Camera className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{profile.nombre}</h2>
            <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
            {isDemo && (
              <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">
                Modo Demo
              </span>
            )}
          </div>
        </div>

        {/* Información del perfil */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Nombre completo
              </label>
              <input
                type="text"
                value={isEditing ? formData.nombre : profile.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-dark-700 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Email (no editable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Correo electrónico
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 rounded-xl bg-gray-50 dark:bg-dark-700 text-gray-500 dark:text-gray-400"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Teléfono
              </label>
              <input
                type="tel"
                value={isEditing ? formData.telefono : profile.telefono || ''}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                disabled={!isEditing}
                placeholder="Ej: +57 123 456 7890"
                className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-dark-700 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Fecha de nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={isEditing ? formData.fecha_nacimiento : profile.fecha_nacimiento || ''}
                onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-dark-700 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Ocupación */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Briefcase className="h-4 w-4 inline mr-2" />
                Ocupación
              </label>
              <input
                type="text"
                value={isEditing ? formData.ocupacion : profile.ocupacion || ''}
                onChange={(e) => handleInputChange('ocupacion', e.target.value)}
                disabled={!isEditing}
                placeholder="Ej: Desarrollador, Contador, Estudiante..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-dark-700 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Biografía */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="h-4 w-4 inline mr-2" />
                Biografía
              </label>
              <textarea
                value={isEditing ? formData.biografia : profile.biografia || ''}
                onChange={(e) => handleInputChange('biografia', e.target.value)}
                disabled={!isEditing}
                rows={3}
                placeholder="Cuéntanos un poco sobre ti..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-dark-700 disabled:text-gray-500 dark:disabled:text-gray-400 resize-none bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Botones de acción para edición */}
          {isEditing && (
            <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-dark-700">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    nombre: profile?.nombre || '',
                    telefono: profile?.telefono || '',
                    fecha_nacimiento: profile?.fecha_nacimiento || '',
                    ocupacion: profile?.ocupacion || '',
                    biografia: profile?.biografia || ''
                  });
                }}
                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}

          {/* Sección de cambio de contraseña */}
          {!isEditing && (
            <div className="pt-6 border-t border-gray-200 dark:border-dark-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Seguridad</h4>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="px-4 py-2 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    Cambiar Contraseña
                  </button>
                )}
              </div>

              {isChangingPassword && (
                <div className="space-y-4">
                  {/* Contraseña actual */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contraseña actual
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                        placeholder="Ingresa tu contraseña actual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Nueva contraseña */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar contraseña */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirmar nueva contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Repite la nueva contraseña"
                    />
                  </div>

                  {/* Botones de contraseña */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-xl font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleChangePassword}
                      disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}