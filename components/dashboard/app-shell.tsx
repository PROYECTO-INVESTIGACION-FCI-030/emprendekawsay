import type { ReactNode } from "react"
import { HeaderSync } from "@/components/dashboard/header-sync"
import { NavigationHistoryTracker } from "@/components/dashboard/navigation-history-tracker"
import { Sidebar } from "@/components/dashboard/sidebar"
import { getNotificacionesUsuario } from "@/lib/notificaciones"
import { getPerfilContext } from "@/lib/perfil"
import { getProjectInfo } from "@/lib/project-info"
import { createAdminClient } from "@/lib/supabase/admin"

export async function AppShell({ children }: { children: ReactNode }) {
  const ctx = await getPerfilContext()
  const notificaciones = await getNotificacionesUsuario(ctx.rolRaw)
  const projectInfo = await getProjectInfo()
  const admin = createAdminClient()
  const { data: leidasRows } = ctx.perfil?.id
    ? await admin
        .from("notificaciones_leidas")
        .select("id_notificacion")
        .eq("id_usuario", ctx.perfil.id)
    : { data: [] }
  const readIds = (leidasRows ?? []).map((row) => String(row.id_notificacion))

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar rolRaw={ctx.rolRaw} projectInfo={projectInfo} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <NavigationHistoryTracker />
        <HeaderSync
          initialProjectName={projectInfo.nombre}
          initialProjectDescription={projectInfo.descripcion}
          initialNombre={ctx.nombre}
          initialRol={ctx.rol}
          initialAvatarUrl={ctx.avatarUrl}
          initialNotificacionesActivas={ctx.notificacionesActivas}
          notificaciones={notificaciones}
          initialReadIds={readIds}
          userId={ctx.perfil?.id ?? null}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
          <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
            &copy; 2026 Universidad de Guayaquil &middot; Plataforma de Gestión de Proyectos FCI
          </footer>
        </main>
      </div>
    </div>
  )
}
