import Link from "next/link"
import { ArrowRight, BookOpenCheck, Eye } from "lucide-react"
import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Curso, TareaCurso } from "@/lib/cursos"

export function FormationCatalog({ cursos, tareas }: { cursos: Curso[]; tareas: TareaCurso[] }) {
  return (
    <AppShell>
      <Toolbar
        titulo="Formacion"
        descripcion="Cursos disponibles para fortalecer tu emprendimiento"
        showControls={false}
      />
      <div className="px-4 pb-10 sm:px-6">
        {cursos.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-6 py-12 text-center">
            <BookOpenCheck className="mx-auto h-7 w-7 text-muted-foreground" />
            <h2 className="mt-3 font-semibold text-foreground">No hay cursos publicados</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Los nuevos cursos apareceran aqui cuando el equipo los publique.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cursos.map((curso) => {
              const totalTareas = tareas.filter((tarea) => tarea.id_curso === curso.id).length
              return (
                <Card key={curso.id} className="flex h-full flex-col">
                  <CardHeader>
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent text-primary">
                      <BookOpenCheck className="h-5 w-5" />
                    </div>
                    <CardTitle className="mt-3 text-lg">{curso.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <p className="flex-1 text-sm leading-6 text-muted-foreground">{curso.descripcion}</p>
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        {totalTareas} {totalTareas === 1 ? "tarea" : "tareas"}
                      </span>
                      <Link
                        href={`/formacion/${curso.id}`}
                        className={buttonVariants({ size: "sm" })}
                      >
                        Entrar al curso
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
