-- Eliminar políticas anteriores
DROP POLICY IF EXISTS "categorias_select_policy" ON public.categorias;
DROP POLICY IF EXISTS "categorias_insert_policy" ON public.categorias;
DROP POLICY IF EXISTS "categorias_update_policy" ON public.categorias;
DROP POLICY IF EXISTS "categorias_delete_policy" ON public.categorias;

-- Crear políticas corrigiendo el manejo de UUID
-- Política de SELECT: los usuarios pueden ver sus propias categorías
CREATE POLICY "categorias_select_policy" ON public.categorias
  FOR SELECT USING (auth.uid() = usuario_id);

-- Política de INSERT: los usuarios pueden insertar categorías
CREATE POLICY "categorias_insert_policy" ON public.categorias
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Política de UPDATE: los usuarios pueden actualizar sus propias categorías
CREATE POLICY "categorias_update_policy" ON public.categorias
  FOR UPDATE USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Política de DELETE: los usuarios pueden eliminar sus propias categorías
CREATE POLICY "categorias_delete_policy" ON public.categorias
  FOR DELETE USING (auth.uid() = usuario_id);

-- Asegurar que RLS esté habilitado
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;