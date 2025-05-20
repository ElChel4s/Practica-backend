"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, Briefcase, Loader2 } from "lucide-react" // Agregado Briefcase para roles
import { api } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" // Para el selector de roles

export function SignupForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [role, setRole] = useState<string | undefined>(undefined) // Rol como string o undefined
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setIsLoading(true)

    if (!username || !email || !password || !confirmPassword || !nombre || !apellido) {
      setError("Por favor, completa todos los campos obligatorios.")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      setIsLoading(false)
      return
    }

    const rolesToSend = role ? [role] : undefined; // Enviar como array si está definido

    try {
      const response = await api.post("/auth/signup", {
        username,
        email,
        password,
        nombre,
        apellido,
        roles: rolesToSend, // Enviar el array de roles
      })

      console.log("Respuesta de registro:", response)

      // Si la respuesta es exitosa (200/201/204), SIEMPRE mostrar éxito y limpiar error
      if (response.status === 200 || response.status === 201 || response.status === 204) {
        // SIEMPRE mostrar el mensaje de éxito si el status es 200/201/204
        let msg = "¡Usuario registrado exitosamente! Serás redirigido al login.";
        if (typeof response.data === "string" && response.data.trim() !== "") {
          msg = response.data;
        } else if (response.data && response.data.message) {
          msg = response.data.message;
        }
        setSuccessMessage(msg);
        setError("");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setNombre("");
        setApellido("");
        setRole(undefined);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
        return;
      }
      // Si llegamos aquí, es un error real
      setError(response.data?.message || response.data || "Error al registrar el usuario. Inténtalo de nuevo.");
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error de registro:", err)
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message)
      } else if (err.message) {
        setError(err.message)
      } else {
        setError("Error de red o del servidor al intentar registrar.")
      }
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="John"
              required
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="apellido">Apellido</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="apellido"
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Doe"
              required
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Nombre de usuario</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="john.doe"
            required
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john.doe@example.com"
            required
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full">
             <div className="flex items-center"> {/* Contenedor para el ícono y el texto */}
              <Briefcase className="h-4 w-4 text-gray-400 mr-2" /> {/* Ícono */}
              <SelectValue placeholder="Seleccionar un rol (opcional)" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="estudiante">Estudiante</SelectItem>
            <SelectItem value="docente">Docente</SelectItem>
            {/* No ofreceremos 'admin' en el signup público por seguridad */}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">Si no seleccionas un rol, se te asignará como Estudiante por defecto.</p>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registrando...
          </>
        ) : (
          "Crear cuenta"
        )}
      </Button>

      <div className="text-center text-sm">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Inicia sesión
        </Link>
      </div>
    </form>
  )
}

// Exportar SOLO como default para evitar conflictos de importación
export default SignupForm;
