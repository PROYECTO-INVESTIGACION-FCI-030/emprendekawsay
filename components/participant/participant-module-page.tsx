import type { LucideIcon } from "lucide-react"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type Step = {
  title: string
  detail: string
  done?: boolean
}

type ParticipantModulePageProps = {
  title: string
  description: string
  action: string
  actionHref?: string
  icon: LucideIcon
  progress: number
  steps: Step[]
  notes: string[]
}

export function ParticipantModulePage({
  title,
  description,
  action,
  actionHref,
  icon: Icon,
  progress,
  steps,
  notes,
}: ParticipantModulePageProps) {
  return (
    <AppShell>
      <Toolbar titulo={title} descripcion={description} showControls={false} />
      <div className="space-y-4 px-6 pb-8">
        <Card className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{title}</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            {actionHref ? (
              <Link href={actionHref}>
                <Button>
                  {action}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button>
                {action}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-sm text-muted-foreground">
              <span>Avance</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pasos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-3 rounded-md border border-border p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                    {step.done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informacion importante</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {notes.map((note) => (
                  <li key={note} className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
