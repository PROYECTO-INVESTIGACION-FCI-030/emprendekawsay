"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Activity = {
  titulo: string
  fecha: string
  estado: "En proceso" | "Progresando"
  progreso: number
}

const activities: Activity[] = [
  { titulo: "Validación del módulo de Finanzas", fecha: "12/11/2025", estado: "En proceso", progreso: 65 },
  { titulo: "Encuesta de satisfacción a participantes", fecha: "18/11/2025", estado: "Progresando", progreso: 40 },
  { titulo: "Publicación de artículo científico", fecha: "25/11/2025", estado: "En proceso", progreso: 30 },
  { titulo: "Taller de marketing digital", fecha: "02/12/2025", estado: "Progresando", progreso: 15 },
  { titulo: "Informe de avance trimestral", fecha: "10/12/2025", estado: "En proceso", progreso: 50 },
]

export function UpcomingActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Próximas Actividades</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {activities.map((a) => (
            <li key={a.titulo} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{a.titulo}</p>
                <p className="text-xs text-muted-foreground">{a.fecha}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                  a.estado === "En proceso"
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {a.estado}
              </span>
              <div className="hidden w-24 shrink-0 sm:block">
                <div className="mb-1 text-right text-xs font-medium text-foreground">
                  {a.progreso}%
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${a.progreso}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
