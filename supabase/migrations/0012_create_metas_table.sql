-- Crear tabla de metas
CREATE TABLE public.metas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    cantidad_objetivo DECIMAL(15,2) NOT NULL CHECK (cantidad_objetivo > 0),
    cantidad_actual DECIMAL(15,2) DEFAULT 0 CHECK (cantidad_actual >= 0),
    fecha_limite DATE NOT NULL,
    categoria VARCHAR(50),
    icono VARCHAR(50) DEFAULT 'Target',
    color VARCHAR(7) DEFAULT '#3b82f6',
    es_completada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_metas_usuario_id ON public.metas(usuario_id);
CREATE INDEX idx_metas_fecha_limite ON public.metas(fecha_limite);
CREATE INDEX idx_metas_es_completada ON public.metas(es_completada);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en metas
CREATE TRIGGER update_metas_updated_at
    BEFORE UPDATE ON public.metas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para marcar meta como completada automáticamente
CREATE OR REPLACE FUNCTION check_meta_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la cantidad actual alcanza o supera el objetivo, marcar como completada
    IF NEW.cantidad_actual >= NEW.cantidad_objetivo THEN
        NEW.es_completada = TRUE;
    ELSE
        NEW.es_completada = FALSE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar completación automática
CREATE TRIGGER check_meta_completion_trigger
    BEFORE INSERT OR UPDATE ON public.metas
    FOR EACH ROW
    EXECUTE FUNCTION check_meta_completion();

-- Habilitar RLS
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para metas
CREATE POLICY "metas_select_policy" ON public.metas
    FOR SELECT USING (
        auth.uid() = usuario_id
    );

CREATE POLICY "metas_insert_policy" ON public.metas
    FOR INSERT WITH CHECK (
        auth.uid() = usuario_id
    );

CREATE POLICY "metas_update_policy" ON public.metas
    FOR UPDATE USING (
        auth.uid() = usuario_id
    ) WITH CHECK (
        auth.uid() = usuario_id
    );

CREATE POLICY "metas_delete_policy" ON public.metas
    FOR DELETE USING (
        auth.uid() = usuario_id
    );

-- Permisos para usuarios autenticados
GRANT SELECT, INSERT, UPDATE, DELETE ON public.metas TO authenticated;