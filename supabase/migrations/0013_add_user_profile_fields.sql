-- Migración para agregar campos adicionales del perfil de usuario
-- Fecha: 2025-01-16

-- Agregar campos faltantes a la tabla users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ocupacion TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS biografia TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at automáticamente en la tabla users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Agregar comentarios para documentar los campos
COMMENT ON COLUMN public.users.telefono IS 'Número de teléfono del usuario';
COMMENT ON COLUMN public.users.fecha_nacimiento IS 'Fecha de nacimiento del usuario';
COMMENT ON COLUMN public.users.ocupacion IS 'Ocupación o profesión del usuario';
COMMENT ON COLUMN public.users.biografia IS 'Biografía o descripción personal del usuario';
COMMENT ON COLUMN public.users.updated_at IS 'Fecha de última actualización del perfil';