-- Cursos formativos y tareas asociadas.
-- Ejecutar una vez en el SQL Editor de Supabase.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL CHECK (length(trim(titulo)) > 0),
  descripcion TEXT NOT NULL CHECK (length(trim(descripcion)) > 0),
  enlace TEXT NOT NULL CHECK (length(trim(enlace)) > 0),
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  creado_por UUID REFERENCES public.perfiles_usuario(id) ON DELETE SET NULL,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tareas_curso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_curso UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL CHECK (length(trim(titulo)) > 0),
  descripcion TEXT,
  fecha_limite TIMESTAMPTZ NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  creado_por UUID REFERENCES public.perfiles_usuario(id) ON DELETE SET NULL,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.entregas_tarea (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tarea UUID NOT NULL REFERENCES public.tareas_curso(id) ON DELETE CASCADE,
  id_participante UUID NOT NULL REFERENCES public.perfiles_usuario(id) ON DELETE CASCADE,
  archivo_path TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL,
  fecha_entrega TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id_tarea, id_participante)
);

ALTER TABLE public.cursos ALTER COLUMN enlace DROP NOT NULL;
ALTER TABLE public.cursos ALTER COLUMN enlace SET DEFAULT NULL;
ALTER TABLE public.cursos
  ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'en_diseno';
ALTER TABLE public.cursos DROP CONSTRAINT IF EXISTS cursos_estado_check;
ALTER TABLE public.cursos ADD CONSTRAINT cursos_estado_check
  CHECK (estado IN ('borrador', 'en_diseno', 'en_validacion', 'completado'));

