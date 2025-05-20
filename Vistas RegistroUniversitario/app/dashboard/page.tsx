"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, ClipboardList, TrendingUp } from "lucide-react"
import { WithAuth } from "@/components/auth/with-auth"
import { decodeToken } from "@/lib/auth"
import { api } from "@/lib/api"

export default function DashboardPage() {
  return (
    <WithAuth>
      <DashboardContent />
    </WithAuth>
  )
}

// Componente interno que contiene el contenido del dashboard
function DashboardContent() {
  const [userName, setUserName] = useState("Usuario")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    students: 0,
    subjects: 0,
    enrollments: 0,
  })

  // Cargar datos reales
  useEffect(() => {
    const loadData = async () => {
      try {
        // Obtener información del usuario del token JWT
        const userInfo = decodeToken()
        if (userInfo?.username) {
          setUserName(userInfo.username)
        }
        
        // Aquí podríamos hacer peticiones a la API para obtener estadísticas reales
        // Por ejemplo:
        // const studentsCount = await api.get('/students/count');
        // const subjectsCount = await api.get('/subjects/count');
        // const enrollmentsCount = await api.get('/enrollments/count');
        
        // Por ahora simulamos datos
        setStats({
          students: 120,
          subjects: 15,
          enrollments: 350,
        })
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-[#003366]">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bienvenido de nuevo, {userName}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-slide-in-up">
        <Card className="hover-lift transition-all duration-300 border-l-4 border-l-[#003366]">
          <CardContent className="p-6 flex items-center">
            <div className="bg-[#003366]/10 p-3 rounded-full mr-4">
              <Users className="h-6 w-6 text-[#003366]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Estudiantes</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {isLoading ? <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div> : stats.students}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all duration-300 border-l-4 border-l-[#006400]">
          <CardContent className="p-6 flex items-center">
            <div className="bg-[#006400]/10 p-3 rounded-full mr-4">
              <BookOpen className="h-6 w-6 text-[#006400]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Materias</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {isLoading ? <div className="h-8 w-12 bg-gray-200 animate-pulse rounded"></div> : stats.subjects}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all duration-300 border-l-4 border-l-[#800000]">
          <CardContent className="p-6 flex items-center">
            <div className="bg-[#800000]/10 p-3 rounded-full mr-4">
              <ClipboardList className="h-6 w-6 text-[#800000]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Inscripciones</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {isLoading ? <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div> : stats.enrollments}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all duration-300 border-l-4 border-l-purple-500">
          <CardContent className="p-6 flex items-center">
            <div className="bg-purple-500/10 p-3 rounded-full mr-4">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tasa de aprobación</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {isLoading ? <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div> : "85%"}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
        <Card className="hover-lift transition-all duration-300 bg-gradient-to-br from-[#003366]/5 to-[#003366]/10 border-[#003366]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#003366] flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-gray-600">
              Gestiona la información de los estudiantes, incluyendo datos personales y académicos.
            </p>
            <div className="mt-4">
              <a
                href="/dashboard/students"
                className="text-[#003366] font-medium hover:underline inline-flex items-center"
              >
                Ir a Estudiantes
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all duration-300 bg-gradient-to-br from-[#006400]/5 to-[#006400]/10 border-[#006400]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#006400] flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Materias
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-gray-600">
              Administra las materias y sus docentes, incluyendo información detallada de cada curso.
            </p>
            <div className="mt-4">
              <a
                href="/dashboard/subjects"
                className="text-[#006400] font-medium hover:underline inline-flex items-center"
              >
                Ir a Materias
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-all duration-300 bg-gradient-to-br from-[#800000]/5 to-[#800000]/10 border-[#800000]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#800000] flex items-center">
              <ClipboardList className="h-5 w-5 mr-2" />
              Inscripciones
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-gray-600">
              Gestiona las inscripciones de estudiantes a materias y lleva un control de las mismas.
            </p>
            <div className="mt-4">
              <a
                href="/dashboard/enrollments"
                className="text-[#800000] font-medium hover:underline inline-flex items-center"
              >
                Ir a Inscripciones
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
