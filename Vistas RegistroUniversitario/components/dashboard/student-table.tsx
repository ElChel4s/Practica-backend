"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Edit, Trash2, Eye, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { EstudianteDTO } from "@/lib/api"

interface StudentTableProps {
  students: EstudianteDTO[]
  onEdit: (student: EstudianteDTO) => void
  onDelete: (id: number) => void
}

export function StudentTable({ students, onEdit, onDelete }: StudentTableProps) {
  const [studentToDelete, setStudentToDelete] = useState<EstudianteDTO | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [viewStudent, setViewStudent] = useState<EstudianteDTO | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const handleDeleteClick = (student: EstudianteDTO) => {
    setStudentToDelete(student)
    setIsAlertOpen(true)
  }

  const confirmDelete = () => {
    if (studentToDelete) {
      onDelete(studentToDelete.id)
      setIsAlertOpen(false)
    }
  }

  const handleViewClick = (student: EstudianteDTO) => {
    setViewStudent(student)
    setIsViewDialogOpen(true)
  }

  const tableRowVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.05,
      },
    }),
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-[#003366]/10 to-[#003366]/5">
            <TableHead className="font-semibold text-[#003366]">Nombre</TableHead>
            <TableHead className="font-semibold text-[#003366]">Apellido</TableHead>
            <TableHead className="font-semibold text-[#003366]">Correo electrónico</TableHead>
            <TableHead className="font-semibold text-[#003366]">N° Inscripción</TableHead>
            <TableHead className="font-semibold text-[#003366]">Estado</TableHead>
            <TableHead className="font-semibold text-[#003366] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <User className="h-10 w-10 mb-2 text-gray-400" />
                  <p>No hay estudiantes registrados.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            students.map((student, i) => (
              <motion.tr
                key={student.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={tableRowVariants}
                className="table-row-animate border-b hover:bg-gray-50"
              >
                <TableCell className="font-medium">{student.nombre}</TableCell>
                <TableCell>{student.apellido}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.numeroInscripcion}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-[#003366]/10 text-[#003366] hover:bg-[#003366]/20">
                    {student.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewClick(student)}
                            className="h-8 w-8 text-[#003366] hover:text-white hover:bg-[#003366] transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver detalles</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ver detalles</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onEdit(student)}
                            className="h-8 w-8 text-[#006400] hover:text-white hover:bg-[#006400] transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar estudiante</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClick(student)}
                            className="h-8 w-8 text-[#800000] hover:text-white hover:bg-[#800000] transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Eliminar estudiante</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </motion.tr>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#800000]">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al estudiante{" "}
              <span className="font-semibold">{studentToDelete?.name}</span> y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#003366] text-[#003366]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-[#800000] hover:bg-[#a00000]">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#003366] text-xl flex items-center">
              <User className="mr-2 h-5 w-5" />
              Detalles del estudiante
            </DialogTitle>
          </DialogHeader>
          {viewStudent && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-[#003366]">Nombre:</div>
                <div className="col-span-2">{viewStudent.nombre} {viewStudent.apellido}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-[#003366]">Correo:</div>
                <div className="col-span-2">{viewStudent.email}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-[#003366]">N° Inscripción:</div>
                <div className="col-span-2">{viewStudent.numeroInscripcion}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-[#003366]">Estado:</div>
                <div className="col-span-2">
                  <Badge variant="outline" className="bg-[#003366]/10 text-[#003366]">
                    {viewStudent.estado}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
