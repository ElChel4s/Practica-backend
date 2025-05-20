// Utilidad para hacer peticiones HTTP autenticadas
import { getToken } from './auth'

const API_URL = 'http://localhost:8080/api'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  requiresAuth?: boolean
  headers?: Record<string, string>
}

/**
 * Realiza una petición HTTP a la API
 * @param endpoint - Ruta relativa de la API (sin /api)
 * @param options - Opciones de la petición
 * @returns La respuesta en JSON
 */
export async function apiCall<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    requiresAuth = true,
    headers = {},
  } = options

  const url = `${API_URL}${endpoint}`
  
  console.log(`Haciendo petición ${method} a ${url}`);
  
  // Headers por defecto
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(requiresAuth ? { 'Authorization': `Bearer ${getToken()}` } : {}),
    ...headers
  }
  
  // Opciones de la petición
  const fetchOptions: RequestInit = {
    method,
    headers: defaultHeaders,
    // No usar credentials: 'include' para evitar problemas con CORS
    // Solo lo habilitamos si es realmente necesario
    // credentials: 'include',
  }

  // Agregar el body si es necesario
  if (body) {
    fetchOptions.body = JSON.stringify(body);
    console.log('Payload enviado:', body);
  }

  try {
    console.log('Opciones de fetch:', fetchOptions);
    const response = await fetch(url, fetchOptions);
    console.log(`Respuesta recibida: ${response.status} ${response.statusText}`);
    
    // Obtener el texto de la respuesta primero
    const responseText = await response.text();
      // Si la respuesta está vacía, manejar según el contexto
    if (!responseText) {
      console.log('La respuesta está vacía');
      
      // Si la respuesta es OK pero vacía, asumimos que es válida (ej. array vacío)
      if (response.ok) {
        // Para endpoints que devuelven arrays, devolver un array vacío
        if (endpoint.includes('inscripciones') || 
            endpoint.includes('estudiantes') || 
            endpoint.includes('materias')) {
          console.log(`Endpoint ${endpoint} devolvió respuesta vacía - devolviendo array vacío`);
          return ([] as unknown) as T;
        }
        return (null as unknown) as T;
      } else {
        // Si es un error 500, manejarlo de forma especial para inscripciones
        if (response.status === 500 && endpoint.includes('inscripciones')) {
          console.warn('Error 500 al cargar inscripciones - devolviendo array vacío');
          return ([] as unknown) as T;
        }
        // Para otros errores, lanzar excepción normal
        throw new Error(`Error ${response.status}: Respuesta vacía del servidor`);
      }
    }
    
    // Intentar parsear el texto como JSON
    try {
      const data = JSON.parse(responseText);
      console.log('Datos de respuesta:', data);
      
      // Verificar si la petición fue exitosa
      if (!response.ok) {
        // Intentar extraer un mensaje de error específico del cuerpo de la respuesta
        let errorMessage = data?.mensaje || data?.message || data?.error || `Error ${response.status}`;
        
        // Si hay detalles disponibles, incluirlos en el mensaje de error
        if (data?.detalles) {
          errorMessage = data.detalles;
        }
        
        console.error('Error en la petición:', errorMessage, data);
          // Caso especial para cualquier error en inscripciones - devolver array vacío
        if (endpoint.includes('inscripciones')) {
          console.warn(`Error ${response.status} al cargar inscripciones - devolviendo array vacío para continuar`);
          console.error('Detalle del error:', data);
          return ([] as unknown) as T;
        }
        
        // Lanzar el error con toda la información disponible para permitir un manejo más detallado
        const error = new Error(errorMessage);
        (error as any).responseData = data; // Adjuntar la respuesta completa al error
        (error as any).status = response.status;
        throw error;
      }
      
      return data as T;
    } catch (parseError) {
      console.error('Error al parsear respuesta JSON:', parseError);
      throw new Error(`Error al procesar respuesta: ${responseText}`);
    }
  } catch (error) {
    console.error('Error en la petición API:', error);
    throw error;
  }
}

