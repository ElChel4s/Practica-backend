import type { Metadata } from 'next'
import './globals.css'
import { AuthGuard } from '@/components/auth/auth-guard'

export const metadata: Metadata = {
  title: 'Registro Universitario',
  description: 'Sistema de Registro Universitario',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  )
}
