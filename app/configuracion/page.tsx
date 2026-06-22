import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { obtenerUsuarios } from "@/lib/usuarios-actions"
import { getRolActual } from "@/lib/perfil"
import { getProjectInfo } from "@/lib/project-info"
import { ConfiguracionClientWrapper } from "@/components/configuracion/configuracion-client-wrapper"

export default async function ConfiguracionPage() {
  const usuarios = await obtenerUsuarios()
  const rolActual = await getRolActual()
  const projectInfo = await getProjectInfo()

  return (
    <AppShell>
      <Toolbar
        titulo="Configuración"
        descripcion="Gestión de usuarios, roles, indicadores y periodos de evaluación"
        showControls={false}
      />
      <div className="px-6 pb-8">
        <ConfiguracionClientWrapper
          usuarios={usuarios.map(u => ({
            id: u.id,
            nombre_completo: u.nombre_completo,
            email: u.email,
            rol: u.rol,
            activa: u.activa
          }))}
          initialRol={rolActual}
          projectInfo={projectInfo}
        />
      </div>
    </AppShell>
  )
}
