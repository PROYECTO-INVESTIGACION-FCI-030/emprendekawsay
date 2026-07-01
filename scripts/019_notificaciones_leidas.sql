CREATE TABLE IF NOT EXISTS public.notificaciones_leidas (
  id BIGSERIAL PRIMARY KEY,
  id_notificacion TEXT NOT NULL,
  id_usuario UUID NOT NULL,
  fecha_lectura TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT notificaciones_leidas_unica UNIQUE (id_notificacion, id_usuario)
);

CREATE INDEX IF NOT EXISTS notificaciones_leidas_usuario_idx
  ON public.notificaciones_leidas USING btree (id_usuario);

CREATE INDEX IF NOT EXISTS notificaciones_leidas_notificacion_idx
  ON public.notificaciones_leidas USING btree (id_notificacion);

ALTER TABLE public.notificaciones_leidas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notificaciones_leidas_select_propias" ON public.notificaciones_leidas;
CREATE POLICY "notificaciones_leidas_select_propias"
  ON public.notificaciones_leidas
  FOR SELECT
  TO authenticated
  USING (id_usuario = auth.uid());

DROP POLICY IF EXISTS "notificaciones_leidas_insert_propias" ON public.notificaciones_leidas;
CREATE POLICY "notificaciones_leidas_insert_propias"
  ON public.notificaciones_leidas
  FOR INSERT
  TO authenticated
  WITH CHECK (id_usuario = auth.uid());

DROP POLICY IF EXISTS "notificaciones_leidas_delete_propias" ON public.notificaciones_leidas;
CREATE POLICY "notificaciones_leidas_delete_propias"
  ON public.notificaciones_leidas
  FOR DELETE
  TO authenticated
  USING (id_usuario = auth.uid());
