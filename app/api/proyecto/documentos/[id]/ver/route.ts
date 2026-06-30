import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const documentoId = Number(id)
  if (!Number.isFinite(documentoId)) {
    return NextResponse.json({ ok: false, message: "Documento invalido" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: documento, error } = await admin
    .from("documentos_proyecto")
    .select("archivo_nombre, archivo_path")
    .eq("id", documentoId)
    .maybeSingle()

  if (error || !documento) {
    return NextResponse.json({ ok: false, message: "Documento no encontrado" }, { status: 404 })
  }

  const { data: signed, error: signedError } = await admin.storage.from("documentos-proyecto").createSignedUrl(documento.archivo_path, 60)
  if (signedError || !signed?.signedUrl) {
    return NextResponse.json({ ok: false, message: "No se pudo preparar la vista" }, { status: 500 })
  }

  const response = await fetch(signed.signedUrl)
  if (!response.ok) {
    return NextResponse.json({ ok: false, message: "No se pudo abrir el archivo" }, { status: 500 })
  }

  const contentType = response.headers.get("content-type") ?? "application/octet-stream"
  const buffer = await response.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${documento.archivo_nombre.replace(/"/g, '\\"')}"`,
    },
  })
}
