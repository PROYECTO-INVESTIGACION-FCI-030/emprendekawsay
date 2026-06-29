-- =============================================================================
-- Kawsay Emprende Guayaquil - fuente real para dashboard desde BD_limpia.xlsx
-- Ejecutar en Supabase antes de importar el Excel.
-- Columnas mapeadas 1:1 con los encabezados del archivo BD_limpia.xlsx
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;

-- -----------------------------------------------------------------------------
-- TABLA PRINCIPAL
-- Orden de columnas = orden exacto del Excel (columna 0 → columna 30)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cuestionario_limpio_respuestas (
  id                            BIGSERIAL PRIMARY KEY,

  ubicacion                     TEXT,
  parroquia                     TEXT,
  parroquia_otro                TEXT,
  sector_ubicacion              TEXT,
  antiguedad_emprendimiento     TEXT,
  sector_economico              TEXT,
  sector_economico_otro         TEXT,
  ingreso_mensual               TEXT,
  nivel_instruccion             TEXT,
  etnia                         TEXT,
  situacion_formalizacion       TEXT,
  control_dinero                TEXT,
  planifica_metas               TEXT,
  reinvierte_ganancias          TEXT,
  define_precios_costos         TEXT,
  promocion_negocio             TEXT,
  medios_promocion              TEXT,
  medios_promocion_otro         TEXT,
  usa_sugerencias_clientes      TEXT,
  dispositivo_internet          TEXT,
  dispositivos_usados           TEXT,
  dispositivos_usados_otro      TEXT,
  usa_apps_digitales            TEXT,
  apps_usadas                   TEXT,
  apps_usadas_otro              TEXT,
  usa_pagos_digitales           TEXT,
  pagos_usados                  TEXT,
  pagos_usados_otro             TEXT,
  dificultad_tecnologia         TEXT,
  dificultad_tecnologia_otro    TEXT,
  incorpora_cultura             TEXT,
  elementos_culturales          TEXT,
  elementos_culturales_otro     TEXT,
  origen_conocimiento_cultural  TEXT,
  participa_asociaciones        TEXT,
  asociaciones                  TEXT,
  asociaciones_otro             TEXT,
  interes_programa              TEXT,
  contacto_programa             TEXT,
  modalidad_preferida           TEXT
);

CREATE INDEX IF NOT EXISTS cuestionario_limpio_parroquia_idx
  ON public.cuestionario_limpio_respuestas (parroquia);

CREATE INDEX IF NOT EXISTS cuestionario_limpio_sector_idx
  ON public.cuestionario_limpio_respuestas (sector_economico);

CREATE INDEX IF NOT EXISTS cuestionario_limpio_etnia_idx
  ON public.cuestionario_limpio_respuestas (etnia);

ALTER TABLE public.cuestionario_limpio_respuestas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cuestionario_limpio_select_roles_dashboard" ON public.cuestionario_limpio_respuestas;
CREATE POLICY "cuestionario_limpio_select_roles_dashboard"
  ON public.cuestionario_limpio_respuestas
  FOR SELECT
  USING (
    public.get_my_rol() IN (
      'administradora',
      'investigadora',
      'formadora',
      'institucion_aliada'
    )
  );

DROP POLICY IF EXISTS "cuestionario_limpio_admin_write" ON public.cuestionario_limpio_respuestas;
CREATE POLICY "cuestionario_limpio_admin_write"
  ON public.cuestionario_limpio_respuestas
  FOR ALL
  USING (public.get_my_rol() = 'administradora')
  WITH CHECK (public.get_my_rol() = 'administradora');

CREATE OR REPLACE VIEW public.v_dashboard_cuestionario_resumen AS
SELECT
  COUNT(*)::INTEGER AS total_respuestas,
  COUNT(*) FILTER (
    WHERE lower(extensions.unaccent(coalesce(situacion_formalizacion, ''))) NOT LIKE '%aun no%'
      AND lower(extensions.unaccent(coalesce(situacion_formalizacion, ''))) NOT LIKE '%no me formalizo%'
  )::INTEGER AS formalizadas,
  COUNT(*) FILTER (
    WHERE lower(extensions.unaccent(coalesce(interes_programa, ''))) LIKE '%si%'
      OR lower(extensions.unaccent(coalesce(interes_programa, ''))) LIKE '%a veces%'
  )::INTEGER AS interesadas,
  COUNT(*) FILTER (
    WHERE lower(extensions.unaccent(coalesce(dispositivo_internet, ''))) LIKE '%no%'
      OR lower(extensions.unaccent(coalesce(dispositivo_internet, ''))) LIKE '%a veces%'
      OR lower(extensions.unaccent(coalesce(usa_apps_digitales, ''))) LIKE '%no%'
      OR lower(extensions.unaccent(coalesce(usa_apps_digitales, ''))) LIKE '%a veces%'
      OR lower(extensions.unaccent(coalesce(dificultad_tecnologia, ''))) LIKE '%falta%'
      OR lower(extensions.unaccent(coalesce(dificultad_tecnologia, ''))) LIKE '%dificultad%'
      OR lower(extensions.unaccent(coalesce(dificultad_tecnologia, ''))) LIKE '%no tengo tiempo%'
  )::INTEGER AS brecha_digital
FROM public.cuestionario_limpio_respuestas;
