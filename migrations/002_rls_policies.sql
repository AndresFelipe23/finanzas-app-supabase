-- Habilitar RLS (Row Level Security) en todas las tablas
alter table public.users enable row level security;
alter table public.cuentas enable row level security;
alter table public.categorias enable row level security;
alter table public.transacciones enable row level security;
alter table public.presupuestos enable row level security;
alter table public.metas_ahorro enable row level security;

-- Políticas para users
create policy "Los usuarios pueden ver su propio perfil" on public.users
  for select using (auth.uid() = id);

create policy "Los usuarios pueden actualizar su propio perfil" on public.users
  for update using (auth.uid() = id);

-- Políticas para cuentas
create policy "Los usuarios pueden ver sus propias cuentas" on public.cuentas
  for select using (auth.uid() = usuario_id);

create policy "Los usuarios pueden insertar sus propias cuentas" on public.cuentas
  for insert with check (auth.uid() = usuario_id);

create policy "Los usuarios pueden actualizar sus propias cuentas" on public.cuentas
  for update using (auth.uid() = usuario_id);

create policy "Los usuarios pueden eliminar sus propias cuentas" on public.cuentas
  for delete using (auth.uid() = usuario_id);

-- Políticas para categorías
create policy "Los usuarios pueden ver sus propias categorías" on public.categorias
  for select using (auth.uid() = usuario_id or usuario_id is null);

create policy "Los usuarios pueden insertar sus propias categorías" on public.categorias
  for insert with check (auth.uid() = usuario_id);

create policy "Los usuarios pueden actualizar sus propias categorías" on public.categorias
  for update using (auth.uid() = usuario_id);

create policy "Los usuarios pueden eliminar sus propias categorías" on public.categorias
  for delete using (auth.uid() = usuario_id);

-- Políticas para transacciones
create policy "Los usuarios pueden ver sus propias transacciones" on public.transacciones
  for select using (auth.uid() = usuario_id);

create policy "Los usuarios pueden insertar sus propias transacciones" on public.transacciones
  for insert with check (auth.uid() = usuario_id);

create policy "Los usuarios pueden actualizar sus propias transacciones" on public.transacciones
  for update using (auth.uid() = usuario_id);

create policy "Los usuarios pueden eliminar sus propias transacciones" on public.transacciones
  for delete using (auth.uid() = usuario_id);

-- Políticas para presupuestos
create policy "Los usuarios pueden ver sus propios presupuestos" on public.presupuestos
  for select using (auth.uid() = usuario_id);

create policy "Los usuarios pueden insertar sus propios presupuestos" on public.presupuestos
  for insert with check (auth.uid() = usuario_id);

create policy "Los usuarios pueden actualizar sus propios presupuestos" on public.presupuestos
  for update using (auth.uid() = usuario_id);

create policy "Los usuarios pueden eliminar sus propios presupuestos" on public.presupuestos
  for delete using (auth.uid() = usuario_id);

-- Políticas para metas de ahorro
create policy "Los usuarios pueden ver sus propias metas" on public.metas_ahorro
  for select using (auth.uid() = usuario_id);

create policy "Los usuarios pueden insertar sus propias metas" on public.metas_ahorro
  for insert with check (auth.uid() = usuario_id);

create policy "Los usuarios pueden actualizar sus propias metas" on public.metas_ahorro
  for update using (auth.uid() = usuario_id);

create policy "Los usuarios pueden eliminar sus propias metas" on public.metas_ahorro
  for delete using (auth.uid() = usuario_id);
