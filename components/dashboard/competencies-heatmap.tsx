"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Each competency has a diagnostic average score (0-100)
const competencies = [
  { name: "Gestión", value: 78 },
  { name: "Finanzas", value: 45 },
  { name: "Marketing", value: 62 },
  { name: "Digital", value: 38 },
  { name: "Liderazgo", value: 71 },
  { name: "Innovación", value: 55 },
  { name: "Ventas", value: 49 },
  { name: "Legal", value: 33 },
  { name: "Producción", value: 67 },
  { name: "Comunicación", value: 74 },
  { name: "Planeación", value: 58 },
  { name: "Redes", value: 41 },
]

// Map a value 0-100 to a chart green heat color
function heatColor(value: number) {
  // interpolate opacity of the primary green based on value
  const opacity = 0.2 + (value / 100) * 0.8
  return `color-mix(in oklch, var(--chart-1) ${Math.round(opacity * 100)}%, white)`
}

function textColor(value: number) {
  return value >= 55 ? "var(--primary-foreground)" : "var(--foreground)"
}

// Hexagon geometry (pointy-top), arranged in a honeycomb grid
const HEX_W = 92
const HEX_H = 104
const COLS = 4

function hexPath(cx: number, cy: number, r: number) {
  const pts = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30)
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return pts.join(" ")
}

export function CompetenciesHeatmap() {
  const r = HEX_W / 2
  const rows = Math.ceil(competencies.length / COLS)
  const width = COLS * HEX_W + HEX_W / 2 + 8
  const height = rows * (HEX_H * 0.78) + HEX_H * 0.3

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Competencias Promedio (Diagnóstico)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-[260px] w-full"
            role="img"
            aria-label="Mapa de calor hexagonal de competencias promedio"
          >
            {competencies.map((c, i) => {
              const col = i % COLS
              const row = Math.floor(i / COLS)
              const offsetX = row % 2 === 1 ? HEX_W / 2 : 0
              const cx = r + col * HEX_W + offsetX + 4
              const cy = r + row * HEX_H * 0.78
              return (
                <g key={c.name}>
                  <polygon
                    points={hexPath(cx, cy, r - 3)}
                    fill={heatColor(c.value)}
                    stroke="var(--card)"
                    strokeWidth={3}
                  />
                  <text
                    x={cx}
                    y={cy - 4}
                    textAnchor="middle"
                    style={{ fill: textColor(c.value) }}
                    className="text-[11px] font-medium"
                  >
                    {c.name}
                  </text>
                  <text
                    x={cx}
                    y={cy + 13}
                    textAnchor="middle"
                    style={{ fill: textColor(c.value) }}
                    className="text-[13px] font-bold"
                  >
                    {c.value}%
                  </text>
                </g>
              )
            })}
          </svg>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Bajo</span>
            <div className="h-2 w-32 rounded-full bg-[linear-gradient(to_right,color-mix(in_oklch,var(--chart-1)_20%,white),var(--chart-1))]" />
            <span>Alto</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
