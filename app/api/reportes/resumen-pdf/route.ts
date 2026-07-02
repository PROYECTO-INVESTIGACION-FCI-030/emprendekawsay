import fs from "node:fs"
import path from "node:path"
import { NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib"
import { getProjectDashboardData } from "@/lib/project-dashboard"
import { getProjectInfo } from "@/lib/project-info"

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN_X = 40
const TOP_Y = 792
const BOTTOM_Y = 50

const COLORS = {
  navy: rgb(0.06, 0.23, 0.45),
  blue: rgb(0.1, 0.39, 0.78),
  cyan: rgb(0.16, 0.68, 0.87),
  softBlue: rgb(0.94, 0.97, 1),
  border: rgb(0.84, 0.89, 0.95),
  text: rgb(0.13, 0.16, 0.2),
  muted: rgb(0.38, 0.44, 0.51),
  green: rgb(0.1, 0.62, 0.34),
  amber: rgb(0.88, 0.59, 0.1),
  red: rgb(0.8, 0.23, 0.2),
  violet: rgb(0.45, 0.29, 0.82),
  white: rgb(1, 1, 1),
}

type DashboardData = Awaited<ReturnType<typeof getProjectDashboardData>>
type ProjectInfo = Awaited<ReturnType<typeof getProjectInfo>>

function formatGeneratedDate() {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Guayaquil",
  }).format(new Date())
}

function safeText(value: unknown, fallback = "Sin dato") {
  if (typeof value === "string") {
    const clean = value.trim()
    return clean || fallback
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return fallback
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const clean = text.replace(/\s+/g, " ").trim()
  if (!clean) return [""]

  const words = clean.split(" ")
  const lines: string[] = []
  let current = words[0] ?? ""

  for (const word of words.slice(1)) {
    const candidate = `${current} ${word}`
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate
    } else {
      lines.push(current)
      current = word
    }
  }

  if (current) lines.push(current)
  return lines
}

