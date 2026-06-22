import type React from "react"

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-secondary p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <span className="font-serif text-2xl font-bold tracking-tight">UG</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-balance text-xl font-semibold leading-tight text-foreground">{title}</h1>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {children}
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          Universidad de Guayaquil · Plataforma de Gestión de Proyectos FCI
        </p>
      </div>
    </div>
  )
}
