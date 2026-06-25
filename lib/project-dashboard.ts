import { fallbackProjectDashboardData, type ProjectDashboardData } from "@/lib/project-dashboard-data"
import { getCursos, type Curso } from "@/lib/cursos"
import { getProjectInfo } from "@/lib/project-info"
import { getProductionDashboardData } from "@/lib/scientific-production"
import { createClient } from "@/lib/supabase/server"

type DashboardRow = {
  fuente: "csv" | "encuesta"
  parroquia?: string | null
  ubicacion?: string | null
  sector_ubicacion?: string | null
  antiguedad_emprendimiento?: string | null
  sector_economico?: string | null
  ingreso_mensual?: string | null
  nivel_instruccion?: string | null
  etnia?: string | null
  modalidad_preferida?: string | null
  interes_programa?: string | null
  situacion_formalizacion?: string | null
  tiene_ruc_permisos?: string | null
  paga_impuestos_permisos?: string | null
  control_dinero?: string | null
  registra_compras_ventas?: string | null
  planifica_metas?: string | null
  organiza_metas_tareas?: string | null
  reinvierte_ganancias?: string | null
  define_precios_costos?: string | null
  promocion_negocio?: string | null
  promociona_negocio?: string | null
  usa_sugerencias_clientes?: string | null
  buena_atencion?: string | null
  adapta_productos?: string | null
  dispositivo_internet?: string | null
  usa_apps_digitales?: string | null
  usa_pagos_digitales?: string | null
  dificultad_tecnologia?: string | null
  incorpora_cultura?: string | null
  origen_conocimiento_cultural?: string | null
  integra_cultura?: string | null
  participa_asociaciones?: string | null
  participa_capacitaciones?: string | null
  participa_redes?: string | null
}

function calculateCourseStats(cursos: Curso[]): ProjectDashboardData["cursos"] {
  const counts = {
    completado: cursos.filter((curso) => curso.estado === "completado").length,
    en_diseno: cursos.filter((curso) => curso.estado === "en_diseno").length,
    en_validacion: cursos.filter((curso) => curso.estado === "en_validacion").length,
    borrador: cursos.filter((curso) => curso.estado === "borrador").length,
  }
  const total = cursos.length
  const percentage = (value: number) => total ? Math.round((value / total) * 100) : 0

  return {
    disenados: total,
    enValidacion: counts.en_validacion,
    total,
    estados: [
      { estado: "Completados", valor: counts.completado, porcentaje: percentage(counts.completado), fill: "#22C55E" },
      { estado: "En diseño", valor: counts.en_diseno, porcentaje: percentage(counts.en_diseno), fill: "#2563EB" },
      { estado: "En validación", valor: counts.en_validacion, porcentaje: percentage(counts.en_validacion), fill: "#F59E0B" },
      { estado: "Borradores", valor: counts.borrador, porcentaje: percentage(counts.borrador), fill: "#8B5CF6" },
    ],
  }
}

function normalize(value: string | null | undefined) {
  return value
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase() ?? ""
}

function firstValue(row: DashboardRow, keys: (keyof DashboardRow)[]) {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === "string" && value.trim()) return value
  }
  return null
}

function includesAny(value: string | null | undefined, words: string[]) {
  const normalized = normalize(value)
  return words.some((word) => normalized.includes(normalize(word)))
}

function percent(count: number, total: number) {
  if (!total) return 0
  return Math.round((count / total) * 100)
}

