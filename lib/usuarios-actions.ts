"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { asignarRolUsuario, etiquetaRol, normalizarRol, obtenerRolUsuario } from "@/lib/roles"

export type Usuario = {
  id: string
  nombre_completo: string | null
  email: string | null
  telefono: string | null
  breve_descripcion: string | null
  linkedin: string | null
  avatar_url: string | null
  notificaciones_activas: boolean
  rol: string
  activa: boolean
}

const demoUsuarios: Usuario[] = [
  {
    id: "demo-1",
    nombre_completo: "Maria Perez Quishpe",
    email: "maria.perez@ug.edu.ec",
    telefono: "+593 9 1234 5678",
    breve_descripcion: "Investigadora principal del proyecto",
    linkedin: "https://linkedin.com/in/maria-perez",
    avatar_url: null,
    notificaciones_activas: true,
    rol: "Administradora",
    activa: true,
  },
  {
    id: "demo-2",
    nombre_completo: "Lucia Andrade Tello",
    email: "lucia.andrade@ug.edu.ec",
    telefono: "+593 9 9876 5432",
    breve_descripcion: "Formadora en temas de emprendimiento",
    linkedin: null,
    avatar_url: null,
    notificaciones_activas: true,
    rol: "Investigadora",
    activa: true,
  },
  {
    id: "demo-3",
    nombre_completo: "Sofia Caisaguano Lopez",
    email: "sofia.c@ug.edu.ec",
    telefono: null,
    breve_descripcion: "Facilitadora de capacitaciones",
    linkedin: null,
    avatar_url: null,
    notificaciones_activas: true,
    rol: "Formadora",
    activa: true,
  },
  {
    id: "demo-4",
    nombre_completo: "Rosa Maldonado",
    email: "rosa.m@ejemplo.com",
    telefono: null,
    breve_descripcion: "Participante emprendedora",
    linkedin: null,
    avatar_url: null,
    notificaciones_activas: false,
    rol: "Mujer emprendedora",
    activa: false,
  },
]

async function esAdministradora(userId: string) {
  const supabase = await createClient()
  return (await obtenerRolUsuario(supabase, userId)) === "administradora"
}

export async function obtenerUsuarios(): Promise<Usuario[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return demoUsuarios

    const select =
      "id, nombre_completo, email, telefono, breve_descripcion, rol, linkedin, avatar_url, notificaciones_activas, cuenta_activa"

    const desdeVista = await supabase
      .from("v_perfiles_usuario_con_rol")
      .select(select)
      .order("nombre_completo", { ascending: true })

    const perfiles = desdeVista.error
      ? await supabase
          .from("perfiles_usuario")
          .select(select)
          .order("nombre_completo", { ascending: true })
      : desdeVista

    if (perfiles.error || !perfiles.data || perfiles.data.length === 0) {
      return demoUsuarios
    }

    return perfiles.data.map((p) => ({
      id: p.id,
      nombre_completo: p.nombre_completo,
      email: p.email,
      telefono: p.telefono,
      breve_descripcion: p.breve_descripcion,
      linkedin: p.linkedin,
      avatar_url: p.avatar_url,
      notificaciones_activas: p.notificaciones_activas ?? true,
      rol: etiquetaRol(p.rol),
      activa: p.cuenta_activa ?? true,
    }))
  } catch {
    return demoUsuarios
  }
}

export async function crearUsuario(
  email: string,
  nombreCompleto: string,
  rol: string,
): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) return { ok: false, message: "No autenticado. Inicia sesion nuevamente." }
    if (!(await esAdministradora(currentUser.id))) {
      return {
        ok: false,
        message: "User not allowed: Solo las usuarias con rol Administradora pueden crear nuevos usuarios.",
      }
    }

    const emailNormalizado = email.trim().toLowerCase()
    const nombre = nombreCompleto.trim()
    const rolNormalizado = normalizarRol(rol)

    if (!emailNormalizado || !emailNormalizado.includes("@")) {
      return { ok: false, message: "Correo electronico invalido." }
    }

    if (nombre.length < 3) {
      return { ok: false, message: "El nombre completo debe tener al menos 3 caracteres." }
    }

    const supabaseAdmin = createAdminClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://proyecto-fci-2025.vercel.app"
    const callbackUrl = new URL("/auth/confirm", siteUrl)
    callbackUrl.searchParams.set("next", "/auth/reset-password?invite=true")
    const redirectTo = callbackUrl.toString()

    const { data: authData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      emailNormalizado,
      {
        redirectTo,
        data: {
          nombre_completo: nombre,
          rol_asignado: rolNormalizado,
        },
      },
    )

    if (inviteError) {
      const message = inviteError.message.toLowerCase()
      if (message.includes("already registered") || message.includes("already been registered")) {
        return { ok: false, message: "Este correo electronico ya esta registrado." }
      }

      if (message.includes("invalid email")) {
        return { ok: false, message: "El formato del correo electronico no es valido." }
      }

      return { ok: false, message: `Error al invitar usuario: ${inviteError.message}` }
    }

    const newUserId = authData.user?.id
    if (!newUserId) {
      return { ok: false, message: "No se pudo crear el usuario en el sistema de autenticacion." }
    }

    const { error: perfilError } = await supabaseAdmin
      .from("perfiles_usuario")
      .upsert(
        {
          id: newUserId,
          nombre_completo: nombre,
          email: emailNormalizado,
          cuenta_activa: true,
          notificaciones_activas: true,
          fecha_actualizacion: new Date().toISOString(),
        },
        { onConflict: "id" },
      )

    if (perfilError) {
      return { ok: false, message: `Usuario invitado, pero no se pudo configurar el perfil: ${perfilError.message}` }
    }

    const rolError = await asignarRolUsuario(supabaseAdmin, newUserId, rolNormalizado)
    if (rolError) {
      return { ok: false, message: `Usuario invitado, pero no se pudo asignar el rol: ${rolError.message}` }
    }

    revalidatePath("/configuracion")
    return {
      ok: true,
      message: `Usuario ${nombre} invitado correctamente. Se envio un enlace a ${emailNormalizado} para registrar su contrasena y completar su perfil.`,
    }
  } catch (error) {
    console.error("Error inesperado en crearUsuario:", error)
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Error desconocido al crear usuario.",
    }
  }
}

