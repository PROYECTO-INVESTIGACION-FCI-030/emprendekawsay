-- Estructura final de la tabla cuestionario_limpio_respuestas
-- Una sola columna por pregunta, sin campos "_otro"

CREATE TABLE IF NOT EXISTS public.cuestionario_limpio_respuestas (
  id                            BIGSERIAL PRIMARY KEY,

  parroquia                     TEXT,
  sector_ubicacion              TEXT,
  antiguedad_emprendimiento     TEXT,
  sector_economico              TEXT,
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
  usa_sugerencias_clientes      TEXT,
  dispositivo_internet          TEXT,
  dispositivos_usados           TEXT,
  usa_apps_digitales            TEXT,
  apps_usadas                   TEXT,
  usa_pagos_digitales           TEXT,
  pagos_usados                  TEXT,
  dificultad_tecnologia         TEXT,
  incorpora_cultura             TEXT,
  elementos_culturales          TEXT,
  origen_conocimiento_cultural  TEXT,
  participa_asociaciones        TEXT,
  asociaciones                  TEXT,
  interes_programa              TEXT,
  contacto_programa             TEXT,
  modalidad_preferida           TEXT
);

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

NOTIFY pgrst, 'reload schema';
