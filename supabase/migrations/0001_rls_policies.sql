-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_ahorro ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla 'users'
CREATE POLICY "Los usuarios pueden ver y editar su propio perfil" ON public.users
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Políticas para la tabla 'cuentas'
CREATE POLICY "Los usuarios pueden gestionar sus propias cuentas" ON public.cuentas
  FOR ALL USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Políticas para la tabla 'categorias'
CREATE POLICY "Los usuarios pueden ver categorías por defecto y las suyas" ON public.categorias
  FOR SELECT USING (es_personalizada = false OR auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden insertar sus categorías personalizadas" ON public.categorias
  FOR INSERT WITH CHECK (auth.uid() = usuario_id AND es_personalizada = true);

CREATE POLICY "Los usuarios pueden actualizar sus categorías personalizadas" ON public.categorias
  FOR UPDATE USING (auth.uid() = usuario_id AND es_personalizada = true)
  WITH CHECK (auth.uid() = usuario_id AND es_personalizada = true);

CREATE POLICY "Los usuarios pueden eliminar sus categorías personalizadas" ON public.categorias
  FOR DELETE USING (auth.uid() = usuario_id AND es_personalizada = true);

-- Políticas para la tabla 'transacciones'
CREATE POLICY "Los usuarios pueden gestionar sus propias transacciones" ON public.transacciones
  FOR ALL USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Políticas para la tabla 'presupuestos'
CREATE POLICY "Los usuarios pueden gestionar sus propios presupuestos" ON public.presupuestos
  FOR ALL USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- Políticas para la tabla 'metas_ahorro'
CREATE POLICY "Los usuarios pueden gestionar sus propias metas de ahorro" ON public.metas_ahorro
  FOR ALL USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);
