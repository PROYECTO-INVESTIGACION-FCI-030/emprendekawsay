-- =============================================================================
-- Kawsay Emprende Guayaquil - encuesta inicial normalizada por bloque
-- Modelo: una tabla por bloque y una columna por pregunta del bloque.
-- Las preguntas de seleccion multiple usan TEXT[].
-- Ejecutar despues de 002_schema_normalizado_kawsay.sql.
-- =============================================================================

ALTER TABLE public.encuestas_iniciales
  ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now();

-- Datos sociodemograficos
ALTER TABLE public.encuesta_datos_sociodemograficos
  ADD COLUMN IF NOT EXISTS parroquia TEXT,
  ADD COLUMN IF NOT EXISTS parroquia_otro TEXT,
  ADD COLUMN IF NOT EXISTS sector_especifico TEXT,
  ADD COLUMN IF NOT EXISTS lugar_procedencia TEXT,
  ADD COLUMN IF NOT EXISTS edad_rango TEXT,
  ADD COLUMN IF NOT EXISTS nivel_instruccion TEXT,
  ADD COLUMN IF NOT EXISTS estado_civil TEXT,
  ADD COLUMN IF NOT EXISTS dependientes_economicos TEXT,
  ADD COLUMN IF NOT EXISTS autoidentificacion_cultural TEXT,
  ADD COLUMN IF NOT EXISTS pueblo_nacionalidad TEXT,
  ADD COLUMN IF NOT EXISTS autoidentificacion_otro TEXT;

-- Informacion del emprendimiento
ALTER TABLE public.encuesta_informacion_emprendimiento
  ADD COLUMN IF NOT EXISTS tiempo_emprendimiento TEXT,
  ADD COLUMN IF NOT EXISTS sector_principal TEXT,
  ADD COLUMN IF NOT EXISTS sector_principal_otro TEXT,
  ADD COLUMN IF NOT EXISTS numero_trabajadores TEXT,
  ADD COLUMN IF NOT EXISTS ingreso_mensual TEXT;

-- Bloque 1. Gestion empresarial y administrativa
ALTER TABLE public.encuesta_gestion_empresarial
  ADD COLUMN IF NOT EXISTS tiene_ruc_permisos TEXT,
  ADD COLUMN IF NOT EXISTS paga_impuestos_permisos TEXT,
  ADD COLUMN IF NOT EXISTS contrata_trabajadores TEXT,
  ADD COLUMN IF NOT EXISTS formalizacion_contratacion TEXT,
  ADD COLUMN IF NOT EXISTS formalizacion_contratacion_otro TEXT,
  ADD COLUMN IF NOT EXISTS registra_compras_ventas TEXT,
  ADD COLUMN IF NOT EXISTS organiza_metas_tareas TEXT;

-- Bloque 2. Finanzas y sostenibilidad economica
ALTER TABLE public.encuesta_finanzas
  ADD COLUMN IF NOT EXISTS solicita_creditos TEXT,
  ADD COLUMN IF NOT EXISTS institucion_credito TEXT,
  ADD COLUMN IF NOT EXISTS institucion_credito_otro TEXT,
  ADD COLUMN IF NOT EXISTS ahorra_reinvierte TEXT,
  ADD COLUMN IF NOT EXISTS registra_dinero TEXT,
  ADD COLUMN IF NOT EXISTS define_precios_costos TEXT;

-- Bloque 3. Marketing y ventas
ALTER TABLE public.encuesta_marketing_ventas
  ADD COLUMN IF NOT EXISTS promociona_negocio TEXT,
  ADD COLUMN IF NOT EXISTS formas_promocion TEXT[],
  ADD COLUMN IF NOT EXISTS formas_promocion_otro TEXT,
  ADD COLUMN IF NOT EXISTS buena_atencion TEXT,
  ADD COLUMN IF NOT EXISTS cuida_calidad TEXT,
  ADD COLUMN IF NOT EXISTS integra_cultura TEXT,
  ADD COLUMN IF NOT EXISTS elementos_culturales TEXT[],
  ADD COLUMN IF NOT EXISTS elementos_culturales_otro TEXT,
  ADD COLUMN IF NOT EXISTS adapta_productos TEXT;

