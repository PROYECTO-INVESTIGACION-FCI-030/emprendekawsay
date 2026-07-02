import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AvanceActivitiesPanel } from "@/components/avance/avance-activities-panel"
import { getActividadesProyecto } from "@/lib/actividades-proyecto"
import { actualizarActividadProyecto, eliminarActividadProyecto, guardarActividadProyecto } from "@/lib/actividades-proyecto-actions"
import { getScientificProducts } from "@/lib/scientific-production"

function formatDateOnly(value: string | null | undefined) {
  if (!value) return "Sin fecha"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Sin fecha"
  return date.toLocaleDateString("es-EC")
}

export default async function AvancePage() {
  const [actividadesProyecto, productos] = await Promise.all([getActividadesProyecto(), getScientificProducts()])

  const actividades = [
    ...actividadesProyecto.map((actividad) => ({
      id: actividad.id,
      titulo: actividad.titulo,
      descripcion: actividad.descripcion ?? "Sin descripción",
      fecha: actividad.fecha_objetivo,
      estado:
        actividad.estado === "en_proceso"
          ? "En proceso"
          : actividad.estado === "completado"
            ? "Completada"
            : "Programada",
      fuente: "Proyecto",
    })),
    ...productos.flatMap((product) => {
      const items = []

      if (product.estado === "publicado") {
        items.push({
          id: `${product.id}-ejecutado`,
          titulo: product.titulo,
          descripcion: product.descripcion ?? "Sin descripción",
          fecha: formatDateOnly(product.fecha_publicacion ?? product.fecha_objetivo),
          estado: "Ejecutada",
          fuente: "Científica",
        })
      } else if (product.fecha_objetivo) {
        items.push({
          id: `${product.id}-planificado`,
          titulo: product.titulo,
          descripcion: product.descripcion ?? "Sin descripción",
          fecha: product.fecha_objetivo,
          estado:
            product.estado === "en_revision"
              ? "En revisión"
              : product.estado === "en_redaccion"
                ? "En redacción"
                : product.estado === "en_proceso"
                  ? "En proceso"
                  : "Programada",
          fuente: "Científica",
        })
      }

      return items
    }),
  ].sort((a, b) => a.fecha.localeCompare(b.fecha))

  const programadas = actividades.filter((actividad) => actividad.estado === "Programada").length
  const enProceso = actividades.filter((actividad) => ["En proceso", "En redacción", "En revisión"].includes(actividad.estado)).length
  const completadas = actividades.filter((actividad) => ["Completada", "Ejecutada"].includes(actividad.estado)).length
  const totalActividades = actividades.length
  const avanceGlobal = totalActividades ? Math.round((completadas / totalActividades) * 100) : 0

  return (
    <AppShell>
      <Toolbar
        titulo="Avance del Proyecto"
        descripcion="Gestión central de actividades del proyecto y de producción científica"
        showControls={false}
      />
      <div className="space-y-4 px-4 pb-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avance global</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-semibold text-foreground">{avanceGlobal}%</p>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${avanceGlobal}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{completadas} de {totalActividades} actividades completadas entre proyecto y producción científica</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Programadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">{programadas}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">En proceso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">{enProceso}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">{completadas}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Crear actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={guardarActividadProyecto} className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block space-y-1.5 text-sm font-medium">
                    <span>Título</span>
                    <input
                      name="titulo"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      placeholder="Ej. Validación de módulo financiero"
                    />
                  </label>
                  <label className="block space-y-1.5 text-sm font-medium">
                    <span>Fecha objetivo</span>
                    <input
                      name="fecha_objetivo"
                      type="date"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </label>
                </div>
                <label className="block space-y-1.5 text-sm font-medium">
                  <span>Descripción</span>
                  <textarea
                    name="descripcion"
                    className="min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Describe la actividad y su alcance"
                  />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block space-y-1.5 text-sm font-medium">
                    <span>Orden</span>
                    <input
                      name="orden"
                      type="number"
                      min="1"
                      defaultValue="1"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </label>
                  <label className="block space-y-1.5 text-sm font-medium">
                    <span>Estado</span>
                    <select
                      name="estado"
                      defaultValue="programado"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="programado">Programada</option>
                      <option value="en_proceso">En proceso</option>
                      <option value="completado">Completada</option>
                    </select>
                  </label>
                </div>
                <button
                  type="submit"
                  className="h-10 rounded-md bg-[#00529b] px-4 text-sm font-semibold text-white hover:bg-[#003f78]"
                >
                  Guardar actividad
                </button>
              </form>

              <details className="mt-4 rounded-md border border-border bg-muted/30">
                <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-foreground">
                  Editar actividades del proyecto
                </summary>
                <div className="border-t border-border p-3">
                  <div className="grid gap-3">
                    {actividadesProyecto.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Todavía no hay actividades de proyecto para editar.</p>
                    ) : (
                      actividadesProyecto.map((actividad) => (
                        <div key={actividad.id} className="w-full space-y-3 rounded-md border border-border bg-white p-4">
                          <form action={actualizarActividadProyecto} className="space-y-3">
                            <input type="hidden" name="id" value={actividad.id} />
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">{actividad.titulo}</p>
                              <p className="text-sm text-muted-foreground">{actividad.descripcion ?? "Sin descripción"}</p>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_180px]">
                              <label className="block min-w-0 space-y-1.5 text-sm font-medium">
                                <span>Fecha objetivo</span>
                                <input
                                  name="fecha_objetivo"
                                  type="date"
                                  defaultValue={actividad.fecha_objetivo}
                                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                />
                              </label>
                              <label className="block min-w-0 space-y-1.5 text-sm font-medium">
                                <span>Estado</span>
                                <select
                                  name="estado"
                                  defaultValue={actividad.estado}
                                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                >
                                  <option value="programado">Programada</option>
                                  <option value="en_proceso">En proceso</option>
                                  <option value="completado">Completada</option>
                                </select>
                              </label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="submit"
                                className="h-9 rounded-md bg-[#00529b] px-4 text-sm font-semibold text-white hover:bg-[#003f78]"
                              >
                                Guardar cambios
                              </button>
                            </div>
                          </form>
                          <form action={eliminarActividadProyecto}>
                            <input type="hidden" name="id" value={actividad.id} />
                            <button
                              type="submit"
                              className="h-9 rounded-md border border-destructive/30 bg-destructive/10 px-4 text-sm font-semibold text-destructive hover:bg-destructive/20"
                            >
                              Eliminar actividad
                            </button>
                          </form>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </details>
            </CardContent>
          </Card>

          <AvanceActivitiesPanel activities={actividades} />
        </div>
      </div>
    </AppShell>
  )
}
