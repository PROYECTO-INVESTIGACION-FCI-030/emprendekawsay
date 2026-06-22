import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AuthErrorPage() {
  return (
    <AuthShell title="Algo salio mal" subtitle="No pudimos completar tu solicitud de autenticacion">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            El enlace pudo haber expirado o ya fue utilizado. Intenta iniciar sesion nuevamente.
          </p>
          <Link href="/auth/login" className={buttonVariants({ className: "w-full" })}>
            Volver a iniciar sesion
          </Link>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
