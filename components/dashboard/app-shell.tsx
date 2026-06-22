import type { ReactNode } from "react"
import { HeaderSync } from "@/components/dashboard/header-sync"
import { Sidebar } from "@/components/dashboard/sidebar"
import { getNotificacionesUsuario } from "@/lib/notificaciones"
import { getPerfilContext } from "@/lib/perfil"
import { getProjectInfo } from "@/lib/project-info"

export async function AppShell({ children }: { children: ReactNode }) {
  const ctx = await getPerfilContext()
  const notificaciones = await getNotificacionesUsuario(ctx.rolRaw)
  const projectInfo = await getProjectInfo()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar rolRaw={ctx.rolRaw} projectInfo={projectInfo} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <HeaderSync
          initialProjectName={projectInfo.nombre}
          initialProjectDescription={projectInfo.descripcion}
          initialNombre={ctx.nombre}
          initialRol={ctx.rol}
          initialAvatarUrl={ctx.avatarUrl}
          initialNotificacionesActivas={ctx.notificacionesActivas}
          notificaciones={notificaciones}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
          <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
            © 2026 Universidad de Guayaquil · Plataforma de Gestion de Proyectos FCI
          </footer>
        </main>
      </div>
    </div>
  )
}