function truncateText(text: string, max = 170) {
  const clean = text.trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 3).trimEnd()}...`
}

function topList(items: Array<{ nombre: string; valor: number }>, fallback: string) {
  if (!items.length) return fallback
  return items
    .slice(0, 5)
    .map((item) => `${item.nombre} (${item.valor})`)
    .join(", ")
}

function needPriority(value: number) {
  if (value >= 70) return "Alta"
  if (value >= 40) return "Media"
  return "Baja"
}

function findTopNeed(data: DashboardData) {
  return [...data.necesidades].sort((a, b) => b.valor - a.valor)[0] ?? null
}

function findWeakestCompetency(data: DashboardData) {
  return [...data.competencias].sort((a, b) => a.valor - b.valor)[0] ?? null
}

function executiveSummary(data: DashboardData) {
  const topNeed = findTopNeed(data)
  const weakest = findWeakestCompetency(data)

  return [
    `El dashboard institucional consolida el seguimiento del proyecto con ${data.proyecto.avance}% de avance global, ${data.cursos.disenados} cursos diseñados, ${data.produccion.completados} productos científicos ejecutados y ${data.validacion.encuestadas} participantes registradas en validación.`,
    `El componente diagnóstico reúne ${data.diagnostico.respuestas} respuestas efectivas, lo que permite construir una lectura territorial, sectorial y formativa consistente para la toma de decisiones del programa.`,
    topNeed
      ? `La principal necesidad de formación identificada es ${topNeed.necesidad}, con prioridad ${needPriority(topNeed.valor).toLowerCase()} y una incidencia de ${topNeed.valor}% dentro del tablero.`
      : "Aún no se identifican necesidades predominantes porque la base diagnóstica no registra suficiente información.",
    weakest
      ? `En competencias promedio, la dimensión con menor desempeño es ${weakest.competencia}, por lo que conviene reforzar ese eje mediante contenidos focalizados y acompañamiento práctico.`
      : "El radar de competencias todavía no dispone de información suficiente para establecer prioridades de refuerzo.",
  ]
}

class PdfLayout {
  pdf: PDFDocument
  regular: PDFFont
  bold: PDFFont
  page: PDFPage
  pageNumber = 1
  y = TOP_Y

  constructor(pdf: PDFDocument, regular: PDFFont, bold: PDFFont, page: PDFPage) {
    this.pdf = pdf
    this.regular = regular
    this.bold = bold
    this.page = page
  }

  addPage() {
    this.page = this.pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    this.pageNumber += 1
    this.y = TOP_Y
    this.drawPageHeader()
    this.drawPageFooter()
  }

  ensureSpace(height: number) {
    if (this.y - height < BOTTOM_Y) this.addPage()
  }

  drawPageHeader() {
    this.page.drawRectangle({
      x: MARGIN_X,
      y: PAGE_HEIGHT - 30,
      width: PAGE_WIDTH - MARGIN_X * 2,
      height: 1,
      color: COLORS.border,
    })
    this.page.drawText("Informe ejecutivo del dashboard institucional", {
      x: MARGIN_X,
      y: PAGE_HEIGHT - 22,
      size: 8.8,
      font: this.regular,
      color: COLORS.muted,
    })
  }

  drawPageFooter() {
    this.page.drawRectangle({
      x: MARGIN_X,
      y: 34,
      width: PAGE_WIDTH - MARGIN_X * 2,
      height: 1,
      color: COLORS.border,
    })
    this.page.drawText(`Página ${this.pageNumber}`, {
      x: PAGE_WIDTH - MARGIN_X - 46,
      y: 20,
      size: 8.8,
      font: this.regular,
      color: COLORS.muted,
    })
  }

  sectionTitle(title: string, subtitle?: string) {
    this.ensureSpace(subtitle ? 52 : 30)
    this.page.drawText(title, {
      x: MARGIN_X,
      y: this.y,
      size: 14,
      font: this.bold,
      color: COLORS.navy,
    })
    this.y -= 8
    this.page.drawRectangle({
      x: MARGIN_X,
      y: this.y,
      width: PAGE_WIDTH - MARGIN_X * 2,
      height: 1,
      color: COLORS.border,
    })
    this.y -= 14
    if (subtitle) {
      this.paragraph(subtitle, { size: 9.6, color: COLORS.muted, gapAfter: 8 })
    }
  }

  paragraph(text: string, options?: { size?: number; color?: ReturnType<typeof rgb>; gapAfter?: number }) {
    const size = options?.size ?? 10.3
    const color = options?.color ?? COLORS.text
    const gapAfter = options?.gapAfter ?? 6
    const lines = wrapText(text, this.regular, size, PAGE_WIDTH - MARGIN_X * 2)
    this.ensureSpace(lines.length * 14 + gapAfter)
    for (const line of lines) {
      this.page.drawText(line, {
        x: MARGIN_X,
        y: this.y,
        size,
        font: this.regular,
        color,
      })
      this.y -= 14
    }
    this.y -= gapAfter
  }

  bullet(text: string) {
    const size = 10.1
    const lines = wrapText(text, this.regular, size, PAGE_WIDTH - MARGIN_X * 2 - 16)
    this.ensureSpace(lines.length * 14 + 4)
    this.page.drawCircle({
      x: MARGIN_X + 4,
      y: this.y + 5,
      size: 2.4,
      color: COLORS.blue,
    })
    for (const line of lines) {
      this.page.drawText(line, {
        x: MARGIN_X + 14,
        y: this.y,
        size,
        font: this.regular,
        color: COLORS.text,
      })
      this.y -= 14
    }
    this.y -= 4
  }

  keyValueRow(label: string, value: string) {
    this.ensureSpace(18)
    this.page.drawText(label, {
      x: MARGIN_X,
      y: this.y,
      size: 9.8,
      font: this.bold,
      color: COLORS.text,
    })
    this.page.drawText(value, {
      x: MARGIN_X + 152,
      y: this.y,
      size: 9.8,
      font: this.regular,
      color: COLORS.text,
    })
    this.y -= 16
  }

  statCard(x: number, y: number, width: number, title: string, value: string, note: string, accent: ReturnType<typeof rgb>) {
    this.page.drawRectangle({
      x,
      y,
      width,
      height: 94,
      borderWidth: 1,
      borderColor: COLORS.border,
      color: COLORS.white,
    })
    this.page.drawRectangle({ x, y: y + 88, width, height: 6, color: accent })
    this.page.drawText(title, {
      x: x + 12,
      y: y + 60,
      size: 9.4,
      font: this.regular,
      color: COLORS.muted,
    })
    this.page.drawText(value, {
      x: x + 12,
      y: y + 33,
      size: 18,
      font: this.bold,
      color: COLORS.text,
    })
    const noteLines = wrapText(note, this.regular, 8.6, width - 24)
    let noteY = y + 15
    for (const line of noteLines.slice(0, 2)) {
      this.page.drawText(line, {
        x: x + 12,
        y: noteY,
        size: 8.6,
        font: this.regular,
        color: COLORS.muted,
      })
      noteY -= 10
    }
  }

  highlightBox(title: string, text: string, accent = COLORS.blue) {
    const lines = wrapText(text, this.regular, 9.8, PAGE_WIDTH - MARGIN_X * 2 - 28)
    const boxHeight = 20 + lines.length * 13 + 16
    this.ensureSpace(boxHeight + 8)
    const y = this.y - boxHeight + 8
    this.page.drawRectangle({
      x: MARGIN_X,
      y,
      width: PAGE_WIDTH - MARGIN_X * 2,
      height: boxHeight,
      color: COLORS.softBlue,
      borderColor: COLORS.border,
      borderWidth: 1,
    })
    this.page.drawRectangle({
      x: MARGIN_X,
      y,
      width: 5,
      height: boxHeight,
      color: accent,
    })
    this.page.drawText(title, {
      x: MARGIN_X + 16,
      y: this.y - 6,
      size: 10.5,
      font: this.bold,
      color: COLORS.navy,
    })
    let lineY = this.y - 24
    for (const line of lines) {
      this.page.drawText(line, {
        x: MARGIN_X + 16,
        y: lineY,
        size: 9.8,
        font: this.regular,
        color: COLORS.text,
      })
      lineY -= 13
    }
    this.y = y - 14
  }

  barRow(label: string, value: number, color: ReturnType<typeof rgb>) {
    const safe = Math.max(0, Math.min(value, 100))
    this.ensureSpace(24)
    this.page.drawText(label, {
      x: MARGIN_X,
      y: this.y,
      size: 9.8,
      font: this.regular,
      color: COLORS.text,
    })
    this.page.drawText(`${safe}%`, {
      x: PAGE_WIDTH - MARGIN_X - 34,
      y: this.y,
      size: 9.8,
      font: this.bold,
      color: COLORS.text,
    })
    this.y -= 12
    this.page.drawRectangle({
      x: MARGIN_X,
      y: this.y,
      width: PAGE_WIDTH - MARGIN_X * 2,
      height: 8,
      color: COLORS.softBlue,
    })
    this.page.drawRectangle({
      x: MARGIN_X,
      y: this.y,
      width: ((PAGE_WIDTH - MARGIN_X * 2) * safe) / 100,
      height: 8,
      color,
    })
    this.y -= 16
  }
}

async function buildPdf(data: DashboardData, projectInfo: ProjectInfo) {
  const pdf = await PDFDocument.create()
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const logoPath = path.join(process.cwd(), "public", "ugcircle.png")
  const logoBytes = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : null
  const logo = logoBytes ? await pdf.embedPng(logoBytes) : null

  const title = safeText(projectInfo.nombre, "Proyecto FCI 2025")
  const description = safeText(
    projectInfo.descripcion,
    "Programa de formación y apoyo técnico para el emprendimiento de mujeres indígenas residentes en Guayaquil"
  )
  const period = `${safeText(projectInfo.fechaInicio, data.proyecto.inicio)} - ${safeText(projectInfo.fechaFin, data.proyecto.fin)}`

  const cover = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  cover.drawRectangle({ x: 0, y: PAGE_HEIGHT - 190, width: PAGE_WIDTH, height: 190, color: COLORS.navy })
  cover.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: 14, color: COLORS.cyan })

  if (logo) {
    const width = 92
    const height = (logo.height / logo.width) * width
    cover.drawImage(logo, {
      x: 42,
      y: PAGE_HEIGHT - 138,
      width,
      height,
    })
  }

  cover.drawText("Universidad de Guayaquil", {
    x: 150,
    y: PAGE_HEIGHT - 66,
    size: 22,
    font: bold,
    color: COLORS.white,
  })
  cover.drawText("Plataforma de gestión del proyecto FCI", {
    x: 150,
    y: PAGE_HEIGHT - 94,
    size: 10.5,
    font: regular,
    color: COLORS.white,
  })

  const titleLines = wrapText(title, bold, 21, PAGE_WIDTH - 84)
  let titleY = PAGE_HEIGHT - 250
  for (const line of titleLines) {
    cover.drawText(line, {
      x: 42,
      y: titleY,
      size: 21,
      font: bold,
      color: COLORS.navy,
    })
    titleY -= 25
  }

  const descLines = wrapText(description, regular, 11.2, PAGE_WIDTH - 84)
  let descY = titleY - 10
  for (const line of descLines.slice(0, 4)) {
    cover.drawText(line, {
      x: 42,
      y: descY,
      size: 11.2,
      font: regular,
      color: COLORS.muted,
    })
    descY -= 15
  }

  cover.drawRectangle({
    x: 42,
    y: descY - 116,
    width: PAGE_WIDTH - 84,
    height: 122,
    color: COLORS.softBlue,
    borderColor: COLORS.border,
    borderWidth: 1,
  })
  cover.drawText("Ficha técnica del informe", {
    x: 58,
    y: descY - 18,
    size: 12,
    font: bold,
    color: COLORS.navy,
  })

  const ficha = [
    `Periodo del proyecto: ${period}`,
    `Fecha de generación: ${formatGeneratedDate()}`,
    `Participantes en validación: ${data.validacion.encuestadas} de ${data.validacion.meta}`,
    `Producción científica ejecutada: ${data.produccion.completados} de ${data.produccion.meta}`,
    `Cursos diseñados: ${data.cursos.disenados}`,
  ]

  let fichaY = descY - 40
  for (const item of ficha) {
    cover.drawText(item, {
      x: 58,
      y: fichaY,
      size: 10.2,
      font: regular,
      color: COLORS.text,
    })
    fichaY -= 15
  }

  cover.drawText("Documento generado a partir de los indicadores reales visibles en el dashboard.", {
    x: 42,
    y: 72,
    size: 9.6,
    font: regular,
    color: COLORS.muted,
  })

  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const layout = new PdfLayout(pdf, regular, bold, page)
  layout.drawPageHeader()
  layout.drawPageFooter()

  layout.sectionTitle(
    "1. Resumen ejecutivo",
    "Síntesis general del estado del proyecto con base en las tarjetas, métricas y actividades visibles en el dashboard."
  )
  for (const text of executiveSummary(data)) {
    layout.paragraph(text)
  }

  layout.sectionTitle(
    "2. Estado general del proyecto",
    "Consolidado de los principales indicadores de desempeño, validación, oferta formativa y producción científica."
  )
  layout.ensureSpace(118)
  const cardsY = layout.y - 92
  layout.statCard(MARGIN_X, cardsY, 120, "Avance global", `${data.proyecto.avance}%`, "Porcentaje de ejecución acumulada del proyecto.", COLORS.blue)
  layout.statCard(MARGIN_X + 130, cardsY, 120, "Cursos diseñados", `${data.cursos.disenados}`, "Oferta formativa disponible en la plataforma.", COLORS.cyan)
  layout.statCard(MARGIN_X + 260, cardsY, 120, "Producción", `${data.produccion.completados}/${data.produccion.meta}`, "Productos científicos ejecutados frente a la meta.", COLORS.green)
  layout.statCard(MARGIN_X + 390, cardsY, 120, "Validación", `${data.validacion.encuestadas}`, "Participantes acumuladas en el proceso de validación.", COLORS.violet)
  layout.y = cardsY - 16

  layout.keyValueRow("Fecha de inicio", safeText(projectInfo.fechaInicio, data.proyecto.inicio))
  layout.keyValueRow("Fecha de fin", safeText(projectInfo.fechaFin, data.proyecto.fin))
  layout.keyValueRow("Tiempo transcurrido", `${data.proyecto.tiempoTranscurrido}%`)
  layout.keyValueRow("Meta de validación", `${data.validacion.meta} participantes`)
  layout.keyValueRow("Cumplimiento de validación", `${data.validacion.porcentaje}%`)

  layout.highlightBox(
    "Lectura gerencial",
    `El tablero reporta ${data.proyecto.avance}% de avance global y articula en una sola vista el seguimiento temporal del proyecto, la evolución de la producción científica, el diseño de cursos y la participación registrada en la validación del programa.`,
    COLORS.blue
  )

  layout.sectionTitle(
    "3. Diagnóstico territorial y perfil de las participantes",
    "Interpretación de los resultados de la encuesta diagnóstica consolidada en la plataforma."
  )
  layout.bullet(`Total de respuestas analizadas: ${data.diagnostico.respuestas}.`)
  layout.bullet(`Parroquias con mayor presencia: ${topList(data.diagnostico.parroquias, "Sin registros suficientes")}.`)
  layout.bullet(`Sectores económicos predominantes: ${topList(data.diagnostico.sectores, "Sin registros suficientes")}.`)
  layout.bullet(`Autoidentificación étnica más frecuente: ${topList(data.diagnostico.etnias, "Sin registros suficientes")}.`)
  layout.bullet(`Modalidades preferidas de capacitación: ${topList(data.diagnostico.modalidades, "Sin registros suficientes")}.`)

  layout.highlightBox(
    "Hallazgo diagnóstico",
    "La encuesta permite identificar patrones de localización, sector económico, modalidad formativa preferida y perfil cultural de las emprendedoras. Esta base sustenta la priorización de contenidos y la proyección de nuevas acciones formativas dentro del proyecto.",
    COLORS.cyan
  )

  layout.sectionTitle(
    "4. Necesidades de formación y competencias promedio",
    "Relación entre las necesidades priorizadas del dashboard y el nivel promedio de competencias reportado."
  )
  const needPalette = [COLORS.red, COLORS.amber, COLORS.blue, COLORS.violet, COLORS.green]
  if (data.necesidades.length === 0) {
    layout.paragraph("Todavía no existen necesidades de formación cuantificables porque la base diagnóstica no registra respuestas suficientes.")
  } else {
    data.necesidades.slice(0, 6).forEach((item, index) => {
      layout.barRow(item.necesidad, item.valor, needPalette[index] ?? COLORS.blue)
    })
  }

  layout.paragraph("Competencias promedio del diagnóstico:", { gapAfter: 2 })
  if (data.competencias.length === 0) {
    layout.paragraph("No se registran valores suficientes para el radar de competencias.")
  } else {
    data.competencias.forEach((item) => {
      layout.bullet(`${item.competencia}: ${item.valor}% de desempeño promedio.`)
    })
  }

  const strongestNeed = findTopNeed(data)
  const weakestCompetency = findWeakestCompetency(data)
  layout.highlightBox(
    "Interpretación pedagógica",
    `La combinación entre necesidades y competencias muestra que ${
      strongestNeed ? safeText(strongestNeed.necesidad).toLowerCase() : "las prioridades formativas"
    } debe atenderse con especial énfasis, mientras que ${
      weakestCompetency ? safeText(weakestCompetency.competencia).toLowerCase() : "las dimensiones más débiles"
    } requiere acompañamiento práctico, refuerzo metodológico y contenidos aplicados al negocio.`,
    COLORS.amber
  )

  layout.sectionTitle(
    "5. Formación, validación y producción científica",
    "Detalle operativo de los tres componentes con mayor trazabilidad dentro del dashboard."
  )
  layout.bullet(
    `Cursos: ${data.cursos.disenados} diseñados y ${data.cursos.enValidacion} en validación. Distribución actual: ${data.cursos.estados
      .map((item) => `${item.estado} ${item.valor}`)
      .join(", ")}.`
  )
  layout.bullet(
    `Producción científica: ${data.produccion.completados} ejecutados, ${data.produccion.enProceso ?? 0} en proceso y ${data.produccion.pendientes} pendientes. Cumplimiento global: ${data.produccion.cumplimiento}%.`
  )
  layout.bullet(
    `Validación del programa: ${data.validacion.encuestadas} participantes acumuladas sobre una meta de ${data.validacion.meta}, con cobertura de ${data.validacion.porcentaje}%.`
  )

  if (data.produccionPorInvestigador.length > 0) {
    layout.paragraph("Productos científicos ejecutados por investigador:", { gapAfter: 2 })
    data.produccionPorInvestigador.slice(0, 8).forEach((item) => {
      layout.bullet(
        `${item.investigador}: ${item.total} ejecutados, distribuidos en ${item.altoImpacto} de alto impacto y ${item.regional} regionales.`
      )
    })
  }

  layout.sectionTitle(
    "6. Próximas actividades del dashboard",
    "Agenda priorizada de acciones visibles en el panel de seguimiento del proyecto."
  )
  if (data.actividades.length === 0) {
    layout.paragraph("No se registran actividades programadas o en seguimiento al momento de generar el informe.")
  } else {
    data.actividades.slice(0, 10).forEach((actividad, index) => {
      layout.bullet(
        `${index + 1}. ${truncateText(actividad.titulo, 95)}. Fecha: ${actividad.fecha}. Estado: ${actividad.estado}. Origen: ${actividad.fuente}.`
      )
    })
  }

  layout.highlightBox(
    "Conclusión ejecutiva",
    "El informe se construye íntegramente a partir del dashboard de la plataforma. Por ello, cada cifra descrita en este documento mantiene trazabilidad con las tarjetas, gráficos y listados operativos que usa el equipo para monitoreo, toma de decisiones y rendición de avances.",
    COLORS.green
  )

  return Buffer.from(await pdf.save())
}

export async function GET() {
  const [data, projectInfo] = await Promise.all([getProjectDashboardData(), getProjectInfo()])
  const pdf = await buildPdf(data, projectInfo)

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="informe_dashboard_${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  })
}
