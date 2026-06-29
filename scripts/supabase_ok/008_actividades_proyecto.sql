-- Tabla para el avance general del proyecto y las actividades del dashboard.

CREATE TABLE IF NOT EXISTS public.actividades_proyecto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT NULL,
  fecha_objetivo DATE NOT NULL,
  estado TEXT NOT NULL DEFAULT 'programado',
  orden INTEGER NOT NULL DEFAULT 1,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  creado_por UUID NULL REFERENCES public.perfiles_usuario(id) ON DELETE SET NULL,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT actividades_proyecto_estado_check
    CHECK (estado IN ('programado', 'en_proceso', 'completado', 'cancelado'))
);

CREATE INDEX IF NOT EXISTS actividades_proyecto_fecha_idx
  ON public.actividades_proyecto (fecha_objetivo);

CREATE INDEX IF NOT EXISTS actividades_proyecto_estado_idx
  ON public.actividades_proyecto (estado);

ALTER TABLE public.actividades_proyecto ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "actividades_proyecto_select_roles" ON public.actividades_proyecto;
CREATE POLICY "actividades_proyecto_select_roles"
  ON public.actividades_proyecto
  FOR SELECT
  USING (
    public.get_my_rol() IN (
      'administradora',
      'investigadora',
      'formadora',
      'institucion_aliada'
    )
  );

DROP POLICY IF EXISTS "actividades_proyecto_write_admin" ON public.actividades_proyecto;
CREATE POLICY "actividades_proyecto_write_admin"
  ON public.actividades_proyecto
  FOR ALL
  USING (public.get_my_rol() = 'administradora')
  WITH CHECK (public.get_my_rol() = 'administradora');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.actividades_proyecto TO authenticated;
