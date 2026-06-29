"use client"

import { useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ActivityItem = {
  id: string
  titulo: string
  descripcion: string
  fecha: string
  estado: string
  fuente: string
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function AvanceActivitiesPanel({ activities }: { activities: ActivityItem[] }) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<"todo" | "programadas" | "ejecutadas" | "completadas">("todo")

  const filtered = useMemo(() => {
    if (filter === "todo") return activities
    if (filter === "programadas") {
      return activities.filter((item) => item.estado === "Programada" || item.estado === "Pendiente")
    }
    if (filter === "ejecutadas") {
      return activities.filter((item) => ["En proceso", "En redacción", "En revisión", "Ejecutada"].includes(item.estado))
    }
    return activities.filter((item) => ["Completada", "Publicada"].includes(item.estado))
  }, [activities, filter])

  const label =
    filter === "todo"
      ? "Todo"
      : filter === "programadas"
        ? "Programadas"
        : filter === "ejecutadas"
          ? "Ejecutadas"
          : "Completadas"

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Actividades programadas</CardTitle>
          <div className="relative">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen((value) => !value)} className="min-w-32 justify-between">
              {label}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            {open ? (
              <div className="absolute right-0 top-11 z-10 w-44 overflow-hidden rounded-md border border-border bg-background shadow-lg">
                {[
                  { value: "todo", label: "Todo" },
                  { value: "programadas", label: "Programadas" },
                  { value: "ejecutadas", label: "Ejecutadas" },
                  { value: "completadas", label: "Completadas/Publicadas" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setFilter(option.value as typeof filter)
                      setOpen(false)
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay actividades para este filtro.</p>
          ) : (
            filtered.map((actividad) => (
              <div key={`${actividad.fuente}-${actividad.id}`} className="rounded-md border border-border bg-white px-4 py-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{actividad.titulo}</p>
                      <Badge variant="secondary">{actividad.fuente}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{actividad.descripcion}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant={
                        actividad.estado === "En proceso" ||
                        actividad.estado === "En redacción" ||
                        actividad.estado === "En revisión" ||
                        actividad.estado === "Ejecutada"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {actividad.estado}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{formatDate(actividad.fecha)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
