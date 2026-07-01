create table if not exists public.historial_ingresos (
  id uuid primary key default gen_random_uuid(),
  id_usuario uuid not null references auth.users (id) on delete cascade,
  nombre_usuario text null,
  email_usuario text null,
  rol_usuario text null,
  fecha_ingreso timestamptz not null default now(),
  ruta text not null,
  user_agent text null,
  accion text null,
  pagina_nombre text null
);

create index if not exists historial_ingresos_fecha_idx
  on public.historial_ingresos (fecha_ingreso desc);

create index if not exists historial_ingresos_usuario_idx
  on public.historial_ingresos (id_usuario, fecha_ingreso desc);

alter table public.historial_ingresos enable row level security;

drop policy if exists "historial_ingresos_select_admin" on public.historial_ingresos;
create policy "historial_ingresos_select_admin"
  on public.historial_ingresos
  for select
  using (public.get_my_rol() = 'administradora');

drop policy if exists "historial_ingresos_write_service" on public.historial_ingresos;
create policy "historial_ingresos_write_service"
  on public.historial_ingresos
  for insert
  with check (true);
