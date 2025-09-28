import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Categoria } from '../types';

interface CreateCategoriaDto {
  nombre: string;
  tipo: 'ingreso' | 'gasto';
  color: string;
  descripcion?: string;
  icono?: string;
}

interface UpdateCategoriaDto extends Partial<CreateCategoriaDto> {
  id: string;
}

// Categorías sugeridas para facilitar la creación rápida
export const CATEGORIAS_SUGERIDAS = {
  gasto: [
    { nombre: 'Alimentación', descripcion: 'Comida, restaurantes, supermercado', icono: 'Utensils', color: '#ef4444' },
    { nombre: 'Transporte', descripcion: 'Gasolina, transporte público, Uber', icono: 'Car', color: '#3b82f6' },
    { nombre: 'Vivienda', descripcion: 'Arriendo, servicios públicos, mantenimiento', icono: 'Home', color: '#8b5cf6' },
    { nombre: 'Entretenimiento', descripcion: 'Cine, conciertos, streaming', icono: 'Film', color: '#f59e0b' },
    { nombre: 'Salud', descripcion: 'Médico, medicinas, seguros', icono: 'Heart', color: '#10b981' },
    { nombre: 'Educación', descripcion: 'Cursos, libros, universidad', icono: 'Book', color: '#06b6d4' },
    { nombre: 'Ropa', descripcion: 'Vestimenta, zapatos, accesorios', icono: 'Shirt', color: '#ec4899' },
    { nombre: 'Tecnología', descripcion: 'Dispositivos, software, apps', icono: 'Laptop', color: '#6366f1' }
  ],
  ingreso: [
    { nombre: 'Salario', descripcion: 'Sueldo mensual principal', icono: 'Briefcase', color: '#059669' },
    { nombre: 'Freelance', descripcion: 'Trabajos independientes', icono: 'Laptop', color: '#0891b2' },
    { nombre: 'Bonificaciones', descripcion: 'Bonos, primas, incentivos', icono: 'Gift', color: '#7c3aed' },
    { nombre: 'Inversiones', descripcion: 'Dividendos, intereses, ganancias', icono: 'TrendingUp', color: '#dc2626' }
  ]
};

// Colores predefinidos para categorías
export const COLORES_CATEGORIA = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#64748b', '#6b7280', '#374151'
];

// Iconos predefinidos para categorías (nombres de iconos de Lucide)
export const ICONOS_CATEGORIA = [
  'Utensils', 'Car', 'Home', 'Film', 'Heart', 'Book', 'Shirt', 'Laptop',
  'Dumbbell', 'Dog', 'Briefcase', 'Gift', 'TrendingUp', 'ShoppingCart', 'Building', 'DollarSign',
  'Music', 'Plane', 'Coffee', 'Package', 'Target', 'Palette', 'Wrench', 'Smartphone',
  'Ticket', 'Sun', 'Bike', 'Wine', 'FileText', 'Lightbulb', 'Key', 'ShoppingBasket',
  'Gamepad2', 'Fuel', 'Stethoscope', 'GraduationCap', 'Scissors', 'Camera', 'Headphones', 'Pizza'
];

export function useCategorias() {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos al inicializar y cuando cambie el usuario
  useEffect(() => {
    loadCategorias();
  }, [user]);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setCategorias([]);
        setLoading(false);
        return;
      }

      // Cargar categorías desde Supabase (sin filtrar por usuario por ahora)
      const { data: supabaseCategorias, error: supabaseError } = await supabase
        .from('categorias')
        .select('*')
        .eq('usuario_id', user.id)
        .order('nombre');

      if (supabaseError) {
        setError('Error al cargar las categorías');
        setCategorias([]);
        return;
      }

      // Usar las categorías del usuario (puede estar vacío al inicio)
      setCategorias(supabaseCategorias || []);
    } catch (err) {
      setError('Error de conexión');
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const createCategoria = async (data: CreateCategoriaDto): Promise<Categoria> => {
    try {
      setError(null);

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Insertar en Supabase incluyendo el usuario_id
      const { data: insertedData, error: supabaseError } = await supabase
        .from('categorias')
        .insert([{
          nombre: data.nombre,
          tipo: data.tipo,
          color: data.color,
          descripcion: data.descripcion || '',
          icono: data.icono || 'Tag',
          usuario_id: user.id
        }])
        .select()
        .single();

      if (supabaseError) {
        throw new Error('No se pudo crear la categoría');
      }

      if (insertedData) {
        setCategorias(prev => [...prev, insertedData]);
        return insertedData;
      }

      throw new Error('No se recibió respuesta del servidor');
    } catch (err) {
      setError('Error al crear la categoría');
      throw err;
    }
  };

  const updateCategoria = async (data: UpdateCategoriaDto): Promise<Categoria> => {
    try {
      setError(null);

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const categoriaActual = categorias.find(c => c.id === data.id);
      if (!categoriaActual) {
        throw new Error('Categoría no encontrada');
      }


      // Actualizar en Supabase SIN restricciones de usuario_id
      const { data: updatedData, error: supabaseError } = await supabase
        .from('categorias')
        .update({
          nombre: data.nombre || categoriaActual.nombre,
          tipo: data.tipo || categoriaActual.tipo,
          color: data.color || categoriaActual.color,
          descripcion: data.descripcion !== undefined ? data.descripcion : categoriaActual.descripcion,
          icono: data.icono || categoriaActual.icono
        })
        .eq('id', data.id)
        .select()
        .single();

      if (supabaseError) {
        throw new Error('No se pudo actualizar la categoría');
      }

      if (updatedData) {
        setCategorias(prev => prev.map(c => c.id === data.id ? updatedData : c));
        return updatedData;
      }

      throw new Error('No se recibió respuesta del servidor');
    } catch (err) {
      setError('Error al actualizar la categoría');
      throw err;
    }
  };

  const deleteCategoria = async (id: string): Promise<void> => {
    try {
      setError(null);

      if (!user) {
        throw new Error('Usuario no autenticado');
      }


      // Eliminar de Supabase SIN restricciones de usuario_id
      const { error: supabaseError } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        throw new Error('No se pudo eliminar la categoría');
      }

      // Actualizar estado local
      setCategorias(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError('Error al eliminar la categoría');
      throw err;
    }
  };

  // Estadísticas
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

  return {
    categorias,
    loading,
    error,
    stats,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    getCategoriasByTipo,
    getCategoriasGasto,
    getCategoriasIngreso,
    refreshCategorias: loadCategorias,
    categoriasSugeridas: CATEGORIAS_SUGERIDAS
  };
}