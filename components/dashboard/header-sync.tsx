"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import type { Notificacion } from "@/lib/perfil"

export function HeaderSync({
  initialProjectName,
  initialProjectDescription,
  initialNombre,
  initialRol,
  initialAvatarUrl,
  initialNotificacionesActivas,
  notificaciones,
  initialReadIds,
  userId,
}: {
  initialProjectName: string
  initialProjectDescription: string
  initialNombre: string
  initialRol: string
  initialAvatarUrl: string | null
  initialNotificacionesActivas: boolean
  notificaciones: Notificacion[]
  initialReadIds: string[]
  userId: string | null
}) {
  const router = useRouter()
  const [projectName, setProjectName] = useState(initialProjectName)
  const [projectDescription, setProjectDescription] = useState(initialProjectDescription)
  const [nombre, setNombre] = useState(initialNombre)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [notificacionesActivas, setNotificacionesActivas] = useState(initialNotificacionesActivas)
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set(initialReadIds))

  useEffect(() => {
    const handleStorageChange = () => {
      const cached = localStorage.getItem("perfil_sync")
      if (!cached) return

      try {
        const data = JSON.parse(cached)
        setNombre(data.nombre || initialNombre)
        setAvatarUrl(data.avatar_url || initialAvatarUrl)
        setNotificacionesActivas(data.notificaciones_activas ?? initialNotificacionesActivas)
        setProjectName(data.project_name || initialProjectName)
        setProjectDescription(data.project_description || initialProjectDescription)
        localStorage.removeItem("perfil_sync")
      } catch (error) {
        console.error("Error al sincronizar el perfil:", error)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("perfil:updated", handleStorageChange as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("perfil:updated", handleStorageChange as EventListener)
    }
  }, [initialNombre, initialAvatarUrl, initialNotificacionesActivas, initialProjectName, initialProjectDescription])

  useEffect(() => {
    setProjectName(initialProjectName)
    setProjectDescription(initialProjectDescription)
  }, [initialProjectName, initialProjectDescription])

  async function marcarLeidas(ids: string[]) {
    if (ids.length === 0) return
    const previous = new Set(readIds)
    setReadIds((current) => {
      const next = new Set(current)
      ids.forEach((id) => next.add(id))
      return next
    })
    const response = await fetch("/api/notificaciones/leer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, userId }),
    })
    if (!response.ok) {
      setReadIds(previous)
      return
    }
    router.refresh()
  }

  const listaNotificaciones = notificaciones.map((notificacion) => ({
    ...notificacion,
    leida: readIds.has(notificacion.id) || notificacion.leida,
  }))

  return (
    <Header
      projectName={projectName}
      projectDescription={projectDescription}
      nombre={nombre}
      rol={initialRol}
      avatarUrl={avatarUrl}
      notificacionesActivas={notificacionesActivas}
      notificaciones={listaNotificaciones}
      onMarkRead={(id) => marcarLeidas([id])}
      onMarkAllRead={() => marcarLeidas(listaNotificaciones.filter((item) => !item.leida).map((item) => item.id))}
    />
  )
}
