import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { ConfiguracionClientWrapper } from "@/components/configuracion/configuracion-client-wrapper"
import { obtenerHistorialIngresos } from "@/lib/permisos"
import { getProjectInfo } from "@/lib/project-info"
import { getRolActual } from "@/lib/perfil"
import { obtenerUsuarios } from "@/lib/usuarios-actions"

export default async function ConfiguracionPage() {
  const usuarios = await obtenerUsuarios()
  const rolActual = await getRolActual()
  const historialIngresos = await obtenerHistorialIngresos(12)
  const projectInfo = await getProjectInfo()

  return (
    <AppShell>
      <Toolbar
        titulo="Configuración"
        descripcion="Gestión de usuarios y historial de ingresos"
        showControls={false}
      />
      <div className="px-6 pb-8">
        <ConfiguracionClientWrapper
          usuarios={usuarios.map((u) => ({
            id: u.id,
            nombre_completo: u.nombre_completo,
            email: u.email,
            rol: u.rol,
            activa: u.activa,
          }))}
          initialRol={rolActual}
          historialIngresos={historialIngresos}
          projectInfo={projectInfo}
        />
      </div>
    </AppShell>
  )
}
