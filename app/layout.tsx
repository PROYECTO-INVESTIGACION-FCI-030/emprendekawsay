import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Plataforma de Gestión de Proyectos FCI | Universidad de Guayaquil",
  description: "Dashboard de gestión y seguimiento de proyectos FCI de la Universidad de Guayaquil",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/ug-192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
    ],
    shortcut: "/ug-192x192.png",
    apple: "/ug-192x192.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
