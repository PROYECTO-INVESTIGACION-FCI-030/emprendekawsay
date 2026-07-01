import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { EncuestaExportButton } from "@/components/reportes/encuesta-export-button"
import { ResumenPdfButton } from "@/components/reportes/resumen-pdf-button"
import { getProjectDashboardData } from "@/lib/project-dashboard"

export default async function ReportesPage() {
  const data = await getProjectDashboardData()

  return (
    <AppShell>
      <Toolbar titulo="Reportes" descripcion="Informes textuales y exportación de evidencia" showControls={false} />
      <div className="space-y-4 px-4 pb-8 sm:px-6">
        <section className="rounded-md border border-border bg-card">
          <header className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Resumen del dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Un informe escrito con los datos más importantes del proyecto, pensado para descargar en PDF y compartir sin
                tantas gráficas.
              </p>
            </div>
          </header>
          <div className="grid gap-4 px-6 py-5 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-md border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Avance</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{data.proyecto.avance}%</p>
              <p className="mt-2 text-sm text-muted-foreground">
                El proyecto se encuentra en desarrollo continuo desde {data.proyecto.inicio} hasta {data.proyecto.fin}.
              </p>
            </article>
            <article className="rounded-md border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Cursos</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{data.cursos.disenados}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Cursos diseñados con seguimiento de validación y estado de publicación.
              </p>
            </article>
            <article className="rounded-md border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Producción científica</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{data.produccion.completados}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Productos completados sobre una meta de {data.produccion.meta}, con avance medible y fechas reales.
              </p>
            </article>
            <article className="rounded-md border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Validación</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{data.validacion.encuestadas}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Participantes registradas en el programa frente a una meta de {data.validacion.meta}.
              </p>
            </article>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-1">
          <article className="rounded-md border border-border bg-card p-6">
            <h3 className="text-base font-semibold text-foreground">Descargas disponibles</h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-md border border-border bg-background p-4">
                <p className="font-medium text-foreground">Encuesta completa</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Exporta el consolidado completo de respuestas de la encuesta en Excel, con todas las preguntas y registros
                  disponibles.
                </p>
                <div className="mt-3">
                  <EncuestaExportButton />
                </div>
              </div>
              <div className="rounded-md border border-border bg-background p-4">
                <p className="font-medium text-foreground">Resumen PDF</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Descarga un documento breve con el mismo contenido textual del dashboard, sin saturarlo de gráficas.
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
