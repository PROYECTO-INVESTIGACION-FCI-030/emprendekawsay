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
            <ResumenPdfButton />
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

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-md border border-border bg-card p-6">
            <h3 className="text-base font-semibold text-foreground">Lectura analítica</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              El dashboard se alimenta de las tablas reales de Supabase y reúne información del diagnóstico, la formación, la
              validación, la producción científica y el avance del proyecto. Cuando cambian las respuestas o se agregan nuevos
              registros, los porcentajes y resúmenes se actualizan automáticamente.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Las necesidades más detectadas, como marketing digital, uso de tecnología y educación financiera, se ordenan según
              la frecuencia de las respuestas. Por eso el informe puede variar cuando se incorporen nuevas encuestas.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Diagnóstico</p>
                <p className="mt-1 text-sm font-medium text-foreground">{data.diagnostico.respuestas} respuestas consolidadas</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  La base permite observar parroquias, sectores, niveles educativos, etnias y modalidad preferida.
                </p>
              </div>
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Actividades</p>
                <p className="mt-1 text-sm font-medium text-foreground">{data.actividades.length} acciones próximas</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Las actividades del proyecto y de producción científica se reflejan en el seguimiento operativo.
                </p>
              </div>
            </div>
          </article>

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
              <div className="rounded-md border border-border bg-background p-4">
                <p className="font-medium text-foreground">Lectura institucional</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  El informe resume el avance, la validación, la producción científica y las prioridades de formación en un
                  formato más narrativo y útil para socialización.
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  )
}
