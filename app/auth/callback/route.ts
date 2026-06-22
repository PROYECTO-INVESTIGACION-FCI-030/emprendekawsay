import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