CREATE TABLE IF NOT EXISTS public.modulos_curso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_curso UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL CHECK (length(trim(titulo)) > 0),
  contenido_html TEXT NOT NULL DEFAULT '',
  orden INTEGER NOT NULL DEFAULT 1 CHECK (orden > 0),
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tareas_curso
  ADD COLUMN IF NOT EXISTS id_modulo UUID REFERENCES public.modulos_curso(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS public.calificaciones_entrega (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_entrega UUID NOT NULL UNIQUE REFERENCES public.entregas_tarea(id) ON DELETE CASCADE,
  calificacion NUMERIC(4,2) NOT NULL CHECK (calificacion >= 0 AND calificacion <= 10),
  retroalimentacion TEXT,
  calificado_por UUID REFERENCES public.perfiles_usuario(id) ON DELETE SET NULL,
  fecha_calificacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tareas_curso_fecha_limite_idx
  ON public.tareas_curso (fecha_limite);

CREATE INDEX IF NOT EXISTS tareas_curso_id_curso_idx
  ON public.tareas_curso (id_curso);

CREATE INDEX IF NOT EXISTS entregas_tarea_participante_idx
  ON public.entregas_tarea (id_participante);

CREATE INDEX IF NOT EXISTS modulos_curso_orden_idx
  ON public.modulos_curso (id_curso, orden);

CREATE INDEX IF NOT EXISTS tareas_curso_modulo_idx
  ON public.tareas_curso (id_modulo);

ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas_curso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas_tarea ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos_curso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calificaciones_entrega ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "perfiles_select_encargados_formacion" ON public.perfiles_usuario;
CREATE POLICY "perfiles_select_encargados_formacion" ON public.perfiles_usuario
  FOR SELECT USING (
    public.get_my_rol() IN ('administradora', 'investigadora', 'formadora')
  );

DROP POLICY IF EXISTS "cursos_select" ON public.cursos;
CREATE POLICY "cursos_select" ON public.cursos
  FOR SELECT USING (
    visible OR public.get_my_rol() IN ('administradora', 'investigadora', 'formadora')
  );

DROP POLICY IF EXISTS "cursos_manage" ON public.cursos;
CREATE POLICY "cursos_manage" ON public.cursos
  FOR ALL USING (
    public.get_my_rol() IN ('administradora', 'investigadora', 'formadora')
  ) WITH CHECK (
    public.get_my_rol() IN ('administradora', 'investigadora', 'formadora')
  );

DROP POLICY IF EXISTS "tareas_select" ON public.tareas_curso;
CREATE POLICY "tareas_select" ON public.tareas_curso
  FOR SELECT USING (
    (
      visible AND EXISTS (
        SELECT 1 FROM public.cursos c
        WHERE c.id = id_curso AND c.visible
      )
    ) OR public.get_my_rol() IN ('administradora', 'investigadora', 'formadora')
  );

DROP POLICY IF EXISTS "tareas_manage" ON public.tareas_curso;
CREATE POLICY "tareas_manage" ON public.tareas_curso
  FOR ALL USING (
    public.get_my_rol() IN ('administradora', 'investigadora', 'formadora')
  ) WITH CHECK (
    public.get_my_rol() IN ('administradora', 'investigadora', 'formadora')
  );

DROP POLICY IF EXISTS "modulos_select" ON public.modulos_curso;
CREATE POLICY "modulos_select" ON public.modulos_curso
  FOR SELECT USING (
    (
      visible AND EXISTS (
        SELECT 1 FROM public.cursos c WHERE c.id = id_curso AND c.visible
      )
    ) OR public.get_my_rol() IN ('administradora', 'investigadora', 'formadora')
  );

DROP POLICY IF EXISTS "modulos_manage" ON public.modulos_curso;
CREATE POLICY "modulos_manage" ON public.modulos_curso
  FOR ALL USING (
    public.get_my_rol() IN ('administradora', 'investigadora', 'formadora')
  ) WITH CHECK (
    public.get_my_rol() IN ('administradora', 'investigadora', 'formadora')
  );

DROP POLICY IF EXISTS "entregas_select" ON public.entregas_tarea;
CREATE POLICY "entregas_select" ON public.entregas_tarea
  FOR SELECT USING (
    id_participante = auth.uid()
    OR public.get_my_rol() IN ('administradora', 'investigadora', 'formadora')
  );

DROP POLICY IF EXISTS "entregas_participante_insert" ON public.entregas_tarea;
CREATE POLICY "entregas_participante_insert" ON public.entregas_tarea
  FOR INSERT WITH CHECK (id_participante = auth.uid());

DROP POLICY IF EXISTS "entregas_participante_update" ON public.entregas_tarea;
CREATE POLICY "entregas_participante_update" ON public.entregas_tarea
  FOR UPDATE USING (id_participante = auth.uid())
  WITH CHECK (id_participante = auth.uid());

DROP POLICY IF EXISTS "calificaciones_select" ON public.calificaciones_entrega;
CREATE POLICY "calificaciones_select" ON public.calificaciones_entrega
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.entregas_tarea e
      WHERE e.id = id_entrega AND e.id_participante = auth.uid()
    ) OR public.get_my_rol() IN ('administradora', 'investigadora', 'formadora')
  );

DROP POLICY IF EXISTS "calificaciones_manage" ON public.calificaciones_entrega;
CREATE POLICY "calificaciones_manage" ON public.calificaciones_entrega
  FOR ALL USING (
    public.get_my_rol() IN ('administradora', 'investigadora', 'formadora')
  ) WITH CHECK (
    public.get_my_rol() IN ('administradora', 'investigadora', 'formadora')
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('entregas-tareas', 'entregas-tareas', FALSE, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "entregas_storage_insert" ON storage.objects;
CREATE POLICY "entregas_storage_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'entregas-tareas'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "entregas_storage_select" ON storage.objects;
CREATE POLICY "entregas_storage_select" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'entregas-tareas'
    AND (
      (storage.foldername(name))[1] = auth.uid()::TEXT
      OR public.get_my_rol() IN ('administradora', 'investigadora', 'formadora')
    )
  );

DROP POLICY IF EXISTS "entregas_storage_update" ON storage.objects;
CREATE POLICY "entregas_storage_update" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'entregas-tareas'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "entregas_storage_delete" ON storage.objects;
CREATE POLICY "entregas_storage_delete" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'entregas-tareas'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

GRANT SELECT ON public.cursos, public.modulos_curso, public.tareas_curso, public.entregas_tarea, public.calificaciones_entrega TO authenticated;
GRANT INSERT, UPDATE ON public.entregas_tarea TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cursos, public.modulos_curso, public.tareas_curso, public.calificaciones_entrega TO authenticated;
