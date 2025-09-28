import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  foto_perfil?: string | null;
  telefono?: string | null;
  fecha_nacimiento?: string | null;
  ocupacion?: string | null;
  biografia?: string | null;
  created_at: string;
  updated_at?: string;
}

interface UpdateProfileDto {
  nombre?: string;
  telefono?: string | null;
  fecha_nacimiento?: string | null;
  ocupacion?: string | null;
  biografia?: string | null;
  foto_perfil?: string | null;
}

interface UserPreferences {
  idioma: 'es' | 'en';
  dashboard_default: 'dashboard' | 'transacciones' | 'cuentas' | 'categorias' | 'presupuestos' | 'metas' | 'reportes';
  densidad_interfaz: 'compacto' | 'normal' | 'espacioso';
  mostrar_saldos: boolean;
  formato_fecha: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  primera_vez: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  idioma: 'es',
  dashboard_default: 'dashboard',
  densidad_interfaz: 'normal',
  mostrar_saldos: true,
  formato_fecha: 'dd/mm/yyyy',
  primera_vez: true
};

export function useConfig() {
  const { user, isDemo } = useAuth();
  const { setLanguage } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar perfil del usuario
  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUserPreferences();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      if (isDemo || !isSupabaseConfigured) {
        // Datos demo del perfil
        const demoProfile: UserProfile = {
          id: user.id,
          nombre: user.nombre || 'Usuario Demo',
          email: user.email,
          telefono: '+57 123 456 7890',
          ocupacion: 'Desarrollador',
          biografia: 'Usuario de demostración para probar la aplicación',
          created_at: new Date().toISOString()
        };
        setProfile(demoProfile);
      } else {
        // Consultar la tabla de usuarios en Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          // Si el usuario no existe en la tabla, crear el registro
          if (error.code === 'PGRST116') {
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert([{
                id: user.id,
                nombre: user.nombre || '',
                foto_perfil: null
              }])
              .select()
              .single();

            if (insertError) {
              throw insertError;
            }

            const userProfile: UserProfile = {
              id: newUser.id,
              nombre: newUser.nombre || '',
              email: user.email,
              telefono: newUser.telefono,
              fecha_nacimiento: newUser.fecha_nacimiento,
              ocupacion: newUser.ocupacion,
              biografia: newUser.biografia,
              foto_perfil: newUser.foto_perfil,
              created_at: newUser.created_at,
              updated_at: newUser.updated_at
            };
            setProfile(userProfile);
          } else {
            throw error;
          }
        } else {
          const userProfile: UserProfile = {
            id: data.id,
            nombre: data.nombre || '',
            email: user.email,
            telefono: data.telefono,
            fecha_nacimiento: data.fecha_nacimiento,
            ocupacion: data.ocupacion,
            biografia: data.biografia,
            foto_perfil: data.foto_perfil,
            created_at: data.created_at,
            updated_at: data.updated_at
          };
          setProfile(userProfile);
        }
      }
    } catch (err) {
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = () => {
    try {
      const stored = localStorage.getItem(`preferences_${user?.id}`);
      if (stored) {
        const parsedPreferences = JSON.parse(stored);
        const newPreferences = { ...DEFAULT_PREFERENCES, ...parsedPreferences };
        setPreferences(newPreferences);
        // Sincronizar idioma con el contexto
        setLanguage(newPreferences.idioma);
      } else {
        setPreferences(DEFAULT_PREFERENCES);
        setLanguage(DEFAULT_PREFERENCES.idioma);
      }
    } catch (err) {
      setPreferences(DEFAULT_PREFERENCES);
      setLanguage(DEFAULT_PREFERENCES.idioma);
    }
  };

  const updateProfile = async (updates: UpdateProfileDto): Promise<boolean> => {
    if (!user || !profile) return false;

    try {
      setError(null);

      // Limpiar datos antes de enviar a Supabase
      const cleanUpdates = { ...updates };
      
      // Convertir cadenas vacías a null para campos de fecha
      if (cleanUpdates.fecha_nacimiento === '') {
        cleanUpdates.fecha_nacimiento = null;
      }
      
      // Convertir cadenas vacías a null para campos de texto opcionales
      if (cleanUpdates.telefono === '') {
        cleanUpdates.telefono = null;
      }
      if (cleanUpdates.ocupacion === '') {
        cleanUpdates.ocupacion = null;
      }
      if (cleanUpdates.biografia === '') {
        cleanUpdates.biografia = null;
      }

      if (isDemo || !isSupabaseConfigured) {
        // Actualización local en modo demo
        const updatedProfile = {
          ...profile,
          ...cleanUpdates,
          updated_at: new Date().toISOString()
        };
        setProfile(updatedProfile);
        return true;
      } else {
        // Actualizar en Supabase        
        const { data, error } = await supabase
          .from('users')
          .update(cleanUpdates)
          .eq('id', user.id)
          .select();


        if (error) {
          throw error;
        }

        // data es un array cuando no usamos .single()
        const updatedUser = Array.isArray(data) ? data[0] : data;
        
        if (!updatedUser) {
          throw new Error('No se pudo actualizar el perfil - usuario no encontrado');
        }


        const updatedProfile: UserProfile = {
          ...profile,
          ...cleanUpdates,
          updated_at: updatedUser.updated_at
        };
        setProfile(updatedProfile);
        return true;
      }
    } catch (err) {
      setError('Error al actualizar el perfil');
      return false;
    }
  };

  const updatePreferences = (newPreferences: Partial<UserPreferences>): boolean => {
    try {
      const updated = { ...preferences, ...newPreferences };
      setPreferences(updated);

      if (user) {
        localStorage.setItem(`preferences_${user.id}`, JSON.stringify(updated));
      }

      return true;
    } catch (err) {
      setError('Error al actualizar las preferencias');
      return false;
    }
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    if (user) {
      localStorage.removeItem(`preferences_${user.id}`);
    }
  };

  const exportUserData = async () => {
    try {
      const data = {
        profile,
        preferences,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finanzas-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      setError('Error al exportar los datos');
      return false;
    }
  };

  const changePassword = async (_currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setError(null);

      if (isDemo) {
        // En modo demo, simular éxito
        return true;
      }

      // Aquí implementarías el cambio de contraseña con Supabase
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setError('Error al cambiar la contraseña');
        return false;
      }

      return true;
    } catch (err) {
      setError('Error al cambiar la contraseña');
      return false;
    }
  };

  const uploadProfilePhoto = async (file: File): Promise<string | null> => {
    try {
      setError(null);

      if (isDemo) {
        // En modo demo, simular URL
        return 'https://via.placeholder.com/150';
      }

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Validar el archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      // Validar tipos de imagen permitidos
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Formato de imagen no soportado. Use JPEG, PNG, GIF o WebP');
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 5MB');
      }

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // Intentar subir directamente al bucket sin subcarpeta primero
      console.log('Intentando subir archivo:', fileName);
      
      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error de Supabase Storage:', error);
        throw error;
      }

      // Obtener la URL pública de la imagen
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Actualizar el perfil con la nueva URL de la foto
      const updateResult = await updateProfile({ foto_perfil: publicUrl });
      
      if (!updateResult) {
        throw new Error('No se pudo actualizar el perfil con la nueva foto');
      }

      return publicUrl;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al subir la foto';
      setError(errorMessage);
      return null;
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    try {
      setError(null);

      if (isDemo) {
        return false; // No permitir eliminar cuenta en demo
      }

      // Aquí implementarías la eliminación de cuenta
      // Por ahora retornamos false
      return false;
    } catch (err) {
      setError('Error al eliminar la cuenta');
      return false;
    }
  };

  return {
    // Estados
    profile,
    preferences,
    loading,
    error,

    // Funciones de perfil
    updateProfile,
    uploadProfilePhoto,
    changePassword,

    // Funciones de preferencias
    updatePreferences,
    resetPreferences,

    // Funciones de datos
    exportUserData,
    deleteAccount,

    // Utilidades
    refreshProfile: loadUserProfile,
    isDemo: isDemo || !isSupabaseConfigured
  };
}