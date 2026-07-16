"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ProjectInfo as ProjectInfoData } from "@/lib/project-info"
import { navItems, visibleForRole } from "@/lib/nav-items"
import { cn } from "@/lib/utils"

function ProjectInfo({ info }: { info: ProjectInfoData }) {
  return (
    <div className="mt-auto border-t border-slate-200 px-4 py-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Información del Proyecto</p>
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">Inicio</dt>
          <dd className="font-medium text-slate-800">{info.fechaInicio}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">Fin</dt>
          <dd className="font-medium text-slate-800">{info.fechaFin}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">Duración</dt>
          <dd className="font-medium text-slate-800">{info.duracionMeses} meses</dd>
        </div>
      </dl>
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-500">Tiempo transcurrido</span>
          <span className="font-semibold text-slate-800">
            {info.mesesTranscurridos} / {info.duracionMeses} meses
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-sky-500" style={{ width: `${info.porcentajeTranscurrido}%` }} />
        </div>
        <p className="mt-1 text-right text-xs font-medium text-sky-700">{info.porcentajeTranscurrido}% transcurrido</p>
      </div>
    </div>
  )
}

export function Sidebar({
  rolRaw,
  projectInfo,
}: {
  rolRaw?: string | null
  projectInfo: ProjectInfoData
}) {
  const pathname = usePathname()
  const visibles = navItems.filter((item) => visibleForRole(item, rolRaw, projectInfo))

  return (
    <aside className="hidden lg:sticky lg:top-0 lg:flex lg:min-h-dvh lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white lg:text-slate-800 xl:w-72">
      <Link href="/" className="flex items-center gap-3 border-b border-slate-200 bg-[#0d4f93] px-4 py-4 text-white">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-white/30">
          <Image
            src="/ugcircle.png"
            alt="Universidad de Guayaquil"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            priority
          />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="text-[0.78rem] font-semibold uppercase tracking-wide text-white/95">Universidad</p>
          <p className="truncate text-xs text-white/80">de Guayaquil</p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {visibles.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-sky-50 font-semibold text-sky-800 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.18)]"
                      : "text-slate-700 hover:bg-sky-50 hover:text-sky-800",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <ProjectInfo info={projectInfo} />
    </aside>
  )
}
