"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export function ConfirmClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function confirm() {
      const next = searchParams.get("next") || "/auth/reset-password?verified=true"
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
      const accessToken = hashParams.get("access_token")
      const refreshToken = hashParams.get("refresh_token")

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) {
          setError(sessionError.message)
          return
        }

        router.replace(next)
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        router.replace(next)
        return
      }

      setError("No se pudo verificar el enlace. Solicita una nueva invitacion.")
    }

    confirm()
  }, [router, searchParams, supabase.auth])

  if (error) {
    return (
      <AuthShell title="Enlace invalido" subtitle="No pudimos confirmar la invitacion">
        <Card>
          <CardContent className="flex flex-col gap-5 pt-6 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Link href="/auth/login">
              <Button className="w-full">Volver al inicio de sesion</Button>
            </Link>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Verificando invitacion" subtitle="Estamos preparando tu acceso">
      <Card>
        <CardContent className="flex items-center justify-center gap-2 pt-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verificando enlace...
        </CardContent>
      </Card>
    </AuthShell>
  )
}
