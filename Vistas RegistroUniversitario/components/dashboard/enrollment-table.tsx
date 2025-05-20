"use client"

import { Trash2, Eye, Calendar, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { EnrollmentWithNames } from "@/app/dashboard/enrollments/page"
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
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface EnrollmentTableProps {
  enrollments: EnrollmentWithNames[]
  onDelete: (id: number) => void
  onUpdateEnrollment: (enrollment: EnrollmentWithNames) => void
}

export function EnrollmentTable({ enrollments, onDelete, onUpdateEnrollment }: EnrollmentTableProps) {
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<EnrollmentWithNames | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [viewEnrollment, setViewEnrollment] = useState<EnrollmentWithNames | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editEnrollment, setEditEnrollment] = useState<EnrollmentWithNames | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleDeleteClick = (enrollment: EnrollmentWithNames) => {
    setEnrollmentToDelete(enrollment)
    setIsAlertOpen(true)
  }

  const confirmDelete = () => {
    if (enrollmentToDelete) {
      onDelete(enrollmentToDelete.id)
      setIsAlertOpen(false)
    }
  }

  const handleViewClick = (enrollment: EnrollmentWithNames) => {
    setViewEnrollment(enrollment)
    setIsViewDialogOpen(true)
  }

  const handleEditClick = (enrollment: EnrollmentWithNames) => {
    setEditEnrollment(enrollment)
    setIsEditDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
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
            <TableHead className="font-semibold text-[#003366]">Estudiante</TableHead>
            <TableHead className="font-semibold text-[#003366]">Materia</TableHead>
            <TableHead className="font-semibold text-[#003366] hidden md:table-cell">Código</TableHead>
            <TableHead className="font-semibold text-[#003366] hidden md:table-cell">Fecha</TableHead>
            <TableHead className="font-semibold text-[#003366] hidden md:table-cell">Estado</TableHead>
            <TableHead className="font-semibold text-[#003366] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <Calendar className="h-10 w-10 mb-2 text-gray-400" />
                  <p>No hay inscripciones registradas.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            enrollments.map((enrollment, i) => (
              <motion.tr
                key={enrollment.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={tableRowVariants}
                className="table-row-animate border-b hover:bg-gray-50"
              >
                <TableCell className="font-medium">{enrollment.studentName}</TableCell>
                <TableCell>{enrollment.subjectName}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="bg-[#003366]/10 text-[#003366] hover:bg-[#003366]/20">
                    {enrollment.subjectCode}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(enrollment.date)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge 
                    variant="outline" 
                    className={`${
                      enrollment.estado?.toLowerCase() === "activa" 
                        ? "bg-green-100 text-green-800 hover:bg-green-200" 
                        : enrollment.estado?.toLowerCase() === "baja"
                        ? "bg-red-100 text-red-800 hover:bg-red-200"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {enrollment.estado || "Desconocido"}
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
                            onClick={() => handleViewClick(enrollment)}
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
                            onClick={() => handleEditClick(enrollment)}
                            className={`h-8 w-8 ${
                              enrollment.estado?.toLowerCase() === "baja"
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-[#005500] hover:text-white hover:bg-[#005500] transition-colors"
                            }`}
                            disabled={enrollment.estado?.toLowerCase() === "baja"}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar inscripción</span>
                          </Button>
                        </TooltipTrigger>                          <TooltipContent>
                          <p>{enrollment.estado?.toLowerCase() === "baja" ? "No se puede editar una inscripción de baja" : "Editar inscripción"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClick(enrollment)}
                            className={`h-8 w-8 ${
                              enrollment.estado?.toLowerCase() === "baja"
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-[#800000] hover:text-white hover:bg-[#800000] transition-colors"
                            }`}
                            disabled={enrollment.estado?.toLowerCase() === "baja"}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Dar de baja inscripción</span>
                          </Button>
                        </TooltipTrigger>                          <TooltipContent>
                          <p>{enrollment.estado?.toLowerCase() === "baja" ? "Inscripción ya dada de baja" : "Dar de baja inscripción"}</p>
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
              Esta acción dará de baja la inscripción de{" "}
              <span className="font-semibold">{enrollmentToDelete?.studentName}</span> en{" "}
              <span className="font-semibold">{enrollmentToDelete?.subjectName}</span>. El estudiante no podrá continuar con esta materia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#003366] text-[#003366]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-[#800000] hover:bg-[#a00000]">
              Dar de baja
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#003366] text-xl flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Detalles de inscripción
            </DialogTitle>
          </DialogHeader>
          {viewEnrollment && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-[#003366]">Estudiante:</div>
                <div className="col-span-2">{viewEnrollment.studentName}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-[#003366]">Materia:</div>
                <div className="col-span-2">{viewEnrollment.subjectName}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-[#003366]">Código:</div>
                <div className="col-span-2">
                  <Badge variant="outline" className="bg-[#003366]/10 text-[#003366]">
                    {viewEnrollment.subjectCode}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-[#003366]">Fecha:</div>
                <div className="col-span-2">{formatDate(viewEnrollment.date)}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-[#003366]">Estado:</div>
                <div className="col-span-2">
                  <Badge 
                    variant="outline" 
                    className={`${
                      viewEnrollment.estado?.toLowerCase() === "activa" 
                        ? "bg-green-100 text-green-800" 
                        : viewEnrollment.estado?.toLowerCase() === "baja"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {viewEnrollment.estado || "Desconocido"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#005500] text-xl flex items-center">
              <Edit className="mr-2 h-5 w-5" />
              Editar inscripción
            </DialogTitle>
          </DialogHeader>
          {editEnrollment && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-[#005500]">Estudiante:</div>
                <div className="col-span-2">{editEnrollment.studentName}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-[#005500]">Materia:</div>
                <div className="col-span-2">{editEnrollment.subjectName}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="font-semibold text-[#005500]">Estado:</div>
                <div className="col-span-2">
                  <Select defaultValue={editEnrollment.estado?.toLowerCase() || "activa"} onValueChange={(value) => {
                    setEditEnrollment({...editEnrollment, estado: value.toUpperCase()});
                  }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activa">ACTIVA</SelectItem>
                      <SelectItem value="baja">BAJA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-4 justify-end mt-6">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                <Button 
                  className="bg-[#005500] hover:bg-[#006600]"
                  onClick={() => {
                    onUpdateEnrollment(editEnrollment);
                    setIsEditDialogOpen(false);
                  }}
                >
                  Guardar cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
