"use client"

import { Download } from "lucide-react"
import { registrarHistorialCliente } from "@/lib/historial-client"

export function DbExportButton() {
  const handleClick = () => {
    void registrarHistorialCliente({
      ruta: "/reportes",
      accion: "descarga_bd",
      paginaNombre: "Reportes",
    })
  }

  return (
    <a
      href="/api/export-db"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
    >
      <Download className="h-4 w-4" />
      Descargar BD
    </a>
  )
}
