"use client"

import { useEffect, useState } from "react"
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
}: {
  initialProjectName: string
  initialProjectDescription: string
  initialNombre: string
  initialRol: string
  initialAvatarUrl: string | null
  initialNotificacionesActivas: boolean
  notificaciones: Notificacion[]
}) {
  const [projectName, setProjectName] = useState(initialProjectName)
  const [projectDescription, setProjectDescription] = useState(initialProjectDescription)
  const [nombre, setNombre] = useState(initialNombre)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [notificacionesActivas, setNotificacionesActivas] = useState(initialNotificacionesActivas)

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

  return (
    <Header
      projectName={projectName}
      projectDescription={projectDescription}
      nombre={nombre}
      rol={initialRol}
      avatarUrl={avatarUrl}
      notificacionesActivas={notificacionesActivas}
      notificaciones={notificaciones}
    />
  )
}
