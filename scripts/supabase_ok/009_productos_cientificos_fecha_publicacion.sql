alter table public.productos_cientificos
add column if not exists fecha_publicacion timestamptz null;

create index if not exists productos_cientificos_fecha_publicacion_idx
  on public.productos_cientificos (fecha_publicacion desc);

update public.productos_cientificos
set fecha_publicacion = coalesce(fecha_publicacion, fecha_actualizacion)
where estado = 'publicado' and fecha_publicacion is null;
