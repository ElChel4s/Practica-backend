"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { inscripcionesApi } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, BookOpen } from "lucide-react"

interface AddEnrollmentFormProps {
  onSubmit: (enrollment: { studentId: number; subjectId: number }) => void
  students: {
    id: number;
    name: string;
    grade: string;
  }[]
  subjects: {
    id: number;
    name: string;
    code: string;
  }[]
}

export function AddEnrollmentForm({ onSubmit, students, subjects }: AddEnrollmentFormProps) {
  console.log("AddEnrollmentForm rendering with:", {
    studentsCount: students?.length ?? 0,
    subjectsCount: subjects?.length ?? 0,
    students: students,
    subjects: subjects
  });
  
  // Verificación adicional para depuración
  if (!students || students.length === 0) {
    console.warn("No hay estudiantes disponibles para el formulario de inscripción");
  }
  
  if (!subjects || subjects.length === 0) {
    console.warn("No hay materias disponibles para el formulario de inscripción");
  }
  
  const [formData, setFormData] = useState({
    studentId: 0,
    subjectId: 0,
  })

  const [errors, setErrors] = useState({
    studentId: "",
    subjectId: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      studentId: "",
      subjectId: "",
    }

    if (!formData.studentId) {
      newErrors.studentId = "El estudiante es requerido"
      isValid = false
    }

    if (!formData.subjectId) {
      newErrors.subjectId = "La materia es requerida"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleStudentChange = (value: string) => {
    setFormData({ ...formData, studentId: Number.parseInt(value) })
    if (errors.studentId) {
      setErrors({ ...errors, studentId: "" })
    }
  }

  const handleSubjectChange = (value: string) => {
    setFormData({ ...formData, subjectId: Number.parseInt(value) })
    if (errors.subjectId) {
      setErrors({ ...errors, subjectId: "" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Verificaciones adicionales antes de llamar a la API
      if (onSubmit) {
        // Delegar la lógica de creación al componente padre que tiene más contexto
        onSubmit(formData);
      }
    } catch (error: any) {
      console.error("Error al crear inscripción:", error);
      // Intentar extraer un mensaje más descriptivo del error
      let errorMessage = error.message;
      
      // Si el error contiene información JSON, intentar extraer detalles más específicos
      if (error.message && error.message.includes("{") && error.message.includes("}")) {
        try {
          const errorJson = JSON.parse(error.message.substring(
            error.message.indexOf("{"), 
            error.message.lastIndexOf("}") + 1
          ));
          
          if (errorJson.detalles) {
            errorMessage = errorJson.detalles;
          } else if (errorJson.mensaje) {
            errorMessage = errorJson.mensaje;
          }
        } catch (parseError) {
          console.error("Error al parsear mensaje de error:", parseError);
        }
      }
      
      // Determinar qué mensaje mostrar basado en el contenido
      if (errorMessage.toLowerCase().includes("ya está inscripto") || 
          errorMessage.toLowerCase().includes("ya existe")) {
        errorMessage = "El estudiante ya está inscrito en esta materia.";
      }
      
      setErrors({ ...errors, subjectId: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const formItemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={formVariants}
    >
      <motion.div className="space-y-2" variants={formItemVariants}>
        <Label htmlFor="student" className="text-[#003366] font-medium flex items-center">
          <User className="h-4 w-4 mr-2 text-gray-400" />
          Estudiante
        </Label>
        <Select onValueChange={handleStudentChange}>
          <SelectTrigger
            className={`rounded-lg transition-all duration-200 ${
              errors.studentId ? "border-red-500 focus:ring-red-500" : "focus:ring-[#003366]"
            }`}
          >
            <SelectValue placeholder="Seleccionar estudiante" />
          </SelectTrigger>
          <SelectContent>
            {students && students.length > 0 ? (
              students.map((student) => (
                <SelectItem key={student.id} value={student.id.toString()}>
                  {student.name} - {student.grade}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="-1" disabled>No hay estudiantes disponibles</SelectItem>
            )}
          </SelectContent>
        </Select>
        {errors.studentId && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 mt-1"
          >
            {errors.studentId}
          </motion.p>
        )}
      </motion.div>

      <motion.div className="space-y-2" variants={formItemVariants}>
        <Label htmlFor="subject" className="text-[#003366] font-medium flex items-center">
          <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
          Materia
        </Label>
        <Select onValueChange={handleSubjectChange}>
          <SelectTrigger
            className={`rounded-lg transition-all duration-200 ${
              errors.subjectId ? "border-red-500 focus:ring-red-500" : "focus:ring-[#003366]"
            }`}
          >
            <SelectValue placeholder="Seleccionar materia" />
          </SelectTrigger>
          <SelectContent>
            {subjects && subjects.length > 0 ? (
              subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  {subject.name} ({subject.code})
                </SelectItem>
              ))
            ) : (
              <SelectItem value="-1" disabled>No hay materias disponibles</SelectItem>
            )}
          </SelectContent>
        </Select>
        {errors.subjectId && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 mt-1"
          >
            {errors.subjectId}
          </motion.p>
        )}
      </motion.div>

      <motion.div className="flex justify-end gap-3 pt-4" variants={formItemVariants}>
        <Button
          type="button"
          variant="outline"
          onClick={() => onSubmit({ studentId: 0, subjectId: 0 })}
          className="border-[#003366] text-[#003366] hover:bg-[#003366]/10 transition-all duration-200"
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-secondary hover:bg-gradient-to-r hover:from-[#006400] hover:to-[#008000] text-white transition-all duration-300 transform hover:scale-[1.02] button-effect"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Inscribiendo...
            </>
          ) : (
            "Inscribir"
          )}
        </Button>
      </motion.div>
    </motion.form>
  )
}
