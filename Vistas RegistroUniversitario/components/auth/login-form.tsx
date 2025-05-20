"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, Loader2, User } from "lucide-react"
import { setToken } from "@/lib/auth"
import { api } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!username || !password) {
      setError("Por favor, completa todos los campos")
      setIsLoading(false)
      return
    }

    try {
      console.log("Enviando solicitud de login con:", { username, password });
      // Usar fetch con opciones más explícitas para depurar
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          username: username,
          password: password
        }),
        // No incluir 'credentials' para simplificar la solicitud CORS
        // credentials: 'include'
      });
      
      console.log("Respuesta del servidor:", response.status, response.statusText);
      
      // Intentar leer el contenido de la respuesta independientemente del status
      let data;
      try {
        const textResponse = await response.text();
        console.log("Respuesta como texto:", textResponse);
        
        // Intentar convertir la respuesta a JSON si no está vacía
        if (textResponse) {
          data = JSON.parse(textResponse);
        }
      } catch (parseError) {
        console.error("Error al procesar respuesta:", parseError);
      }
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorMessage = (data && data.message) 
          ? data.message 
          : `Error ${response.status}: ${response.statusText}`;
        
        setError(errorMessage);
        setIsLoading(false);
        return;
      }
      
      // Si llegamos aquí, la respuesta es exitosa
      console.log("Login exitoso:", data);
      
      // Guardar el token JWT y la información del usuario en localStorage
      // data debería ser de tipo LoginApiResponse (definido en auth.ts)
      setToken(data); 
      
      // Redirigir al dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error de login:", err);
      setError(err.message || "Error de red o del servidor");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-[#003366] font-medium">
            Nombre de usuario
          </Label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-gray-400" />
            </div>
            <Input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 input-focus-effect transition-all duration-300 focus:border-[#003366] focus:ring-[#003366]/20"
              placeholder="usuario123"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[#003366] font-medium">
              Contraseña
            </Label>
            <a href="#" className="text-sm font-medium text-[#006400] hover:text-[#004d00] transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 input-focus-effect transition-all duration-300 focus:border-[#003366] focus:ring-[#003366]/20"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 py-6 button-effect"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </div>

      <div className="flex items-center justify-center mt-6">
        <div className="text-sm">
          <Link
            href="/signup"
            className="font-medium text-[#006400] hover:text-[#004d00] transition-colors hover-lift inline-block"
          >
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>
      </div>
    </form>
  )
}
