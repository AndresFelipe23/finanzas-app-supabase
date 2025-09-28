-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- Tabla de perfiles de usuario (extiende auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  nombre text not null,
  foto_perfil text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de cuentas financieras
create table public.cuentas (
  id uuid default uuid_generate_v4() primary key,
  usuario_id uuid references public.users(id) on delete cascade not null,
  nombre text not null,
  saldo decimal(15,2) not null default 0,
  tipo text not null check (tipo in ('efectivo', 'ahorro', 'credito', 'inversion')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de categorías
create table public.categorias (
  id uuid default uuid_generate_v4() primary key,
  usuario_id uuid references public.users(id) on delete cascade,
  nombre text not null,
  icono text not null,
  color text not null,
  tipo text not null check (tipo in ('ingreso', 'gasto')),
  es_personalizada boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de transacciones
create table public.transacciones (
  id uuid default uuid_generate_v4() primary key,
  usuario_id uuid references public.users(id) on delete cascade not null,
  cuenta_id uuid references public.cuentas(id) on delete cascade not null,
  categoria_id uuid references public.categorias(id) on delete set null,
  monto decimal(15,2) not null,
  descripcion text,
  fecha date not null,
  tipo text not null check (tipo in ('ingreso', 'gasto')),
  es_recurrente boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de presupuestos
create table public.presupuestos (
  id uuid default uuid_generate_v4() primary key,
  usuario_id uuid references public.users(id) on delete cascade not null,
  categoria_id uuid references public.categorias(id) on delete cascade not null,
  limite decimal(15,2) not null,
  mes integer not null check (mes >= 1 and mes <= 12),
  ano integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(usuario_id, categoria_id, mes, ano)
);

-- Tabla de metas de ahorro
create table public.metas_ahorro (
  id uuid default uuid_generate_v4() primary key,
  usuario_id uuid references public.users(id) on delete cascade not null,
  nombre text not null,
  cantidad_objetivo decimal(15,2) not null,
  cantidad_actual decimal(15,2) not null default 0,
  fecha_limite date not null,
  descripcion text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices para mejorar el rendimiento
create index idx_cuentas_usuario_id on public.cuentas(usuario_id);
create index idx_categorias_usuario_id on public.categorias(usuario_id);
create index idx_transacciones_usuario_id on public.transacciones(usuario_id);
create index idx_transacciones_fecha on public.transacciones(fecha);
create index idx_transacciones_cuenta_id on public.transacciones(cuenta_id);
create index idx_presupuestos_usuario_id on public.presupuestos(usuario_id);
create index idx_metas_ahorro_usuario_id on public.metas_ahorro(usuario_id);

-- Función para actualizar updated_at automáticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers para actualizar updated_at
create trigger update_users_updated_at before update on public.users
  for each row execute function update_updated_at_column();

create trigger update_cuentas_updated_at before update on public.cuentas
  for each row execute function update_updated_at_column();

create trigger update_transacciones_updated_at before update on public.transacciones
  for each row execute function update_updated_at_column();

create trigger update_presupuestos_updated_at before update on public.presupuestos
  for each row execute function update_updated_at_column();

create trigger update_metas_ahorro_updated_at before update on public.metas_ahorro
  for each row execute function update_updated_at_column();
