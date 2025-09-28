import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Cuenta, Categoria, Transaccion, Presupuesto, MetaAhorro, PresupuestoConProgreso, CreateCategoriaDto, UpdateCategoriaDto } from '../types';
import { faker } from '@faker-js/faker';

// Configurar faker en español
faker.locale = 'es';

// Datos demo
const getDemoData = () => {
  const demoCuentas: Cuenta[] = [
    {
      id: '1',
      usuario_id: 'demo-user-1',
      nombre: 'Efectivo',
      saldo: 250000,
      tipo: 'efectivo',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      usuario_id: 'demo-user-1',
      nombre: 'Cuenta de Ahorros',
      saldo: 1500000,
      tipo: 'ahorro',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      usuario_id: 'demo-user-1',
      nombre: 'Tarjeta de Crédito',
      saldo: -320000,
      tipo: 'credito',
      created_at: new Date().toISOString()
    }
  ];

  const demoCategorias: Categoria[] = [
    // Categorías de gastos
    { id: '1', usuario_id: 'demo-user-1', nombre: 'Alimentación', icono: 'Utensils', color: '#ef4444', tipo: 'gasto' },
    { id: '2', usuario_id: 'demo-user-1', nombre: 'Transporte', icono: 'Car', color: '#f97316', tipo: 'gasto' },
    { id: '3', usuario_id: 'demo-user-1', nombre: 'Entretenimiento', icono: 'Film', color: '#8b5cf6', tipo: 'gasto' },
    { id: '4', usuario_id: 'demo-user-1', nombre: 'Salud', icono: 'Heart', color: '#06b6d4', tipo: 'gasto' },
    { id: '5', usuario_id: 'demo-user-1', nombre: 'Educación', icono: 'Book', color: '#3b82f6', tipo: 'gasto' },
    { id: '6', usuario_id: 'demo-user-1', nombre: 'Hogar', icono: 'Home', color: '#10b981', tipo: 'gasto' },
    // Categorías de ingresos
    { id: '7', usuario_id: 'demo-user-1', nombre: 'Salario', icono: 'Briefcase', color: '#22c55e', tipo: 'ingreso' },
    { id: '8', usuario_id: 'demo-user-1', nombre: 'Freelance', icono: 'Laptop', color: '#84cc16', tipo: 'ingreso' },
    { id: '9', usuario_id: 'demo-user-1', nombre: 'Inversiones', icono: 'TrendingUp', color: '#16a34a', tipo: 'ingreso' }
  ];

  const demoTransacciones: Transaccion[] = [];
  
  // Generar transacciones de los últimos 3 meses
  for (let i = 0; i < 50; i++) {
    const tipo = Math.random() > 0.3 ? 'gasto' : 'ingreso';
    const categoriasFiltradas = demoCategorias.filter(c => c.tipo === tipo);
    const categoria = categoriasFiltradas[Math.floor(Math.random() * categoriasFiltradas.length)];
    const cuenta = demoCuentas[Math.floor(Math.random() * demoCuentas.length)];
    
    let monto: number;
    if (tipo === 'ingreso') {
      monto = faker.number.int({ min: 50000, max: 2000000 });
    } else {
      monto = faker.number.int({ min: 5000, max: 500000 });
    }

    // Generar nombres descriptivos basados en la categoría
    const nombreTransaccion = (() => {
      switch (categoria.nombre) {
        case 'Alimentación':
          return ['Supermercado Éxito', 'Almuerzo en restaurante', 'Compra mercado', 'Cena familiar', 'Domicilio comida'][Math.floor(Math.random() * 5)];
        case 'Transporte':
          return ['Gasolina', 'Uber', 'Transporte público', 'Peaje', 'Mantenimiento vehículo'][Math.floor(Math.random() * 5)];
        case 'Entretenimiento':
          return ['Netflix', 'Cine', 'Concierto', 'Videojuegos', 'Salida amigos'][Math.floor(Math.random() * 5)];
        case 'Salud':
          return ['Consulta médica', 'Medicamentos', 'Exámenes', 'Odontólogo', 'Gimnasio'][Math.floor(Math.random() * 5)];
        case 'Educación':
          return ['Curso online', 'Libros', 'Certificación', 'Universidad', 'Material estudio'][Math.floor(Math.random() * 5)];
        case 'Hogar':
          return ['Servicios públicos', 'Arriendo', 'Reparaciones', 'Decoración', 'Limpieza'][Math.floor(Math.random() * 5)];
        case 'Salario':
          return ['Salario mensual', 'Bonificación', 'Horas extra', 'Comisiones', 'Aguinaldo'][Math.floor(Math.random() * 5)];
        case 'Freelance':
          return ['Proyecto web', 'Consultoría', 'Diseño gráfico', 'Traducción', 'Programación'][Math.floor(Math.random() * 5)];
        case 'Inversiones':
          return ['Dividendos', 'Venta acciones', 'Intereses', 'Renta fija', 'Crypto'][Math.floor(Math.random() * 5)];
        default:
          return categoria.nombre;
      }
    })();

    demoTransacciones.push({
      id: `demo-trans-${i}`,
      usuario_id: 'demo-user-1',
      cuenta_id: cuenta.id,
      categoria_id: categoria.id,
      nombre: nombreTransaccion,
      monto: monto,
      descripcion: faker.commerce.productDescription().substring(0, 50),
      fecha: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
      tipo: tipo,
      es_recurrente: Math.random() > 0.85,
      created_at: new Date().toISOString()
    });
  }

  return { demoCuentas, demoCategorias, demoTransacciones };
};

