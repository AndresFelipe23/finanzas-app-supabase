-- 1. Habilitar la extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de perfiles de usuario (vinculada a auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  foto_perfil TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Tabla de cuentas financieras
CREATE TABLE public.cuentas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  saldo NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('efectivo', 'ahorro', 'credito', 'inversion')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Tabla de categorías
CREATE TABLE public.categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Null para categorías por defecto
  nombre TEXT NOT NULL,
  icono TEXT,
  color TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
  es_personalizada BOOLEAN DEFAULT FALSE NOT NULL
);

-- 5. Tabla de transacciones
CREATE TABLE public.transacciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  cuenta_id UUID REFERENCES public.cuentas(id) ON DELETE CASCADE NOT NULL,
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
  monto NUMERIC(15, 2) NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
  es_recurrente BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Tabla de presupuestos
CREATE TABLE public.presupuestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE CASCADE NOT NULL,
  limite NUMERIC(15, 2) NOT NULL,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(usuario_id, categoria_id, mes, ano)
);

-- 7. Tabla de metas de ahorro
CREATE TABLE public.metas_ahorro (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  cantidad_objetivo NUMERIC(15, 2) NOT NULL,
  cantidad_actual NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  fecha_limite DATE,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Índices para mejorar el rendimiento de las consultas
CREATE INDEX ON public.cuentas (usuario_id);
CREATE INDEX ON public.categorias (usuario_id);
CREATE INDEX ON public.transacciones (usuario_id, fecha);
CREATE INDEX ON public.presupuestos (usuario_id, mes, ano);
CREATE INDEX ON public.metas_ahorro (usuario_id);
