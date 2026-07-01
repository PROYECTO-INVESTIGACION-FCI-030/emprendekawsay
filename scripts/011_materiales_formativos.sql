create table if not exists public.materiales_curso (
  id uuid primary key default gen_random_uuid(),
  id_curso uuid not null references public.cursos (id) on delete cascade,
  tipo text not null,
  titulo text not null,
  descripcion text null,
  enlace text null,
  visible boolean not null default true,
  orden integer not null default 1,
  creado_por uuid null references auth.users (id),
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now(),
  constraint materiales_curso_tipo_check check (
    tipo in (
      'Silabo',
      'Malla curricular',
      'Guia docente',
      'Guia de estudio o cuadernillo de trabajo',
      'Banco de reactivos o propuesta de evaluacion',
      'Rubrica de evaluacion',
      'Informe de justificacion tecnica',
      'Ficha tecnica del curso'
    )
  ),
  constraint materiales_curso_orden_check check (orden between 1 and 6)
);

create index if not exists materiales_curso_id_curso_tipo_idx
  on public.materiales_curso (id_curso, tipo, orden);

alter table public.materiales_curso enable row level security;

drop policy if exists "materiales_curso_select_publico" on public.materiales_curso;
create policy "materiales_curso_select_publico"
  on public.materiales_curso
  for select
  using (visible = true);

drop policy if exists "materiales_curso_select_gestion" on public.materiales_curso;
create policy "materiales_curso_select_gestion"
  on public.materiales_curso
  for select
  to authenticated
  using (true);

drop policy if exists "materiales_curso_write_gestion" on public.materiales_curso;
create policy "materiales_curso_write_gestion"
  on public.materiales_curso
  for all
  to authenticated
  using (public.get_my_rol() in ('administradora', 'investigadora', 'formadora'))
  with check (public.get_my_rol() in ('administradora', 'investigadora', 'formadora'));
