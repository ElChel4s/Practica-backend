"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Edit, Trash2, Eye, BookOpen } from "lucide-react"
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
import type { MateriaDTO } from "@/lib/api"

interface SubjectTableProps {
  subjects: MateriaDTO[]
  onEdit: (subject: MateriaDTO) => void
  onDelete: (id: number) => void
}

export function SubjectTable({ subjects, onEdit, onDelete }: SubjectTableProps) {
  const [subjectToDelete, setSubjectToDelete] = useState<MateriaDTO | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [viewSubject, setViewSubject] = useState<MateriaDTO | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const handleDeleteClick = (subject: MateriaDTO) => {
    setSubjectToDelete(subject)
    setIsAlertOpen(true)
  }

  const confirmDelete = () => {
    if (subjectToDelete && subjectToDelete.id !== undefined) {
      onDelete(subjectToDelete.id)
      setIsAlertOpen(false)
    }
  }

  const handleViewClick = (subject: MateriaDTO) => {
    setViewSubject(subject)
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
          <TableRow className="bg-gradient-to-r from-[#006400]/10 to-[#006400]/5">
            <TableHead className="font-semibold text-[#006400]">Nombre</TableHead>
            <TableHead className="font-semibold text-[#006400]">Código</TableHead>
            <TableHead className="font-semibold text-[#006400]">Créditos</TableHead>
            <TableHead className="font-semibold text-[#006400]">Prerrequisitos</TableHead>
            <TableHead className="font-semibold text-[#006400] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <BookOpen className="h-10 w-10 mb-2 text-gray-400" />
                  <p>No hay materias registradas.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            subjects.map((subject, i) => (
              <motion.tr
                key={subject.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={tableRowVariants}
                className="table-row-animate border-b hover:bg-gray-50"
              >
                <TableCell className="font-medium">{subject.nombreMateria}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-[#006400]/10 text-[#006400] hover:bg-[#006400]/20">
                    {subject.codigoUnico}
                  </Badge>
                </TableCell>
                <TableCell>{subject.creditos}</TableCell>
                <TableCell>
                  {subject.prerequisitos && subject.prerequisitos.length > 0
                    ? subject.prerequisitos
                        .map((id) => {
                          const found = subjects.find((m) => m.id === id)
                          return found ? found.codigoUnico : id
                        })
                        .join(", ")
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewClick(subject)}
                            className="h-8 w-8 text-[#006400] hover:text-white hover:bg-[#006400] transition-colors"
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
                            onClick={() => onEdit(subject)}
                            className="h-8 w-8 text-[#006400] hover:text-white hover:bg-[#006400] transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar materia</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClick(subject)}
                            className="h-8 w-8 text-[#800000] hover:text-white hover:bg-[#800000] transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Eliminar materia</p>
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
              Esta acción eliminará permanentemente la materia{" "}
              <span className="font-semibold">{subjectToDelete?.nombreMateria}</span> y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#006400] text-[#006400]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-[#800000] hover:bg-[#a00000]">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#006400] text-xl flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Detalles de la materia
            </DialogTitle>
          </DialogHeader>
          {viewSubject && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-[#006400]">Nombre:</div>
                <div className="col-span-2">{viewSubject.nombreMateria}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-[#006400]">Código:</div>
                <div className="col-span-2">
                  <Badge variant="outline" className="bg-[#006400]/10 text-[#006400]">
                    {viewSubject.codigoUnico}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-[#006400]">Créditos:</div>
                <div className="col-span-2">{viewSubject.creditos}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-[#006400]">Prerrequisito:</div>
                <div className="col-span-2">
                  {viewSubject && viewSubject.prerequisitos && viewSubject.prerequisitos.length > 0
                    ? viewSubject.prerequisitos
                        .map((id) => {
                          const found = subjects.find((m) => m.id === id)
                          return found ? `${found.nombreMateria} (${found.codigoUnico})` : id
                        })
                        .join(", ")
                    : "-"}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
