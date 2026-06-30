-- =============================================================================
-- Documentos del proyecto
-- Gestion documental para la pagina Proyecto
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.documentos_proyecto (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT NOT NULL DEFAULT 'General',
  nombre_archivo_original TEXT NOT NULL DEFAULT '',
  archivo_nombre TEXT NOT NULL,
  archivo_path TEXT NOT NULL,
  archivo_tipo TEXT,
  archivo_tamano BIGINT,
  enlace_externo TEXT,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  orden INTEGER NOT NULL DEFAULT 0,
  creado_por UUID REFERENCES public.perfiles_usuario(id) ON DELETE SET NULL,
  actualizado_por UUID REFERENCES public.perfiles_usuario(id) ON DELETE SET NULL,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS documentos_proyecto_visible_idx
  ON public.documentos_proyecto (visible, orden, fecha_creacion DESC);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos-proyecto',
  'documentos-proyecto',
  FALSE,
  20971520,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "documentos_proyecto_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "documentos_proyecto_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "documentos_proyecto_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "documentos_proyecto_storage_delete" ON storage.objects;

CREATE POLICY "documentos_proyecto_storage_select"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'documentos-proyecto');

CREATE POLICY "documentos_proyecto_storage_insert"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'documentos-proyecto' AND public.get_my_rol() = 'administradora');

CREATE POLICY "documentos_proyecto_storage_update"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'documentos-proyecto' AND public.get_my_rol() = 'administradora')
  WITH CHECK (bucket_id = 'documentos-proyecto' AND public.get_my_rol() = 'administradora');

CREATE POLICY "documentos_proyecto_storage_delete"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'documentos-proyecto' AND public.get_my_rol() = 'administradora');

ALTER TABLE public.documentos_proyecto ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documentos_proyecto_select_roles" ON public.documentos_proyecto;
CREATE POLICY "documentos_proyecto_select_roles"
  ON public.documentos_proyecto
  FOR SELECT
  USING (
    public.get_my_rol() IN ('administradora', 'investigadora', 'formadora', 'institucion_aliada')
  );

DROP POLICY IF EXISTS "documentos_proyecto_admin_write" ON public.documentos_proyecto;
CREATE POLICY "documentos_proyecto_admin_write"
  ON public.documentos_proyecto
  FOR ALL
  USING (public.get_my_rol() = 'administradora')
  WITH CHECK (public.get_my_rol() = 'administradora');
