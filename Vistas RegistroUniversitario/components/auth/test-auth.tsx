"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function TestAuth() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const testDirectLogin = async () => {
    setIsLoading(true)
    setResult("Enviando solicitud...")

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      })

      const responseText = await response.text()
      
      setResult(`
      Status: ${response.status} ${response.statusText}
      Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}
      Body: ${responseText}
      `)

      if (response.ok) {
        try {
          const data = JSON.parse(responseText)
          // Mostrar el token si existe
          if (data.token) {
            setResult(prev => prev + `\n\nToken recibido correctamente: ${data.token.substring(0, 20)}...`)
          } else {
            setResult(prev => prev + `\n\nRespuesta sin token: ${JSON.stringify(data)}`)
          }
        } catch (e) {
          setResult(prev => prev + `\n\nError al parsear la respuesta como JSON`)
        }
      }
    } catch (error) {
      setResult(`Error al hacer la petición: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Test de Autenticación</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="testUsername">Usuario</Label>
          <Input 
            id="testUsername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="usuario"
          />
        </div>
        
        <div>
          <Label htmlFor="testPassword">Contraseña</Label>
          <Input 
            id="testPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="contraseña"
          />
        </div>

        <Button 
          onClick={testDirectLogin}
          disabled={isLoading}
        >
          {isLoading ? "Probando..." : "Probar Login Directo"}
        </Button>

        {result && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <h3 className="text-sm font-semibold mb-2">Resultado:</h3>
            <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-96">
              {result}
            </pre>
          </div>
        )}
      </div>
    </Card>
  )
}
