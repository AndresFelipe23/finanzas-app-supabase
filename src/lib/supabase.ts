import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar si las credenciales están configuradas correctamente
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_API_KEY' && 
  supabaseAnonKey !== 'YOUR_API_KEY' &&
  supabaseUrl.startsWith('http');

let supabaseClient: any = null;

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    supabaseClient = null;
  }
}

// Cliente mock para desarrollo sin Supabase
const mockSupabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: any) => {
      setTimeout(() => callback('SIGNED_OUT', null), 100);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } }),
        order: () => Promise.resolve({ data: [], error: null })
      }),
      or: () => ({
        order: () => Promise.resolve({ data: [], error: null })
      }),
      order: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } })
        })
      })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: { message: 'Supabase no configurado' } })
    })
  })
};

// Exporta el cliente real si está configurado y se creó correctamente, de lo contrario, el mock.
export const supabase = isSupabaseConfigured && supabaseClient ? supabaseClient : mockSupabase;

// Función para probar la conexión
export const testSupabaseConnection = async () => {
  if (!isSupabaseConfigured) {
    return false;
  }

  try {
    // Timeout más corto para la prueba
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Test timeout')), 5000)
    );

    const testPromise = supabase.auth.getSession();

    const { data, error } = await Promise.race([testPromise, timeoutPromise]) as any;

    return !error;
  } catch (error) {
    return false;
  }
};