export function useFinanceData() {
  const { user, isDemo } = useAuth();
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [metas, setMetas] = useState<MetaAhorro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, isDemo]);

  const loadAllData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (isDemo || !isSupabaseConfigured) {
        // Cargar datos demo
        const { demoCuentas, demoCategorias, demoTransacciones } = getDemoData();
        setCuentas(demoCuentas);
        setCategorias(demoCategorias);
        setTransacciones(demoTransacciones);
        setPresupuestos([]);
        setMetas([]);
      } else {
        // Cargar datos reales de Supabase
        await Promise.all([
          loadCuentas(),
          loadCategorias(),
          loadTransacciones(),
          loadPresupuestos(),
          loadMetas()
        ]);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCuentas = async () => {
    if (!user || !isSupabaseConfigured) return;

    const { data, error } = await supabase
      .from('cuentas')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error cargando cuentas:', error);
      return;
    }

    setCuentas(data || []);
  };

  const loadCategorias = async () => {
    if (!isSupabaseConfigured) return;

    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('usuario_id', user?.id)
      .order('nombre');

    if (error) {
      console.error('Error cargando categorías:', error);
      return;
    }

    setCategorias(data || []);
  };

  const loadTransacciones = async () => {
    if (!user || !isSupabaseConfigured) return;

    const { data, error } = await supabase
      .from('transacciones')
      .select('*')
      .eq('usuario_id', user.id)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error cargando transacciones:', error);
      return;
    }

    setTransacciones(data || []);
  };

  const loadPresupuestos = async () => {
    if (!user || !isSupabaseConfigured) return;

    const { data, error } = await supabase
      .from('presupuestos')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando presupuestos:', error);
      return;
    }

    setPresupuestos(data || []);
  };

  const loadMetas = async () => {
    if (!user || !isSupabaseConfigured) return;

    const { data, error } = await supabase
      .from('metas_ahorro')
      .select('*')
      .eq('usuario_id', user.id)
      .order('fecha_limite', { ascending: true });

    if (error) {
      console.error('Error cargando metas:', error);
      return;
    }

    setMetas(data || []);
  };

  // Funciones para agregar/actualizar/eliminar datos
  const addCuenta = async (cuenta: Omit<Cuenta, 'id' | 'usuario_id' | 'created_at'>) => {
    if (!user) return null;

    if (isDemo || !isSupabaseConfigured) {
      // Modo demo - agregar localmente
      const newCuenta: Cuenta = {
        id: `demo-cuenta-${Date.now()}`,
        usuario_id: user.id,
        created_at: new Date().toISOString(),
        ...cuenta
      };
      setCuentas(prev => [...prev, newCuenta]);
      return newCuenta;
    }

    const { data, error } = await supabase
      .from('cuentas')
      .insert([{ ...cuenta, usuario_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error agregando cuenta:', error);
      return null;
    }

    setCuentas(prev => [...prev, data]);
    return data;
  };

  const addTransaccion = async (transaccion: Omit<Transaccion, 'id' | 'usuario_id' | 'created_at'>) => {
    if (!user) return null;

    if (isDemo || !isSupabaseConfigured) {
      // Modo demo - agregar localmente
      const newTransaccion: Transaccion = {
        id: `demo-trans-${Date.now()}`,
        usuario_id: user.id,
        created_at: new Date().toISOString(),
        es_recurrente: false,
        ...transaccion
      };
      setTransacciones(prev => [newTransaccion, ...prev]);
      
      // Actualizar saldo de cuenta en modo demo
      setCuentas(prev => prev.map(cuenta => {
        if (cuenta.id === transaccion.cuenta_id) {
          const cambio = transaccion.tipo === 'ingreso' ? transaccion.monto : -transaccion.monto;
          return { ...cuenta, saldo: cuenta.saldo + cambio };
        }
        return cuenta;
      }));
      
      return newTransaccion;
    }

    const { data, error } = await supabase
      .from('transacciones')
      .insert([{ ...transaccion, usuario_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error agregando transacción:', error);
      return null;
    }

    setTransacciones(prev => [data, ...prev]);
    loadCuentas(); // Recargar cuentas para actualizar saldos
    return data;
  };

  const addCategoria = async (categoria: CreateCategoriaDto) => {
    if (!user || !user.id) return null;

    if (isDemo || !isSupabaseConfigured) {
      // Modo demo - agregar localmente
      const newCategoria: Categoria = {
        id: `demo-cat-${Date.now()}`,
        usuario_id: user.id,
        ...categoria
      };
      setCategorias(prev => [...prev, newCategoria]);
      return newCategoria;
    }

    // Preparar datos para Supabase
    const categoriaData = {
      nombre: categoria.nombre,
      tipo: categoria.tipo,
      color: categoria.color,
      icono: categoria.icono,
      descripcion: categoria.descripcion,
      usuario_id: user.id
    };

    const { data, error } = await supabase
      .from('categorias')
      .insert([categoriaData])
      .select()
      .single();

    if (error) {
      console.error('Error agregando categoría:', error);
      return null;
    }

    setCategorias(prev => [...prev, data]);
    return data;
  };

  const updateCategoria = async (categoria: UpdateCategoriaDto) => {
    if (!user) return null;

    if (isDemo || !isSupabaseConfigured) {
      // Modo demo - actualizar localmente
      setCategorias(prev => prev.map(c => c.id === categoria.id ? { ...c, ...categoria } : c));
      return { ...categorias.find(c => c.id === categoria.id), ...categoria };
    }

    // Buscar la categoría actual para verificar si es editable
    const categoriaActual = categorias.find(c => c.id === categoria.id);
    if (!categoriaActual) {
      console.error('Categoría no encontrada');
      return null;
    }


    const updateData: any = {
      nombre: categoria.nombre,
      tipo: categoria.tipo,
      color: categoria.color,
      icono: categoria.icono,
      descripcion: categoria.descripcion || ''
    };

    console.log('Actualizando categoría:', { categoriaId: categoria.id, updateData, userId: user.id });

    const { data, error } = await supabase
      .from('categorias')
      .update(updateData)
      .eq('id', categoria.id)
      .eq('usuario_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando categoría:', error);
      return null;
    }

    console.log('Categoría actualizada exitosamente:', data);
    setCategorias(prev => prev.map(c => c.id === categoria.id ? data : c));
    return data;
  };

  const deleteCategoria = async (id: string) => {
    if (!user) return false;
    if (isDemo || !isSupabaseConfigured) {
      // Modo demo - eliminar localmente
      setCategorias(prev => prev.filter(c => c.id !== id));
      return true;
    }

    // Buscar la categoría actual para verificar si es editable
    const categoriaActual = categorias.find(c => c.id === id);
    if (!categoriaActual) {
      console.error('Categoría no encontrada');
      return false;
    }


    console.log('Eliminando categoría:', { categoriaId: id, userId: user.id });

    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id)
      .eq('usuario_id', user.id);

    if (error) {
      console.error('Error eliminando categoría:', error);
      return false;
    }

    console.log('Categoría eliminada exitosamente');
    setCategorias(prev => prev.filter(c => c.id !== id));
    return true;
  };

  const addMeta = async (meta: Omit<MetaAhorro, 'id' | 'usuario_id' | 'created_at'>) => {
    if (!user) return null;

    if (isDemo || !isSupabaseConfigured) {
      const newMeta: MetaAhorro = {
        id: `demo-meta-${Date.now()}`,
        usuario_id: user.id,
        created_at: new Date().toISOString(),
        ...meta
      };
      setMetas(prev => [...prev, newMeta]);
      return newMeta;
    }

    const { data, error } = await supabase
      .from('metas_ahorro')
      .insert([{ ...meta, usuario_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error agregando meta:', error);
      return null;
    }

    setMetas(prev => [...prev, data]);
    return data;
  };

  const addPresupuesto = async (presupuesto: Omit<Presupuesto, 'id' | 'usuario_id' | 'created_at'>) => {
    if (!user) return null;

    if (isDemo || !isSupabaseConfigured) {
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
  };

  const updatePresupuesto = async (id: string, updates: Partial<Presupuesto>) => {
    if (isDemo || !isSupabaseConfigured) {
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
  };

  const deletePresupuesto = async (id: string) => {
    if (isDemo || !isSupabaseConfigured) {
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
  };

  // Estadísticas de categorías
  const getCategoriasByTipo = (tipo: 'ingreso' | 'gasto') => {
    return categorias.filter(c => c.tipo === tipo);
  };

  const getCategoriasGasto = () => getCategoriasByTipo('gasto');
  const getCategoriasIngreso = () => getCategoriasByTipo('ingreso');

  const stats = {
    total: categorias.length,
    gastos: getCategoriasGasto().length,
    ingresos: getCategoriasIngreso().length
  };

  // Función para calcular el progreso de presupuestos
  const calcularProgresoPresupuestos = (
    mes?: number,
    ano?: number
  ): PresupuestoConProgreso[] => {
    const mesActual = mes || new Date().getMonth() + 1;
    const anoActual = ano || new Date().getFullYear();

    return presupuestos
      .filter(p => p.mes === mesActual && p.ano === anoActual)
      .map(presupuesto => {
        const categoria = categorias.find(c => c.id === presupuesto.categoria_id);
        
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

  const updateTransaccion = async (id: string, updates: Partial<Transaccion>) => {
    if (isDemo || !isSupabaseConfigured) {
      // Modo demo - actualizar localmente
      setTransacciones(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      return { ...transacciones.find(t => t.id === id), ...updates };
    }

    const { data, error } = await supabase
      .from('transacciones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando transacción:', error);
      return null;
    }

    setTransacciones(prev => prev.map(t => t.id === id ? data : t));
    loadCuentas(); // Recargar cuentas para actualizar saldos
    return data;
  };

  const deleteTransaccion = async (id: string) => {
    if (isDemo || !isSupabaseConfigured) {
      // Modo demo - eliminar localmente
      const transaccion = transacciones.find(t => t.id === id);
      if (transaccion) {
        setTransacciones(prev => prev.filter(t => t.id !== id));
        
        // Revertir cambio en saldo
        setCuentas(prev => prev.map(cuenta => {
          if (cuenta.id === transaccion.cuenta_id) {
            const cambio = transaccion.tipo === 'ingreso' ? -transaccion.monto : transaccion.monto;
            return { ...cuenta, saldo: cuenta.saldo + cambio };
          }
          return cuenta;
        }));
      }
      return true;
    }

    const { error } = await supabase
      .from('transacciones')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando transacción:', error);
      return false;
    }

    setTransacciones(prev => prev.filter(t => t.id !== id));
    loadCuentas(); // Recargar cuentas para actualizar saldos
    return true;
  };

  return {
    cuentas,
    categorias,
    transacciones,
    presupuestos,
    metas,
    loading,
    setCuentas,
    setCategorias,
    setTransacciones,
    setPresupuestos,
    setMetas,
    // Funciones CRUD
    addCuenta,
    addTransaccion,
    addCategoria,
    updateCategoria,
    deleteCategoria,
    addMeta,
    addPresupuesto,
    updatePresupuesto,
    deletePresupuesto,
    updateTransaccion,
    deleteTransaccion,
    // Funciones de recarga
    loadAllData,
    loadCuentas,
    loadCategorias,
    loadTransacciones,
    loadPresupuestos,
    // Funciones de presupuestos
    calcularProgresoPresupuestos,
    // Estadísticas
    stats,
    getCategoriasByTipo,
    getCategoriasGasto,
    getCategoriasIngreso,
    // Estado
    isDemo: isDemo || !isSupabaseConfigured
  };
}
