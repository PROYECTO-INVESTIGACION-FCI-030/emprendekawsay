import { Suspense } from "react"
import ResetPasswordForm from "./reset-password-form"
import { AuthShell } from "@/components/auth/auth-shell"
import { Card, CardContent } from "@/components/ui/card"

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Verificando..." subtitle="Por favor espera">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                Verificando tu enlace de recuperacion...
              </div>
            </CardContent>
          </Card>
        </AuthShell>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
