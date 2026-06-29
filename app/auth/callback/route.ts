import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"
  const type = searchParams.get("type")

  const forwardedHost = request.headers.get("x-forwarded-host")
  const isLocalEnv = process.env.NODE_ENV === "development"

  const getRedirectUrl = (path: string) => {
    if (isLocalEnv) return `${origin}${path}`
    if (forwardedHost) return `https://${forwardedHost}${path}`
    return `${origin}${path}`
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id
      if (userId && type !== "recovery") {
        const admin = createAdminClient()
        const { data: perfil } = await admin
          .from("v_perfiles_usuario_con_rol")
          .select("id, nombre_completo, email, rol")
          .eq("id", userId)
          .maybeSingle()

        const { data: userData } = await admin.auth.admin.getUserById(userId)
        const basePayload = {
          id_usuario: userId,
          nombre_usuario: perfil?.nombre_completo ?? userData.user?.user_metadata?.nombre_completo ?? null,
          email_usuario: perfil?.email ?? userData.user?.email ?? null,
          rol_usuario: perfil?.rol ?? null,
          ruta: next,
          user_agent: request.headers.get("user-agent"),
        }

        const extendedPayload = {
          ...basePayload,
          pagina_nombre: next,
          accion: type === "invite" ? "invitacion" : "inicio_sesion",
        }

        let { error } = await admin.from("historial_ingresos").insert(extendedPayload)
        if (error && /column .* does not exist|record .* has no column/i.test(error.message)) {
          const fallback = await admin.from("historial_ingresos").insert(basePayload)
          error = fallback.error
        }

        if (error) {
          throw error
        }
        await admin.from("perfiles_usuario").update({ ultimo_acceso: new Date().toISOString() }).eq("id", userId)
      }
      if (type === "recovery" || type === "invite") {
        return NextResponse.redirect(getRedirectUrl("/auth/reset-password?verified=true"))
      }

      return NextResponse.redirect(getRedirectUrl(next))
    }

    return NextResponse.redirect(
      getRedirectUrl(`/auth/login?error=auth_error&message=${encodeURIComponent(error.message)}`),
    )
  }

  if (type === "recovery" || type === "invite") {
    return NextResponse.redirect(getRedirectUrl("/auth/reset-password?verified=true"))
  }

  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    return NextResponse.redirect(getRedirectUrl(next))
  }

  return NextResponse.redirect(getRedirectUrl("/auth/login?error=no_code"))
}
