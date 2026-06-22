import { Suspense } from "react"
import { AuthShell } from "@/components/auth/auth-shell"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmClient } from "./confirm-client"

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Verificando invitacion" subtitle="Estamos preparando tu acceso">
          <Card>
            <CardContent className="pt-6 text-center text-sm text-muted-foreground">
              Verificando enlace...
            </CardContent>
          </Card>
        </AuthShell>
      }
    >
      <ConfirmClient />
    </Suspense>
  )
}
