"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { StudentTable } from "@/components/dashboard/student-table"
import { AddStudentForm } from "@/components/dashboard/add-student-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { UserPlus, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { estudiantesApi, EstudianteDTO } from "@/lib/api"

export default function StudentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<EstudianteDTO | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [students, setStudents] = useState<EstudianteDTO[]>([])

  // Cargar datos reales del backend
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const data = await estudiantesApi.getAll()
        setStudents(data)
      } catch (err) {
        // TODO: mostrar error
      }
      setIsLoading(false)
    }

    loadData()
  }, [])

  // Alta de estudiante
  const handleAddStudent = async (student: Omit<EstudianteDTO, "id">) => {
    setIsLoading(true)
    try {
      const nuevo = await estudiantesApi.create(student as EstudianteDTO)
      setStudents([...students, nuevo])
      setIsDialogOpen(false)
      toast({
        title: "Estudiante agregado",
        description: `${nuevo.nombre} ${nuevo.apellido} ha sido agregado correctamente.`,
      })
    } catch (err: any) {
      toast({
        title: "Error al agregar estudiante",
        description: err.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  // Edición de estudiante
  const handleEditStudent = (student: EstudianteDTO) => {
    setEditingStudent(student)
    setIsDialogOpen(true)
  }

  // Actualizar estudiante
  const handleUpdateStudent = async (updatedStudent: EstudianteDTO) => {
    setIsLoading(true)
    try {
      const original = students.find((s) => s.id === updatedStudent.id)
      if (!original) throw new Error("No se encontró el estudiante original")
      const esBaja = updatedStudent.estado === "inactivo"
      let completo: EstudianteDTO = {
        ...original,
        ...updatedStudent,
        nombre: updatedStudent.nombre ?? original.nombre ?? "",
        apellido: updatedStudent.apellido ?? original.apellido ?? "",
        email: updatedStudent.email ?? original.email ?? "",
        fechaNacimiento: updatedStudent.fechaNacimiento ?? original.fechaNacimiento ?? "",
        numeroInscripcion: updatedStudent.numeroInscripcion ?? original.numeroInscripcion ?? "",
        usuarioAlta: original.usuarioAlta ?? "admin",
        fechaAlta: original.fechaAlta ?? new Date().toISOString().slice(0, 10),
        estado: updatedStudent.estado,
        fechaBaja: esBaja ? (updatedStudent.fechaBaja ?? original.fechaBaja ?? new Date().toISOString().slice(0, 10)) : undefined,
        usuarioBaja: esBaja ? (updatedStudent.usuarioBaja ?? original.usuarioBaja ?? "admin") : undefined,
        motivoBaja: esBaja ? (updatedStudent.motivoBaja ?? original.motivoBaja ?? undefined) : undefined,
      }
      // Eliminar campos de baja si el estado es activo
      if (!esBaja) {
        delete completo.fechaBaja
        delete completo.usuarioBaja
        delete completo.motivoBaja
      }
      const actualizado = await estudiantesApi.update(completo.id!, completo)
      // Recargar la lista desde el backend para reflejar cambios reales
      const data = await estudiantesApi.getAll()
      setStudents(data)
      setIsDialogOpen(false)
      setEditingStudent(null)
      toast({
        title: "Estudiante actualizado",
        description: `${actualizado.nombre} ${actualizado.apellido} ha sido actualizado correctamente.`,
      })
    } catch (err: any) {
      toast({
        title: "Error al actualizar estudiante",
        description: err.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  // Baja lógica
  const handleDeleteStudent = async (id: number) => {
    setIsLoading(true)
    try {
      const estudiante = students.find((s) => s.id === id)
      if (!estudiante) return
      const eliminado = await estudiantesApi.baja(id, { ...estudiante, estado: "inactivo", usuarioBaja: "admin", fechaBaja: new Date().toISOString().slice(0, 10) })
      setStudents(students.filter((s) => s.id !== id))
      toast({
        title: "Estudiante eliminado",
        description: `${eliminado.nombre} ${eliminado.apellido} ha sido eliminado correctamente.`,
        variant: "destructive",
      })
    } catch (err: any) {
      toast({
        title: "Error al eliminar estudiante",
        description: err.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  // Filtrado por nombre, apellido, email, numeroInscripcion
  const filteredStudents = students.filter(
    (student) =>
      student.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.numeroInscripcion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={container}>
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#003366]">Estudiantes</h1>
          <p className="text-gray-600 mt-1">Gestiona la información de los estudiantes</p>
        </div>
        <Button
          onClick={() => {
            setEditingStudent(null)
            setIsDialogOpen(true)
          }}
          className="bg-gradient-to-r from-[#003366] to-[#004080] hover:from-[#004080] hover:to-[#005099] text-white transition-all duration-300 transform hover:scale-[1.02] button-effect"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar estudiante
        </Button>
      </motion.div>

      <motion.div variants={item} className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="search"
          placeholder="Buscar estudiantes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full md:max-w-xs rounded-lg border-gray-300 focus:border-[#003366] focus:ring-[#003366] input-focus-effect"
        />
      </motion.div>

      <motion.div variants={item}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-[#003366] animate-spin mb-4" />
            <p className="text-gray-500">Cargando estudiantes...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={searchTerm}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <StudentTable students={filteredStudents} onEdit={handleEditStudent} onDelete={handleDeleteStudent} />
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#003366] text-xl">
              {editingStudent ? "Editar estudiante" : "Agregar estudiante"}
            </DialogTitle>
          </DialogHeader>
          <AddStudentForm
            onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent}
            initialData={editingStudent}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

// Animaciones
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.3 } },
}
