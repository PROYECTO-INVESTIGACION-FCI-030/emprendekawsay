"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) throw error
      
      setSuccess(true)
      setEmail("")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error al enviar el correo de recuperación")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <AuthShell
        title="Correo enviado"
        subtitle="Revisa tu bandeja de entrada"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-5 text-center">
              <p className="text-sm text-muted-foreground">
                Hemos enviado un enlace a tu correo electrónico para recuperar tu contraseña.
                Por favor, revisa tu bandeja de entrada (y la carpeta de spam si es necesario).
              </p>
              <p className="text-xs text-muted-foreground">
                El enlace expirará en 24 horas.
              </p>
              <Link href="/auth/login">
                <Button className="w-full">
                  Volver a Iniciar sesión
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Ingresa tu correo para recibir un enlace de recuperación"
    >
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleResetPassword}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>
            </div>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              ¿Recuerdas tu contraseña?{" "}
              <Link href="/auth/login" className="font-medium text-primary underline underline-offset-4">
                Inicia sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
