import fs from "node:fs"
import path from "node:path"
import { NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { getProjectDashboardData } from "@/lib/project-dashboard"
import { getProjectInfo } from "@/lib/project-info"

type AiSummary = {
  resumen: string[]
  hallazgos: string[]
  recomendaciones: string[]
}

function wrapLines(text: string, maxChars = 88) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxChars) {
      if (current) lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

async function buildAiSummary(data: Awaited<ReturnType<typeof getProjectDashboardData>>): Promise<AiSummary> {
  const apiKey = process.env.GEMINI_API_KEY
  const fallback: AiSummary = {
      resumen: [
        `El proyecto registra un avance global de ${data.proyecto.avance}% dentro del periodo informado.`,
        "El informe consolida diagnóstico, validación, producción científica y avance general del proyecto.",
      ],
    hallazgos: [
      `La validación del programa registra ${data.validacion.encuestadas} participantes frente a una meta de ${data.validacion.meta}.`,
      `La producción científica completada alcanza ${data.produccion.completados} productos de una meta de ${data.produccion.meta}.`,
    ],
      recomendaciones: [
        "Fortalecer las necesidades críticas vinculadas con marketing digital, herramientas básicas y pagos digitales.",
        "Mantener la actualización de la base de datos para que los resúmenes institucionales reflejen el avance real.",
      ],
  }

  if (!apiKey) return fallback

  const prompt = [
    "Redacta un informe institucional breve, formal y académico para un proyecto de investigación sobre mujeres emprendedoras indígenas.",
    "Usa solo los datos entregados y no inventes cifras.",
    "Escribe con tono institucional, sobrio y profesional, como si fuera un informe universitario de seguimiento.",
    "Evita frases genéricas, redundancias, lenguaje promocional y expresiones demasiado conversacionales.",
    "Prioriza redacción clara, sintaxis limpia, vocabulario técnico moderado y coherencia entre secciones.",
    "Devuelve solo JSON válido con esta estructura exacta:",
    '{"resumen":["..."],"hallazgos":["..."],"recomendaciones":["..."]}',
    "Cada arreglo debe tener entre 2 y 4 elementos, redactados en español claro, preciso y elegante.",
    "El resumen debe sonar como un texto de informe; los hallazgos deben ser analíticos; las recomendaciones deben ser concretas y accionables.",
    `Datos: ${JSON.stringify({
      titulo: (await getProjectInfo()).nombre,
      periodo: data.periodo,
      avance: data.proyecto.avance,
      produccion: data.produccion,
      validacion: data.validacion,
      diagnostico: data.diagnostico,
      necesidades: data.necesidades.slice(0, 5),
      competencias: data.competencias.slice(0, 5),
    })}`,
  ].join("\n")

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.25, responseMimeType: "application/json" },
      }),
    })

    if (!response.ok) return fallback
    const payload = await response.json()
    const text = payload?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("") ?? ""
    const parsed = JSON.parse(text)
    return {
      resumen: Array.isArray(parsed?.resumen) ? parsed.resumen.filter((item: unknown) => typeof item === "string") : fallback.resumen,
      hallazgos: Array.isArray(parsed?.hallazgos) ? parsed.hallazgos.filter((item: unknown) => typeof item === "string") : fallback.hallazgos,
      recomendaciones: Array.isArray(parsed?.recomendaciones)
        ? parsed.recomendaciones.filter((item: unknown) => typeof item === "string")
        : fallback.recomendaciones,
    }
  } catch {
    return fallback
  }
}

