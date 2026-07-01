import { AppShell } from "@/components/dashboard/app-shell"
import { Toolbar } from "@/components/dashboard/header"
import { ProjectDocumentsManager } from "@/components/project/project-documents-manager"
import { getProjectDocuments, isAdminUser } from "@/lib/project-documents"

export default async function ProyectoPage() {
  const documents = await getProjectDocuments()
  const admin = await isAdminUser()

  return (
    <AppShell>
      <Toolbar titulo="Proyecto" descripcion="Documentos, evidencia institucional y soporte del proyecto" showControls={false} />
      <div className="space-y-6 px-4 pb-8 sm:px-6">
        <ProjectDocumentsManager documents={documents} isAdmin={admin} />
      </div>
    </AppShell>
  )
}
