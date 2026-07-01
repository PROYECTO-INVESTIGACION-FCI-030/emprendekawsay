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
  source: "gemini" | "fallback"
  sourceReason?: string
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

type GeminiCourseSuggestion = {
  numeroBloque: number
  bloque: string
  titulo: string
  descripcion: string
  brecha?: number
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

function buildCriticalNeedSummary(rows: SurveyRow[]) {
  const total = rows.length || 1
  const countNeed = (check: (row: SurveyRow) => boolean) => percentage(countRows(rows, check), total)

  const marketingDigital = countNeed(
    (row) => isWeak(row.promocion_negocio) || isWeak(row.usa_apps_digitales) || isWeak(row.dispositivo_internet) || isWeak(row.apps_usadas),
  )
  const pagosDigitales = countNeed((row) => isWeak(row.usa_pagos_digitales) || isWeak(row.pagos_usados) || isWeak(row.dificultad_tecnologia))
  const herramientasBasicas = countNeed((row) => isWeak(row.dispositivo_internet) || isWeak(row.usa_apps_digitales) || isWeak(row.apps_usadas))
  const finanzas = countNeed((row) => isWeak(row.control_dinero) || isWeak(row.define_precios_costos) || isWeak(row.reinvierte_ganancias))
  const formalizacion = countNeed((row) => isWeak(row.situacion_formalizacion))
  const servicio = countNeed((row) => isWeak(row.usa_sugerencias_clientes) || isWeak(row.promocion_negocio))

  return {
    totalRespuestas: rows.length,
    necesidadesCriticas: [
      { nombre: "Marketing digital", valor: marketingDigital },
      { nombre: "Pagos digitales y banca móvil", valor: pagosDigitales },
      { nombre: "Herramientas digitales básicas", valor: herramientasBasicas },
      { nombre: "Control financiero y precios", valor: finanzas },
      { nombre: "Formalización del emprendimiento", valor: formalizacion },
      { nombre: "Atención al cliente y ventas", valor: servicio },
    ]
      .filter((item) => item.valor > 0)
      .sort((a, b) => b.valor - a.valor),
    perfil: {
      parroquia: getTopLabel(countBy(rows, "parroquia")),
      sectorEconomico: getTopLabel(countBy(rows, "sector_economico")),
      ingresoMensual: getTopLabel(countBy(rows, "ingreso_mensual")),
      nivelInstruccion: getTopLabel(countBy(rows, "nivel_instruccion")),
      modalidadPreferida: getModalidadTopLabel(rows),
      etnia: getTopLabel(countBy(rows, "etnia")),
      antiguedad: getTopLabel(countBy(rows, "antiguedad_emprendimiento")),
    },
  }
}

function normalizeGeminiSuggestions(value: unknown): GeminiCourseSuggestion[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const candidate = item as Partial<GeminiCourseSuggestion>
      const numeroBloque = Number(candidate.numeroBloque)
      const bloque = typeof candidate.bloque === "string" ? candidate.bloque.trim() : ""
      const titulo = typeof candidate.titulo === "string" ? candidate.titulo.trim() : ""
      const descripcion = typeof candidate.descripcion === "string" ? candidate.descripcion.trim() : ""
      const brecha = Number(candidate.brecha ?? 0)
      if (!numeroBloque || !bloque || !titulo || !descripcion) return null
      return {
        numeroBloque,
        bloque,
        titulo,
        descripcion,
        brecha: Number.isFinite(brecha) ? Math.max(0, Math.min(100, brecha)) : undefined,
      }
    })
    .filter(Boolean) as GeminiCourseSuggestion[]
}

