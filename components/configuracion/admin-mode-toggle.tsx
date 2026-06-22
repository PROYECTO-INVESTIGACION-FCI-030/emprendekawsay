"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export function AdminModeToggle({ onToggle }: { onToggle?: (isAdmin: boolean) => void }) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("dev_admin_mode") === "true"
    setIsAdmin(stored)
    onToggle?.(stored)
  }, [onToggle])

  const toggle = () => {
    const newValue = !isAdmin
    setIsAdmin(newValue)
    localStorage.setItem("dev_admin_mode", String(newValue))
    window.location.reload()
  }

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== "development") return null

  return (
    <Button
      size="sm"
      variant={isAdmin ? "default" : "outline"}
      onClick={toggle}
      className="fixed bottom-4 right-4 z-50"
    >
      <ShieldAlert className="mr-1.5 h-4 w-4" />
      {isAdmin ? "Admin ON" : "Admin OFF"}
    </Button>
  )
}
