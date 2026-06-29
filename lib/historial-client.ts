"use client"

import { createClient } from "@/lib/supabase/client"

export async function registrarHistorialCliente(params: {
  ruta: string
  accion: string
  paginaNombre?: string
}) {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  const userId = data.user?.id
  if (!userId) return false

  await fetch("/api/login-history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      ruta: params.ruta,
      accion: params.accion,
      pagina_nombre: params.paginaNombre ?? params.ruta,
    }),
    keepalive: true,
  }).catch(() => null)

  return true
}
