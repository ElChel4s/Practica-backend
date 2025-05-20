// Datos de prueba para cuando la API no está disponible
import { EstudianteDTO, InscripcionDTO, MateriaDTO } from "./api";

// Mock de inscripciones para mostrar cuando el endpoint /inscripciones falla
export const mockInscripciones: InscripcionDTO[] = [
  {
    id: 1001,
    estudianteId: 1,
    materiaId: 1,
    fechaInscripcion: "2025-03-15T10:30:00",
    estado: "ACTIVA",
    usuarioAlta: "admin",
    fechaAlta: "2025-03-15T10:30:00"
  },
  {
    id: 1002,
    estudianteId: 1,
    materiaId: 2,
    fechaInscripcion: "2025-03-16T11:45:00",
    estado: "ACTIVA",
    usuarioAlta: "admin",
    fechaAlta: "2025-03-16T11:45:00"
  },
  {
    id: 1003,
    estudianteId: 2,
    materiaId: 3,
    fechaInscripcion: "2025-03-17T09:15:00",
    estado: "ACTIVA",
    usuarioAlta: "admin",
    fechaAlta: "2025-03-17T09:15:00"
  },
  {
    id: 1004,
    estudianteId: 3,
    materiaId: 1,
    fechaInscripcion: "2025-03-18T14:20:00",
    estado: "ACTIVA",
    usuarioAlta: "admin",
    fechaAlta: "2025-03-18T14:20:00"
  },
  {
    id: 1005,
    estudianteId: 4,
    materiaId: 5,
    fechaInscripcion: "2025-03-19T16:10:00",
    estado: "ACTIVA",
    usuarioAlta: "admin",
    fechaAlta: "2025-03-19T16:10:00"
  }
];

/**
 * Verifica si un estudiante ya está inscrito en una materia específica
 * @param estudianteId ID del estudiante
 * @param materiaId ID de la materia
 * @param inscripciones Lista de inscripciones a verificar
 * @returns true si ya existe la inscripción, false en caso contrario
 */
export const verificarInscripcionExistente = (
  estudianteId: number,
  materiaId: number,
  inscripciones: InscripcionDTO[]
): boolean => {
  return inscripciones.some(
    inscripcion => 
      inscripcion.estudianteId === estudianteId && 
      inscripcion.materiaId === materiaId
  );
};

/**
 * Genera una nueva inscripción con un ID único
 * @param estudianteId ID del estudiante
 * @param materiaId ID de la materia
 * @returns Una nueva inscripción con datos generados
 */
export const generarNuevaInscripcion = (
  estudianteId: number,
  materiaId: number
): InscripcionDTO => {
  const ahora = new Date();
  const fechaStr = ahora.toISOString();
  
  // Generar ID único asegurándonos de que no existe
  const maxId = Math.max(0, ...mockInscripciones.map(i => i.id || 0));
  const nuevoId = maxId + 1;
  
  return {
    id: nuevoId,
    estudianteId,
    materiaId,
    fechaInscripcion: fechaStr,
    estado: "ACTIVA",
    usuarioAlta: "admin",
    fechaAlta: fechaStr
  };
};