async function buildPdf(data: Awaited<ReturnType<typeof getProjectDashboardData>>, ai: AiSummary) {
  const pdf = await PDFDocument.create()
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const logoPath = path.join(process.cwd(), "public", "ugcircle.png")
  const logoBytes = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : null
  const logo = logoBytes ? await pdf.embedPng(logoBytes) : null

  const blue = rgb(0.06, 0.31, 0.51)
  const lightBlue = rgb(0.93, 0.96, 1)
  const gray = rgb(0.3, 0.34, 0.39)
  const projectInfo = await getProjectInfo()
  const coverTitle = projectInfo?.nombre?.trim() || "Proyecto FCI 2025"

  const page1 = pdf.addPage([595.28, 841.89])
  const { width, height } = page1.getSize()
  page1.drawRectangle({ x: 0, y: height - 150, width, height: 150, color: blue })

  if (logo) {
    const logoWidth = 92
    const logoHeight = (logo.height / logo.width) * logoWidth
    page1.drawImage(logo, { x: 42, y: height - 126, width: logoWidth, height: logoHeight })
  }

  page1.drawText("Universidad de Guayaquil", {
    x: logo ? 148 : 42,
    y: height - 60,
    size: 18,
    font: bold,
    color: rgb(1, 1, 1),
  })
  page1.drawText("Informe institucional automatizado", {
    x: logo ? 148 : 42,
    y: height - 84,
    size: 10.4,
    font: regular,
    color: rgb(1, 1, 1),
  })

  page1.drawText(coverTitle, {
    x: 42,
    y: height - 220,
    size: 18,
    font: bold,
    color: blue,
    maxWidth: width - 84,
    lineHeight: 24,
  })
  page1.drawText(`Periodo de seguimiento: ${data.periodo}`, {
    x: 42,
    y: height - 255,
    size: 10.5,
    font: regular,
    color: gray,
  })
  page1.drawRectangle({ x: 42, y: height - 322, width: width - 84, height: 56, borderColor: rgb(0.85, 0.91, 1), borderWidth: 1, color: lightBlue })
  page1.drawText("Proyecto FCI 2025", {
    x: 58,
    y: height - 296,
    size: 13,
    font: bold,
    color: blue,
  })
  page1.drawText("Resumen institucional automatizado", {
    x: 58,
    y: height - 315,
    size: 9.2,
    font: regular,
    color: gray,
  })

  const page2 = pdf.addPage([595.28, 841.89])
  let y = 805
  const margin = 42

  const sectionTitle = (title: string) => {
    page2.drawText(title, { x: margin, y, size: 12.5, font: bold, color: blue })
    y -= 8
    page2.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.8, color: rgb(0.85, 0.91, 1) })
    y -= 18
  }

  const paragraph = (text: string, size = 10.2) => {
    const lines = wrapLines(text, 90)
    for (const line of lines) {
      page2.drawText(line, { x: margin, y, size, font: regular, color: rgb(0.12, 0.15, 0.18) })
      y -= 14
    }
    y -= 2
  }

  const bullet = (text: string) => {
    const lines = wrapLines(text, 84)
    if (!lines.length) return
    page2.drawText(`- ${lines[0]}`, { x: margin, y, size: 10.1, font: regular, color: rgb(0.12, 0.15, 0.18) })
    y -= 14
    for (const line of lines.slice(1)) {
      page2.drawText(line, { x: margin + 12, y, size: 10.1, font: regular, color: rgb(0.12, 0.15, 0.18) })
      y -= 14
    }
    y -= 2
  }

  sectionTitle("Resumen ejecutivo")
  for (const line of ai.resumen) paragraph(line)

  sectionTitle("Estado general")
  const stats = [
    `Avance del proyecto: ${data.proyecto.avance}%`,
    `Cursos diseñados: ${data.cursos.disenados}`,
    `Producción científica completada: ${data.produccion.completados} de ${data.produccion.meta}`,
    `Validación del programa: ${data.validacion.encuestadas} participantes frente a una meta de ${data.validacion.meta}`,
    `Respuestas de diagnóstico procesadas: ${data.diagnostico.respuestas}`,
  ]
  for (const item of stats) paragraph(item)

  sectionTitle("Hallazgos clave")
  for (const item of ai.hallazgos) bullet(item)

  sectionTitle("Necesidades de formación priorizadas")
  for (const item of data.necesidades.slice(0, 5)) bullet(`${item.necesidad}: ${item.valor}%`)

  sectionTitle("Competencias promedio identificadas")
  for (const item of data.competencias.slice(0, 5)) bullet(`${item.competencia}: ${item.valor}%`)

  sectionTitle("Recomendaciones")
  for (const item of ai.recomendaciones) bullet(item)

  page2.drawLine({ start: { x: margin, y: 42 }, end: { x: width - margin, y: 42 }, thickness: 0.8, color: rgb(0.85, 0.91, 1) })
  page2.drawText("Firma de revisión institucional: ____________________", {
    x: margin,
    y: 24,
    size: 8.5,
    font: regular,
    color: gray,
  })

  return Buffer.from(await pdf.save())
}

export async function GET() {
  const data = await getProjectDashboardData()
  const ai = await buildAiSummary(data)
  const pdf = await buildPdf(data, ai)

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="informe_parcial_${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  })
}
