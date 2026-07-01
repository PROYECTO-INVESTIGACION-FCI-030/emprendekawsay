"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, BellOff, CheckCheck, Download, LogOut, Info, CircleCheck, TriangleAlert } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { Notificacion } from "@/lib/perfil"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}

const TIPO_ICON = {
  info: Info,
  exito: CircleCheck,
  alerta: TriangleAlert,
} as const

const TIPO_COLOR = {
  info: "text-chart-4",
  exito: "text-primary",
  alerta: "text-chart-3",
} as const

export function Header({
  projectName = "Proyecto FCI 2025",
  projectDescription = "Programa de formación y apoyo técnico para el emprendimiento de mujeres indígenas residentes en Guayaquil",
  nombre = "Usuario",
  rol = "Miembro del proyecto",
  avatarUrl = null,
  notificacionesActivas = true,
  notificaciones = [],
  onMarkRead,
  onMarkAllRead,
}: {
  projectName?: string
  projectDescription?: string
  nombre?: string
  rol?: string
  avatarUrl?: string | null
  notificacionesActivas?: boolean
  notificaciones?: Notificacion[]
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
}) {
  const router = useRouter()
  const visibles = notificacionesActivas ? notificaciones : []
  const noLeidas = visibles.filter((n) => !n.leida).length

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="flex flex-col gap-4 border-b border-border bg-card px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-foreground">{projectName}</h1>
        <p className="truncate text-sm text-muted-foreground">{projectDescription}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <Popover>
          <PopoverTrigger
            className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Notificaciones"
          >
            {notificacionesActivas ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
            {notificacionesActivas && noLeidas > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {noLeidas}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[calc(100vw-1.5rem)] max-w-80 p-0 sm:w-80">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Notificaciones</p>
              <div className="flex items-center gap-2">
                {notificacionesActivas && noLeidas > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {noLeidas} nuevas
                  </span>
                )}
                {notificacionesActivas && noLeidas > 0 ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary"
                    onClick={onMarkAllRead}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Leer todo
                  </button>
                ) : null}
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {!notificacionesActivas ? (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <BellOff className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Tienes las notificaciones desactivadas. Actívalas en Configuración.
                  </p>
                </div>
              ) : visibles.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No tienes notificaciones.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {visibles.map((n) => {
                    const Icon = TIPO_ICON[n.tipo]
                    return (
                      <li
                        key={n.id}
                        className={cn(
                          "flex gap-3 px-4 py-3",
                          !n.leida && "bg-secondary/50",
                        )}
                      >
                        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", TIPO_COLOR[n.tipo])} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{n.titulo}</p>
                          <p className="text-xs text-muted-foreground">{n.mensaje}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground/70">{n.fecha}</p>
                        </div>
                        {!n.leida ? (
                          <button
                            type="button"
                            className="mt-0.5 inline-flex h-6 items-center rounded-md border border-border px-1.5 text-[10px] font-medium text-muted-foreground hover:bg-secondary"
                            onClick={() => onMarkRead?.(n.id)}
                          >
                            Leída
                          </button>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Link
          href="/perfil"
          className="flex min-w-0 items-center gap-3 rounded-md p-1 transition-colors hover:bg-secondary"
        >
          <Avatar className="h-9 w-9">
            {avatarUrl && <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={nombre} />}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials(nombre)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-medium text-foreground">{nombre}</p>
            <p className="text-xs text-muted-foreground">{rol}</p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}

export function Toolbar({
  titulo = "Dashboard",
  descripcion = "Resumen general del proyecto",
  showControls = true,
  action,
}: {
  titulo?: string
  descripcion?: string
  showControls?: boolean
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{titulo}</h2>
        <p className="text-sm text-muted-foreground">{descripcion}</p>
      </div>
      <div className="flex items-center gap-3">
        {showControls && (
          null
        )}
        {action}
        {showControls && !action && (
          <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <Download className="h-4 w-4" />
            Exportar reporte
          </button>
        )}
      </div>
    </div>
  )
}
