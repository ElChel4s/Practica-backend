"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getToken, isAuthenticated } from '@/lib/auth'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Esta función solo debe ejecutarse en el cliente
    const checkAuth = () => {
      const publicPaths = ['/login', '/signup']
      const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
      const userAuthenticated = isAuthenticated()
      
      if (!userAuthenticated && !isPublicPath) {
        // Si no está autenticado y la ruta requiere autenticación, redirigir al login
        router.push('/login')
      } else if (userAuthenticated && isPublicPath) {
        // Si está autenticado y está en una ruta pública, redirigir al dashboard
        router.push('/dashboard')
      }
      
      setAuthChecked(true)
    }
    
    checkAuth()
  }, [pathname, router])

  // Solo renderizamos el contenido cuando ya se ha verificado la autenticación
  if (!authChecked) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-900"></div>
      </div>
    )
  }

  // Renderizamos el contenido una vez que se ha verificado la autenticación
  return <>{children}</>
}
