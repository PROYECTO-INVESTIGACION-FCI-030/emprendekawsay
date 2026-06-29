"use client"

import { Download } from "lucide-react"
import { registrarHistorialCliente } from "@/lib/historial-client"

export function ResumenPdfButton() {
  const handleClick = () => {
    void registrarHistorialCliente({
      ruta: "/reportes",
      accion: "descarga_pdf_resumen",
      paginaNombre: "Reportes",
    })
  }

  return (
    <a
      href="/api/reportes/resumen-pdf"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-md border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-95"
    >
      <Download className="h-4 w-4" />
      Descargar resumen PDF
    </a>
  )
}
