import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const nombre = String(body.nombre ?? "").trim()
    const descripcion = String(body.descripcion ?? "").trim()
    const fechaInicio = String(body.fecha_inicio ?? "").trim()
    const fechaFin = String(body.fecha_fin ?? "").trim()
    const metaValidacion = Number(body.meta_validacion ?? 0)

    if (!nombre || !descripcion || !fechaInicio || !fechaFin) {
      return NextResponse.json({ ok: false, message: "Completa nombre, descripcion, fecha inicio y fecha fin." }, { status: 400 })
    }

    if (!Number.isFinite(metaValidacion) || metaValidacion <= 0) {
      return NextResponse.json({ ok: false, message: "Indica una meta de validación válida." }, { status: 400 })
    }

    if (new Date(fechaFin) < new Date(fechaInicio)) {
      return NextResponse.json({ ok: false, message: "La fecha fin no puede ser anterior a la fecha de inicio." }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from("configuracion_proyecto")
      .upsert(
        {
          id: 1,
          nombre,
          descripcion,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          meta_validacion: metaValidacion,
          fecha_actualizacion: new Date().toISOString(),
        },
        { onConflict: "id" },
      )

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: "Configuración del proyecto guardada correctamente." })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado"
    return NextResponse.json({ ok: false, message }, { status: 500 })
  }
}
