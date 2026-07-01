CREATE TABLE IF NOT EXISTS public.notificaciones (
  id BIGSERIAL PRIMARY KEY,
  id_usuario UUID NULL,
  rol TEXT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'info',
  href TEXT NULL,
  accion TEXT NULL,
  leida BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT notificaciones_tipo_check CHECK (tipo IN ('info', 'alerta', 'exito'))
);

CREATE INDEX IF NOT EXISTS notificaciones_id_usuario_idx
  ON public.notificaciones USING btree (id_usuario);

CREATE INDEX IF NOT EXISTS notificaciones_rol_idx
  ON public.notificaciones USING btree (rol);

ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notificaciones_select_propias_o_por_rol" ON public.notificaciones;
CREATE POLICY "notificaciones_select_propias_o_por_rol"
  ON public.notificaciones
  FOR SELECT
  USING (
    (id_usuario IS NOT NULL AND id_usuario = auth.uid())
    OR (rol IS NOT NULL AND rol = public.get_my_rol())
  );

DROP POLICY IF EXISTS "notificaciones_insert_autorizadas" ON public.notificaciones;
CREATE POLICY "notificaciones_insert_autorizadas"
  ON public.notificaciones
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      id_usuario = auth.uid()
      OR rol IS NOT NULL
      OR public.get_my_rol() = 'administradora'
    )
  );

DROP POLICY IF EXISTS "notificaciones_update_propias_o_admin" ON public.notificaciones;
CREATE POLICY "notificaciones_update_propias_o_admin"
  ON public.notificaciones
  FOR UPDATE
  USING (
    (id_usuario IS NOT NULL AND id_usuario = auth.uid())
    OR public.get_my_rol() = 'administradora'
  )
  WITH CHECK (
    (id_usuario IS NOT NULL AND id_usuario = auth.uid())
    OR public.get_my_rol() = 'administradora'
  );
