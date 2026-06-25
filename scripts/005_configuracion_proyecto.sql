-- =============================================================================
-- Kawsay Emprende Guayaquil - configuracion editable del proyecto
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.configuracion_proyecto (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  nombre TEXT NOT NULL DEFAULT 'Proyecto FCI 2025',
  descripcion TEXT NOT NULL DEFAULT 'Programa de formación y apoyo técnico para el emprendimiento de mujeres indígenas residentes en Guayaquil',
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT configuracion_proyecto_singleton CHECK (id = 1),
  CONSTRAINT configuracion_proyecto_fechas_validas CHECK (fecha_fin >= fecha_inicio)
);

INSERT INTO public.configuracion_proyecto (id, fecha_inicio, fecha_fin)
VALUES (1, DATE '2026-06-01', DATE '2028-06-30')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.configuracion_proyecto ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "configuracion_proyecto_select_roles" ON public.configuracion_proyecto;
CREATE POLICY "configuracion_proyecto_select_roles"
  ON public.configuracion_proyecto
  FOR SELECT
  USING (
    public.get_my_rol() IN (
      'administradora',
      'investigadora',
      'formadora',
      'institucion_aliada',
      'mujer_emprendedora'
    )
  );

DROP POLICY IF EXISTS "configuracion_proyecto_admin_write" ON public.configuracion_proyecto;
CREATE POLICY "configuracion_proyecto_admin_write"
  ON public.configuracion_proyecto
  FOR ALL
  USING (public.get_my_rol() = 'administradora')
  WITH CHECK (public.get_my_rol() = 'administradora');