-- Bloque 4. Tecnologia y digitalizacion
ALTER TABLE public.encuesta_tecnologia_digitalizacion
  ADD COLUMN IF NOT EXISTS dispositivo_internet TEXT,
  ADD COLUMN IF NOT EXISTS dispositivos TEXT[],
  ADD COLUMN IF NOT EXISTS dispositivos_otro TEXT,
  ADD COLUMN IF NOT EXISTS usa_apps_digitales TEXT,
  ADD COLUMN IF NOT EXISTS apps_utilizadas TEXT[],
  ADD COLUMN IF NOT EXISTS apps_utilizadas_otro TEXT,
  ADD COLUMN IF NOT EXISTS usa_pagos_digitales TEXT,
  ADD COLUMN IF NOT EXISTS pagos_digitales TEXT[],
  ADD COLUMN IF NOT EXISTS pagos_digitales_otro TEXT,
  ADD COLUMN IF NOT EXISTS vende_en_linea TEXT,
  ADD COLUMN IF NOT EXISTS usa_ia TEXT,
  ADD COLUMN IF NOT EXISTS actividades_ia TEXT[],
  ADD COLUMN IF NOT EXISTS actividades_ia_otro TEXT,
  ADD COLUMN IF NOT EXISTS dificultad_tecnologia TEXT;

-- Bloque 5. Capital social y redes de apoyo
ALTER TABLE public.encuesta_capital_social_redes
  ADD COLUMN IF NOT EXISTS participa_capacitaciones TEXT,
  ADD COLUMN IF NOT EXISTS tipos_capacitaciones TEXT[],
  ADD COLUMN IF NOT EXISTS tipos_capacitaciones_otro TEXT,
  ADD COLUMN IF NOT EXISTS organizaciones_capacitacion TEXT[],
  ADD COLUMN IF NOT EXISTS organizaciones_capacitacion_otro TEXT,
  ADD COLUMN IF NOT EXISTS apoyo_no_capacitacion TEXT,
  ADD COLUMN IF NOT EXISTS origen_apoyo TEXT[],
  ADD COLUMN IF NOT EXISTS origen_apoyo_otro TEXT,
  ADD COLUMN IF NOT EXISTS participa_redes TEXT,
  ADD COLUMN IF NOT EXISTS redes_participa TEXT[],
  ADD COLUMN IF NOT EXISTS redes_participa_otro TEXT;

-- Bloque 6. Aspectos personales y familiares
ALTER TABLE public.encuesta_aspectos_personales_familiares
  ADD COLUMN IF NOT EXISTS equilibrio_familia_negocio TEXT,
  ADD COLUMN IF NOT EXISTS apoyo_familiar TEXT,
  ADD COLUMN IF NOT EXISTS tipo_apoyo_familiar TEXT[],
  ADD COLUMN IF NOT EXISTS tipo_apoyo_familiar_otro TEXT,
  ADD COLUMN IF NOT EXISTS cuida_salud TEXT,
  ADD COLUMN IF NOT EXISTS segura_continuar TEXT;

-- Bloque 7. Barreras percibidas y oportunidades de crecimiento
ALTER TABLE public.encuesta_barreras_oportunidades
  ADD COLUMN IF NOT EXISTS barreras_principales TEXT[],
  ADD COLUMN IF NOT EXISTS barreras_principales_otro TEXT,
  ADD COLUMN IF NOT EXISTS oportunidades_crecimiento TEXT[],
  ADD COLUMN IF NOT EXISTS oportunidades_crecimiento_otro TEXT;

-- Limpieza de columnas genericas o legacy que ya no forman parte del modelo.
ALTER TABLE public.encuesta_datos_sociodemograficos
  DROP COLUMN IF EXISTS respuestas,
  DROP COLUMN IF EXISTS edad,
  DROP COLUMN IF EXISTS dependientes_economicos_rango,
  DROP COLUMN IF EXISTS dependientes_economicos_min,
  DROP COLUMN IF EXISTS dependientes_economicos_max,
  DROP COLUMN IF EXISTS edad_min,
  DROP COLUMN IF EXISTS edad_max;

ALTER TABLE public.encuesta_informacion_emprendimiento
  DROP COLUMN IF EXISTS respuestas,
  DROP COLUMN IF EXISTS numero_trabajadores_rango,
  DROP COLUMN IF EXISTS ingreso_mensual_rango,
  DROP COLUMN IF EXISTS numero_trabajadores_min,
  DROP COLUMN IF EXISTS numero_trabajadores_max,
  DROP COLUMN IF EXISTS ingreso_mensual_min,
  DROP COLUMN IF EXISTS ingreso_mensual_max,
  DROP COLUMN IF EXISTS ingreso_mensual_aproximado,
  DROP COLUMN IF EXISTS descripcion_emprendimiento;

