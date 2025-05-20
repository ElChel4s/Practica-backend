"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, decodeToken } from '@/lib/auth'

interface WithAuthProps {
  requiredRoles?: string[]
  children: React.ReactNode
}

/**
 * Componente HOC para proteger rutas que requieren autenticación
 * @param requiredRoles - Roles requeridos para acceder a la ruta (opcional)
 * @param children - Contenido de la página
 */
export function WithAuth({ requiredRoles, children }: WithAuthProps) {
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    // Verificar roles si es necesario
    if (requiredRoles && requiredRoles.length > 0) {
      const userInfo = decodeToken()
      
      if (!userInfo || !userInfo.roles) {
        router.push('/login')
        return
      }
      
      // Verificar si el usuario tiene al menos uno de los roles requeridos
      const hasRequiredRole = requiredRoles.some(role => 
        userInfo.roles.includes(role)
      )
      
      if (!hasRequiredRole) {
        router.push('/dashboard') // Redirigir a dashboard si no tiene permiso
      }
    }
  }, [router, requiredRoles])

  return <>{children}</>
}
