import { AdminModulePage } from "@/components/admin/admin-module-page"
import { adminModules } from "@/components/admin/admin-module-data"
import { roleModules } from "@/components/roles/role-module-data"
import { getPerfilContext } from "@/lib/perfil"

type ModuleKey = keyof typeof adminModules
type RoleKey = keyof typeof roleModules

export async function RoleAwareModulePage({ moduleKey }: { moduleKey: ModuleKey }) {
  const ctx = await getPerfilContext()
  const roleKey = ctx.rolRaw as RoleKey | null
  const roleData = roleKey ? roleModules[roleKey]?.[moduleKey as keyof (typeof roleModules)[RoleKey]] : null

  return <AdminModulePage {...(roleData ?? adminModules[moduleKey])} />
}
