import type { LucideIcon } from "lucide-react"
import { ArrowRight, CheckCircle2, Download, FileText, Filter, Settings2 } from "lucide-react"
import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type Metric = {
  label: string
  value: string
  detail: string
  icon: LucideIcon
}

export type Section = {
  title: string
  items: string[]
}

export type WorkflowStep = {
  label: string
  description: string
}

export type TableRowData = {
  name: string
  owner: string
  status: string
  progress: string
}

export type AdminModulePageProps = {
  title: string
  description: string
  metrics: Metric[]
  sections: Section[]
  workflow?: WorkflowStep[]
  tableTitle: string
  tableRows: TableRowData[]
  primaryAction?: string
}

export function AdminModulePage({
  title,
  description,
  metrics,
  sections,
  workflow,
  tableTitle,
  tableRows,
  primaryAction = "Nuevo registro",
}: AdminModulePageProps) {
  return (
    <AppShell>
      <Toolbar titulo={title} descripcion={description} showControls={false} />
      <div className="space-y-4 px-6 pb-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{metric.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-primary">
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{metric.detail}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-base">Gestion administrativa</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Filter className="mr-1.5 h-4 w-4" />
                  Filtrar
                </Button>
                <Button size="sm">
                  <Settings2 className="mr-1.5 h-4 w-4" />
                  {primaryAction}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {sections.map((section) => (
                  <div key={section.title} className="rounded-md border border-border p-4">
                    <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                    <ul className="mt-3 space-y-2">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Flujo del modulo</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {(workflow ?? []).map((step, index) => (
                  <li key={step.label} className="flex gap-3 rounded-md border border-border p-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-base">{tableTitle}</CardTitle>
            <Button size="sm" variant="outline">
              <Download className="mr-1.5 h-4 w-4" />
              Exportar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Elemento</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Avance</TableHead>
                    <TableHead className="text-right">Accion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableRows.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell className="font-medium text-foreground">{row.name}</TableCell>
                      <TableCell className="text-muted-foreground">{row.owner}</TableCell>
                      <TableCell>
                        <Badge variant={row.status === "Activo" ? "default" : "secondary"}>
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.progress}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost">
                          <FileText className="mr-1.5 h-4 w-4" />
                          Abrir
                          <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
