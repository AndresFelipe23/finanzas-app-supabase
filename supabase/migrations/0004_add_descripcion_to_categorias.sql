-- Agregar columna descripcion a la tabla categorias
alter table public.categorias 
add column descripcion text;

-- Comentario para la columna
comment on column public.categorias.descripcion is 'Descripción opcional de la categoría';
