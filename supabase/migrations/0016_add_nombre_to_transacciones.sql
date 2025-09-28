-- Agregar columna nombre a la tabla transacciones
ALTER TABLE public.transacciones 
ADD COLUMN nombre TEXT NOT NULL DEFAULT '';

-- Crear índice para mejorar el rendimiento en búsquedas por nombre
CREATE INDEX idx_transacciones_nombre ON public.transacciones (nombre);

-- Comentario para documentar el cambio
COMMENT ON COLUMN public.transacciones.nombre IS 'Nombre descriptivo de la transacción (ej: Compra en supermercado, Salario mensual)';
