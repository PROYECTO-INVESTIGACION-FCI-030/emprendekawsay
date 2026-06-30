"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const PAGINAS = [
  { ruta: "/", nombre: "Dashboard" },
  { ruta: "/proyecto", nombre: "Proyecto" },
  { ruta: "/diagnostico", nombre: "Diagnóstico (Encuesta)" },
  { ruta: "/analitica", nombre: "Analítica de Necesidades" },
  { ruta: "/prediccion", nombre: "Predicción de Cursos" },
  { ruta: "/diseno-cursos", nombre: "Diseño de Cursos" },
  { ruta: "/malla-formativa", nombre: "Malla Formativa" },
  { ruta: "/produccion", nombre: "Producción Científica" },
  { ruta: "/avance", nombre: "Avance del Proyecto" },
  { ruta: "/reportes", nombre: "Reportes" },
  { ruta: "/configuracion", nombre: "Configuración" },
  { ruta: "/evaluaciones", nombre: "Evaluaciones" },
  { ruta: "/perfil", nombre: "Mi perfil" },
]

function obtenerNombrePaginaPorRuta(ruta: string) {
  const rutaNormalizada = ruta.split("?")[0].split("#")[0]
  const coincidencia = PAGINAS.find(
    (pagina) => rutaNormalizada === pagina.ruta || rutaNormalizada.startsWith(`${pagina.ruta}/`),
  )
  return coincidencia?.nombre ?? rutaNormalizada
}

export function NavigationHistoryTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastSentRef = useRef<string>("")

  useEffect(() => {
    const query = searchParams.toString()
    const ruta = query ? `${pathname}?${query}` : pathname
    const signature = `${ruta}`
    if (lastSentRef.current === signature) return
    lastSentRef.current = signature

    const registrar = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      const userId = data.user?.id
      if (!userId) return

      fetch("/api/login-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ruta,
          accion: ruta === "/" ? "ingreso_dashboard" : "navegacion_pagina",
          pagina_nombre: obtenerNombrePaginaPorRuta(ruta),
        }),
        keepalive: true,
      }).catch(() => null)
    }

    const timeout = window.setTimeout(() => {
      registrar().catch(() => null)
    }, 150)

    return () => window.clearTimeout(timeout)
  }, [pathname, searchParams])

  return null
}
