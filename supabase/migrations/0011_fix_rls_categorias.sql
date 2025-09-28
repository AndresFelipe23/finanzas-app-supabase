-- Rehabilitar RLS en categorías con políticas correctas
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "categorias_select_policy" ON public.categorias;
DROP POLICY IF EXISTS "categorias_insert_policy" ON public.categorias;
DROP POLICY IF EXISTS "categorias_update_policy" ON public.categorias;
DROP POLICY IF EXISTS "categorias_delete_policy" ON public.categorias;

-- Crear políticas RLS correctas para categorías

-- Política de SELECT: Los usuarios pueden ver sus propias categorías
CREATE POLICY "categorias_select_policy" ON public.categorias
    FOR SELECT USING (
        auth.uid() = usuario_id
    );

-- Política de INSERT: Los usuarios pueden crear categorías para sí mismos
CREATE POLICY "categorias_insert_policy" ON public.categorias
    FOR INSERT WITH CHECK (
        auth.uid() = usuario_id
    );

-- Política de UPDATE: Los usuarios pueden actualizar sus propias categorías
CREATE POLICY "categorias_update_policy" ON public.categorias
    FOR UPDATE USING (
        auth.uid() = usuario_id
    ) WITH CHECK (
        auth.uid() = usuario_id
    );

-- Política de DELETE: Los usuarios pueden eliminar sus propias categorías
CREATE POLICY "categorias_delete_policy" ON public.categorias
    FOR DELETE USING (
        auth.uid() = usuario_id
    );

-- Verificar que los permisos están establecidos correctamente
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categorias TO authenticated;