"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  ShieldCheck,
  Gauge,
  CalendarRange,
  FolderKanban,
  Plus,
  Search,
  Check,
  X,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { ProjectInfo } from "@/lib/project-info"
import { actualizarConfiguracionProyecto } from "@/lib/project-config-actions"
import { crearUsuario, actualizarUsuario, eliminarUsuario } from "@/lib/usuarios-actions"

const SECCIONES = [
  { value: "proyecto", label: "Proyecto", icon: FolderKanban },
  { value: "usuarios", label: "Gestión de usuarios", icon: Users },
  { value: "roles", label: "Roles y permisos", icon: ShieldCheck },
  { value: "indicadores", label: "Parámetros de indicadores", icon: Gauge },
  { value: "periodos", label: "Periodos de evaluación", icon: CalendarRange },
] as const

export function ConfiguracionTabs({ 
  usuarios = [], 
  esAdmin = false,
  projectInfo,
}: { 
  usuarios?: Array<{ id: string; nombre_completo: string | null; email: string | null; rol: string; activa: boolean }> 
  esAdmin?: boolean
  projectInfo: ProjectInfo
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
      <TabsContent value="roles">
        <RolesPermisos />
      </TabsContent>
      <TabsContent value="indicadores">
        <ParametrosIndicadores />
      </TabsContent>
      <TabsContent value="periodos">
        <PeriodosEvaluacion />
      </TabsContent>
    </Tabs>
  )
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string
  description: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
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
      title="Configuracion del proyecto"
      description="Edita la informacion que se muestra en el dashboard y en la tarjeta lateral del proyecto"
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
              placeholder="Proyecto FCI 2025"
            />
          </div>

          <div className="space-y-1.5 lg:col-span-2">
            <Label htmlFor="project-description">Descripcion</Label>
            <Input
              id="project-description"
              name="descripcion"
              value={descripcionProyecto}
              onChange={(event) => setDescripcionProyecto(event.target.value)}
              disabled={!esAdmin || pending}
              placeholder="Programa de formacion y apoyo tecnico..."
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
        </div>

        <div className="rounded-md border border-border p-4">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tiempo transcurrido</span>
            <span className="font-medium text-foreground">
              {projectInfo.mesesTranscurridos} / {projectInfo.duracionMeses} meses
            </span>
          </div>
          <Progress value={projectInfo.porcentajeTranscurrido} />
          <p className="mt-2 text-right text-xs text-muted-foreground">
            {projectInfo.porcentajeTranscurrido}% transcurrido
          </p>
        </div>

        {!esAdmin ? (
          <p className="text-sm text-muted-foreground">Solo la administradora puede editar esta informacion.</p>
        ) : null}

        {state?.message ? (
          <p className={cn("text-sm", state.ok ? "text-primary" : "text-destructive")}>{state.message}</p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={!esAdmin || pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar configuracion
          </Button>
        </div>
      </form>
    </Panel>
  )
}

const ROL_BADGE: Record<string, string> = {
  Administradora: "bg-primary/10 text-primary",
  Investigadora: "bg-chart-4/15 text-chart-4",
  Formadora: "bg-chart-3/15 text-chart-3",
  "Mujer emprendedora": "bg-secondary text-secondary-foreground",
  "Institución aliada": "bg-chart-2/15 text-chart-2",
  "Sin rol": "bg-secondary text-secondary-foreground",
}

function GestionUsuarios({ usuarios, esAdmin }: { usuarios: Array<{ id: string; nombre_completo: string | null; email: string | null; rol: string; activa: boolean }>; esAdmin: boolean }) {
  const [query, setQuery] = useState("")
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedUser, setSelectedUser] = useState<typeof usuarios[0] | null>(null)
  const [newEmail, setNewEmail] = useState("")
  const [newNombre, setNewNombre] = useState("")
  const [newRol, setNewRol] = useState("investigadora")
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
      setNewRol("investigadora")
      window.location.reload() // Refrescar lista
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
      window.location.reload() // Refrescar lista
    } else {
      alert(`Error: ${res.message}`)
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("¿Eliminar este usuario?")) return
    setLoading(true)
    const res = await eliminarUsuario(userId)
    setLoading(false)
    if (res.ok) {
      window.location.reload()
    } else {
      alert(`Error: ${res.message}`)
    }
  }

  function openEditDialog(user: typeof usuarios[0]) {
    setSelectedUser(user)
    setEditNombre(user.nombre_completo ?? "")
    setEditEmail(user.email ?? "")
    setEditRol(user.rol)
    setEditActiva(user.activa)
    setOpenEdit(true)
  }

  if (!esAdmin) {
    return (
      <Panel
        title="Gestión de usuarios"
        description="Solo los administradores pueden gestionar usuarios"
      >
        <p className="text-muted-foreground">No tienes permiso para gestionar usuarios.</p>
      </Panel>
    )
  }

  return (
    <>
      <Panel
        title="Gestión de usuarios"
        description="Administra las personas con acceso a la plataforma"
        action={
          <Button size="sm" onClick={() => setOpenCreate(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo usuario
          </Button>
        }
      >
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            className="pl-9"
          />
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
                  <TableCell>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        ROL_BADGE[u.rol] ?? "bg-secondary text-secondary-foreground",
                      )}
                    >
                      {u.rol}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.activa ? "default" : "secondary"}>
                      {u.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditDialog(u)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar {u.nombre_completo}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteUser(u.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar {u.nombre_completo}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Panel>

      {/* Dialog para crear usuario */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nuevo usuario</DialogTitle>
            <DialogDescription>Ingresa los datos del nuevo usuario. Se enviará un correo con instrucciones para establecer contraseña.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-900">
              <p className="font-medium">¿Cómo funciona?</p>
              <p className="mt-1 text-xs">Se enviará un correo al nuevo usuario con un enlace para establecer su propia contraseña de forma segura.</p>
            </div>
            <div>
              <Label htmlFor="new-nombre">Nombre completo</Label>
              <Input
                id="new-nombre"
                value={newNombre}
                onChange={(e) => setNewNombre(e.target.value)}
                placeholder="María García"
              />
            </div>
            <div>
              <Label htmlFor="new-email">Correo</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="maria@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="new-rol">Rol</Label>
              <select
                id="new-rol"
                value={newRol}
                onChange={(e) => setNewRol(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="investigadora">Investigadora</option>
                <option value="administradora">Administradora</option>
                <option value="formadora">Formadora</option>
                <option value="mujer_emprendedora">Mujer emprendedora</option>
                <option value="institucion_aliada">Institución aliada</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={loading || !newNombre || !newEmail}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar usuario */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>Actualiza los datos del usuario.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nombre">Nombre completo</Label>
              <Input
                id="edit-nombre"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Correo</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-rol">Rol</Label>
              <select
                id="edit-rol"
                value={editRol}
                onChange={(e) => setEditRol(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Investigadora">Investigadora</option>
                <option value="Administradora">Administradora</option>
                <option value="Formadora">Formadora</option>
                <option value="Mujer emprendedora">Mujer emprendedora</option>
                <option value="Institución aliada">Institución aliada</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="edit-activa"
                checked={editActiva}
                onCheckedChange={setEditActiva}
              />
              <Label htmlFor="edit-activa">Cuenta activa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancelar
            </Button>
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

const PERMISOS = ["Ver dashboard", "Editar proyecto", "Gestionar usuarios", "Generar reportes", "Configurar indicadores"]
const MATRIZ: Record<string, boolean[]> = {
  Administradora: [true, true, true, true, true],
  Investigadora: [true, true, false, true, true],
  Formadora: [true, true, false, true, false],
  "Mujer emprendedora": [true, false, false, false, false],
  "Institución aliada": [true, false, false, true, false],
}

function RolesPermisos() {
  return (
    <Panel
      title="Roles y permisos"
      description="Define qué puede hacer cada rol dentro del sistema"
      action={
        <Button size="sm" variant="outline">
          <Plus className="mr-1.5 h-4 w-4" />
          Nuevo rol
        </Button>
      }
    >
      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rol</TableHead>
              {PERMISOS.map((p) => (
                <TableHead key={p} className="text-center">
                  {p}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(MATRIZ).map(([rol, permisos]) => (
              <TableRow key={rol}>
                <TableCell className="font-medium text-foreground">{rol}</TableCell>
                {permisos.map((permitido, i) => (
                  <TableCell key={i} className="text-center">
                    {permitido ? (
                      <Check className="mx-auto h-4 w-4 text-primary" />
                    ) : (
                      <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Panel>
  )
}

const INDICADORES = [
  { nombre: "Asistencia a cursos", meta: 80, unidad: "%", activo: true },
  { nombre: "Productos científicos", meta: 12, unidad: "docs", activo: true },
  { nombre: "Satisfacción de participantes", meta: 90, unidad: "%", activo: true },
  { nombre: "Avance de malla formativa", meta: 100, unidad: "%", activo: false },
]

function ParametrosIndicadores() {
  return (
    <Panel
      title="Parámetros de indicadores"
      description="Configura las metas y umbrales de los indicadores del proyecto"
      action={
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Nuevo indicador
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {INDICADORES.map((ind) => (
          <div key={ind.nombre} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-foreground">{ind.nombre}</p>
              <Switch defaultChecked={ind.activo} />
            </div>
            <div className="mt-4 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Meta objetivo ({ind.unidad})</Label>
              <Input type="number" defaultValue={ind.meta} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

const PERIODOS = [
  { nombre: "Diagnóstico inicial", inicio: "01/05/2025", fin: "30/06/2025", estado: "Finalizado" },
  { nombre: "Formación - Fase 1", inicio: "01/07/2025", fin: "30/10/2025", estado: "En curso" },
  { nombre: "Validación intermedia", inicio: "01/11/2025", fin: "15/12/2025", estado: "Programado" },
  { nombre: "Evaluación final", inicio: "01/03/2026", fin: "30/04/2026", estado: "Programado" },
]

const ESTADO_BADGE: Record<string, "default" | "secondary" | "outline"> = {
  Finalizado: "secondary",
  "En curso": "default",
  Programado: "outline",
}

function PeriodosEvaluacion() {
  return (
    <Panel
      title="Periodos de evaluación"
      description="Define las ventanas de tiempo para cada etapa de evaluación"
      action={
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Nuevo periodo
        </Button>
      }
    >
      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Periodo</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PERIODOS.map((p) => (
              <TableRow key={p.nombre}>
                <TableCell className="font-medium text-foreground">{p.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{p.inicio}</TableCell>
                <TableCell className="text-muted-foreground">{p.fin}</TableCell>
                <TableCell>
                  <Badge variant={ESTADO_BADGE[p.estado] ?? "outline"}>{p.estado}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar {p.nombre}</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Panel>
  )
}
