-- Eliminar las políticas existentes para categorías
DROP POLICY IF EXISTS "Los usuarios pueden gestionar sus categorías personalizadas" ON public.categorias;

-- Crear políticas separadas para cada operación
CREATE POLICY "Los usuarios pueden insertar sus categorías personalizadas" ON public.categorias
  FOR INSERT WITH CHECK (auth.uid() = usuario_id AND es_personalizada = true);

CREATE POLICY "Los usuarios pueden actualizar sus categorías personalizadas" ON public.categorias
  FOR UPDATE USING (auth.uid() = usuario_id AND es_personalizada = true)
  WITH CHECK (auth.uid() = usuario_id AND es_personalizada = true);

CREATE POLICY "Los usuarios pueden eliminar sus categorías personalizadas" ON public.categorias
  FOR DELETE USING (auth.uid() = usuario_id AND es_personalizada = true);