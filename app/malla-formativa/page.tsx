import { FormationCatalog } from "@/components/courses/formation-catalog"
import { RoleAwareModulePage } from "@/components/roles/role-aware-module-page"
import { getPerfilContext } from "@/lib/perfil"
import { getCursos, getTareasCurso } from "@/lib/cursos"

export default async function MallaFormativaPage() {
  const ctx = await getPerfilContext()
  if (ctx.rolRaw === "mujer_emprendedora") {
    const [cursos, tareas] = await Promise.all([getCursos(false), getTareasCurso(false)])
    return <FormationCatalog cursos={cursos} tareas={tareas} />
  }

  return <RoleAwareModulePage moduleKey="malla" />
}
