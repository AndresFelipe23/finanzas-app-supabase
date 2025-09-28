-- Deshabilitar RLS temporalmente para diagnosticar
ALTER TABLE public.categorias DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Los usuarios pueden ver sus categorías" ON public.categorias;
DROP POLICY IF EXISTS "Los usuarios pueden crear categorías" ON public.categorias;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus categorías" ON public.categorias;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus categorías" ON public.categorias;

-- Habilitar RLS nuevamente
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Crear política de SELECT: los usuarios pueden ver sus propias categorías
CREATE POLICY "categorias_select_policy" ON public.categorias
  FOR SELECT USING (auth.uid() = usuario_id);

-- Crear política de INSERT: los usuarios pueden insertar categorías con su propio usuario_id
CREATE POLICY "categorias_insert_policy" ON public.categorias
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Crear política de UPDATE: los usuarios pueden actualizar sus propias categorías
CREATE POLICY "categorias_update_policy" ON public.categorias
  FOR UPDATE USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Crear política de DELETE: los usuarios pueden eliminar sus propias categorías
CREATE POLICY "categorias_delete_policy" ON public.categorias
  FOR DELETE USING (auth.uid() = usuario_id);