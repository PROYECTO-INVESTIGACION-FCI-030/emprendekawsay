import { FormationCatalog } from "@/components/courses/formation-catalog"
import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { RoleAwareModulePage } from "@/components/roles/role-aware-module-page"
import { MallaFormativaManager } from "@/components/malla-formativa/malla-formativa-manager"
import { getMaterialesFormativos, getCursosFormativosParaMalla } from "@/lib/materiales-formativos"
import { getPerfilContext } from "@/lib/perfil"
import { getCursosAsignadosUsuario, getTareasAsignadasUsuario } from "@/lib/cursos"

export default async function MallaFormativaPage() {
  const ctx = await getPerfilContext()
  if (ctx.rolRaw === "mujer_emprendedora") {
    const [cursos, tareas] = await Promise.all([getCursosAsignadosUsuario(), getTareasAsignadasUsuario()])
    return <FormationCatalog cursos={cursos} tareas={tareas} />
  }

  const [materiales, cursos] = await Promise.all([getMaterialesFormativos(), getCursosFormativosParaMalla()])
  if (ctx.rolRaw === "administradora" || ctx.rolRaw === "investigadora" || ctx.rolRaw === "formadora") {
    return (
      <AppShell>
        <Toolbar titulo="Malla Formativa" descripcion="Documentos académicos por curso, creados y gestionados manualmente." showControls={false} />
        <MallaFormativaManager cursos={cursos} materiales={materiales} />
      </AppShell>
    )
  }

  return <RoleAwareModulePage moduleKey="malla" />
}
