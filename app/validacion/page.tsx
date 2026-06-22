import { ParticipantModulePage } from "@/components/participant/participant-module-page"
import { participantModules } from "@/components/participant/participant-module-data"
import { RoleAwareModulePage } from "@/components/roles/role-aware-module-page"
import { getPerfilContext } from "@/lib/perfil"

export default async function ValidacionPage() {
  const ctx = await getPerfilContext()
  if (ctx.rolRaw === "mujer_emprendedora") {
    return <ParticipantModulePage {...participantModules.validacion} />
  }

  return <RoleAwareModulePage moduleKey="validacion" />
}
