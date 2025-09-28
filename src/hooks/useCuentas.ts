import { useState, useEffect } from 'react';
import { Cuenta, CreateCuentaDto, UpdateCuentaDto } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Función para manejar datos locales adicionales
const getStorageKey = (userId: string) => `cuentas_extra_${userId}`;

const saveExtraData = (userId: string, cuentaId: string, extraData: any) => {
  const key = getStorageKey(userId);
  const stored = JSON.parse(localStorage.getItem(key) || '{}');
  stored[cuentaId] = extraData;
  localStorage.setItem(key, JSON.stringify(stored));
};

const getExtraData = (userId: string, cuentaId: string) => {
  const key = getStorageKey(userId);
  const stored = JSON.parse(localStorage.getItem(key) || '{}');
  return stored[cuentaId] || {};
};

const getAllExtraData = (userId: string) => {
  const key = getStorageKey(userId);
  return JSON.parse(localStorage.getItem(key) || '{}');
};

const removeExtraData = (userId: string, cuentaId: string) => {
  const key = getStorageKey(userId);
  const stored = JSON.parse(localStorage.getItem(key) || '{}');
  delete stored[cuentaId];
  localStorage.setItem(key, JSON.stringify(stored));
};

// Datos demo para desarrollo
const demoData: Cuenta[] = [
  {
    id: '1',
    usuario_id: 'demo-user-1',
    nombre: 'Cuenta Corriente Bancolombia',
    saldo: 2500000,
    tipo: 'ahorro',
    descripcion: 'Cuenta principal para gastos diarios',
    banco: 'Bancolombia',
    numero_cuenta: '****1234',
    activa: true,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    usuario_id: 'demo-user-1',
    nombre: 'Tarjeta de Crédito',
    saldo: -850000,
    tipo: 'credito',
    descripcion: 'Tarjeta de crédito para compras grandes',
    banco: 'Banco de Bogotá',
    numero_cuenta: '****5678',
    limite_credito: 3000000,
    interes: 2.5,
    fecha_vencimiento: '2027-12-31',
    activa: true,
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    usuario_id: 'demo-user-1',
    nombre: 'Efectivo',
    saldo: 350000,
    tipo: 'efectivo',
    descripcion: 'Dinero en efectivo en billetera',
    activa: true,
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: '4',
    usuario_id: 'demo-user-1',
    nombre: 'Cuenta de Ahorro',
    saldo: 5200000,
    tipo: 'inversion',
    descripcion: 'Inversión a plazo fijo',
    banco: 'Davivienda',
    numero_cuenta: '****9012',
    interes: 4.2,
    fecha_vencimiento: '2024-12-31',
    activa: true,
    created_at: '2023-12-01T10:00:00Z'
  }
];

const getCacheKey = (userId: string) => `cuentas_cache_${userId}`;

