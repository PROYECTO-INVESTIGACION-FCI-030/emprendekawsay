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

export type CourseProfileSummaryItem = {
  categoria: string
  total: number
}

export type CoursePredictionProfile = {
  totalRegistros: number
  perfilGeneral: Array<{
    etiqueta: string
    valor: string
    detalle: string
  }>
  segmentos: {
    parroquia: CourseProfileSummaryItem[]
    nivelInstruccion: CourseProfileSummaryItem[]
    sectorEconomico: CourseProfileSummaryItem[]
    ingresoMensual: CourseProfileSummaryItem[]
    modalidadPreferida: CourseProfileSummaryItem[]
    etnia: CourseProfileSummaryItem[]
    antiguedad: CourseProfileSummaryItem[]
  }
}

export type CoursePredictionResult = {
  cursos: CoursePrediction[]
  perfil: CoursePredictionProfile
}

type SurveyRow = Record<string, string | null>

type Template = {
  id: string
  numeroBloque: number
  bloque: string
  titulo: string
  descripcion: string
  score: (row: SurveyRow) => number
}

function normalize(value: string | null | undefined) {
  return value?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase() ?? ""
}

function includesAny(value: string | null | undefined, terms: string[]) {
  const current = normalize(value)
  return terms.some((term) => current.includes(normalize(term)))
}

function isWeak(value: string | null | undefined) {
  return includesAny(value, ["no", "a veces", "aun no", "en proceso", "solo", "falta", "dificultad"])
}

function positive(value: string | null | undefined) {
  return includesAny(value, ["si", "siempre", "mucho", "frecuente", "activo", "completo", "publicado"])
}

function countRows(rows: SurveyRow[], check: (row: SurveyRow) => boolean) {
  return rows.reduce((total, row) => total + (check(row) ? 1 : 0), 0)
}

function percentage(count: number, total: number) {
  if (!total) return 0
  return Math.round((count / total) * 100)
}

function valuePriority(weakCount: number, strongCount: number) {
  return Math.max(0, Math.min(100, Math.round((weakCount * 100) / Math.max(1, weakCount + strongCount))))
}

function countBy(rows: SurveyRow[], key: string, fallback = "Sin dato", limit = 5) {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const value = normalize(row[key])
    let label = value || fallback
    if (key === "modalidad_preferida") {
      if (includesAny(value, ["hibrida", "mixta", "semi presencial", "semipresencial"])) label = "Hibrida"
      else if (includesAny(value, ["virtual", "en linea", "online", "a distancia", "remota"])) label = "Virtual"
      else if (includesAny(value, ["presencial", "cara a cara", "en aula", "asistida"])) label = "Presencial"
      else if (includesAny(value, ["pres", "virt", "hibr"])) label = "Hibrida"
      else label = fallback
    }
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([categoria, total]) => ({ categoria, total }))
}

function getTopLabel(items: CourseProfileSummaryItem[]) {
  if (!items.length) return "Sin datos"
  const top = items[0]
  return top ? top.categoria : "Sin datos"
}

