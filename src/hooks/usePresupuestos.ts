import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Presupuesto, CreatePresupuestoDto, UpdatePresupuestoDto, PresupuestoConProgreso, Categoria, Transaccion } from '../types';

export function usePresupuestos() {
  const { user, isDemo } = useAuth();
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPresupuestos();
    }
  }, [user, isDemo]);

  const loadPresupuestos = async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);

      if (isDemo || !isSupabaseConfigured) {
        // Datos demo para presupuestos
        const demoPresupuestos: Presupuesto[] = [
          {
            id: 'demo-pres-1',
            usuario_id: user.id,
            categoria_id: '1', // Alimentación
            limite: 500000,
            mes: new Date().getMonth() + 1,
            ano: new Date().getFullYear(),
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-pres-2',
            usuario_id: user.id,
            categoria_id: '2', // Transporte
            limite: 300000,
            mes: new Date().getMonth() + 1,
            ano: new Date().getFullYear(),
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-pres-3',
            usuario_id: user.id,
            categoria_id: '3', // Entretenimiento
            limite: 200000,
            mes: new Date().getMonth() + 1,
            ano: new Date().getFullYear(),
            created_at: new Date().toISOString()
          }
        ];
        setPresupuestos(demoPresupuestos);
      } else {
        const { data, error } = await supabase
          .from('presupuestos')
          .select('*')
          .eq('usuario_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error cargando presupuestos desde Supabase:', error);
          return;
        }

        setPresupuestos(data || []);
      }
    } catch (error) {
      console.error('Error general cargando presupuestos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPresupuesto = async (presupuesto: CreatePresupuestoDto) => {
    if (!user) return null;

    try {
      if (isDemo || !isSupabaseConfigured) {
        // Modo demo - agregar localmente
        const newPresupuesto: Presupuesto = {
          id: `demo-pres-${Date.now()}`,
          usuario_id: user.id,
          created_at: new Date().toISOString(),
          ...presupuesto
        };
        setPresupuestos(prev => [...prev, newPresupuesto]);
        return newPresupuesto;
      }

      const { data, error } = await supabase
        .from('presupuestos')
        .insert([{ ...presupuesto, usuario_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error agregando presupuesto:', error);
        return null;
      }

      setPresupuestos(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error agregando presupuesto:', error);
      return null;
    }
  };

  const updatePresupuesto = async (id: string, updates: UpdatePresupuestoDto) => {
    try {
      if (isDemo || !isSupabaseConfigured) {
        // Modo demo - actualizar localmente
        setPresupuestos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        return { ...presupuestos.find(p => p.id === id), ...updates };
      }

      const { data, error } = await supabase
        .from('presupuestos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando presupuesto:', error);
        return null;
      }

      setPresupuestos(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (error) {
      console.error('Error actualizando presupuesto:', error);
      return null;
    }
  };

  const deletePresupuesto = async (id: string) => {
    try {
      if (isDemo || !isSupabaseConfigured) {
        // Modo demo - eliminar localmente
        setPresupuestos(prev => prev.filter(p => p.id !== id));
        return true;
      }

      const { error } = await supabase
        .from('presupuestos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error eliminando presupuesto:', error);
        return false;
      }

      setPresupuestos(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (error) {
      console.error('Error eliminando presupuesto:', error);
      return false;
    }
  };

  // Función para calcular el progreso de presupuestos
  const calcularProgresoPresupuestos = (
    presupuestos: Presupuesto[],
    categorias: Categoria[],
    transacciones: Transaccion[],
    mes?: number,
    ano?: number
  ): PresupuestoConProgreso[] => {
    const mesActual = mes || new Date().getMonth() + 1;
    const anoActual = ano || new Date().getFullYear();

    return presupuestos
      .filter(p => p.mes === mesActual && p.ano === anoActual)
      .map(presupuesto => {
        const categoria = categorias.find(c => c.id === presupuesto.categoria_id);
        
        // Calcular gastos de la categoría en el mes
        const gastado = transacciones
          .filter(t => {
            const fecha = new Date(t.fecha);
            return (
              t.categoria_id === presupuesto.categoria_id &&
              t.tipo === 'gasto' &&
              fecha.getMonth() + 1 === mesActual &&
              fecha.getFullYear() === anoActual
            );
          })
          .reduce((sum, t) => sum + t.monto, 0);

        const porcentaje_usado = presupuesto.limite > 0 ? (gastado / presupuesto.limite) * 100 : 0;
        const restante = presupuesto.limite - gastado;

        let estado: 'dentro_presupuesto' | 'cerca_limite' | 'excedido';
        if (porcentaje_usado >= 100) {
          estado = 'excedido';
        } else if (porcentaje_usado >= 80) {
          estado = 'cerca_limite';
        } else {
          estado = 'dentro_presupuesto';
        }

        return {
          ...presupuesto,
          categoria: categoria || { id: '', usuario_id: '', nombre: 'Sin categoría', icono: '❓', color: '#6B7280', tipo: 'gasto' },
          gastado,
          porcentaje_usado,
          restante,
          estado
        };
      });
  };

  // Función para obtener presupuestos por mes y año
  const getPresupuestosPorMes = (mes: number, ano: number) => {
    return presupuestos.filter(p => p.mes === mes && p.ano === ano);
  };

  // Función para verificar si existe presupuesto para una categoría en un mes específico
  const existePresupuesto = (categoria_id: string, mes: number, ano: number) => {
    return presupuestos.some(p => 
      p.categoria_id === categoria_id && p.mes === mes && p.ano === ano
    );
  };

  return {
    presupuestos,
    loading,
    addPresupuesto,
    updatePresupuesto,
    deletePresupuesto,
    loadPresupuestos,
    refreshPresupuestos: loadPresupuestos,
    calcularProgresoPresupuestos,
    getPresupuestosPorMes,
    existePresupuesto,
    isDemo: isDemo || !isSupabaseConfigured
  };
}