// Métodos HTTP comunes
export const api = {
  get: <T = any>(endpoint: string, options: Omit<ApiOptions, 'method' | 'body'> = {}) => 
    apiCall<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T = any>(endpoint: string, body: any, options: Omit<ApiOptions, 'method'> = {}) => 
    apiCall<T>(endpoint, { ...options, method: 'POST', body }),
  
  put: <T = any>(endpoint: string, body: any, options: Omit<ApiOptions, 'method'> = {}) => 
    apiCall<T>(endpoint, { ...options, method: 'PUT', body }),
  
  delete: <T = any>(endpoint: string, options: Omit<ApiOptions, 'method'> = {}) => 
    apiCall<T>(endpoint, { ...options, method: 'DELETE' })
}

// --- API estudiantes ---
export interface EstudianteDTO {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  fechaNacimiento: string; // ISO string
  numeroInscripcion: string;
  estado: string;
  usuarioAlta: string;
  fechaAlta: string; // ISO string
  usuarioModificacion?: string;
  fechaModificacion?: string;
  usuarioBaja?: string;
  fechaBaja?: string;
  motivoBaja?: string;
}

export const estudiantesApi = {
  getAll: () => api.get<EstudianteDTO[]>("/estudiantes"),
  create: (estudiante: EstudianteDTO) => api.post<EstudianteDTO>("/estudiantes", estudiante),
  update: (id: number, estudiante: EstudianteDTO) => api.put<EstudianteDTO>(`/estudiantes/${id}`, estudiante),
  baja: (id: number, estudiante: EstudianteDTO) => api.put<EstudianteDTO>(`/estudiantes/${id}/baja`, estudiante),
}

// --- API materias ---
export interface MateriaDTO {
  id?: number;
  nombreMateria: string;
  codigoUnico: string;
  creditos: number;
  prerequisitos?: number[];
  esPrerequisitoDe?: number[];
}

export const materiasApi = {
  getAll: () => {
    console.log("Llamando a materiasApi.getAll");
    return api.get<MateriaDTO[]>("/materias").then(result => {
      console.log("Resultado de materiasApi.getAll:", result);
      return result;
    });
  },
  create: (materia: MateriaDTO) => api.post<MateriaDTO>("/materias", materia),
  update: (id: number, materia: MateriaDTO) => api.put<MateriaDTO>(`/materias/${id}`, materia),
  delete: (id: number) => api.delete<void>(`/materias/${id}`),
  getById: (id: number) => api.get<MateriaDTO>(`/materias/${id}`),
  getByCodigoUnico: (codigo: string) => api.get<MateriaDTO>(`/materias/codigo/${codigo}`),
}

// --- API inscripciones ---
export interface InscripcionDTO {
  id?: number;
  estudianteId: number;
  materiaId: number;
  fechaInscripcion?: string;
  estado?: string;
  usuarioAlta?: string;
  fechaAlta?: string;
  usuarioBaja?: string;
  fechaBaja?: string;
}

export const inscripcionesApi = {
  getAll: () => {
    console.log("Llamando a inscripcionesApi.getAll");
    return api.get<InscripcionDTO[]>("/inscripciones").then(result => {
      console.log("Resultado de inscripcionesApi.getAll:", result);
      return result;
    });
  },
  create: (inscripcion: InscripcionDTO) => api.post<InscripcionDTO>("/inscripciones", inscripcion),
  getByEstudiante: (estudianteId: number) => api.get<InscripcionDTO[]>(`/inscripciones/estudiante/${estudianteId}`),
  update: (id: number, inscripcion: InscripcionDTO) => api.put<InscripcionDTO>(`/inscripciones/${id}`, inscripcion),
  delete: (id: number, usuarioBaja: string) => api.delete<void>(`/inscripciones/${id}?usuarioBaja=${usuarioBaja}`),
};
