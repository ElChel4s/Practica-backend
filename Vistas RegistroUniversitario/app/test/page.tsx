"use client"

import { TestAuth } from "@/components/auth/test-auth"

export default function TestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8 text-center">Página de Prueba de Autenticación</h1>
      <TestAuth />
    </div>
  )
}
