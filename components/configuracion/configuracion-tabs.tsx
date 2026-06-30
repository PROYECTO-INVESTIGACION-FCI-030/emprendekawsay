"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, FolderKanban, Loader2, Pencil, Plus, Search, Trash2, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { ProjectInfo } from "@/lib/project-info"
import { actualizarConfiguracionProyecto } from "@/lib/project-config-actions"
import { crearUsuario, actualizarUsuario, eliminarUsuario } from "@/lib/usuarios-actions"
import { normalizarRol } from "@/lib/roles"

const ROLES_EDITABLES = [
  { value: "administradora", label: "Administradora" },
  { value: "investigadora", label: "Investigadora" },
  { value: "formadora", label: "Formadora" },
  { value: "mujer_emprendedora", label: "Mujer emprendedora" },
  { value: "institucion_aliada", label: "Institución aliada" },
]

const SECCIONES = [
  { value: "proyecto", label: "Proyecto", icon: FolderKanban },
  { value: "usuarios", label: "Gestión de usuarios", icon: Users },
  { value: "historial", label: "Historial de ingresos", icon: Check },
] as const

export function ConfiguracionTabs({
  usuarios = [],
  esAdmin = false,
  projectInfo,
  historialIngresos = [],
}: {
  usuarios?: Array<{ id: string; nombre_completo: string | null; email: string | null; rol: string; activa: boolean }>
  esAdmin?: boolean
  projectInfo: ProjectInfo
  historialIngresos?: Array<{
    id: string
    id_usuario: string
    nombre_usuario: string | null
    email_usuario: string | null
    rol_usuario: string | null
    fecha_ingreso: string
    ruta: string | null
    user_agent: string | null
  }>
}) {
  return (
    <Tabs defaultValue="proyecto" className="gap-6">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
        {SECCIONES.map((s) => (
          <TabsTrigger
            key={s.value}
            value={s.value}
            className="gap-2 rounded-md border border-border bg-card px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <s.icon className="h-4 w-4" />
            {s.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="proyecto">
        <ConfiguracionProyecto projectInfo={projectInfo} esAdmin={esAdmin} />
      </TabsContent>
      <TabsContent value="usuarios">
        <GestionUsuarios usuarios={usuarios} esAdmin={esAdmin} />
      </TabsContent>
      <TabsContent value="historial">
        <HistorialIngresos historialIngresos={historialIngresos} />
      </TabsContent>
    </Tabs>
  )
}

function Panel({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </header>
      <div className="p-6">{children}</div>
    </section>
  )
}

function ConfiguracionProyecto({ projectInfo, esAdmin }: { projectInfo: ProjectInfo; esAdmin: boolean }) {
  const [state, formAction, pending] = useActionState(actualizarConfiguracionProyecto, null)
  const router = useRouter()
  const [nombreProyecto, setNombreProyecto] = useState(projectInfo.nombre)
  const [descripcionProyecto, setDescripcionProyecto] = useState(projectInfo.descripcion)
  const [fechaInicio, setFechaInicio] = useState(projectInfo.fechaInicioInput)
  const [fechaFin, setFechaFin] = useState(projectInfo.fechaFinInput)
  const [metaValidacion, setMetaValidacion] = useState(String(projectInfo.metaValidacion))

  useEffect(() => {
    if (!state?.ok) return
    localStorage.setItem(
      "perfil_sync",
      JSON.stringify({
        project_name: nombreProyecto,
        project_description: descripcionProyecto,
      }),
    )
    window.dispatchEvent(new Event("perfil:updated"))
    router.refresh()
  }, [state?.ok, nombreProyecto, descripcionProyecto, router])

  return (
    <Panel
      title="Configuración del proyecto"
      description="Edita la información que se muestra en el header, la tarjeta lateral y la validación."
    >
      <form action={formAction} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-1.5 lg:col-span-2">
            <Label htmlFor="project-name">Nombre del proyecto</Label>
            <Input
              id="project-name"
              name="nombre"
              value={nombreProyecto}
              onChange={(event) => setNombreProyecto(event.target.value)}
              disabled={!esAdmin || pending}
            />
          </div>
          <div className="space-y-1.5 lg:col-span-2">
            <Label htmlFor="project-description">Descripción</Label>
            <Input
              id="project-description"
              name="descripcion"
              value={descripcionProyecto}
              onChange={(event) => setDescripcionProyecto(event.target.value)}
              disabled={!esAdmin || pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-start">Fecha de inicio</Label>
            <Input
              id="project-start"
              name="fecha_inicio"
              type="date"
              value={fechaInicio}
              onChange={(event) => setFechaInicio(event.target.value)}
              disabled={!esAdmin || pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-end">Fecha de fin</Label>
            <Input
              id="project-end"
              name="fecha_fin"
              type="date"
              value={fechaFin}
              onChange={(event) => setFechaFin(event.target.value)}
              disabled={!esAdmin || pending}
            />
          </div>
          <div className="space-y-1.5 lg:col-span-2">
            <Label htmlFor="project-meta">Meta de participantes</Label>
            <Input
              id="project-meta"
              name="meta_validacion"
              type="number"
              min="1"
              value={metaValidacion}
              onChange={(event) => setMetaValidacion(event.target.value)}
              disabled={!esAdmin || pending}
            />
          </div>
        </div>

        <div className="rounded-md border border-border p-4">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tiempo transcurrido</span>
            <span className="font-medium text-foreground">
              {projectInfo.mesesTranscurridos} / {projectInfo.duracionMeses} meses
            </span>
          </div>
          <Progress value={projectInfo.porcentajeTranscurrido} />
          <p className="mt-2 text-right text-xs text-muted-foreground">{projectInfo.porcentajeTranscurrido}% transcurrido</p>
        </div>

        {!esAdmin ? <p className="text-sm text-muted-foreground">Solo la administradora puede editar esta información.</p> : null}

        {state?.message ? (
          <p className={cn("text-sm", state.ok ? "text-primary" : "text-destructive")}>{state.message}</p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={!esAdmin || pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar configuración
          </Button>
        </div>
      </form>
    </Panel>
  )
}

function GestionUsuarios({ usuarios, esAdmin }: { usuarios: Array<{ id: string; nombre_completo: string | null; email: string | null; rol: string; activa: boolean }>; esAdmin: boolean }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedUser, setSelectedUser] = useState<typeof usuarios[0] | null>(null)
  const [newEmail, setNewEmail] = useState("")
  const [newNombre, setNewNombre] = useState("")
  const [newRol, setNewRol] = useState("")
  const [loading, setLoading] = useState(false)
  const [editNombre, setEditNombre] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRol, setEditRol] = useState("")
  const [editActiva, setEditActiva] = useState(true)

  const filtrados = usuarios.filter(
    (u) =>
      (u.nombre_completo?.toLowerCase() ?? "").includes(query.toLowerCase()) ||
      (u.email?.toLowerCase() ?? "").includes(query.toLowerCase()),
  )

  async function handleCreateUser() {
    if (!newEmail || !newNombre) return
    setLoading(true)
    const res = await crearUsuario(newEmail, newNombre, newRol)
    setLoading(false)
    if (res.ok) {
      setOpenCreate(false)
      setNewEmail("")
      setNewNombre("")
      setNewRol("")
      router.refresh()
    } else {
      alert(`Error: ${res.message}`)
    }
  }

  async function handleUpdateUser() {
    if (!selectedUser) return
    setLoading(true)
    const res = await actualizarUsuario(selectedUser.id, {
      nombre_completo: editNombre,
      email: editEmail,
      rol: editRol,
      activa: editActiva,
    })
    setLoading(false)
    if (res.ok) {
      setOpenEdit(false)
      router.refresh()
    } else {
      alert(`Error: ${res.message}`)
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("¿Eliminar este usuario?")) return
    setLoading(true)
    const res = await eliminarUsuario(userId)
    setLoading(false)
    if (res.ok) window.location.reload()
    else alert(`Error: ${res.message}`)
  }

  function openEditDialog(user: typeof usuarios[0]) {
    setSelectedUser(user)
    setEditNombre(user.nombre_completo ?? "")
    setEditEmail(user.email ?? "")
    const rolNormalizado = normalizarRol(user.rol)
    setEditRol(ROLES_EDITABLES.some((rol) => rol.value === rolNormalizado) ? rolNormalizado : "")
    setEditActiva(user.activa)
    setOpenEdit(true)
  }

  if (!esAdmin) {
    return (
      <Panel title="Gestión de usuarios" description="Solo la administradora puede gestionar usuarios.">
        <p className="text-muted-foreground">No tienes permiso para gestionar usuarios.</p>
      </Panel>
    )
  }

  return (
    <>
      <Panel
        title="Gestión de usuarios"
        description="Administra a las personas con acceso a la plataforma."
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o correo..." className="pl-9" />
          </div>
          <Button onClick={() => setOpenCreate(true)} className="self-start">
            <Plus className="mr-2 h-4 w-4" />
            Crear usuario
          </Button>
        </div>
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-foreground">{u.nombre_completo ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email ?? "—"}</TableCell>
                  <TableCell>{u.rol}</TableCell>
                  <TableCell>
                    <Badge variant={u.activa ? "default" : "secondary"}>{u.activa ? "Activa" : "Inactiva"}</Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(u)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nuevo usuario</DialogTitle>
            <DialogDescription>Ingresa los datos del nuevo usuario.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-nombre">Nombre completo</Label>
              <Input id="new-nombre" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="new-email">Correo</Label>
              <Input id="new-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="new-rol">Rol</Label>
              <select
                id="new-rol"
                value={newRol}
                onChange={(e) => setNewRol(e.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="" disabled>
                  Selecciona un rol
                </option>
                {ROLES_EDITABLES.map((rol) => (
                  <option key={rol.value} value={rol.value}>
                    {rol.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreateUser} disabled={loading || !newNombre || !newEmail}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>Actualiza los datos del usuario.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nombre">Nombre completo</Label>
              <Input id="edit-nombre" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-email">Correo</Label>
              <Input id="edit-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-rol">Rol</Label>
              <select
                id="edit-rol"
                value={editRol}
                onChange={(e) => setEditRol(e.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="">Sin rol</option>
                {ROLES_EDITABLES.map((rol) => (
                  <option key={rol.value} value={rol.value}>
                    {rol.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>Cancelar</Button>
            <Button onClick={handleUpdateUser} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function HistorialIngresos({
  historialIngresos,
}: {
  historialIngresos: Array<{
    id: string
    id_usuario: string
    nombre_usuario: string | null
    email_usuario: string | null
    rol_usuario: string | null
    fecha_ingreso: string
    ruta: string | null
    user_agent: string | null
    accion?: string | null
    pagina_nombre?: string | null
  }>
}) {
  return (
    <Panel title="Historial de ingresos" description="Últimos accesos registrados al iniciar sesión">
      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Ruta</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historialIngresos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Aún no hay registros en el historial de ingresos.
                </TableCell>
              </TableRow>
            ) : (
              historialIngresos.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.nombre_usuario ?? "—"}</TableCell>
                  <TableCell>{item.email_usuario ?? "—"}</TableCell>
                  <TableCell>{item.rol_usuario ?? "—"}</TableCell>
                  <TableCell>{item.accion ?? "navegacion"}</TableCell>
                  <TableCell>{item.pagina_nombre ?? item.ruta ?? "—"}</TableCell>
                  <TableCell>{new Date(item.fecha_ingreso).toLocaleString("es-EC")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Panel>
  )
}
