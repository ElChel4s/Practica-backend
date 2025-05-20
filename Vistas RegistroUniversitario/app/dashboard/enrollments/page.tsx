"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { EnrollmentTable } from "@/components/dashboard/enrollment-table"
import { AddEnrollmentForm } from "@/components/dashboard/add-enrollment-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { ClipboardPlus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { inscripcionesApi, InscripcionDTO, estudiantesApi, materiasApi } from "@/lib/api"
import { mockInscripciones, generarNuevaInscripcion } from "@/lib/mock-data"

export default function EnrollmentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [enrollments, setEnrollments] = useState<InscripcionDTO[]>([])

  useEffect(() => {
    console.log("Cargando datos iniciales...")
    
    estudiantesApi.getAll().then((data) => {
      console.log("Estudiantes cargados:", data)
      setStudents(data.map(e => ({
        id: e.id ?? 0,
        nombre: e.nombre,
        email: e.email,
        telefono: "",
        grado: e.estado || ""
      })))
      console.log("Estado de students después de cargar:", data.length)
    }).catch(error => {
      console.error("Error al cargar estudiantes:", error)
      toast({
        title: "Error al cargar estudiantes",
        description: "No se pudieron cargar los estudiantes. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    })
    
    materiasApi.getAll().then((data) => {
      console.log("Materias cargadas:", data)
      setSubjects(data.map(m => ({
        id: m.id ?? 0,
        nombreMateria: m.nombreMateria,
        codigoUnico: m.codigoUnico,
        descripcion: "",
        docente: ""
      })))
      console.log("Estado de materias después de cargar:", data.length)
    }).catch(error => {
      console.error("Error al cargar materias:", error)
      toast({
        title: "Error al cargar materias",
        description: "No se pudieron cargar las materias. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    })
    
    // Intentar cargar inscripciones existentes, pero manejando el caso donde el endpoint no está funcionando
    const loadInscripciones = async () => {
      try {
        console.log("Intentando cargar inscripciones...");
        
        // Si el endpoint /inscripciones no funciona, usaremos datos mock
        let inscripcionesData = [];
        let usandoMock = false;
        
        try {
          // Intento principal de cargar todas las inscripciones
          inscripcionesData = await inscripcionesApi.getAll();
          console.log("Inscripciones cargadas exitosamente desde /inscripciones");
        } catch (mainError) {
          console.warn("No se pudieron cargar inscripciones desde el endpoint principal. Intentando método alternativo...");
          
          try {
            // Si no funciona, intentamos obtener las inscripciones de cada estudiante
            const estudiantesData = await estudiantesApi.getAll();
            
            // Crear un array para almacenar todas las promesas de inscripciones
            const inscripcionesPromises = [];
            
            // Por cada estudiante, intentar obtener sus inscripciones
            for (const estudiante of estudiantesData.slice(0, 3)) { // Limitamos a los primeros 3 estudiantes para evitar muchas solicitudes
              if (estudiante.id) {
                try {
                  const inscripcionesEstudiante = await inscripcionesApi.getByEstudiante(estudiante.id);
                  inscripcionesPromises.push(...inscripcionesEstudiante);
                } catch (error) {
                  console.warn(`No se pudieron cargar inscripciones para el estudiante ${estudiante.id}`);
                }
              }
            }
            
            // Combinar todas las inscripciones obtenidas
            inscripcionesData = inscripcionesPromises;
          } catch (studentError) {
            console.warn("Todos los métodos de carga de inscripciones fallaron. Usando datos mock.", studentError);
            
            // Si también falla el método alternativo, usar datos mock
            inscripcionesData = [...mockInscripciones];
            usandoMock = true;
            
            toast({
              title: "Usando datos temporales",
              description: "No se pudieron cargar las inscripciones desde el servidor. Se están mostrando datos temporales para poder continuar.",
              variant: "warning",
            });
          }
        }
        
        // Actualizar estado con las inscripciones obtenidas
        console.log(usandoMock ? "Usando datos mock de inscripciones:" : "Inscripciones obtenidas del servidor:", inscripcionesData);
        setEnrollments(inscripcionesData || []);
        
        // Mostrar información detallada para depuración
        if (inscripcionesData && inscripcionesData.length > 0) {
          console.log("Información detallada de inscripciones:");
          inscripcionesData.forEach((inscripcion, index) => {
            console.log(`Inscripción ${index + 1}:`, {
              id: inscripcion.id,
              estudianteId: inscripcion.estudianteId,
              materiaId: inscripcion.materiaId,
              fecha: inscripcion.fechaInscripcion
            });
          });
        } else {
          console.log("No hay inscripciones existentes.");
        }
      } catch (error) {
        console.error("Error total al cargar inscripciones:", error);
        
        // En caso de error completo, usar datos mock como respaldo final
        console.log("Usando datos mock como último recurso");
        setEnrollments([...mockInscripciones]);
        
        toast({
          title: "Usando datos temporales",
          description: "Se detectaron errores al cargar las inscripciones. Se están mostrando datos temporales para poder continuar.",
          variant: "warning",
        });
      }
    };
    
    // Ejecutar la función de carga
    loadInscripciones();
  }, [])

  const handleAddEnrollment = async (enrollment: { studentId: number; subjectId: number }) => {
    try {
      // Si el studentId o subjectId son inválidos, no continuar
      if (!enrollment.studentId || !enrollment.subjectId) {
        toast({
          title: "Datos incompletos",
          description: "Por favor selecciona un estudiante y una materia.",
          variant: "destructive",
        });
        return;
      }
      
      // Verificar si ya existe esta inscripción en el estado local
      const yaExisteLocalDisponible = verificarInscripcionExistente(
        enrollment.studentId, 
        enrollment.subjectId
      );
      
      if (yaExisteLocalDisponible) {
        const student = students.find((s) => s.id === enrollment.studentId);
        const subject = subjects.find((s) => s.id === enrollment.subjectId);
        
        toast({
          title: "Inscripción existente",
          description: `${student?.nombre} ya está inscrito en ${subject?.nombreMateria}.`,
          variant: "destructive",
        });
        return;
      }
      
      // Obtener la información del estudiante y la materia
      const student = students.find((s) => s.id === enrollment.studentId);
      const subject = subjects.find((s) => s.id === enrollment.subjectId);
      
      if (!student || !subject) {
        toast({
          title: "Error de datos",
          description: "No se encontró el estudiante o la materia seleccionada.",
          variant: "destructive",
        });
        return;
      }
      
      // Intentamos verificar con el backend, pero con manejo de errores robusto
      console.log("Intentando verificar inscripciones existentes...");
      
      try {
        // Primero verificamos en el estado local (más rápido y evita errores del backend)
        if (verificarInscripcionExistente(enrollment.studentId, enrollment.subjectId)) {
          toast({
            title: "Inscripción existente",
            description: `${student.nombre} ya está inscrito en ${subject.nombreMateria}.`,
            variant: "destructive",
          });
          return;
        }
        
        // Si tenemos pocos registros en el estado local, intentamos buscar en el backend
        if (enrollments.length < 10) {
          try {
            const existentes = await inscripcionesApi.getByEstudiante(enrollment.studentId).catch(() => []);
            console.log("Inscripciones del estudiante:", existentes);
            
            if (Array.isArray(existentes) && existentes.length > 0) {
              const yaInscrito = existentes.some(
                inscripcion => inscripcion && inscripcion.materiaId === enrollment.subjectId
              );
              
              if (yaInscrito) {
                toast({
                  title: "Inscripción existente",
                  description: `${student.nombre} ya está inscrito en ${subject.nombreMateria}.`,
                  variant: "destructive",
                });
                return;
              }
            }
          } catch (backendError) {
            console.warn("No se pudo verificar en el backend, continuando con la inscripción local:", backendError);
            // Continuamos con la inscripción, ya que verificamos en el estado local anteriormente
          }
        } else {
          console.log("Suficientes inscripciones en el estado local, omitiendo verificación en backend");
        }
        
        // Si todavía no existe, procedemos a crear la inscripción
        console.log("Creando nueva inscripción para", student.nombre, "en", subject.nombreMateria);
        
        // Crear objeto de inscripción
        const nuevaInscripcion = {
          estudianteId: enrollment.studentId,
          materiaId: enrollment.subjectId,
          usuarioAlta: "admin", // O el usuario logueado
        };
        
        try {
          const nueva = await inscripcionesApi.create(nuevaInscripcion);
          console.log("Inscripción creada exitosamente:", nueva);
          
          // Actualizar el estado local con la nueva inscripción
          if (nueva && nueva.id) {
            setEnrollments(prev => [...prev, nueva]);
            
            // Actualizar el estado del estudiante a "activo" en la lista local
            setStudents(prevStudents => prevStudents.map(s => {
              if (s.id === enrollment.studentId) {
                return { ...s, grado: "activo" };
              }
              return s;
            }));
            
            // Cerrar el diálogo y mostrar mensaje de éxito
            setIsDialogOpen(false);
            
            toast({
              title: "Inscripción exitosa",
              description: `${student.nombre} ha sido inscrito en ${subject.nombreMateria} y ahora está activo.`,
            });
          } else {
            // Si la respuesta es exitosa pero sin ID, aún así actualizamos el estado local y mostramos mensaje
            console.warn("La respuesta del servidor no incluyó ID de inscripción, pero fue exitosa");
            
            // Crear objeto temporal con datos mínimos
            const inscripcionTemporal = {
              ...nuevaInscripcion,
              id: Math.floor(Math.random() * 10000) + 1000, // ID temporal
              fechaInscripcion: new Date().toISOString()
            };
            
            setEnrollments(prev => [...prev, inscripcionTemporal]);
            
            // Actualizar el estado del estudiante a "activo" en la lista local
            setStudents(prevStudents => prevStudents.map(s => {
              if (s.id === enrollment.studentId) {
                return { ...s, grado: "activo" };
              }
              return s;
            }));
            
            setIsDialogOpen(false);
            
            toast({
              title: "Inscripción registrada",
              description: `${student.nombre} ha sido inscrito en ${subject.nombreMateria} y ahora está activo.`,
            });
          }
        } catch (error: any) {
          // Si el error contiene "ya está inscripto", es un duplicado que no fue detectado previamente
          if (error.message && error.message.toLowerCase().includes("ya está inscripto")) {
            console.log("Inscripción duplicada detectada por el servidor:", error);
            
            toast({
              title: "Inscripción duplicada",
              description: `${student.nombre} ya está inscrito en ${subject.nombreMateria}.`,
              variant: "destructive",
            });
          } else {
            console.error("Error al crear inscripción:", error);
            
            toast({
              title: "Error en inscripción",
              description: `No se pudo inscribir a ${student.nombre} en ${subject.nombreMateria}. ${error.message || 'Error desconocido'}`,
              variant: "destructive",
            });
          }
        }
      } catch (error: any) {
        // Si ocurre un error específico de "ya inscrito", lo manejamos aquí
        if (error.message && error.message.toLowerCase().includes("ya está inscripto")) {
          toast({
            title: "Inscripción existente",
            description: `${student.nombre} ya está inscrito en ${subject.nombreMateria}.`,
            variant: "destructive",
          });
          return;
        }
        
        // De lo contrario, reenviamos el error para que sea manejado por el catch general
        throw error;
      }
    } catch (error: any) {
      console.error("Error al inscribir estudiante:", error);
      
      let mensajeError = error.message;
      // Intentar extraer un mensaje más descriptivo si existe
      if ((error as any).responseData?.detalles) {
        mensajeError = (error as any).responseData.detalles;
      }
      
      toast({
        title: "Error de inscripción",
        description: mensajeError,
        variant: "destructive",
      });
    }
  }

  const handleDeleteEnrollment = async (id: number) => {
    try {
      // En lugar de eliminar, actualizamos el estado a "BAJA"
      const inscripcion = enrollments.find(e => e.id === id);
      if (!inscripcion) {
        throw new Error("No se encontró la inscripción");
      }
      
      const updatedInscripcion: InscripcionDTO = {
        ...inscripcion,
        estado: "BAJA",
        usuarioBaja: "admin",
        fechaBaja: new Date().toISOString()
      };
      
      await inscripcionesApi.update(id, updatedInscripcion);
      
      // Actualizar en el estado local
      setEnrollments((prev) => prev.map((e) => 
        e.id === id ? { ...e, estado: "BAJA" } : e
      ));
      
      toast({
        title: "Inscripción dada de baja",
        description: `Se ha dado de baja la inscripción correctamente.`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Error al dar de baja inscripción",
        description: error.message,
        variant: "destructive",
      })
    }
  }
  
  const handleUpdateEnrollment = async (enrollment: EnrollmentWithNames) => {
    try {
      // Obtener la inscripción original
      const originalEnrollment = enrollments.find(e => e.id === enrollment.id);
      if (!originalEnrollment) {
        throw new Error("No se encontró la inscripción original");
      }
      
      // Preparar la inscripción actualizada
      const updatedInscripcion: InscripcionDTO = {
        ...originalEnrollment,
        estado: enrollment.estado,
        // Si el estado cambió a BAJA, agregamos información de baja
        ...(enrollment.estado?.toUpperCase() === "BAJA" && {
          usuarioBaja: "admin",
          fechaBaja: new Date().toISOString()
        })
      };
      
      // Llamar a la API para actualizar
      await inscripcionesApi.update(enrollment.id, updatedInscripcion);
      
      // Actualizar en el estado local
      setEnrollments((prev) => prev.map((e) => 
        e.id === enrollment.id ? { 
          ...e, 
          estado: enrollment.estado 
        } : e
      ));
      
      toast({
        title: "Inscripción actualizada",
        description: `Se ha actualizado la inscripción correctamente.`,
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Error al actualizar inscripción",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Funciones para obtener nombres/códigos
  const getStudentName = (estudianteId: number) => {
    const student = students.find((s) => s.id === estudianteId)
    return student ? student.nombre : "Desconocido"
  }
  const getSubjectName = (materiaId: number) => {
    const subject = subjects.find((s) => s.id === materiaId)
    return subject ? subject.nombreMateria : "Desconocida"
  }
  const getSubjectCode = (materiaId: number) => {
    const subject = subjects.find((s) => s.id === materiaId)
    return subject ? subject.codigoUnico : ""
  }

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const studentName = getStudentName(enrollment.estudianteId).toLowerCase()
    const subjectName = getSubjectName(enrollment.materiaId).toLowerCase()
    const subjectCode = getSubjectCode(enrollment.materiaId).toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    return (
      studentName.includes(searchLower) ||
      subjectName.includes(searchLower) ||
      subjectCode.includes(searchLower) ||
      (enrollment.fechaInscripcion || "").includes(searchLower)
    )
  })

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

  // Adaptar para el formulario AddEnrollmentForm
  const studentsForForm = students.map(s => ({ id: s.id, name: s.nombre, grade: s.grado || "" }))
  
  // Agregar logs para depuración
  console.log("Número de materias disponibles antes de mapear:", subjects.length);
  console.log("Materias crudas:", subjects);
  
  const subjectsForForm = subjects.map(s => {
    console.log("Mapeando materia:", s);
    return { 
      id: s.id, 
      name: s.nombreMateria,
      code: s.codigoUnico 
    };
  });
  
  console.log("Materias mapeadas para el formulario:", subjectsForForm);

  // Función para verificar si un estudiante ya está inscrito en una materia
  const verificarInscripcionExistente = (estudianteId: number, materiaId: number) => {
    console.log("Verificando inscripción existente para estudiante:", estudianteId, "y materia:", materiaId);
    
    // Verificar si enrollments está definido y tiene elementos
    if (!enrollments || enrollments.length === 0) {
      console.log("No hay inscripciones cargadas para verificar");
      return false;
    }
    
    console.log("Inscripciones actuales:", enrollments);
    
    // Verificación más robusta
    try {
      const yaExiste = enrollments.some(
        inscripcion => {
          if (!inscripcion) return false;
          
          const coincide = inscripcion.estudianteId === estudianteId && inscripcion.materiaId === materiaId;
          if (coincide) {
            console.log("Inscripción encontrada:", inscripcion);
          }
          return coincide;
        }
      );
      
      console.log("¿Ya existe inscripción?", yaExiste);
      return yaExiste;
    } catch (error) {
      console.error("Error al verificar inscripción existente:", error);
      return false; // En caso de error, asumimos que no existe
    }
  }

  // Función para obtener las materias en las que un estudiante ya está inscrito
  const getMateriasInscritas = (estudianteId: number) => {
    return enrollments
      .filter(inscripcion => inscripcion.estudianteId === estudianteId)
      .map(inscripcion => inscripcion.materiaId);
  }

  // Función para verificar si hay errores al seleccionar un estudiante y materia
  const verificarErroresInscripcion = (estudianteId: number, materiaId: number) => {
    if (verificarInscripcionExistente(estudianteId, materiaId)) {
      const nombreEstudiante = getStudentName(estudianteId);
      const nombreMateria = getSubjectName(materiaId);
      return `${nombreEstudiante} ya está inscrito en ${nombreMateria}`;
    }
    return null;
  }

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={container}>
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#003366]">Inscripciones</h1>
          <p className="text-gray-600 mt-1">Gestiona las inscripciones de estudiantes a materias</p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-gradient-secondary hover:bg-gradient-to-r hover:from-[#006400] hover:to-[#008000] text-white transition-all duration-300 transform hover:scale-[1.02] button-effect"
        >
          <ClipboardPlus className="mr-2 h-4 w-4" />
          Nueva inscripción
        </Button>
      </motion.div>

      <motion.div variants={item} className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="search"
          placeholder="Buscar inscripciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full md:max-w-xs rounded-lg border-gray-300 focus:border-[#003366] focus:ring-[#003366] input-focus-effect"
        />
      </motion.div>

      <motion.div variants={item}>
        <AnimatePresence mode="wait">
          <motion.div
            key={searchTerm}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <EnrollmentTable
              enrollments={filteredEnrollments.map((e) => ({
                ...e,
                studentName: getStudentName(e.estudianteId),
                subjectName: getSubjectName(e.materiaId),
                subjectCode: getSubjectCode(e.materiaId),
                date: e.fechaInscripcion || "",
                studentId: e.estudianteId,
                subjectId: e.materiaId,
                estado: e.estado || "ACTIVA"
              }))}
              onDelete={handleDeleteEnrollment}
              onUpdateEnrollment={handleUpdateEnrollment}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        console.log("Estado del modal cambiado a:", open);
        if (open) {
          // Verificar datos antes de abrir el modal
          console.log("Abriendo modal con:", {
            estudiantes: studentsForForm.length,
            materias: subjectsForForm.length
          });
        }
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#003366] text-xl">Nueva inscripción</DialogTitle>
          </DialogHeader>
          <AddEnrollmentForm 
            onSubmit={handleAddEnrollment} 
            students={studentsForForm} 
            subjects={subjectsForForm} 
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export interface Enrollment {
  id: number
  studentId: number
  subjectId: number
  date: string
  estado?: string
}

export interface EnrollmentWithNames extends Enrollment {
  studentName: string
  subjectName: string
  subjectCode: string
}

// Quitar los imports de Student y Subject desde page, y definir los tipos aquí:
export interface Student {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  grado?: string;
}

export interface Subject {
  id: number;
  nombreMateria: string;
  codigoUnico: string;
  descripcion?: string;
  docente?: string;
}
