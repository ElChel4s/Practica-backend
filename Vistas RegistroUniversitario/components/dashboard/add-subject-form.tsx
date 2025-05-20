"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MateriaDTO, materiasApi } from "@/lib/api"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface AddSubjectFormProps {
  onSubmit: (materia: Partial<MateriaDTO>) => void
  initialData: MateriaDTO | null
  onCancel: () => void
}

export function AddSubjectForm({ onSubmit, initialData, onCancel }: AddSubjectFormProps) {
  const [formData, setFormData] = useState<Partial<MateriaDTO>>({
    id: initialData?.id,
    nombreMateria: initialData?.nombreMateria || "",
    codigoUnico: initialData?.codigoUnico || "",
    creditos: initialData?.creditos || 1,
    prerequisitos: initialData?.prerequisitos || [],
  })
  const [errors, setErrors] = useState({
    nombreMateria: "",
    codigoUnico: "",
    creditos: "",
    prerequisitos: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touchedFields, setTouchedFields] = useState({
    nombreMateria: false,
    codigoUnico: false,
    creditos: false,
    prerequisitos: false,
  })
  const [materias, setMaterias] = useState<MateriaDTO[]>([])

  useEffect(() => {
    materiasApi.getAll().then(setMaterias)
  }, [])

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        nombreMateria: initialData.nombreMateria,
        codigoUnico: initialData.codigoUnico,
        creditos: initialData.creditos,
        prerequisitos: initialData.prerequisitos || [],
      })
    }
  }, [initialData])

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      nombreMateria: "",
      codigoUnico: "",
      creditos: "",
      prerequisitos: "",
    }

    if (!formData.nombreMateria || !formData.nombreMateria.trim()) {
      newErrors.nombreMateria = "El nombre de la materia es obligatorio"
      isValid = false
    }

    if (!formData.codigoUnico || !formData.codigoUnico.trim()) {
      newErrors.codigoUnico = "El código único es obligatorio"
      isValid = false
    }

    if (!formData.creditos || formData.creditos < 1) {
      newErrors.creditos = "Los créditos deben ser mayores a 0"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: name === "creditos" ? Number(value) : value })
    setTouchedFields({ ...touchedFields, [name]: true })
  }

  const handlePrerequisitosChange = (ids: number[]) => {
    setFormData({ ...formData, prerequisitos: ids })
    setTouchedFields({ ...touchedFields, prerequisitos: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouchedFields({
      nombreMateria: true,
      codigoUnico: true,
      creditos: true,
      prerequisitos: true,
    })

    if (validateForm()) {
      setIsSubmitting(true)
      await onSubmit(formData)
      setIsSubmitting(false)
    }
  }

  return (
    <motion.form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nombreMateria">Nombre de la materia</Label>
        <Input
          id="nombreMateria"
          name="nombreMateria"
          value={formData.nombreMateria}
          onChange={handleChange}
          className={errors.nombreMateria ? "border-red-500" : ""}
        />
        {errors.nombreMateria && <p className="text-red-600 text-sm">{errors.nombreMateria}</p>}
      </div>
      <div>
        <Label htmlFor="codigoUnico">Código único</Label>
        <Input
          id="codigoUnico"
          name="codigoUnico"
          value={formData.codigoUnico}
          onChange={handleChange}
          className={errors.codigoUnico ? "border-red-500" : ""}
        />
        {errors.codigoUnico && <p className="text-red-600 text-sm">{errors.codigoUnico}</p>}
      </div>
      <div>
        <Label htmlFor="creditos">Créditos</Label>
        <Input
          id="creditos"
          name="creditos"
          type="number"
          min={1}
          value={formData.creditos}
          onChange={handleChange}
          className={errors.creditos ? "border-red-500" : ""}
        />
        {errors.creditos && <p className="text-red-600 text-sm">{errors.creditos}</p>}
      </div>
      <div>
        <Label>Prerrequisito</Label>
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="prerequisito"
              value=""
              checked={!formData.prerequisitos || formData.prerequisitos.length === 0}
              onChange={() => setFormData({ ...formData, prerequisitos: [] })}
            />
            Sin prerrequisito
          </label>
          {materias
            .filter((m) => !formData.id || m.id !== formData.id)
            .map((m) => (
              <label key={m.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="prerequisito"
                  value={m.id}
                  checked={formData.prerequisitos && formData.prerequisitos[0] === m.id}
                  onChange={() => setFormData({ ...formData, prerequisitos: [m.id!] })}
                />
                {m.nombreMateria}
              </label>
            ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 items-center">
        <div className="font-semibold text-[#006400]">Prerrequisito:</div>
        <div className="col-span-2">
          {formData.prerequisitos && formData.prerequisitos.length > 0
            ? formData.prerequisitos
                .map((id) => {
                  const found = materias.find((m) => m.id === id)
                  return found ? `${found.nombreMateria} (${found.codigoUnico})` : id
                })
                .join(", ")
            : "-"}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Guardar"}
        </Button>
      </div>
    </motion.form>
  )
}
