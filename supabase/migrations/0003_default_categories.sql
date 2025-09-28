-- Insertar categorías de gastos por defecto
INSERT INTO public.categorias (nombre, icono, color, tipo, es_personalizada)
VALUES
  ('Alimentación', 'Utensils', '#ef4444', 'gasto', false),
  ('Transporte', 'Car', '#f97316', 'gasto', false),
  ('Vivienda', 'Home', '#eab308', 'gasto', false),
  ('Facturas', 'FileText', '#84cc16', 'gasto', false),
  ('Salud', 'HeartPulse', '#22c55e', 'gasto', false),
  ('Entretenimiento', 'Ticket', '#10b981', 'gasto', false),
  ('Ropa', 'Shirt', '#06b6d4', 'gasto', false),
  ('Educación', 'BookOpen', '#3b82f6', 'gasto', false),
  ('Cuidado Personal', 'Sparkles', '#6366f1', 'gasto', false),
  ('Regalos', 'Gift', '#8b5cf6', 'gasto', false),
  ('Otros Gastos', 'MoreHorizontal', '#a855f7', 'gasto', false);

-- Insertar categorías de ingresos por defecto
INSERT INTO public.categorias (nombre, icono, color, tipo, es_personalizada)
VALUES
  ('Salario', 'Briefcase', '#16a34a', 'ingreso', false),
  ('Freelance', 'Laptop', '#65a30d', 'ingreso', false),
  ('Inversiones', 'TrendingUp', '#059669', 'ingreso', false),
  ('Regalos', 'Gift', '#0d9488', 'ingreso', false),
  ('Otros Ingresos', 'MoreHorizontal', '#0f766e', 'ingreso', false);