export async function actualizarUsuario(
  userId: string,
  data: Partial<
    Pick<Usuario, "nombre_completo" | "email" | "telefono" | "breve_descripcion" | "linkedin" | "rol" | "activa">
  >,
): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) return { ok: false, message: "No autenticado." }

    const esAdmin = await esAdministradora(currentUser.id)
    if (!esAdmin && currentUser.id !== userId) {
      return { ok: false, message: "No tienes permiso para actualizar otros usuarios." }
    }

    if (!esAdmin && (data.rol !== undefined || data.activa !== undefined)) {
      return { ok: false, message: "No tienes permiso para cambiar roles o estado de cuenta." }
    }

    const updateData: Record<string, unknown> = {
      fecha_actualizacion: new Date().toISOString(),
    }

    if (data.nombre_completo !== undefined) {
      updateData.nombre_completo = data.nombre_completo?.trim() || null
    }
    if (data.email !== undefined) {
      updateData.email = data.email?.trim().toLowerCase() || null
    }
    if (data.telefono !== undefined) updateData.telefono = data.telefono
    if (data.breve_descripcion !== undefined) updateData.breve_descripcion = data.breve_descripcion
    if (data.linkedin !== undefined) updateData.linkedin = data.linkedin
    if (data.activa !== undefined && esAdmin) updateData.cuenta_activa = data.activa

    const { error: updateError } = await supabase
      .from("perfiles_usuario")
      .update(updateData)
      .eq("id", userId)

    if (updateError) return { ok: false, message: updateError.message }

    if (data.rol !== undefined && esAdmin) {
      const supabaseAdmin = createAdminClient()
      const rolError = await asignarRolUsuario(supabaseAdmin, userId, data.rol)
      if (rolError) return { ok: false, message: rolError.message }
    }

    revalidatePath("/configuracion")
    return { ok: true, message: "Usuario actualizado correctamente." }
  } catch (error) {
    console.error("Error en actualizarUsuario:", error)
    return { ok: false, message: "Error al actualizar usuario." }
  }
}

export async function eliminarUsuario(userId: string): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) return { ok: false, message: "No autenticado." }
    if (!(await esAdministradora(currentUser.id))) {
      return { ok: false, message: "User not allowed: Solo administradoras pueden eliminar usuarios." }
    }

    if (userId === currentUser.id) {
      return { ok: false, message: "No puedes eliminar tu propio usuario." }
    }

    const { data: userToDelete, error: checkError } = await supabase
      .from("perfiles_usuario")
      .select("id, email")
      .eq("id", userId)
      .single()

    if (checkError || !userToDelete) return { ok: false, message: "El usuario no existe." }

    const supabaseAdmin = createAdminClient()
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      return { ok: false, message: `Error al eliminar usuario: ${deleteAuthError.message}` }
    }

    revalidatePath("/configuracion")
    return { ok: true, message: `Usuario ${userToDelete.email} eliminado permanentemente.` }
  } catch (error) {
    console.error("Error en eliminarUsuario:", error)
    return { ok: false, message: "Error al eliminar usuario." }
  }
}

export async function desactivarUsuario(userId: string): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) return { ok: false, message: "No autenticado." }
    if (!(await esAdministradora(currentUser.id))) {
      return { ok: false, message: "No tienes permisos para desactivar usuarios." }
    }

    if (userId === currentUser.id) {
      return { ok: false, message: "No puedes desactivar tu propio usuario." }
    }

    const { error } = await supabase
      .from("perfiles_usuario")
      .update({ cuenta_activa: false, fecha_actualizacion: new Date().toISOString() })
      .eq("id", userId)

    if (error) return { ok: false, message: error.message }

    revalidatePath("/configuracion")
    return { ok: true, message: "Usuario desactivado correctamente." }
  } catch {
    return { ok: false, message: "Error al desactivar usuario." }
  }
}

export async function reactivarUsuario(userId: string): Promise<{ ok: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) return { ok: false, message: "No autenticado." }
    if (!(await esAdministradora(currentUser.id))) {
      return { ok: false, message: "No tienes permisos para reactivar usuarios." }
    }

    const { error } = await supabase
      .from("perfiles_usuario")
      .update({ cuenta_activa: true, fecha_actualizacion: new Date().toISOString() })
      .eq("id", userId)

    if (error) return { ok: false, message: error.message }

    revalidatePath("/configuracion")
    return { ok: true, message: "Usuario reactivado correctamente." }
  } catch {
    return { ok: false, message: "Error al reactivar usuario." }
  }
}