async function getGeminiSuggestions(rows: SurveyRow[]) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return { suggestions: [], reason: "Falta GEMINI_API_KEY en el entorno." }

  const summary = buildCriticalNeedSummary(rows)
  const prompt = [
    "Eres un analista académico especializado en formación para mujeres emprendedoras indígenas.",
    "Con base en estas necesidades críticas y perfil de la muestra, propone exactamente 6 cursos específicos.",
    "Los cursos deben ser concretos, útiles y enfocados en necesidades reales. Evita títulos genéricos.",
    "Prioriza especialmente: marketing digital, redes sociales, pagos digitales, banca móvil, herramientas digitales básicas, control financiero, precios y formalización.",
    "Devuelve SOLO JSON válido con esta estructura:",
    '[{"numeroBloque":3,"bloque":"Bloque 3: Marketing y tecnología del negocio","titulo":"...","descripcion":"...","brecha":85}]',
    "La suma total debe incluir 6 cursos, ordenados del mayor al menor impacto.",
    `Perfil: ${JSON.stringify(summary.perfil)}`,
    `Necesidades críticas: ${JSON.stringify(summary.necesidadesCriticas)}`,
  ].join("\n")

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "")
      if (response.status === 429) {
        return {
          suggestions: [],
          reason: "Gemini alcanzó el límite temporal del plan gratuito. Se usará la predicción de respaldo.",
        }
      }
      if (response.status === 503) {
        return {
          suggestions: [],
          reason: "Gemini está temporalmente saturado. Se usará la predicción de respaldo.",
        }
      }
      return { suggestions: [], reason: `Gemini respondió ${response.status}. ${errorText || "Sin detalle."}`.trim() }
    }

    const payload = await response.json()
    const text = payload?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("") ?? ""
    if (!text) return { suggestions: [], reason: "Gemini no devolvió texto utilizable." }

    const parsed = JSON.parse(text)
    const suggestions = normalizeGeminiSuggestions(parsed)
    if (!suggestions.length) return { suggestions: [], reason: "Gemini devolvió JSON, pero sin sugerencias válidas." }
    return { suggestions, reason: "Gemini respondió correctamente." }
  } catch {
    return { suggestions: [], reason: "No se pudo interpretar la respuesta de Gemini." }
  }
}

const templates: Template[] = [
  {
    id: "mkt-redes",
    numeroBloque: 3,
    bloque: "Bloque 3: Marketing y tecnología del negocio",
    titulo: "Marketing digital y redes sociales",
    descripcion: "Fortalece la promoción del negocio en Facebook, Instagram y WhatsApp para atraer más clientes.",
    score: (row) =>
      valuePriority(
        [row.promocion_negocio, row.usa_apps_digitales, row.dispositivo_internet, row.apps_usadas, row.usa_sugerencias_clientes].filter(
          isWeak,
        ).length * 2,
        [row.promocion_negocio, row.usa_apps_digitales, row.dispositivo_internet, row.apps_usadas].filter(positive).length,
      ),
  },
  {
    id: "dig-herramientas",
    numeroBloque: 3,
    bloque: "Bloque 3: Marketing y tecnología del negocio",
    titulo: "Manejo de aplicaciones y herramientas digitales básicas",
    descripcion: "Uso práctico del celular, aplicaciones y herramientas simples para organizar pedidos y comunicación.",
    score: (row) =>
      valuePriority(
        [row.dispositivo_internet, row.usa_apps_digitales, row.apps_usadas, row.dificultad_tecnologia].filter(isWeak).length * 2,
        [row.dispositivo_internet, row.usa_apps_digitales, row.apps_usadas].filter(positive).length,
      ),
  },
  {
    id: "pay-banca",
    numeroBloque: 3,
    bloque: "Bloque 3: Marketing y tecnología del negocio",
    titulo: "Pagos digitales y banca móvil",
    descripcion: "Aprende a cobrar y pagar con transferencias, QR, banca móvil y herramientas financieras digitales.",
    score: (row) =>
      valuePriority(
        [row.usa_pagos_digitales, row.pagos_usados, row.dificultad_tecnologia].filter(isWeak).length * 2,
        [row.usa_pagos_digitales, row.pagos_usados].filter(positive).length,
      ),
  },
  {
    id: "finanzas-costos",
    numeroBloque: 2,
    bloque: "Bloque 2: Gestión y finanzas",
    titulo: "Control financiero, costos y fijación de precios",
    descripcion: "Organiza ingresos, gastos, reinversión y precios de venta para entender la rentabilidad real.",
    score: (row) =>
      valuePriority(
        [row.control_dinero, row.reinvierte_ganancias, row.define_precios_costos].filter(isWeak).length * 2,
        [row.control_dinero, row.reinvierte_ganancias, row.define_precios_costos].filter(positive).length,
      ),
  },
  {
    id: "formalizacion",
    numeroBloque: 2,
    bloque: "Bloque 2: Gestión y finanzas",
    titulo: "Formalización del emprendimiento y trámites básicos",
    descripcion: "Revisa permisos, RUC y pasos prácticos para ordenar el negocio y avanzar con seguridad.",
    score: (row) =>
      valuePriority(
        [row.situacion_formalizacion, row.parroquia, row.sector_economico].filter(isWeak).length * 2,
        [row.situacion_formalizacion].filter(positive).length,
      ),
  },
  {
    id: "clientes-ventas",
    numeroBloque: 1,
    bloque: "Bloque 1: Datos base del emprendimiento",
    titulo: "Gestión de clientas y mejoras del servicio",
    descripcion: "Aprende a usar sugerencias, mejorar la atención y convertir más interés en ventas.",
    score: (row) =>
      valuePriority(
        [row.usa_sugerencias_clientes, row.promocion_negocio].filter(isWeak).length * 2,
        [row.usa_sugerencias_clientes].filter(positive).length,
      ),
  },
]

