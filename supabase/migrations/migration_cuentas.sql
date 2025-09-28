-- Script para agregar columnas faltantes a la tabla cuentas
-- Ejecuta estos comandos en el SQL Editor de Supabase

-- Agregar columna para descripción
ALTER TABLE cuentas
ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Agregar columna para banco
ALTER TABLE cuentas
ADD COLUMN IF NOT EXISTS banco VARCHAR(100);

-- Agregar columna para número de cuenta
ALTER TABLE cuentas
ADD COLUMN IF NOT EXISTS numero_cuenta VARCHAR(50);

-- Agregar columna para límite de crédito
ALTER TABLE cuentas
ADD COLUMN IF NOT EXISTS limite_credito NUMERIC;

-- Agregar columna para tasa de interés
ALTER TABLE cuentas
ADD COLUMN IF NOT EXISTS interes NUMERIC;

-- Agregar columna para fecha de vencimiento
ALTER TABLE cuentas
ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;

-- Agregar columna para estado activo (por defecto true)
ALTER TABLE cuentas
ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT true;

-- Agregar columna para fecha de actualización
ALTER TABLE cuentas
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_cuentas_updated_at ON cuentas;
CREATE TRIGGER update_cuentas_updated_at
    BEFORE UPDATE ON cuentas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Actualizar registros existentes para que tengan activa = true
UPDATE cuentas SET activa = true WHERE activa IS NULL;