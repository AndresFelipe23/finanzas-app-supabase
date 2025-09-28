import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Meta, CreateMetaDto, UpdateMetaDto, MetaConProgreso } from '../types';

// Iconos predefinidos para metas
export const ICONOS_META = [
  'Target', 'Home', 'Car', 'Plane', 'GraduationCap', 'Heart',
  'Smartphone', 'Laptop', 'Camera', 'Bike', 'Gift', 'Dumbbell',
  'Book', 'Palette', 'Music', 'Coffee', 'Sun', 'Mountain'
];

// Colores predefinidos para metas
export const COLORES_META = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
  '#84cc16', '#f97316', '#ec4899', '#6366f1', '#14b8a6', '#eab308'
];

// Categorías sugeridas para metas (mantenidas para retrocompatibilidad)
export const CATEGORIAS_META = [
  'Vivienda', 'Vehículo', 'Vacaciones', 'Educación', 'Emergencia',
  'Inversión', 'Tecnología', 'Salud', 'Entretenimiento', 'Otros'
];

export function useMetas() {
  const { user, isDemo } = useAuth();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadMetas();
    }
  }, [user, isDemo]);

  const loadMetas = async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isDemo || !isSupabaseConfigured) {
        // Datos demo para metas
        const demoMetas: Meta[] = [
          {
            id: 'demo-meta-1',
            usuario_id: user.id,
            nombre: 'Vacaciones de verano',
            descripcion: 'Ahorrar para unas vacaciones en la playa',
            cantidad_objetivo: 2000000,
            cantidad_actual: 800000,
            fecha_limite: '2024-06-01',
            categoria: 'Vacaciones',
            icono: 'Plane',
            color: '#3b82f6',
            es_completada: false,
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-meta-2',
            usuario_id: user.id,
            nombre: 'Laptop nueva',
            descripcion: 'Comprar una laptop para trabajo',
            cantidad_objetivo: 3000000,
            cantidad_actual: 3000000,
            fecha_limite: '2024-03-15',
            categoria: 'Tecnología',
            icono: 'Laptop',
            color: '#10b981',
            es_completada: true,
            created_at: new Date().toISOString()
          }
        ];
        setMetas(demoMetas);
      } else {
        const { data, error } = await supabase
          .from('metas')
          .select('*')
          .eq('usuario_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setMetas(data || []);
      }
    } catch (err) {
      setError('Error al cargar las metas');
    } finally {
      setLoading(false);
    }
  };

  const createMeta = async (data: CreateMetaDto): Promise<Meta | null> => {
    if (!user) return null;

    try {
      setError(null);


      if (isDemo || !isSupabaseConfigured) {
        const newMeta: Meta = {
          id: `demo-meta-${Date.now()}`,
          usuario_id: user.id,
          cantidad_actual: 0,
          es_completada: false,
          created_at: new Date().toISOString(),
          ...data
        };
        setMetas(prev => [newMeta, ...prev]);
        return newMeta;
      }

      const { data: insertedData, error: supabaseError } = await supabase
        .from('metas')
        .insert([{
          ...data,
          usuario_id: user.id
        }])
        .select()
        .single();

      if (supabaseError) {
        console.error('Error creando meta:', supabaseError);
        setError('Error al crear la meta');
        return null;
      }

      if (insertedData) {
        setMetas(prev => [insertedData, ...prev]);
        return insertedData;
      }

      return null;
    } catch (err) {
      console.error('Error general creando meta:', err);
      setError('Error inesperado');
      return null;
    }
  };

  const updateMeta = async (id: string, updates: UpdateMetaDto): Promise<Meta | null> => {
    if (!user) return null;

    try {
      setError(null);
      console.log('=== DEBUG METAS: Actualizando meta ===');
      console.log('ID:', id);
      console.log('Updates:', updates);

      if (isDemo || !isSupabaseConfigured) {
        setMetas(prev => prev.map(m => m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m));
        return metas.find(m => m.id === id) || null;
      }

      const { data: updatedData, error: supabaseError } = await supabase
        .from('metas')
        .update(updates)
        .eq('id', id)
        .eq('usuario_id', user.id)
        .select()
        .single();

      if (supabaseError) {
        console.error('Error actualizando meta:', supabaseError);
        setError('Error al actualizar la meta');
        return null;
      }

      if (updatedData) {
        setMetas(prev => prev.map(m => m.id === id ? updatedData : m));
        return updatedData;
      }

      return null;
    } catch (err) {
      console.error('Error general actualizando meta:', err);
      setError('Error inesperado');
      return null;
    }
  };

  const deleteMeta = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      console.log('=== DEBUG METAS: Eliminando meta ===');
      console.log('ID:', id);

      if (isDemo || !isSupabaseConfigured) {
        setMetas(prev => prev.filter(m => m.id !== id));
        return true;
      }

      const { error: supabaseError } = await supabase
        .from('metas')
        .delete()
        .eq('id', id)
        .eq('usuario_id', user.id);

      if (supabaseError) {
        console.error('Error eliminando meta:', supabaseError);
        setError('Error al eliminar la meta');
        return false;
      }

      setMetas(prev => prev.filter(m => m.id !== id));
      return true;
    } catch (err) {
      console.error('Error general eliminando meta:', err);
      setError('Error inesperado');
      return false;
    }
  };

  const actualizarProgreso = async (id: string, cantidad: number): Promise<boolean> => {
    const meta = metas.find(m => m.id === id);
    if (!meta) return false;

    const nuevaCantidad = Math.max(0, meta.cantidad_actual + cantidad);
    const result = await updateMeta(id, { cantidad_actual: nuevaCantidad });
    return result !== null;
  };

  // Calcular progreso de metas
  const calcularProgresoMetas = (metasList: Meta[] = metas): MetaConProgreso[] => {
    return metasList.map(meta => {
      const porcentaje_completado = meta.cantidad_objetivo > 0
        ? Math.min((meta.cantidad_actual / meta.cantidad_objetivo) * 100, 100)
        : 0;

      const fechaLimite = new Date(meta.fecha_limite);
      const hoy = new Date();
      const tiempo_restante_dias = Math.ceil((fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

      const dinero_restante = Math.max(0, meta.cantidad_objetivo - meta.cantidad_actual);

      const progreso_diario_requerido = tiempo_restante_dias > 0
        ? dinero_restante / tiempo_restante_dias
        : dinero_restante;

      let estado: 'en_tiempo' | 'atrasada' | 'completada' | 'vencida';

      if (meta.es_completada) {
        estado = 'completada';
      } else if (tiempo_restante_dias < 0) {
        estado = 'vencida';
      } else if (tiempo_restante_dias < 30 && porcentaje_completado < 70) {
        estado = 'atrasada';
      } else {
        estado = 'en_tiempo';
      }

      return {
        ...meta,
        porcentaje_completado,
        tiempo_restante_dias,
        dinero_restante,
        progreso_diario_requerido,
        estado
      };
    });
  };

  // Estadísticas
  const stats = {
    total: metas.length,
    completadas: metas.filter(m => m.es_completada).length,
    activas: metas.filter(m => !m.es_completada).length,
    dinero_total_objetivo: metas.reduce((sum, m) => sum + m.cantidad_objetivo, 0),
    dinero_total_ahorrado: metas.reduce((sum, m) => sum + m.cantidad_actual, 0)
  };

  return {
    metas,
    loading,
    error,
    stats,
    createMeta,
    updateMeta,
    deleteMeta,
    actualizarProgreso,
    calcularProgresoMetas,
    refreshMetas: loadMetas,
    isDemo: isDemo || !isSupabaseConfigured
  };
}