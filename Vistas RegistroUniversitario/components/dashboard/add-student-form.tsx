"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { EstudianteDTO } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface AddStudentFormProps {
  onSubmit: (student: Partial<EstudianteDTO>) => void
  initialData: EstudianteDTO | null
  onCancel: () => void
}

export function AddStudentForm({ onSubmit, initialData, onCancel }: AddStudentFormProps) {
  const [formData, setFormData] = useState<Partial<EstudianteDTO>>({
    id: initialData?.id,
    nombre: initialData?.nombre || "",
    apellido: initialData?.apellido || "",
    email: initialData?.email || "",
    fechaNacimiento: initialData?.fechaNacimiento || "",
    numeroInscripcion: initialData?.numeroInscripcion || "",
    estado: initialData?.estado || "activo",
    usuarioAlta: initialData?.usuarioAlta || "admin",
    fechaAlta: initialData?.fechaAlta || new Date().toISOString().slice(0, 10),
  })

  const [errors, setErrors] = useState({
    nombre: "",
    apellido: "",
    email: "",
    fechaNacimiento: "",
    numeroInscripcion: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touchedFields, setTouchedFields] = useState({
    nombre: false,
    apellido: false,
    email: false,
    fechaNacimiento: false,
    numeroInscripcion: false,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        nombre: initialData.nombre,
        apellido: initialData.apellido,
        email: initialData.email,
        numeroInscripcion: initialData.numeroInscripcion,
        estado: initialData.estado,
        fechaNacimiento: initialData.fechaNacimiento,
        usuarioAlta: initialData.usuarioAlta,
        fechaAlta: initialData.fechaAlta,
      })
    }
  }, [initialData])

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      nombre: "",
      apellido: "",
      email: "",
      fechaNacimiento: "",
      numeroInscripcion: "",
    }
    if (!(formData.nombre ?? "").trim()) {
      newErrors.nombre = "El nombre es requerido"
      isValid = false
    }
    if (!(formData.apellido ?? "").trim()) {
      newErrors.apellido = "El apellido es requerido"
      isValid = false
    }
    if (!(formData.email ?? "").trim()) {
      newErrors.email = "El correo electrónico es requerido"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email ?? "")) {
      newErrors.email = "El correo electrónico no es válido"
      isValid = false
    }
    if (!(formData.fechaNacimiento ?? "").trim()) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es requerida"
      isValid = false
    }
    if (!(formData.numeroInscripcion ?? "").trim()) {
      newErrors.numeroInscripcion = "El número de inscripción es requerido"
      isValid = false
    }
    setErrors(newErrors)
    return isValid
  }

  const validateField = (name: string, value: string) => {
    let error = ""

    switch (name) {
      case "nombre":
        if (!value.trim()) error = "El nombre es requerido"
        break
      case "email":
        if (!value.trim()) {
          error = "El correo electrónico es requerido"
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = "El correo electrónico no es válido"
        }
        break
      case "numeroInscripcion":
        if (!value.trim()) error = "El número de inscripción es requerido"
        break
      case "fechaNacimiento":
        if (!value) error = "La fecha de nacimiento es requerida"
        break
    }

    setErrors({
      ...errors,
      [name]: error,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Mark field as touched
    setTouchedFields({
      ...touchedFields,
      [name]: true,
    })

    // Validate on change for better UX
    if (touchedFields[name as keyof typeof touchedFields]) {
      validateField(name, value)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouchedFields({
      ...touchedFields,
      [name]: true,
    })
    validateField(name, value)
  }

  const handleEstadoChange = (value: string) => {
    setFormData({ ...formData, estado: value })
    setTouchedFields({
      ...touchedFields,
      estado: true,
    })

    if (!value) {
      setErrors({ ...errors, estado: "El estado es requerido" })
    } else {
      setErrors({ ...errors, estado: "" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouchedFields({
      nombre: true,
      email: true,
      numeroInscripcion: true,
      fechaNacimiento: true,
    })

    if (validateForm()) {
      setIsSubmitting(true)

      // Simulate API call
      setTimeout(() => {
        onSubmit(formData)
        setIsSubmitting(false)
      }, 800)
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
        <Label htmlFor="nombre" className="text-[#003366] font-medium">
          Nombre
        </Label>
        <div className="relative">
          <Input
            id="nombre"
            name="nombre"
            value={formData.nombre ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`rounded-lg transition-all duration-200 ${
              errors.nombre
                ? "border-red-500 focus:ring-red-500"
                : touchedFields.nombre && !errors.nombre
                  ? "border-green-500 focus:ring-green-500"
                  : "focus:ring-[#003366]"
            }`}
          />
          {touchedFields.nombre && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {errors.nombre ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          )}
        </div>
        {errors.nombre && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 mt-1"
          >
            {errors.nombre}
          </motion.p>
        )}
      </motion.div>

      <motion.div className="space-y-2" variants={formItemVariants}>
        <Label htmlFor="apellido" className="text-[#003366] font-medium">
          Apellido
        </Label>
        <div className="relative">
          <Input
            id="apellido"
            name="apellido"
            value={formData.apellido ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`rounded-lg transition-all duration-200 ${
              errors.apellido
                ? "border-red-500 focus:ring-red-500"
                : touchedFields.apellido && !errors.apellido
                  ? "border-green-500 focus:ring-green-500"
                  : "focus:ring-[#003366]"
            }`}
          />
          {touchedFields.apellido && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {errors.apellido ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          )}
        </div>
        {errors.apellido && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 mt-1"
          >
            {errors.apellido}
          </motion.p>
        )}
      </motion.div>

      <motion.div className="space-y-2" variants={formItemVariants}>
        <Label htmlFor="email" className="text-[#003366] font-medium">
          Correo electrónico
        </Label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`rounded-lg transition-all duration-200 ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : touchedFields.email && !errors.email
                  ? "border-green-500 focus:ring-green-500"
                  : "focus:ring-[#003366]"
            }`}
          />
          {touchedFields.email && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {errors.email ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          )}
        </div>
        {errors.email && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 mt-1"
          >
            {errors.email}
          </motion.p>
        )}
      </motion.div>

      <motion.div className="space-y-2" variants={formItemVariants}>
        <Label htmlFor="fechaNacimiento" className="text-[#003366] font-medium">
          Fecha de nacimiento
        </Label>
        <div className="relative">
          <Input
            id="fechaNacimiento"
            name="fechaNacimiento"
            type="date"
            value={formData.fechaNacimiento ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`rounded-lg transition-all duration-200 ${
              errors.fechaNacimiento
                ? "border-red-500 focus:ring-red-500"
                : touchedFields.fechaNacimiento && !errors.fechaNacimiento
                  ? "border-green-500 focus:ring-green-500"
                  : "focus:ring-[#003366]"
            }`}
          />
          {touchedFields.fechaNacimiento && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {errors.fechaNacimiento ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          )}
        </div>
        {errors.fechaNacimiento && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 mt-1"
          >
            {errors.fechaNacimiento}
          </motion.p>
        )}
      </motion.div>

      <motion.div className="space-y-2" variants={formItemVariants}>
        <Label htmlFor="numeroInscripcion" className="text-[#003366] font-medium">
          Número de inscripción
        </Label>
        <div className="relative">
          <Input
            id="numeroInscripcion"
            name="numeroInscripcion"
            value={formData.numeroInscripcion ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`rounded-lg transition-all duration-200 ${
              errors.numeroInscripcion
                ? "border-red-500 focus:ring-red-500"
                : touchedFields.numeroInscripcion && !errors.numeroInscripcion
                  ? "border-green-500 focus:ring-green-500"
                  : "focus:ring-[#003366]"
            }`}
          />
          {touchedFields.numeroInscripcion && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {errors.numeroInscripcion ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          )}
        </div>
        {errors.numeroInscripcion && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 mt-1"
          >
            {errors.numeroInscripcion}
          </motion.p>
        )}
      </motion.div>

      <motion.div className="space-y-2" variants={formItemVariants}>
        <Label htmlFor="estado" className="text-[#003366] font-medium">
          Estado
        </Label>
        <Select value={formData.estado} onValueChange={handleEstadoChange}>
          <SelectTrigger
            className={`rounded-lg transition-all duration-200 ${
              errors.estado
                ? "border-red-500 focus:ring-red-500"
                : touchedFields.estado && !errors.estado
                  ? "border-green-500 focus:ring-green-500"
                  : "focus:ring-[#003366]"
            }`}
          >
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
          </SelectContent>
        </Select>
        {errors.estado && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 mt-1"
          >
            {errors.estado}
          </motion.p>
        )}
      </motion.div>

      <motion.div className="flex justify-end gap-3 pt-4" variants={formItemVariants}>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-[#003366] text-[#003366] hover:bg-[#003366]/10 transition-all duration-200"
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-[#003366] to-[#004080] hover:from-[#004080] hover:to-[#005099] text-white transition-all duration-300 transform hover:scale-[1.02] button-effect"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? "Actualizando..." : "Guardando..."}
            </>
          ) : initialData ? (
            "Actualizar"
          ) : (
            "Guardar"
          )}
        </Button>
      </motion.div>
    </motion.form>
  )
}
