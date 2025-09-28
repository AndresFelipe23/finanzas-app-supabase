import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, nombre: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  isDemo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuario demo para desarrollo
const demoUser: User = {
  id: 'demo-user-1',
  email: 'demo@finanzasapp.com',
  nombre: 'Usuario Demo',
  created_at: new Date().toISOString()
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Modo demo - usar usuario demo automáticamente
      setTimeout(() => {
        setUser(demoUser);
        setLoading(false);
      }, 1000);
      return;
    }

    // Saltear getSession inicial ya que se cuelga, depender solo de onAuthStateChange
    setLoading(false);

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: any, session: any) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id, session);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, session?: any) => {
    if (!isSupabaseConfigured) return;

    try {
      // Usar datos de la sesión que ya tenemos del onAuthStateChange
      if (session?.user) {
        const basicUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          nombre: session.user.user_metadata?.nombre || session.user.email?.split('@')[0] || 'Usuario',
          created_at: session.user.created_at || new Date().toISOString()
        };

        setUser(basicUser);
        setLoading(false);

        // Intentar obtener perfil adicional de la tabla users en background (opcional)
        try {

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 3000)
          );

          const profilePromise = supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          const { data: userProfile, error: profileError } = await Promise.race([profilePromise, timeoutPromise]) as any;

          if (!profileError && userProfile) {
            // Actualizar con datos de la tabla si están disponibles
            const completeUser: User = {
              id: userProfile.id,
              email: session.user.email || '',
              nombre: userProfile.nombre || basicUser.nombre,
              created_at: userProfile.created_at
            };
            setUser(completeUser);
          }
        } catch (backgroundError) {
          // Ignorar errores en background, ya tenemos el usuario básico
        }
      }

    } catch (error) {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      // Modo demo - simular login exitoso
      return new Promise((resolve) => {
        setTimeout(() => {
          setUser(demoUser);
          resolve({ success: true });
        }, 1000);
      });
    }

    try {

      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login timeout')), 10000)
      );

      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;


      if (error) {

        // Mapear errores específicos de Supabase
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Credenciales inválidas. Revisa tu correo y contraseña.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email not confirmed';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Demasiados intentos. Espera unos minutos antes de intentar de nuevo.';
        }

        return { success: false, error: errorMessage };
      }

      if (data?.user) {
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Ocurrió un error inesperado.' };
    }
  };

  const register = async (email: string, password: string, nombre: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      // Modo demo - simular registro exitoso
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: nombre
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Si el registro fue exitoso, el usuario ya está autenticado automáticamente
      // No necesitamos confirmación por correo
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error inesperado durante el registro' };
    }
  };

  const resendConfirmationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Función no disponible en modo demo.' };
    }
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error inesperado.' };
    }
  };

  const logout = async (): Promise<void> => {
    if (!isSupabaseConfigured) {
      // Modo demo - simular logout
      setUser(null);
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
      }
    } catch (error) {
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      // Modo demo - simular actualización
      if (user) {
        setUser({ ...user, ...data });
        return true;
      }
      return false;
    }

    try {
      if (!user) return false;

      // Limpiar datos antes de enviar a Supabase
      const cleanData = { ...data };
      
      // Convertir cadenas vacías a null para campos de fecha
      if (cleanData.fecha_nacimiento === '') {
        cleanData.fecha_nacimiento = null;
      }
      
      // Convertir cadenas vacías a null para campos de texto opcionales
      if (cleanData.telefono === '') {
        cleanData.telefono = null;
      }
      if (cleanData.ocupacion === '') {
        cleanData.ocupacion = null;
      }
      if (cleanData.biografia === '') {
        cleanData.biografia = null;
      }


      const { data: updatedData, error } = await supabase
        .from('users')
        .update(cleanData)
        .eq('id', user.id)
        .select();


      if (error) {
        return false;
      }

      // Verificar que la actualización fue exitosa
      if (!updatedData || updatedData.length === 0) {
        return false;
      }

      setUser({ ...user, ...cleanData });
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      resendConfirmationEmail,
      isDemo: !isSupabaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
