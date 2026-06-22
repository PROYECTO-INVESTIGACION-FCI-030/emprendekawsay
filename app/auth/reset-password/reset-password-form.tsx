"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [verifyingSession, setVerifyingSession] = useState(true)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          setError("Error al verificar tu sesion. Por favor, intenta de nuevo.")
          setVerifyingSession(false)
          return
        }

        if (session?.user) {
          setVerifyingSession(false)
        } else {
          setError("No se pudo verificar tu identidad. Por favor, solicita un nuevo enlace de recuperacion.")
          setVerifyingSession(false)
        }
      } catch {
        setError("Ocurrio un error al verificar el enlace. Por favor, solicita uno nuevo.")
        setVerifyingSession(false)
      }
    }

    checkSession()
  }, [supabase])

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden")
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message || "Error al actualizar la contrasena")
        setLoading(false)
        return
      }

      setSuccess(true)
      await supabase.auth.signOut()

      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocurrio un error al actualizar la contrasena")
      setLoading(false)
    }
  }

  if (verifyingSession) {
    return (
      <AuthShell title="Verificando..." subtitle="Por favor espera">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Verificando tu enlace de recuperacion...
            </div>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  if (success) {
    return (
      <AuthShell title="Contrasena actualizada" subtitle="Tu contrasena ha sido cambiada exitosamente">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-5 text-center">
              <p className="text-sm text-muted-foreground">
                Seras redirigido al inicio de sesion en unos momentos.
              </p>
              <Link href="/auth/login">
                <Button className="w-full">Ir al inicio de sesion</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  if (error) {
    return (
      <AuthShell title="Enlace invalido" subtitle="Hubo un problema con tu solicitud">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-5 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Link href="/auth/forgot-password">
                <Button className="w-full">Solicitar nuevo enlace</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Volver al inicio de sesion
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Restablecer contrasena" subtitle="Ingresa tu nueva contrasena">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleResetPassword}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="password">Nueva contrasena</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimo 6 caracteres"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={6}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu nueva contrasena"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={6}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar contrasena"
                )}
              </Button>
            </div>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              <Link href="/auth/login" className="font-medium text-primary underline underline-offset-4">
                Volver al inicio de sesion
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
