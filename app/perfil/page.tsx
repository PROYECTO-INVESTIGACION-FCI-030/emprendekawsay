import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { PerfilForm } from "@/components/perfil/perfil-form"
import { getPerfilContext } from "@/lib/perfil"

export default async function PerfilPage() {
  const ctx = await getPerfilContext()

  return (
    <AppShell>
      <Toolbar
        titulo="Mi perfil"
        descripcion="Gestiona tus datos personales y preferencias de notificación"
        showControls={false}
      />
      <div className="px-6 pb-8">
        <PerfilForm perfil={ctx.perfil} rol={ctx.rol} />
      </div>
    </AppShell>
  )
}
