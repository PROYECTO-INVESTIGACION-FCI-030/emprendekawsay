import { createClient } from "@/lib/supabase/server"

export type CoursePrediction = {
  id: string
  bloque: string
  numeroBloque: number
  titulo: string
  descripcion: string
  brecha: number
  respuestas: number
}

type SurveyRow = Record<string, string | null>

function normalize(value: string | null | undefined) {
  return value?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase() ?? ""
}

function weak(value: string | null | undefined, terms: string[]) {
  const current = normalize(value)
  return terms.some((term) => current.includes(normalize(term)))
}

function gap(rows: SurveyRow[], checks: Array<(row: SurveyRow) => boolean>) {
  if (!rows.length || !checks.length) return 0
  const weakAnswers = rows.reduce(
    (total, row) => total + checks.reduce((sum, check) => sum + (check(row) ? 1 : 0), 0),
    0,
  )
  return Math.round((weakAnswers / (rows.length * checks.length)) * 100)
}

export async function getCoursePredictions(): Promise<CoursePrediction[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("cuestionario_limpio_respuestas")
    .select("antiguedad_emprendimiento, ingreso_mensual, nivel_instruccion, situacion_formalizacion, control_dinero, planifica_metas, reinvierte_ganancias, define_precios_costos, promocion_negocio, usa_sugerencias_clientes, dispositivo_internet, usa_apps_digitales, usa_pagos_digitales, dificultad_tecnologia, incorpora_cultura, origen_conocimiento_cultural, participa_asociaciones, interes_programa, modalidad_preferida")
    .limit(5000)

  const rows = error ? [] : (data as SurveyRow[])
  const count = rows.length
  const baseGap = gap(rows, [
    (row) => weak(row.antiguedad_emprendimiento, ["menos de 1", "1-3"]),
    (row) => weak(row.ingreso_mensual, ["100-199", "200-399"]),
    (row) => weak(row.nivel_instruccion, ["primaria", "secundaria"]),
  ])
  const financeGap = gap(rows, [
    (row) => weak(row.situacion_formalizacion, ["no", "aun", "en proceso"]),
    (row) => weak(row.control_dinero, ["no", "a veces"]),
    (row) => weak(row.planifica_metas, ["no", "a veces", "parcial"]),
    (row) => weak(row.reinvierte_ganancias, ["no", "a veces"]),
    (row) => weak(row.define_precios_costos, ["no", "a veces", "intuicion"]),
  ])
  const digitalGap = gap(rows, [
    (row) => weak(row.promocion_negocio, ["solo espero", "no"]),
    (row) => weak(row.usa_sugerencias_clientes, ["no", "a veces"]),
    (row) => weak(row.dispositivo_internet, ["no", "a veces"]),
    (row) => weak(row.usa_apps_digitales, ["no", "a veces"]),
    (row) => weak(row.usa_pagos_digitales, ["no", "a veces", "solo efectivo"]),
    (row) => !weak(row.dificultad_tecnologia, ["ninguna", "no he tenido", "sin dificultad"]),
  ])
  const cultureGap = gap(rows, [
    (row) => weak(row.incorpora_cultura, ["no", "a veces", "parcial"]),
    (row) => weak(row.origen_conocimiento_cultural, ["no", "copia"]),
    (row) => weak(row.participa_asociaciones, ["no", "me gustaria"]),
  ])
  const participationGap = gap(rows, [
    (row) => weak(row.interes_programa, ["no", "restriccion", "a veces"]),
    (row) => !normalize(row.modalidad_preferida),
  ])

  return [
    { id: "base-modelo", bloque: "Información base del negocio", numeroBloque: 1, titulo: "Modelo de negocio y propuesta de valor", descripcion: "Define clientes, propuesta de valor, canales, recursos y fuentes de ingreso para emprendimientos en etapa temprana.", brecha: baseGap, respuestas: count },
    { id: "base-crecimiento", bloque: "Información base del negocio", numeroBloque: 1, titulo: "Plan de crecimiento para microemprendimientos", descripcion: "Convierte el diagnóstico del negocio en metas medibles de ventas, capacidad productiva y sostenibilidad.", brecha: baseGap, respuestas: count },
    { id: "finanzas-control", bloque: "Gestión y finanzas", numeroBloque: 2, titulo: "Control financiero y flujo de caja", descripcion: "Registro práctico de ingresos, gastos, utilidad, ahorro y reinversión para tomar decisiones con datos.", brecha: financeGap, respuestas: count },
    { id: "finanzas-precios", bloque: "Gestión y finanzas", numeroBloque: 2, titulo: "Costos, precios y formalización del negocio", descripcion: "Calcula costos reales y precios rentables mientras organiza RUC, permisos y obligaciones básicas.", brecha: financeGap, respuestas: count },
    { id: "digital-ventas", bloque: "Marketing y tecnología", numeroBloque: 3, titulo: "Ventas digitales con WhatsApp y redes sociales", descripcion: "Crea catálogos, contenido comercial y procesos de atención que conviertan contactos en ventas.", brecha: digitalGap, respuestas: count },
    { id: "digital-pagos", bloque: "Marketing y tecnología", numeroBloque: 3, titulo: "Herramientas digitales y pagos seguros", descripcion: "Usa aplicaciones de gestión, pagos digitales y buenas prácticas de seguridad para operar el negocio.", brecha: digitalGap, respuestas: count },
    { id: "cultura-marca", bloque: "Cultura e identidad", numeroBloque: 4, titulo: "Identidad cultural aplicada a la marca", descripcion: "Transforma saberes, historias y elementos culturales en una marca autentica y respetuosa.", brecha: cultureGap, respuestas: count },
    { id: "cultura-redes", bloque: "Cultura e identidad", numeroBloque: 4, titulo: "Asociatividad y comercialización comunitaria", descripcion: "Fortalece redes entre emprendedoras, alianzas, ferias y canales colectivos de comercialización.", brecha: cultureGap, respuestas: count },
    { id: "participacion-ruta", bloque: "Participación en el programa", numeroBloque: 5, titulo: "Ruta flexible de aprendizaje emprendedor", descripcion: "Organiza el aprendizaje por metas, modalidad y disponibilidad para sostener la participación en el programa.", brecha: participationGap, respuestas: count },
    { id: "participacion-liderazgo", bloque: "Participación en el programa", numeroBloque: 5, titulo: "Liderazgo, autonomía y redes de apoyo", descripcion: "Desarrolla liderazgo personal, colaboración y estrategias para superar restricciones de participación.", brecha: participationGap, respuestas: count },
  ]
}
