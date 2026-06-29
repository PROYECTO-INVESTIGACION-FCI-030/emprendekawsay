import { NextResponse } from "next/server"
import { getProjectDashboardData } from "@/lib/project-dashboard"

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
}

function wrapLines(text: string, maxChars = 90) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars) {
      if (current) lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines
}

function buildPdf(lines: string[]) {
  const contentLines = ["BT", "/F1 12 Tf", "1 0 0 1 50 790 Tm"]
  let first = true
  for (const line of lines) {
    if (!first) contentLines.push("0 -16 Td")
    contentLines.push(`(${escapePdfText(line)}) Tj`)
    first = false
  }
  contentLines.push("ET")
  const content = contentLines.join("\n")

  const objects: string[] = []
  const offsets: number[] = []
  let length = 0
  function addObject(body: string) {
    offsets.push(length)
    objects.push(body)
    length += body.length
  }

  addObject("%PDF-1.4\n")
  addObject("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n")
  addObject("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n")
  addObject("3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n")
  addObject("4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n")
  addObject(`5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream\nendobj\n`)

  const body = objects.join("")
  const xrefOffset = body.length
  const xref = [
    "xref",
    "0 6",
    "0000000000 65535 f ",
    ...offsets.map((offset) => String(offset).padStart(10, "0") + " 00000 n "),
    "trailer << /Size 6 /Root 1 0 R >>",
    "startxref",
    String(xrefOffset),
    "%%EOF",
  ].join("\n")

  return Buffer.from(body + xref, "binary")
}

export async function GET() {
  const data = await getProjectDashboardData()
  const lines = [
    "Informe ejecutivo del proyecto",
    `Periodo: ${data.periodo}`,
    "",
    `Avance general del proyecto: ${data.proyecto.avance}%`,
    `Oferta formativa: ${data.cursos.disenados} cursos disenados, ${data.cursos.enValidacion} en validacion y ${data.cursos.total} en total.`,
    `Produccion cientifica: ${data.produccion.completados} productos completados de una meta de ${data.produccion.meta} (${data.produccion.cumplimiento}%).`,
    `Validacion del programa: ${data.validacion.encuestadas} participantes registradas frente a una meta de ${data.validacion.meta}.`,
    `Diagnostico consolidado: ${data.diagnostico.respuestas} respuestas procesadas para necesidades y competencias.`,
    `Actividades proximas: ${data.actividades.length} acciones visibles en el seguimiento operativo.`,
    "",
    "Principales necesidades de formacion:",
    ...data.necesidades.map((item) => `- ${item.necesidad}: ${item.valor}%`),
    "",
    "Competencias promedio identificadas:",
    ...data.competencias.map((item) => `- ${item.competencia}: ${item.valor}%`),
    "",
    "Sintesis ejecutiva:",
    "El dashboard consolida el avance del proyecto, la oferta formativa, la produccion cientifica y la validacion del programa en una sola lectura institucional.",
    "Las necesidades de formacion se actualizan segun las respuestas registradas, por lo que los porcentajes varian a medida que aumenta la base de datos.",
    "La produccion cientifica y las actividades del proyecto se sincronizan con las acciones proximas y con la linea de tiempo general para facilitar el seguimiento.",
    "El diagnostico integra parroquia, sector economico, ingreso mensual y nivel de instruccion para sustentar decisiones de formacion mas precisas.",
  ].flatMap((line) => (line ? wrapLines(line, 88) : [""]))

  const pdf = buildPdf(lines)

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="reporte_resumen_${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  })
}
