import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { EncuestaExportButton } from "@/components/reportes/encuesta-export-button"
import { ResumenPdfButton } from "@/components/reportes/resumen-pdf-button"
import { getProjectDashboardData } from "@/lib/project-dashboard"

export default async function ReportesPage() {
  const data = await getProjectDashboardData()

  return (
    <AppShell>
      <Toolbar titulo="Reportes" descripcion="Informes ejecutivos y exportación de evidencia del proyecto" showControls={false} />
      <div className="space-y-4 px-4 pb-8 sm:px-6">
        <section className="rounded-md border border-border bg-card">
          <header className="border-b border-border px-4 py-4 sm:px-6">
            <h3 className="text-base font-semibold text-foreground">Resumen ejecutivo del dashboard</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Genera un documento formal con lectura analítica, métricas clave y trazabilidad de los indicadores
              principales del proyecto.
            </p>
          </header>

          <div className="grid gap-4 px-4 py-5 md:grid-cols-2 xl:grid-cols-4 sm:px-6">
            <article className="rounded-md border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Avance</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{data.proyecto.avance}%</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Seguimiento acumulado del proyecto entre {data.proyecto.inicio} y {data.proyecto.fin}.
              </p>
            </article>

            <article className="rounded-md border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Cursos</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{data.cursos.disenados}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Cursos diseñados con control de validación y estado de publicación.
              </p>
            </article>

            <article className="rounded-md border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Producción científica</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{data.produccion.completados}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Productos ejecutados sobre una meta de {data.produccion.meta}, con fechas y trazabilidad operativa.
              </p>
            </article>

            <article className="rounded-md border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Validación</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{data.validacion.encuestadas}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Participantes registradas frente a una meta de {data.validacion.meta}.
              </p>
            </article>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-1">
          <article className="rounded-md border border-border bg-card p-4 sm:p-6">
            <h3 className="text-base font-semibold text-foreground">Exportaciones disponibles</h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-md border border-border bg-background p-4">
                <p className="font-medium text-foreground">Encuesta completa</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Exporta el consolidado total de respuestas en Excel, con todas las preguntas y filas almacenadas en la
                  base de datos.
                </p>
                <div className="mt-3">
                  <EncuestaExportButton />
                </div>
              </div>

              <div className="rounded-md border border-border bg-background p-4">
                <p className="font-medium text-foreground">Informe ejecutivo en PDF</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Descarga un informe institucional con portada, síntesis del dashboard, lectura diagnóstica y detalle
                  narrativo de los indicadores del proyecto.
                </p>
                <div className="mt-3">
                  <ResumenPdfButton />
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  )
}
