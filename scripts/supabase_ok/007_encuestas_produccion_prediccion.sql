-- Encuestas dinamicas y produccion cientifica sincronizada.

ALTER TABLE public.productos_cientificos
  ADD COLUMN IF NOT EXISTS descripcion TEXT,
  ADD COLUMN IF NOT EXISTS evidencia_url TEXT;

ALTER TABLE public.productos_cientificos DROP CONSTRAINT IF EXISTS productos_cientificos_tipo_check;
ALTER TABLE public.productos_cientificos ADD CONSTRAINT productos_cientificos_tipo_check
  CHECK (tipo IN ('alto_impacto', 'regional', 'articulo_scopus', 'articulo_latindex'));

UPDATE public.productos_cientificos
SET tipo = CASE
  WHEN tipo IN ('articulo_scopus', 'alto_impacto') THEN 'alto_impacto'
  WHEN tipo IN ('articulo_latindex', 'regional') THEN 'regional'
  ELSE tipo
END
WHERE tipo IN ('articulo_scopus', 'articulo_latindex', 'alto_impacto', 'regional');

ALTER TABLE public.productos_cientificos DROP CONSTRAINT IF EXISTS productos_cientificos_estado_check;
ALTER TABLE public.productos_cientificos ADD CONSTRAINT productos_cientificos_estado_check
  CHECK (estado IN ('pendiente', 'en_redaccion', 'en_revision', 'publicado'));

CREATE TABLE IF NOT EXISTS public.productos_cientificos_investigadores (
  id_producto UUID NOT NULL REFERENCES public.productos_cientificos(id) ON DELETE CASCADE,
  id_investigador UUID NOT NULL REFERENCES public.perfiles_usuario(id) ON DELETE CASCADE,
  PRIMARY KEY (id_producto, id_investigador)
);

ALTER TABLE public.productos_cientificos_investigadores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "productos_investigadores_select_equipo" ON public.productos_cientificos_investigadores;
CREATE POLICY "productos_investigadores_select_equipo" ON public.productos_cientificos_investigadores
  FOR SELECT USING (public.get_my_rol() IN ('administradora', 'investigadora', 'formadora', 'institucion_aliada'));

DROP POLICY IF EXISTS "productos_investigadores_write" ON public.productos_cientificos_investigadores;
CREATE POLICY "productos_investigadores_write" ON public.productos_cientificos_investigadores
  FOR ALL USING (public.get_my_rol() IN ('administradora', 'investigadora'))
  WITH CHECK (public.get_my_rol() IN ('administradora', 'investigadora'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.productos_cientificos_investigadores TO authenticated;

DROP POLICY IF EXISTS "Encuestas escritura admin" ON public.encuestas;
CREATE POLICY "Encuestas escritura admin" ON public.encuestas
  FOR ALL USING (public.get_my_rol() = 'administradora')
  WITH CHECK (public.get_my_rol() = 'administradora');

DROP POLICY IF EXISTS "Bloques escritura admin" ON public.encuesta_bloques;
CREATE POLICY "Bloques escritura admin" ON public.encuesta_bloques
  FOR ALL USING (public.get_my_rol() = 'administradora')
  WITH CHECK (public.get_my_rol() = 'administradora');

DROP POLICY IF EXISTS "Preguntas escritura admin" ON public.encuesta_preguntas;
CREATE POLICY "Preguntas escritura admin" ON public.encuesta_preguntas
  FOR ALL USING (public.get_my_rol() = 'administradora')
  WITH CHECK (public.get_my_rol() = 'administradora');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.encuestas, public.encuesta_bloques, public.encuesta_preguntas TO authenticated;

DROP POLICY IF EXISTS "cuestionario_limpio_select_roles_dashboard" ON public.cuestionario_limpio_respuestas;
CREATE POLICY "cuestionario_limpio_select_roles_dashboard" ON public.cuestionario_limpio_respuestas
  FOR SELECT USING (public.get_my_rol() IN ('administradora', 'investigadora', 'formadora', 'institucion_aliada'));

DROP POLICY IF EXISTS "cuestionario_limpio_admin_write" ON public.cuestionario_limpio_respuestas;
CREATE POLICY "cuestionario_limpio_admin_write" ON public.cuestionario_limpio_respuestas
  FOR ALL USING (public.get_my_rol() = 'administradora')
  WITH CHECK (public.get_my_rol() = 'administradora');

CREATE INDEX IF NOT EXISTS productos_cientificos_investigadores_investigador_idx
  ON public.productos_cientificos_investigadores (id_investigador);
