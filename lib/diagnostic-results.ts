import { createClient } from "@/lib/supabase/server"

type QuestionConfig = {
  id: string
  label: string
  column: string
}

type BlockConfig = {
  id: string
  title: string
  description: string
  questions: QuestionConfig[]
}

export type DiagnosticAnswerCount = {
  respuesta: string
  total: number
  porcentaje: number
}

export type DiagnosticQuestionResult = QuestionConfig & {
  total: number
  sinRespuesta: number
  respuestas: DiagnosticAnswerCount[]
}

export type DiagnosticBlockResult = Omit<BlockConfig, "questions"> & {
  totalPreguntas: number
  totalRespuestas: number
  preguntas: DiagnosticQuestionResult[]
}

export type DiagnosticResults = {
  totalEncuestas: number
  bloques: DiagnosticBlockResult[]
}

const blocks: BlockConfig[] = [
  {
    id: "datos-base",
    title: "Bloque 1: Datos base del emprendimiento",
    description: "Ubicación, trayectoria, actividad económica, ingresos, educación e identidad cultural.",
    questions: [
      { id: "p1", label: "1. Parroquia", column: "parroquia" },
      { id: "p2", label: "2. Sector o ubicación", column: "sector_ubicacion" },
      { id: "p3", label: "3. Antigüedad del emprendimiento", column: "antiguedad_emprendimiento" },
      { id: "p4", label: "4. Sector económico", column: "sector_economico" },
      { id: "p5", label: "5. Ingreso mensual", column: "ingreso_mensual" },
      { id: "p6", label: "6. Nivel de instrucción", column: "nivel_instruccion" },
      { id: "p7", label: "7. Autoidentificación cultural", column: "etnia" },
    ],
  },
  {
    id: "gestion-finanzas",
    title: "Bloque 2: Gestión y finanzas",
    description: "Formalización, control del dinero, planificación, reinversión y definición de precios.",
    questions: [
      { id: "p8", label: "8. Situación de formalización", column: "situacion_formalizacion" },
      { id: "p9", label: "9. Control del dinero", column: "control_dinero" },
      { id: "p10", label: "10. Planificación de metas", column: "planifica_metas" },
      { id: "p11", label: "11. Reinversión de ganancias", column: "reinvierte_ganancias" },
      { id: "p12", label: "12. Definición de precios y costos", column: "define_precios_costos" },
    ],
  },
  {
    id: "comercial-digital",
    title: "Bloque 3: Comercialización y tecnología",
    description: "Promoción, clientes, acceso digital, aplicaciones, pagos y dificultades tecnológicas.",
    questions: [
      { id: "p13", label: "13. Promoción del negocio", column: "promocion_negocio" },
      { id: "p14", label: "14. Uso de sugerencias de clientes", column: "usa_sugerencias_clientes" },
      { id: "p15", label: "15. Dispositivo e internet", column: "dispositivo_internet" },
      { id: "p16", label: "16. Uso de aplicaciones digitales", column: "usa_apps_digitales" },
      { id: "p17", label: "17. Uso de pagos digitales", column: "usa_pagos_digitales" },
      { id: "p18", label: "18. Dificultad con tecnología", column: "dificultad_tecnologia" },
    ],
  },
  {
    id: "cultura-redes",
    title: "Bloque 4: Cultura, innovación y redes",
    description: "Identidad cultural, origen del conocimiento y participación en asociaciones.",
    questions: [
      { id: "p19", label: "19. Incorpora elementos culturales", column: "incorpora_cultura" },
      { id: "p20", label: "20. Origen del conocimiento cultural", column: "origen_conocimiento_cultural" },
      { id: "p21", label: "21. Participación en asociaciones", column: "participa_asociaciones" },
    ],
  },
  {
    id: "programa",
    title: "Bloque 5: Interés en el programa",
    description: "Interés de participación y modalidad preferida para la formación.",
    questions: [
      { id: "p22", label: "22. Interés en el programa", column: "interes_programa" },
      { id: "p23", label: "23. Modalidad preferida", column: "modalidad_preferida" },
    ],
  },
]

function normalizeAnswer(value: unknown) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ")
  if (typeof value !== "string") return ""
  return value.trim()
}

function countQuestion(rows: Record<string, unknown>[], question: QuestionConfig): DiagnosticQuestionResult {
  const counts = new Map<string, number>()
  let answered = 0

  for (const row of rows) {
    const raw = normalizeAnswer(row[question.column])
    if (!raw) continue
    answered += 1
    counts.set(raw, (counts.get(raw) ?? 0) + 1)
  }

  return {
    ...question,
    total: answered,
    sinRespuesta: rows.length - answered,
    respuestas: [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([respuesta, total]) => ({
        respuesta,
        total,
        porcentaje: answered ? Math.round((total / answered) * 100) : 0,
      })),
  }
}

export async function getDiagnosticResults(): Promise<DiagnosticResults> {
  const supabase = await createClient()
  const columns = [...new Set(blocks.flatMap((block) => block.questions.map((question) => question.column)))]
  const { data, count, error } = await supabase
    .from("cuestionario_limpio_respuestas")
    .select(columns.join(", "), { count: "exact" })
    .limit(5000)

  const rows = error || !data ? [] : (data as unknown as Record<string, unknown>[])

  return {
    totalEncuestas: count ?? rows.length,
    bloques: blocks.map((block) => {
      const preguntas = block.questions.map((question) => countQuestion(rows, question))
      return {
        id: block.id,
        title: block.title,
        description: block.description,
        totalPreguntas: block.questions.length,
        totalRespuestas: preguntas.reduce((total, question) => total + question.total, 0),
        preguntas,
      }
    }),
  }
}
