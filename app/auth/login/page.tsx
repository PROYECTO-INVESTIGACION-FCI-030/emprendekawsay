"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { registrarHistorialCliente } from "@/lib/historial-client"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResolvingLink, setIsResolvingLink] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const resolveAuthLink = async () => {
      const hash = window.location.hash.replace(/^#/, "")
      if (!hash) return

      const params = new URLSearchParams(hash)
      const accessToken = params.get("access_token")
      const refreshToken = params.get("refresh_token")
      const linkType = params.get("type")

      if (!accessToken || !refreshToken) return

      setIsResolvingLink(true)
      setError(null)

      try {
        const supabase = createClient()
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) throw sessionError

        window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
        if (linkType === "invite") {
          router.replace("/auth/reset-password?invite=true")
          return
        }

        if (linkType === "recovery") {
          router.replace("/auth/reset-password?verified=true")
          return
        }

        router.replace("/")
      } catch (linkError: unknown) {
        setError(linkError instanceof Error ? linkError.message : "No se pudo completar el enlace de acceso")
      } finally {
        setIsResolvingLink(false)
      }
    }

    resolveAuthLink()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id
      if (userId) {
        await registrarHistorialCliente({ ruta: "/", accion: "inicio_sesion", paginaNombre: "Dashboard" })
      }
      router.push("/")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Ingresa tus credenciales para acceder al panel de gestión del proyecto"
    >
      <Card>
        <CardContent className="pt-6">
          {isResolvingLink ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Abriendo tu enlace de acceso...</div>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder=""
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    <Link href="/auth/forgot-password" className="text-xs font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Ingresando..." : "Ingresar"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  )
}
