-- Verificar las políticas actuales
-- Primero, vamos a eliminar todas las políticas y recrearlas con mejor configuración

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "categorias_select_policy" ON public.categorias;
DROP POLICY IF EXISTS "categorias_insert_policy" ON public.categorias;
DROP POLICY IF EXISTS "categorias_update_policy" ON public.categorias;
DROP POLICY IF EXISTS "categorias_delete_policy" ON public.categorias;

-- Recrear políticas con configuración más permisiva para debugging
-- Política de SELECT: los usuarios pueden ver sus propias categorías
CREATE POLICY "categorias_select_policy" ON public.categorias
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    auth.uid()::text = usuario_id
  );

-- Política de INSERT: los usuarios pueden insertar categorías
CREATE POLICY "categorias_insert_policy" ON public.categorias
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid()::text = usuario_id
  );

-- Política de UPDATE: los usuarios pueden actualizar sus propias categorías
CREATE POLICY "categorias_update_policy" ON public.categorias
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    auth.uid()::text = usuario_id
  ) WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid()::text = usuario_id
  );

-- Política de DELETE: los usuarios pueden eliminar sus propias categorías
CREATE POLICY "categorias_delete_policy" ON public.categorias
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    auth.uid()::text = usuario_id
  );

-- Verificar que RLS esté habilitado
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;