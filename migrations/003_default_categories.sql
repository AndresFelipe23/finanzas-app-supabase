-- Insertar categorías por defecto (sin usuario_id para que sean globales)
insert into public.categorias (nombre, icono, color, tipo, es_personalizada) values
-- Categorías de ingreso
('Salario', 'DollarSign', '#10B981', 'ingreso', false),
('Freelance', 'Briefcase', '#3B82F6', 'ingreso', false),
('Inversiones', 'TrendingUp', '#8B5CF6', 'ingreso', false),
('Bonus', 'Gift', '#F59E0B', 'ingreso', false),
('Ventas', 'ShoppingBag', '#06B6D4', 'ingreso', false),

-- Categorías de gasto
('Comida', 'Utensils', '#EF4444', 'gasto', false),
('Transporte', 'Car', '#F59E0B', 'gasto', false),
('Entretenimiento', 'Film', '#8B5CF6', 'gasto', false),
('Salud', 'Heart', '#EF4444', 'gasto', false),
('Educación', 'GraduationCap', '#06B6D4', 'gasto', false),
('Vivienda', 'Home', '#10B981', 'gasto', false),
('Ropa', 'Shirt', '#EC4899', 'gasto', false),
('Servicios', 'Zap', '#F97316', 'gasto', false),
('Compras', 'ShoppingCart', '#84CC16', 'gasto', false),
('Otros', 'MoreHorizontal', '#6B7280', 'gasto', false);
