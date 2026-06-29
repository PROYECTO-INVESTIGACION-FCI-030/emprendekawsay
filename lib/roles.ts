import type { SupabaseClient } from "@supabase/supabase-js"

export const ROLES_LABEL: Record<string, string> = {
  administradora: "Administradora",
  investigadora: "Investigadora",
  formadora: "Formadora",
  mujer_emprendedora: "Mujer emprendedora",
  institucion_aliada: "Institucion aliada",
}

export const ROLES_INVERSO: Record<string, string> = {
  Administradora: "administradora",
  Administrador: "administradora",
  Admin: "administradora",
  Investigadora: "investigadora",
  Formadora: "formadora",
  "Mujer emprendedora": "mujer_emprendedora",
  "Institucion aliada": "institucion_aliada",
  "InstituciÃ³n aliada": "institucion_aliada",
}

export function normalizarRol(rol: string) {
  const limpio = rol.trim()
  return ROLES_INVERSO[limpio] ?? limpio.toLowerCase().replace(/\s+/g, "_")
}

export function etiquetaRol(rol: string | null | undefined) {
  if (!rol) return "Sin rol"
  return ROLES_LABEL[rol] ?? rol
}

export async function obtenerRolUsuario(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data: vista } = await supabase
    .from("v_perfiles_usuario_con_rol")
    .select("rol")
    .eq("id", userId)
    .maybeSingle()

  if (vista?.rol) return vista.rol

  const { data: perfilLegacy } = await supabase
    .from("perfiles_usuario")
    .select("rol")
    .eq("id", userId)
    .maybeSingle()

  return perfilLegacy?.rol ?? null
}

export async function asignarRolUsuario(
  supabase: SupabaseClient,
  userId: string,
  rol: string,
) {
  const rolNormalizado = normalizarRol(rol)

  const { data: rolCatalogo, error: rolError } = await supabase
    .from("roles")
    .select("id")
    .eq("codigo", rolNormalizado)
    .maybeSingle()

  if (!rolError && rolCatalogo?.id) {
    const { error } = await supabase
      .from("roles_usuario")
      .upsert(
        {
          id_usuario: userId,
          id_rol: rolCatalogo.id,
          rol: rolNormalizado,
          fecha_asignacion: new Date().toISOString(),
        },
        { onConflict: "id_usuario" },
      )

    if (!error) return null
  }

  const { error } = await supabase
    .from("roles_usuario")
    .upsert(
      {
        id_usuario: userId,
        rol: rolNormalizado,
        fecha_asignacion: new Date().toISOString(),
      },
      { onConflict: "id_usuario,rol" },
    )

  return error
}
