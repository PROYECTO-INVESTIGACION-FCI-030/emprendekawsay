import { redirect } from "next/navigation"
import { FormationCatalog } from "@/components/courses/formation-catalog"
import { RoleAwareModulePage } from "@/components/roles/role-aware-module-page"
import { getPerfilContext } from "@/lib/perfil"
import { getCursosAsignadosUsuario, getTareasAsignadasUsuario } from "@/lib/cursos"

export default async function MallaFormativaPage() {
  const ctx = await getPerfilContext()

  if (ctx.rolRaw === "mujer_emprendedora") {
    const [cursos, tareas] = await Promise.all([getCursosAsignadosUsuario(), getTareasAsignadasUsuario()])
    return <FormationCatalog cursos={cursos} tareas={tareas} />
  }

  if (ctx.rolRaw === "administradora" || ctx.rolRaw === "investigadora" || ctx.rolRaw === "formadora") {
    redirect("/diseno-cursos#materiales-formativos")
  }

  return <RoleAwareModulePage moduleKey="malla" />
}