function getModalidadTopLabel(rows: SurveyRow[]) {
  const items = countBy(rows, "modalidad_preferida")
  const top = items[0]?.categoria ?? "Sin dato"
  if (top !== "Sin dato") return top

  const rawCounts = new Map<string, number>()
  for (const row of rows) {
    const raw = row.modalidad_preferida?.trim()
    if (!raw) continue
    rawCounts.set(raw, (rawCounts.get(raw) ?? 0) + 1)
  }

  const rawTop = [...rawCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  return rawTop ?? "Sin dato"
}

const templates: Template[] = [
  {
    id: "b1-mercado",
    numeroBloque: 1,
    bloque: "Bloque 1: Datos base del emprendimiento",
    titulo: "Modelo de negocio y clientela objetivo",
    descripcion: "Define a quién vende, qué ofrece y cómo organiza su negocio para crecer con claridad.",
    score: (row) =>
      valuePriority(
        [row.parroquia, row.sector_economico, row.ingreso_mensual, row.nivel_instruccion].filter(isWeak).length,
        [row.parroquia, row.sector_economico, row.ingreso_mensual, row.nivel_instruccion].filter(positive).length,
      ),
  },
  {
    id: "b1-crecimiento",
    numeroBloque: 1,
    bloque: "Bloque 1: Datos base del emprendimiento",
    titulo: "Plan de crecimiento y metas del emprendimiento",
    descripcion: "Trabaja objetivos, prioridades y pasos concretos para ordenar el avance del negocio.",
    score: (row) =>
      valuePriority(
        [row.antiguedad_emprendimiento, row.interes_programa].filter(isWeak).length,
        [row.interes_programa].filter(positive).length,
      ),
  },
  {
    id: "b2-control",
    numeroBloque: 2,
    bloque: "Bloque 2: Gestión y finanzas",
    titulo: "Control de ingresos, gastos y flujo de caja",
    descripcion: "Aprende a registrar dinero, separar gastos y entender qué deja realmente tu negocio.",
    score: (row) =>
      valuePriority(
        [row.control_dinero, row.planifica_metas, row.reinvierte_ganancias].filter(isWeak).length,
        [row.control_dinero, row.planifica_metas, row.reinvierte_ganancias].filter(positive).length,
      ),
  },
  {
    id: "b2-precios",
    numeroBloque: 2,
    bloque: "Bloque 2: Gestión y finanzas",
    titulo: "Costos, precios y formalización básica",
    descripcion: "Refuerza el cálculo de precios, costos y pasos básicos para ordenar la formalización.",
    score: (row) =>
      valuePriority(
        [row.situacion_formalizacion, row.define_precios_costos].filter(isWeak).length,
        [row.situacion_formalizacion, row.define_precios_costos].filter(positive).length,
      ),
  },
  {
    id: "b3-whatsapp",
    numeroBloque: 3,
    bloque: "Bloque 3: Marketing y tecnología del negocio",
    titulo: "Uso de WhatsApp Business y catálogo digital",
    descripcion: "Organiza productos, respuestas rápidas y pedidos desde el celular para vender mejor.",
    score: (row) =>
      valuePriority(
        [row.dispositivo_internet, row.usa_apps_digitales].filter(isWeak).length,
        [row.dispositivo_internet, row.usa_apps_digitales].filter(positive).length,
      ),
  },
  {
    id: "b3-redes",
    numeroBloque: 3,
    bloque: "Bloque 3: Marketing y tecnología del negocio",
    titulo: "Promoción digital para microemprendimientos",
    descripcion: "Crea publicaciones, promociones y mensajes claros para atraer más clientas.",
    score: (row) =>
      valuePriority(
        [row.promocion_negocio, row.usa_sugerencias_clientes].filter(isWeak).length,
        [row.promocion_negocio, row.usa_sugerencias_clientes].filter(positive).length,
      ),
  },
  {
    id: "b3-pagos",
    numeroBloque: 3,
    bloque: "Bloque 3: Marketing y tecnología del negocio",
    titulo: "Pagos digitales y cobros seguros",
    descripcion: "Practica transferencias, cobros QR y herramientas digitales para vender con confianza.",
    score: (row) =>
      valuePriority(
        [row.usa_pagos_digitales, row.dificultad_tecnologia].filter(isWeak).length,
        [row.usa_pagos_digitales].filter(positive).length,
      ),
  },
  {
    id: "b4-identidad",
    numeroBloque: 4,
    bloque: "Bloque 4: Cultura e identidad del negocio",
    titulo: "Identidad cultural aplicada a productos y marca",
    descripcion: "Convierte la cultura en una propuesta diferenciada y coherente con tu negocio.",
    score: (row) =>
      valuePriority(
        [row.incorpora_cultura, row.origen_conocimiento_cultural].filter(isWeak).length,
        [row.incorpora_cultura, row.origen_conocimiento_cultural].filter(positive).length,
      ),
  },
  {
    id: "b4-redes",
    numeroBloque: 4,
    bloque: "Bloque 4: Cultura e identidad del negocio",
    titulo: "Redes comunitarias y comercialización colectiva",
    descripcion: "Fortalece alianzas, grupos y ferias para vender en conjunto y ampliar oportunidades.",
    score: (row) =>
      valuePriority(
        [row.participa_asociaciones].filter(isWeak).length,
        [row.participa_asociaciones].filter(positive).length,
      ),
  },
  {
    id: "b5-ruta",
    numeroBloque: 5,
    bloque: "Bloque 5: General",
    titulo: "Ruta flexible de aprendizaje emprendedor",
    descripcion: "Organiza horarios, ritmo y modalidad para que la formación se adapte a la realidad de la emprendedora.",
    score: (row) =>
      valuePriority(
        [row.interes_programa, row.modalidad_preferida].filter(isWeak).length,
        [row.interes_programa, row.modalidad_preferida].filter(positive).length,
      ),
  },
  {
    id: "b5-autonomia",
    numeroBloque: 5,
    bloque: "Bloque 5: General",
    titulo: "Autonomía y constancia para sostener el negocio",
    descripcion: "Refuerza hábitos, seguimiento y apoyo continuo para sostener el proceso formativo.",
    score: (row) =>
      valuePriority(
        [row.interes_programa].filter(isWeak).length,
        [row.interes_programa].filter(positive).length,
      ),
  },
]

export async function getCoursePredictions(): Promise<CoursePredictionResult> {
  const supabase = await createClient()
  const { data, error, count } = await supabase
    .from("cuestionario_limpio_respuestas")
    .select(
      "antiguedad_emprendimiento, ingreso_mensual, nivel_instruccion, etnia, situacion_formalizacion, control_dinero, planifica_metas, reinvierte_ganancias, define_precios_costos, promocion_negocio, usa_sugerencias_clientes, dispositivo_internet, usa_apps_digitales, usa_pagos_digitales, dificultad_tecnologia, incorpora_cultura, origen_conocimiento_cultural, participa_asociaciones, interes_programa, modalidad_preferida, sector_economico",
      { count: "exact" },
    )
    .limit(5000)

  const rows = error || !data ? [] : (data as SurveyRow[])
  const total = count ?? rows.length

  const byTemplate = templates.map((template) => {
    const scores = rows.map((row) => template.score(row)).filter((score) => Number.isFinite(score))
    const baseScore = scores.length ? Math.round(scores.reduce((acc, value) => acc + value, 0) / scores.length) : 0
    const weakRows = countRows(rows, (row) => template.score(row) >= 60)
    return {
      id: template.id,
      bloque: template.bloque,
      numeroBloque: template.numeroBloque,
      titulo: template.titulo,
      descripcion: template.descripcion,
      brecha: Math.max(baseScore, percentage(weakRows, Math.max(1, total)) || 0),
      respuestas: total,
    } satisfies CoursePrediction
  })

  const grouped = new Map<number, CoursePrediction[]>()
  for (const item of byTemplate) {
    const current = grouped.get(item.numeroBloque) ?? []
    current.push(item)
    grouped.set(item.numeroBloque, current)
  }

  const result: CoursePrediction[] = []
  for (const block of [...grouped.keys()].sort((a, b) => a - b)) {
    const blockItems = (grouped.get(block) ?? []).sort((a, b) => {
      if (b.brecha !== a.brecha) return b.brecha - a.brecha
      return a.titulo.localeCompare(b.titulo)
    })
    result.push(...blockItems.slice(0, 3))
  }

  const perfil: CoursePredictionProfile = {
    totalRegistros: total,
    perfilGeneral: [
      {
        etiqueta: "Parroquia predominante",
        valor: getTopLabel(countBy(rows, "parroquia")),
        detalle: "Ubicacion con mayor presencia dentro de la muestra.",
      },
      {
        etiqueta: "Sector predominante",
        valor: getTopLabel(countBy(rows, "sector_economico")),
        detalle: "Actividad economica con mayor presencia en la base.",
      },
      {
        etiqueta: "Ingreso mensual predominante",
        valor: getTopLabel(countBy(rows, "ingreso_mensual")),
        detalle: "Rango de ingreso que mas se repite en las respuestas.",
      },
      {
        etiqueta: "Nivel predominante",
        valor: getTopLabel(countBy(rows, "nivel_instruccion")),
        detalle: "Distribucion de instruccion formal en la muestra.",
      },
      {
        etiqueta: "Modalidad más frecuente",
        valor: getModalidadTopLabel(rows),
        detalle: "Canal de formacion con mayor demanda declarada.",
      },
    ],
    segmentos: {
      parroquia: countBy(rows, "parroquia"),
      nivelInstruccion: countBy(rows, "nivel_instruccion"),
      sectorEconomico: countBy(rows, "sector_economico"),
      ingresoMensual: countBy(rows, "ingreso_mensual"),
      modalidadPreferida: countBy(rows, "modalidad_preferida"),
      etnia: countBy(rows, "etnia"),
      antiguedad: countBy(rows, "antiguedad_emprendimiento"),
    },
  }

  return {
    cursos: result.sort((a, b) => {
    if (b.brecha !== a.brecha) return b.brecha - a.brecha
    if (a.numeroBloque !== b.numeroBloque) return a.numeroBloque - b.numeroBloque
    return a.titulo.localeCompare(b.titulo)
    }),
    perfil,
  }
}
