"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SubjectTable } from "@/components/dashboard/subject-table"
import { AddSubjectForm } from "@/components/dashboard/add-subject-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { BookPlus, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { MateriaDTO, materiasApi } from "@/lib/api"

export default function SubjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<MateriaDTO | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [subjects, setSubjects] = useState<MateriaDTO[]>([])

  useEffect(() => {
    setIsLoading(true)
    materiasApi.getAll()
      .then((data) => setSubjects(data))
      .finally(() => setIsLoading(false))
  }, [])

  const handleAddSubject = async (materia: Partial<MateriaDTO>) => {
    try {
      const nueva = await materiasApi.create(materia as MateriaDTO)
      setSubjects((prev) => [...prev, nueva])
      setIsDialogOpen(false)
      toast({ title: "Materia agregada", description: `${nueva.nombreMateria} ha sido agregada correctamente.` })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleEditSubject = (materia: MateriaDTO) => {
    setEditingSubject(materia)
    setIsDialogOpen(true)
  }

  const handleUpdateSubject = async (materia: Partial<MateriaDTO>) => {
    if (!materia.id) return
    try {
      const actualizada = await materiasApi.update(materia.id, materia as MateriaDTO)
      setSubjects((prev) => prev.map((m) => (m.id === actualizada.id ? actualizada : m)))
      setIsDialogOpen(false)
      setEditingSubject(null)
      toast({ title: "Materia actualizada", description: `${actualizada.nombreMateria} ha sido actualizada correctamente.` })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  const handleDeleteSubject = async (id: number) => {
    try {
      await materiasApi.delete(id)
      setSubjects((prev) => prev.filter((m) => m.id !== id))
      toast({ title: "Materia eliminada", description: `La materia ha sido eliminada correctamente.`, variant: "destructive" })
    } catch (e: any) {
      let msg = "Ocurrió un error al eliminar la materia."
      // Si el error es una instancia de Error, usar su mensaje
      if (e instanceof Error && e.message) {
        msg = e.message
      }
      // Si el error es un objeto con detalles del backend (ApiError)
      if (typeof e === "object" && e !== null) {
        if (e.details) {
          msg += ` Detalle: ${e.details}`
        }
        if (e.message && typeof e.message === "string" && e.message.includes("prerrequisito de otra")) {
          msg = "No se puede eliminar la materia porque es prerrequisito de otra materia. Elimina o cambia los prerrequisitos antes de intentar borrar.";
        }
      }
      toast({ title: "No se puede eliminar", description: msg, variant: "destructive" })
    }
  }

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.nombreMateria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.codigoUnico.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={container}>
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#006400]">Materias</h1>
          <p className="text-gray-600 mt-1">Gestiona las materias y sus prerrequisitos</p>
        </div>
        <Button
          onClick={() => {
            setEditingSubject(null)
            setIsDialogOpen(true)
          }}
          className="bg-gradient-to-r from-[#006400] to-[#008000] hover:from-[#008000] hover:to-[#009900] text-white transition-all duration-300 transform hover:scale-[1.02] button-effect"
        >
          <BookPlus className="mr-2 h-4 w-4" />
          Nueva materia
        </Button>
      </motion.div>

      <motion.div variants={item} className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="search"
          placeholder="Buscar materias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full md:max-w-xs rounded-lg border-gray-300 focus:border-[#006400] focus:ring-[#006400] input-focus-effect"
        />
      </motion.div>

      <motion.div variants={item}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-[#006400] animate-spin mb-4" />
            <p className="text-gray-500">Cargando materias...</p>
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
              <SubjectTable subjects={filteredSubjects} onEdit={handleEditSubject} onDelete={handleDeleteSubject} />
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#006400] text-xl">
              {editingSubject ? "Editar materia" : "Agregar materia"}
            </DialogTitle>
          </DialogHeader>
          <AddSubjectForm
            onSubmit={editingSubject ? handleUpdateSubject : handleAddSubject}
            initialData={editingSubject}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