function answerScore(key: keyof DashboardRow, value: string | null | undefined): number | null {
  const normalized = normalize(value)
  if (!normalized) return null

  if (key === "ingreso_mensual") {
    if (normalized.includes("1000")) return 100
    if (normalized.includes("600")) return 80
    if (normalized.includes("400")) return 60
    if (normalized.includes("200")) return 40
    return 20
  }
  if (key === "nivel_instruccion") {
    if (normalized.includes("postgrado")) return 100
    if (normalized.includes("superior")) return 80
    if (normalized.includes("tecn")) return 60
    if (normalized.includes("secund")) return 40
    return 20
  }
  if (key === "dificultad_tecnologia") {
    if (includesAny(value, ["ninguna", "no he tenido", "sin dificultad"])) return 100
    if (includesAny(value, ["a veces", "poca" ])) return 50
    return 20
  }
  if (key === "origen_conocimiento_cultural") {
    if (normalized.includes("copia")) return 0
    if (includesAny(value, ["tradicion", "familia", "inspiracion", "ancestral"])) return 100
    return 50
  }

  if (includesAny(value, ["no", "ninguno", "solo espero", "solo efectivo", "intuicion"])) return 0
  if (includesAny(value, ["a veces", "parcial", "en proceso", "restriccion", "me gustaria"])) return 50
  if (includesAny(value, ["si", "activa", "aplicacion", "software", "costo +", "muy importante"])) return 100
  return 50
}

function needsSupport(value: string | null | undefined) {
  return includesAny(value, [
    "no",
    "a veces",
    "solo espero",
    "aun no",
    "no me formalizo",
    "falta",
    "dificultad",
    "no tengo tiempo",
    "no conozco",
  ])
}

function topItems(rows: DashboardRow[], key: keyof DashboardRow, limit = 5) {
  const counts = new Map<string, number>()

  for (const row of rows) {
    const raw = row[key]
    if (typeof raw !== "string") continue
    const value = raw.trim()
    if (!value) continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([nombre, valor]) => ({ nombre, valor }))
}

function calculateDashboard(rows: DashboardRow[]): ProjectDashboardData {
  const total = rows.length

  const marketingDigital = rows.filter((row) => {
    const promocion = firstValue(row, ["promocion_negocio", "promociona_negocio"])
    return includesAny(promocion, ["solo espero"]) || needsSupport(row.usa_apps_digitales)
  }).length

  const usoTecnologia = rows.filter(
    (row) => needsSupport(row.dispositivo_internet) || needsSupport(row.dificultad_tecnologia),
  ).length

  const educacionFinanciera = rows.filter(
    (row) =>
      needsSupport(firstValue(row, ["control_dinero", "registra_compras_ventas"])) ||
      needsSupport(row.define_precios_costos) ||
      needsSupport(row.reinvierte_ganancias),
  ).length

  const formalizacion = rows.filter(
    (row) =>
      needsSupport(row.situacion_formalizacion) ||
      needsSupport(row.tiene_ruc_permisos) ||
      needsSupport(row.paga_impuestos_permisos),
  ).length

  const redesApoyo = rows.filter(
    (row) =>
      needsSupport(firstValue(row, ["participa_asociaciones", "participa_redes"])) ||
      needsSupport(row.participa_capacitaciones),
  ).length

  const formalizadas = rows.filter(
    (row) => !needsSupport(firstValue(row, ["situacion_formalizacion", "tiene_ruc_permisos"])),
  ).length

  const interes = rows.filter((row) => includesAny(row.interes_programa, ["si", "a veces"])).length
  const brechaDigital = rows.filter(
    (row) =>
      needsSupport(row.dispositivo_internet) ||
      needsSupport(row.usa_apps_digitales) ||
      needsSupport(row.dificultad_tecnologia),
  ).length

  const score = (keys: (keyof DashboardRow)[]) => {
    const values = rows.flatMap((row) => keys.map((key) => answerScore(key, row[key])).filter((value): value is number => value !== null))
    if (!values.length) return 0
    return Math.round(values.reduce((acc, value) => acc + value, 0) / values.length)
  }

  return {
    ...fallbackProjectDashboardData,
    validacion: {
      encuestadas: total,
      meta: total || fallbackProjectDashboardData.validacion.meta,
      porcentaje: total ? 100 : 0,
    },
    necesidades: [
      { necesidad: "Marketing digital", valor: percent(marketingDigital, total) },
      { necesidad: "Uso de tecnología", valor: percent(usoTecnologia, total) },
      { necesidad: "Educación financiera", valor: percent(educacionFinanciera, total) },
      { necesidad: "Formalización", valor: percent(formalizacion, total) },
      { necesidad: "Redes de apoyo", valor: percent(redesApoyo, total) },
    ].sort((a, b) => b.valor - a.valor),
    competencias: [
      { competencia: "Financiera", valor: score(["ingreso_mensual", "control_dinero", "reinvierte_ganancias", "define_precios_costos"]) },
      { competencia: "Digital", valor: score(["dispositivo_internet", "usa_apps_digitales", "usa_pagos_digitales", "dificultad_tecnologia"]) },
      { competencia: "Comercial", valor: score(["promocion_negocio", "usa_sugerencias_clientes"]) },
      { competencia: "Innovación", valor: score(["etnia", "incorpora_cultura", "origen_conocimiento_cultural", "participa_asociaciones"]) },
      { competencia: "Gestión", valor: score(["parroquia", "sector_ubicacion", "antiguedad_emprendimiento", "sector_economico", "nivel_instruccion", "situacion_formalizacion", "planifica_metas", "interes_programa", "modalidad_preferida"]) },
    ],
    diagnostico: {
      respuestas: total,
      formalizacion: percent(formalizadas, total),
      interesParticipacion: percent(interes, total),
      usoDigital: percent(brechaDigital, total),
      parroquias: topItems(rows, "parroquia"),
      sectores: topItems(rows, "sector_economico"),
      etnias: topItems(rows, "etnia"),
      modalidades: topItems(rows, "modalidad_preferida"),
    },
  }
}