export function useCuentas() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const { user } = useAuth();

  // Cargar datos del cache al inicializar
  useEffect(() => {
    if (user) {
      const cached = localStorage.getItem(getCacheKey(user.id));
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          setCuentas(cachedData);
          setLoading(false);
        } catch (error) {
          console.error('Error loading cached data:', error);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && !initialized) {
      fetchCuentas();
    }
  }, [user, initialized]);

  const fetchCuentas = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        // Modo demo
        setTimeout(() => {
          setCuentas(demoData);
          setLoading(false);
          setInitialized(true);
        }, 500);
        return;
      }

      const { data, error: supabaseError } = await supabase
        .from('cuentas')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      // Después de la migración, todos los datos vienen de Supabase
      const cuentasCompletas = (data || []).map(cuenta => ({
        ...cuenta,
        activa: cuenta.activa !== undefined ? cuenta.activa : true
      }));
      setCuentas(cuentasCompletas);

      // Guardar en cache
      if (user) {
        localStorage.setItem(getCacheKey(user.id), JSON.stringify(cuentasCompletas));
      }
    } catch (err: any) {
      console.error('Error fetching cuentas:', err);
      setError(err.message || 'Error al cargar las cuentas');
      // En caso de error, usar datos demo como fallback
      setCuentas(demoData);
      if (user) {
        localStorage.setItem(getCacheKey(user.id), JSON.stringify(demoData));
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const addCuenta = async (newCuenta: CreateCuentaDto): Promise<boolean> => {
    if (!user) return false;

    try {
      if (!isSupabaseConfigured) {
        // Modo demo - guardar datos extra en localStorage también
        const cuentaId = Date.now().toString();
        const extraData = {
          descripcion: newCuenta.descripcion || null,
          banco: newCuenta.banco || null,
          numero_cuenta: newCuenta.numero_cuenta || null,
          limite_credito: newCuenta.limite_credito || null,
          interes: newCuenta.interes || null,
          fecha_vencimiento: newCuenta.fecha_vencimiento || null,
          activa: true
        };

        saveExtraData(user.id, cuentaId, extraData);

        const cuenta: Cuenta = {
          id: cuentaId,
          usuario_id: user.id,
          nombre: newCuenta.nombre,
          tipo: newCuenta.tipo,
          saldo: newCuenta.saldo || 0,
          created_at: new Date().toISOString(),
          ...extraData
        };
        setCuentas(prev => [cuenta, ...prev]);
        return true;
      }

      // Enviar todos los campos (después de ejecutar la migración) con validaciones
      const insertData = {
        usuario_id: user.id,
        nombre: newCuenta.nombre,
        tipo: newCuenta.tipo,
        saldo: newCuenta.saldo || 0,
        descripcion: newCuenta.descripcion || null,
        banco: newCuenta.banco || null,
        numero_cuenta: newCuenta.numero_cuenta || null,
        limite_credito: newCuenta.limite_credito || null,
        interes: newCuenta.interes || null,
        fecha_vencimiento: newCuenta.fecha_vencimiento && newCuenta.fecha_vencimiento !== '' ? newCuenta.fecha_vencimiento : null,
        activa: true
      };

      const { data, error: supabaseError } = await supabase
        .from('cuentas')
        .insert([insertData])
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      // Guardar campos adicionales en localStorage
      const extraData = {
        descripcion: newCuenta.descripcion || null,
        banco: newCuenta.banco || null,
        numero_cuenta: newCuenta.numero_cuenta || null,
        limite_credito: newCuenta.limite_credito || null,
        interes: newCuenta.interes || null,
        fecha_vencimiento: newCuenta.fecha_vencimiento || null,
        activa: true
      };

      saveExtraData(user.id, data.id, extraData);

      // Crear cuenta completa combinando datos de Supabase y localStorage
      const cuentaCompleta = {
        ...data,
        ...extraData
      };
      const newCuentas = [cuentaCompleta, ...cuentas];
      setCuentas(newCuentas);

      // Actualizar cache
      localStorage.setItem(getCacheKey(user.id), JSON.stringify(newCuentas));
      return true;
    } catch (err: any) {
      console.error('Error adding cuenta:', err);
      setError(err.message || 'Error al crear la cuenta');
      return false;
    }
  };

  const updateCuenta = async (id: string, updates: UpdateCuentaDto): Promise<boolean> => {
    try {
      if (!isSupabaseConfigured) {
        // Modo demo
        setCuentas(prev => prev.map(cuenta =>
          cuenta.id === id
            ? { ...cuenta, ...updates, updated_at: new Date().toISOString() }
            : cuenta
        ));
        return true;
      }

      // Después de la migración, enviar todos los campos actualizados con validaciones
      const updateData = {};

      if (updates.nombre !== undefined) updateData.nombre = updates.nombre;
      if (updates.tipo !== undefined) updateData.tipo = updates.tipo;
      if (updates.saldo !== undefined) updateData.saldo = updates.saldo;
      if (updates.descripcion !== undefined) updateData.descripcion = updates.descripcion || null;
      if (updates.banco !== undefined) updateData.banco = updates.banco || null;
      if (updates.numero_cuenta !== undefined) updateData.numero_cuenta = updates.numero_cuenta || null;
      if (updates.limite_credito !== undefined) updateData.limite_credito = updates.limite_credito || null;
      if (updates.interes !== undefined) updateData.interes = updates.interes || null;
      if (updates.fecha_vencimiento !== undefined) {
        updateData.fecha_vencimiento = updates.fecha_vencimiento && updates.fecha_vencimiento !== '' ? updates.fecha_vencimiento : null;
      }
      if (updates.activa !== undefined) updateData.activa = updates.activa;

      const { data, error: supabaseError } = await supabase
        .from('cuentas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      // Actualizar datos extra en localStorage
      const cuentaActual = cuentas.find(c => c.id === id);
      const extraActual = getExtraData(user.id, id);

      const extraActualizado = {
        ...extraActual,
        descripcion: updates.descripcion !== undefined ? updates.descripcion : extraActual.descripcion,
        banco: updates.banco !== undefined ? updates.banco : extraActual.banco,
        numero_cuenta: updates.numero_cuenta !== undefined ? updates.numero_cuenta : extraActual.numero_cuenta,
        limite_credito: updates.limite_credito !== undefined ? updates.limite_credito : extraActual.limite_credito,
        interes: updates.interes !== undefined ? updates.interes : extraActual.interes,
        fecha_vencimiento: updates.fecha_vencimiento !== undefined ? updates.fecha_vencimiento : extraActual.fecha_vencimiento,
        activa: updates.activa !== undefined ? updates.activa : (extraActual.activa ?? true)
      };

      saveExtraData(user.id, id, extraActualizado);

      // Crear cuenta actualizada combinando datos de Supabase y localStorage
      const cuentaActualizada = {
        ...data,
        ...extraActualizado
      };

      const updatedCuentas = cuentas.map(cuenta =>
        cuenta.id === id ? cuentaActualizada : cuenta
      );
      setCuentas(updatedCuentas);

      // Actualizar cache
      localStorage.setItem(getCacheKey(user.id), JSON.stringify(updatedCuentas));
      return true;
    } catch (err: any) {
      console.error('Error updating cuenta:', err);
      setError(err.message || 'Error al actualizar la cuenta');
      return false;
    }
  };

  const deleteCuenta = async (id: string): Promise<boolean> => {
    try {
      if (!isSupabaseConfigured) {
        // Modo demo
        setCuentas(prev => prev.filter(cuenta => cuenta.id !== id));
        return true;
      }

      const { error: supabaseError } = await supabase
        .from('cuentas')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      const filteredCuentas = cuentas.filter(cuenta => cuenta.id !== id);
      setCuentas(filteredCuentas);

      // Limpiar datos extra del localStorage
      if (user) {
        removeExtraData(user.id, id);
        // Actualizar cache
        localStorage.setItem(getCacheKey(user.id), JSON.stringify(filteredCuentas));
      }

      return true;
    } catch (err: any) {
      console.error('Error deleting cuenta:', err);
      setError(err.message || 'Error al eliminar la cuenta');
      return false;
    }
  };

  const toggleCuentaActiva = async (id: string): Promise<boolean> => {
    const cuenta = cuentas.find(c => c.id === id);
    if (!cuenta) return false;

    // Después de la migración, actualizar directamente en Supabase
    return updateCuenta(id, { activa: !cuenta.activa });
  };

  // Estadísticas derivadas
  const totalBalance = cuentas
    .filter(cuenta => cuenta.activa)
    .reduce((total, cuenta) => {
      if (cuenta.tipo === 'credito') {
        return total - Math.abs(cuenta.saldo); // Las deudas restan
      }
      return total + cuenta.saldo;
    }, 0);

  const totalCredito = cuentas
    .filter(cuenta => cuenta.tipo === 'credito' && cuenta.activa)
    .reduce((total, cuenta) => total + Math.abs(cuenta.saldo), 0);

  const totalAhorro = cuentas
    .filter(cuenta => (cuenta.tipo === 'ahorro' || cuenta.tipo === 'inversion') && cuenta.activa)
    .reduce((total, cuenta) => total + cuenta.saldo, 0);

  const cuentasPorTipo = {
    efectivo: cuentas.filter(c => c.tipo === 'efectivo' && c.activa),
    ahorro: cuentas.filter(c => c.tipo === 'ahorro' && c.activa),
    credito: cuentas.filter(c => c.tipo === 'credito' && c.activa),
    inversion: cuentas.filter(c => c.tipo === 'inversion' && c.activa)
  };

  return {
    cuentas,
    loading,
    error,
    addCuenta,
    updateCuenta,
    deleteCuenta,
    toggleCuentaActiva,
    refreshCuentas: () => {
      setInitialized(false);
      fetchCuentas();
    },
    // Estadísticas
    totalBalance,
    totalCredito,
    totalAhorro,
    cuentasPorTipo,
    // Métricas útiles
    cuentasActivas: cuentas.filter(c => c.activa).length,
    cuentasInactivas: cuentas.filter(c => !c.activa).length
  };
}