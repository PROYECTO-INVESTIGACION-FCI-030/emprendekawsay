import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  FileCheck2,
  TrendingUp,
} from "lucide-react"
import { Card } from "@/components/ui/card"

const stats = [
  { label: "Participantes", value: "267", detail: "Mujeres emprendedoras registradas", icon: ClipboardList, color: "text-primary" },
  { label: "Encuestas", value: "180", detail: "Diagnosticos completados", icon: FileCheck2, color: "text-chart-2" },
  { label: "Necesidades", value: "82%", detail: "Requieren educacion financiera", icon: BarChart3, color: "text-chart-3" },
  { label: "Cursos", value: "5", detail: "Modulos formativos activos", icon: BookOpenCheck, color: "text-chart-4" },
  { label: "Avance", value: "65%", detail: "Progreso global del proyecto", icon: TrendingUp, color: "text-chart-5", progress: 65 },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
            <div className={`flex h-9 w-9 items-center justify-center rounded-md bg-accent ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.detail}</p>
          {stat.progress !== undefined && (
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${stat.progress}%` }} />
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
