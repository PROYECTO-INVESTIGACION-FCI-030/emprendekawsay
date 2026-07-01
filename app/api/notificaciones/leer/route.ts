"use server"

import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

type Body = {
  ids?: string[]
  userId?: string | null
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body
    const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : []
    const userId = typeof body.userId === "string" ? body.userId.trim() : ""

    if (ids.length === 0) {
      return NextResponse.json({ ok: false, message: "No se recibieron notificaciones." }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ ok: false, message: "No se recibió el usuario." }, { status: 400 })
    }

    const admin = createAdminClient()
    const registros = ids.map((id) => ({
      id_notificacion: id,
      id_usuario: userId,
      fecha_lectura: new Date().toISOString(),
    }))

    const { error } = await admin.from("notificaciones_leidas").upsert(registros, { onConflict: "id_notificacion,id_usuario" })

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "No se pudo marcar como leídas." }, { status: 500 })
  }
}
