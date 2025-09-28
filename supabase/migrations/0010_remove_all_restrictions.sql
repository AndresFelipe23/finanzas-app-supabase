-- Eliminar TODAS las políticas RLS de categorías
DROP POLICY IF EXISTS "categorias_select_policy" ON public.categorias;
DROP POLICY IF EXISTS "categorias_insert_policy" ON public.categorias;
DROP POLICY IF EXISTS "categorias_update_policy" ON public.categorias;
DROP POLICY IF EXISTS "categorias_delete_policy" ON public.categorias;

-- También eliminar cualquier política que pueda existir con nombres anteriores
DROP POLICY IF EXISTS "Los usuarios pueden ver sus categorías" ON public.categorias;
DROP POLICY IF EXISTS "Los usuarios pueden crear categorías" ON public.categorias;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus categorías" ON public.categorias;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus categorías" ON public.categorias;

-- DESHABILITAR completamente RLS para categorías
ALTER TABLE public.categorias DISABLE ROW LEVEL SECURITY;

-- Dar permisos completos a usuarios autenticados
GRANT ALL ON public.categorias TO authenticated;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_categorias_usuario_id ON public.categorias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON public.categorias(tipo);