async function getCsvRows() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("cuestionario_limpio_respuestas")
    .select(
      "ubicacion, parroquia, sector_ubicacion, antiguedad_emprendimiento, sector_economico, ingreso_mensual, nivel_instruccion, etnia, situacion_formalizacion, control_dinero, planifica_metas, reinvierte_ganancias, define_precios_costos, promocion_negocio, usa_sugerencias_clientes, dispositivo_internet, usa_apps_digitales, usa_pagos_digitales, dificultad_tecnologia, incorpora_cultura, origen_conocimiento_cultural, participa_asociaciones, interes_programa, modalidad_preferida",
    )
    .limit(5000)

  if (error || !data) return []
  return (data as Omit<DashboardRow, "fuente">[]).map((row) => ({ ...row, fuente: "csv" as const }))
}

async function getCsvCount() {
  const supabase = await createClient()
  const { count } = await supabase
    .from("cuestionario_limpio_respuestas")
    .select("id", { count: "exact", head: true })
  return count ?? 0
}

export async function getProjectDashboardData(): Promise<ProjectDashboardData> {
  const [csvRows, csvCount, projectInfo, cursos, production] = await Promise.all([
    getCsvRows(),
    getCsvCount(),
    getProjectInfo(),
    getCursos(true),
    getProductionDashboardData(),
  ])
  const rows = csvRows
  const courseStats = calculateCourseStats(cursos)

  if (rows.length === 0) {
    return {
      ...fallbackProjectDashboardData,
      cursos: courseStats,
      produccion: production.resumen,
      produccionPorInvestigador: production.investigadores,
      validacion: {
        encuestadas: csvCount,
        meta: csvCount,
        porcentaje: csvCount ? 100 : 0,
      },
      proyecto: {
        ...fallbackProjectDashboardData.proyecto,
        inicio: projectInfo.fechaInicio,
        fin: projectInfo.fechaFin,
        tiempoTranscurrido: projectInfo.porcentajeTranscurrido,
      },
    }
  }

  const dashboard = calculateDashboard(rows)
  return {
    ...dashboard,
    cursos: courseStats,
    produccion: production.resumen,
    produccionPorInvestigador: production.investigadores,
    validacion: {
      encuestadas: csvCount,
      meta: csvCount,
      porcentaje: csvCount ? 100 : 0,
    },
    proyecto: {
      ...dashboard.proyecto,
      inicio: projectInfo.fechaInicio,
      fin: projectInfo.fechaFin,
      tiempoTranscurrido: projectInfo.porcentajeTranscurrido,
    },
  }
}
