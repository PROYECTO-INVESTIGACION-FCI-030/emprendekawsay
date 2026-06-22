import { fallbackProjectDashboardData, type ProjectDashboardData } from "@/lib/project-dashboard-data"
import { getCursos, type Curso } from "@/lib/cursos"
import { getProjectInfo } from "@/lib/project-info"
import { createClient } from "@/lib/supabase/server"

type DashboardRow = {
  fuente: "csv" | "encuesta"
  parroquia?: string | null
  sector_economico?: string | null
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
      { estado: "En diseno", valor: counts.en_diseno, porcentaje: percentage(counts.en_diseno), fill: "#2563EB" },
      { estado: "En validacion", valor: counts.en_validacion, porcentaje: percentage(counts.en_validacion), fill: "#F59E0B" },
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

function yesScore(value: string | null | undefined) {
  const normalized = normalize(value)
  if (normalized.includes("si")) return 100
  if (normalized.includes("a veces") || normalized.includes("un poco")) return 50
  return 0
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

  const avg = (...values: number[]) => Math.round(values.reduce((acc, value) => acc + value, 0) / values.length)
  const score = (keys: (keyof DashboardRow)[]) => {
    if (!total) return 0
    return Math.round(rows.reduce((acc, row) => acc + yesScore(firstValue(row, keys)), 0) / total)
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
      { necesidad: "Uso de tecnologia", valor: percent(usoTecnologia, total) },
      { necesidad: "Educacion financiera", valor: percent(educacionFinanciera, total) },
      { necesidad: "Formalizacion", valor: percent(formalizacion, total) },
      { necesidad: "Redes de apoyo", valor: percent(redesApoyo, total) },
    ].sort((a, b) => b.valor - a.valor),
    competencias: [
      { competencia: "Digital", valor: avg(score(["dispositivo_internet"]), score(["usa_apps_digitales"]), score(["usa_pagos_digitales"])) },
      { competencia: "Comercial", valor: avg(score(["promocion_negocio", "promociona_negocio"]), score(["usa_sugerencias_clientes", "buena_atencion", "adapta_productos"])) },
      { competencia: "Gestion", valor: avg(score(["planifica_metas", "organiza_metas_tareas"]), score(["usa_sugerencias_clientes", "adapta_productos"])) },
      { competencia: "Innovacion", valor: avg(score(["incorpora_cultura", "integra_cultura"]), score(["participa_asociaciones", "participa_redes"])) },
      { competencia: "Financiera", valor: avg(score(["control_dinero", "registra_compras_ventas"]), score(["reinvierte_ganancias"]), score(["define_precios_costos"])) },
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
      "parroquia, sector_economico, situacion_formalizacion, control_dinero, planifica_metas, reinvierte_ganancias, define_precios_costos, promocion_negocio, usa_sugerencias_clientes, dispositivo_internet, usa_apps_digitales, usa_pagos_digitales, dificultad_tecnologia, incorpora_cultura, participa_asociaciones, interes_programa, modalidad_preferida, etnia",
    )
    .limit(5000)

  if (error || !data) return []
  return (data as Omit<DashboardRow, "fuente">[]).map((row) => ({ ...row, fuente: "csv" as const }))
}

async function getEncuestaRows() {
  const supabase = await createClient()
  const { data: encuestas, error } = await supabase
    .from("encuestas_iniciales")
    .select("id")
    .limit(5000)

  if (error || !encuestas?.length) return []

  const ids = encuestas.map((item) => item.id as string)
  const rows = new Map<string, DashboardRow>()
  for (const id of ids) rows.set(id, { fuente: "encuesta" })

  const mergeTable = async <T extends Record<string, unknown>>(table: string, columns: string) => {
    const { data } = await supabase.from(table).select(`id_encuesta, ${columns}`).in("id_encuesta", ids)
    for (const item of ((data ?? []) as unknown as T[])) {
      const id = item.id_encuesta as string
      const current = rows.get(id)
      if (current) rows.set(id, { ...current, ...(item as Partial<DashboardRow>) })
    }
  }

  await Promise.all([
    mergeTable("encuesta_datos_sociodemograficos", "parroquia, autoidentificacion_cultural"),
    mergeTable("encuesta_informacion_emprendimiento", "sector_principal"),
    mergeTable("encuesta_gestion_empresarial", "tiene_ruc_permisos, paga_impuestos_permisos, registra_compras_ventas, organiza_metas_tareas"),
    mergeTable("encuesta_finanzas", "ahorra_reinvierte, registra_dinero, define_precios_costos"),
    mergeTable("encuesta_marketing_ventas", "promociona_negocio, buena_atencion, adapta_productos, integra_cultura"),
    mergeTable("encuesta_tecnologia_digitalizacion", "dispositivo_internet, usa_apps_digitales, usa_pagos_digitales, dificultad_tecnologia"),
    mergeTable("encuesta_capital_social_redes", "participa_capacitaciones, participa_redes"),
  ])

  return [...rows.values()].map((row) => ({
    ...row,
    etnia: row.etnia ?? (row as { autoidentificacion_cultural?: string | null }).autoidentificacion_cultural,
    sector_economico: row.sector_economico ?? (row as { sector_principal?: string | null }).sector_principal,
    control_dinero: row.control_dinero ?? (row as { registra_dinero?: string | null }).registra_dinero,
    planifica_metas: row.planifica_metas ?? row.organiza_metas_tareas,
    promocion_negocio: row.promocion_negocio ?? row.promociona_negocio,
    incorpora_cultura: row.incorpora_cultura ?? row.integra_cultura,
    participa_asociaciones: row.participa_asociaciones ?? row.participa_redes,
  }))
}

export async function getProjectDashboardData(): Promise<ProjectDashboardData> {
  const [csvRows, encuestaRows, projectInfo, cursos] = await Promise.all([
    getCsvRows(),
    getEncuestaRows(),
    getProjectInfo(),
    getCursos(true),
  ])
  const rows = [...csvRows, ...encuestaRows]
  const courseStats = calculateCourseStats(cursos)

  if (rows.length === 0) {
    return {
      ...fallbackProjectDashboardData,
      cursos: courseStats,
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
    proyecto: {
      ...dashboard.proyecto,
      inicio: projectInfo.fechaInicio,
      fin: projectInfo.fechaFin,
      tiempoTranscurrido: projectInfo.porcentajeTranscurrido,
    },
  }
}