ALTER TABLE public.encuesta_gestion_empresarial
  DROP COLUMN IF EXISTS respuestas,
  DROP COLUMN IF EXISTS tiene_ruc_o_permisos,
  DROP COLUMN IF EXISTS paga_impuestos_o_renueva_permisos,
  DROP COLUMN IF EXISTS contrata_trabajadores_respuesta,
  DROP COLUMN IF EXISTS forma_contratacion,
  DROP COLUMN IF EXISTS registra_compras_materiales_ventas,
  DROP COLUMN IF EXISTS organiza_tareas_y_metas,
  DROP COLUMN IF EXISTS observaciones;

ALTER TABLE public.encuesta_finanzas
  DROP COLUMN IF EXISTS respuestas,
  DROP COLUMN IF EXISTS ha_solicitado_credito,
  DROP COLUMN IF EXISTS instituciones_financieras,
  DROP COLUMN IF EXISTS ahorra_o_reinvierte,
  DROP COLUMN IF EXISTS registra_entradas_salidas,
  DROP COLUMN IF EXISTS forma_define_precios,
  DROP COLUMN IF EXISTS necesita_capacitacion_financiera,
  DROP COLUMN IF EXISTS observaciones;

ALTER TABLE public.encuesta_marketing_ventas
  DROP COLUMN IF EXISTS respuestas,
  DROP COLUMN IF EXISTS usa_ferias_mercados,
  DROP COLUMN IF EXISTS usa_redes_sociales,
  DROP COLUMN IF EXISTS atencion_cliente,
  DROP COLUMN IF EXISTS calidad_productos_servicios,
  DROP COLUMN IF EXISTS integra_cultura_tradiciones,
  DROP COLUMN IF EXISTS adapta_productos_clientes,
  DROP COLUMN IF EXISTS observaciones;

ALTER TABLE public.encuesta_tecnologia_digitalizacion
  DROP COLUMN IF EXISTS respuestas,
  DROP COLUMN IF EXISTS tiene_dispositivo_internet,
  DROP COLUMN IF EXISTS usa_whatsapp,
  DROP COLUMN IF EXISTS usa_facebook,
  DROP COLUMN IF EXISTS usa_instagram,
  DROP COLUMN IF EXISTS usa_tiktok,
  DROP COLUMN IF EXISTS usa_comercio_en_linea,
  DROP COLUMN IF EXISTS usa_herramientas_ia,
  DROP COLUMN IF EXISTS dificultades_tecnologia;

ALTER TABLE public.encuesta_capital_social_redes
  DROP COLUMN IF EXISTS respuestas,
  DROP COLUMN IF EXISTS participo_capacitaciones,
  DROP COLUMN IF EXISTS organizaciones_capacitadoras,
  DROP COLUMN IF EXISTS recibio_apoyo_no_capacitacion,
  DROP COLUMN IF EXISTS tipo_apoyo_recibido,
  DROP COLUMN IF EXISTS participa_redes_apoyo,
  DROP COLUMN IF EXISTS redes_comunitarias;

ALTER TABLE public.encuesta_aspectos_personales_familiares
  DROP COLUMN IF EXISTS respuestas,
  DROP COLUMN IF EXISTS recibe_apoyo_familiar,
  DROP COLUMN IF EXISTS cuida_salud_mientras_trabaja,
  DROP COLUMN IF EXISTS seguridad_para_continuar,
  DROP COLUMN IF EXISTS motivacion_para_continuar,
  DROP COLUMN IF EXISTS observaciones;

ALTER TABLE public.encuesta_barreras_oportunidades
  DROP COLUMN IF EXISTS respuestas,
  DROP COLUMN IF EXISTS barreras_principales_lista,
  DROP COLUMN IF EXISTS dificultad_financiamiento,
  DROP COLUMN IF EXISTS dificultad_tramites,
  DROP COLUMN IF EXISTS falta_apoyo_familiar,
  DROP COLUMN IF EXISTS falta_capacitacion,
  DROP COLUMN IF EXISTS dificultad_clientes_mercados,
  DROP COLUMN IF EXISTS oportunidades_crecimiento_lista,
  DROP COLUMN IF EXISTS interes_nuevas_capacitaciones,
  DROP COLUMN IF EXISTS interes_tecnologia,
  DROP COLUMN IF EXISTS interes_redes_apoyo,
  DROP COLUMN IF EXISTS interes_nuevos_mercados,
  DROP COLUMN IF EXISTS interes_innovacion,
  DROP COLUMN IF EXISTS interes_cultura_tradicional;
