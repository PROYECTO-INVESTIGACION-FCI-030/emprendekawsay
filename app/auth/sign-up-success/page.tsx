import Link from "next/link"
import { MailCheck } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <AuthShell title="Revisa tu correo" subtitle="Tu cuenta fue creada correctamente">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <MailCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            Te enviamos un enlace de confirmacion. Confirma tu correo electronico para activar tu cuenta y poder iniciar
            sesion.
          </p>
          <Link href="/auth/login" className={buttonVariants({ className: "w-full" })}>
            Volver a iniciar sesion
          </Link>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
