-- Eliminar todas las políticas existentes primero
DROP POLICY IF EXISTS "Los usuarios pueden ver categorías por defecto y las suyas" ON public.categorias;
DROP POLICY IF EXISTS "Los usuarios pueden gestionar sus categorías personalizadas" ON public.categorias;
DROP POLICY IF EXISTS "Los usuarios pueden insertar sus categorías personalizadas" ON public.categorias;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus categorías personalizadas" ON public.categorias;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus categorías personalizadas" ON public.categorias;

-- Eliminar todas las categorías predefinidas existentes
DELETE FROM public.categorias WHERE es_personalizada = false;

-- Eliminar el campo es_personalizada ya que todas las categorías serán personalizadas
ALTER TABLE public.categorias DROP COLUMN IF EXISTS es_personalizada;

-- Crear nuevas políticas RLS más simples para todas las categorías
-- Solo los usuarios autenticados pueden ver sus propias categorías
CREATE POLICY "Los usuarios pueden ver sus categorías" ON public.categorias
  FOR SELECT USING (auth.uid() = usuario_id);

-- Solo los usuarios autenticados pueden insertar sus categorías
CREATE POLICY "Los usuarios pueden crear categorías" ON public.categorias
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Solo los usuarios autenticados pueden actualizar sus categorías
CREATE POLICY "Los usuarios pueden actualizar sus categorías" ON public.categorias
  FOR UPDATE USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Solo los usuarios autenticados pueden eliminar sus categorías
CREATE POLICY "Los usuarios pueden eliminar sus categorías" ON public.categorias
  FOR DELETE USING (auth.uid() = usuario_id);