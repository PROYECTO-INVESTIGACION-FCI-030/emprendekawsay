import type { ReactNode } from "react"
import Link from "next/link"
import { HeaderSync } from "@/components/dashboard/header-sync"
import { NavigationHistoryTracker } from "@/components/dashboard/navigation-history-tracker"
import { Sidebar } from "@/components/dashboard/sidebar"
import { getNotificacionesUsuario } from "@/lib/notificaciones"
import { navItems, visibleForRole } from "@/lib/nav-items"
import { getPerfilContext } from "@/lib/perfil"
import { getProjectInfo } from "@/lib/project-info"
import { createAdminClient } from "@/lib/supabase/admin"
import { cn } from "@/lib/utils"

export async function AppShell({ children }: { children: ReactNode }) {
  const ctx = await getPerfilContext()
  const notificaciones = await getNotificacionesUsuario(ctx.rolRaw)
  const projectInfo = await getProjectInfo()
  const admin = createAdminClient()
  const { data: leidasRows } = ctx.perfil?.id
    ? await admin.from("notificaciones_leidas").select("id_notificacion").eq("id_usuario", ctx.perfil.id)
    : { data: [] }
  const readIds = (leidasRows ?? []).map((row) => String(row.id_notificacion))
  const mobileNavItems = navItems.filter((item) => visibleForRole(item, ctx.rolRaw, projectInfo))

  return (
    <div className="flex min-h-screen flex-col bg-background lg:min-h-dvh lg:flex-row">
      <Sidebar rolRaw={ctx.rolRaw} projectInfo={projectInfo} />

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <NavigationHistoryTracker />

        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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

          <div className="border-b border-border bg-card px-3 py-3 lg:hidden">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Navegación rápida</p>
              <p className="text-[11px] text-muted-foreground">{mobileNavItems.length} secciones</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    "border-border bg-background text-foreground hover:bg-secondary",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1720px]">
            {children}
            <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
              &copy; 2026 Universidad de Guayaquil &middot; Plataforma de Gestión de Proyectos FCI
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