export async function getCoursePredictions(): Promise<CoursePredictionResult> {
  const supabase = await createClient()
  const { data, error, count } = await supabase
    .from("cuestionario_limpio_respuestas")
    .select(
      "parroquia, antiguedad_emprendimiento, ingreso_mensual, nivel_instruccion, etnia, situacion_formalizacion, control_dinero, planifica_metas, reinvierte_ganancias, define_precios_costos, promocion_negocio, usa_sugerencias_clientes, dispositivo_internet, usa_apps_digitales, usa_pagos_digitales, dificultad_tecnologia, incorpora_cultura, origen_conocimiento_cultural, participa_asociaciones, interes_programa, modalidad_preferida, sector_economico, apps_usadas, pagos_usados",
      { count: "exact" },
    )
    .limit(5000)

  const rows = error || !data ? [] : (data as SurveyRow[])
  const total = count ?? rows.length

  if (total === 0) {
    return {
      cursos: [],
      perfil: {
        totalRegistros: 0,
        perfilGeneral: [
          {
            etiqueta: "Sin datos",
            valor: "No hay respuestas registradas",
            detalle: "La predicción necesita respuestas reales en cuestionario_limpio_respuestas.",
          },
          {
            etiqueta: "Estado",
            valor: "Esperando información",
            detalle: "Cuando lleguen encuestas, aquí se generarán los cursos sugeridos.",
          },
        ],
        segmentos: {
          parroquia: [],
          nivelInstruccion: [],
          sectorEconomico: [],
          ingresoMensual: [],
          modalidadPreferida: [],
          etnia: [],
          antiguedad: [],
        },
      },
      source: "fallback",
    }
  }

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

  const geminiResult = await getGeminiSuggestions(rows)
  const source: "gemini" | "fallback" = geminiResult.suggestions.length ? "gemini" : "fallback"
  const suggested = (geminiResult.suggestions.length ? geminiResult.suggestions : [])
    .map((item, index) => {
      const fallback = byTemplate[index] ?? byTemplate[0]
      if (!fallback) return null
      return {
        id: fallback.id,
        bloque: item.bloque || fallback.bloque,
        numeroBloque: item.numeroBloque || fallback.numeroBloque,
        titulo: item.titulo || fallback.titulo,
        descripcion: item.descripcion || fallback.descripcion,
        brecha: item.brecha ?? fallback.brecha,
        respuestas: total,
      } satisfies CoursePrediction
    })
    .filter(Boolean) as CoursePrediction[]

  const result = (suggested.length ? suggested : byTemplate)
    .sort((a, b) => {
      if (b.brecha !== a.brecha) return b.brecha - a.brecha
      if (a.numeroBloque !== b.numeroBloque) return a.numeroBloque - b.numeroBloque
      return a.titulo.localeCompare(b.titulo)
    })

  const perfil: CoursePredictionProfile = {
    totalRegistros: total,
    perfilGeneral: [
      {
        etiqueta: "Parroquia predominante",
        valor: getTopLabel(countBy(rows, "parroquia")),
        detalle: "Ubicación con mayor presencia dentro de la muestra.",
      },
      {
        etiqueta: "Sector predominante",
        valor: getTopLabel(countBy(rows, "sector_economico")),
        detalle: "Actividad económica con mayor presencia en la base.",
      },
      {
        etiqueta: "Ingreso mensual predominante",
        valor: getTopLabel(countBy(rows, "ingreso_mensual")),
        detalle: "Rango de ingreso que más se repite en las respuestas.",
      },
      {
        etiqueta: "Nivel predominante",
        valor: getTopLabel(countBy(rows, "nivel_instruccion")),
        detalle: "Distribución de instrucción formal en la muestra.",
      },
      {
        etiqueta: "Modalidad más frecuente",
        valor: getModalidadTopLabel(rows),
        detalle: "Canal de formación con mayor demanda declarada.",
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
    cursos: result.slice(0, 6),
    perfil,
    source,
    sourceReason: geminiResult.reason,
  }
}
