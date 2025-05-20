// Utilidades para manejar el token JWT y la información del usuario en localStorage

// Interfaz para la información del usuario en el token y en localStorage
export interface UserInfo {
  username: string;
  email?: string;
  roles: string[];
  sub?: string; // subject (generalmente el username del token)
  nombre?: string;
  apellido?: string;
  id?: number;
  exp?: number; // fecha de expiración del token
  iat?: number; // fecha de emisión del token
}

// Estructura esperada de la respuesta de la API de login
interface LoginApiResponse {
  token: string;
  type?: string; // Ejemplo: "Bearer"
  id: number;
  username: string;
  email?: string;
  roles: string[];
  nombre?: string; // Opcional, si el backend lo envía
  apellido?: string; // Opcional, si el backend lo envía
}

export function setToken(loginResponse: LoginApiResponse) {
  if (!loginResponse || !loginResponse.token) {
    console.error("setToken fue llamado sin una respuesta de login válida o sin token.");
    return;
  }
  localStorage.setItem("token", loginResponse.token);
  
  const userInfoToStore: UserInfo = {
    id: loginResponse.id,
    username: loginResponse.username,
    email: loginResponse.email,
    roles: loginResponse.roles,
    nombre: loginResponse.nombre, // Será undefined si no viene en loginResponse
    apellido: loginResponse.apellido, // Será undefined si no viene en loginResponse
  };

  // Decodificar el token para obtener 'sub', 'iat', 'exp' y cualquier otro claim del token
  const decodedToken = decodeToken(loginResponse.token);
  if (decodedToken) {
    userInfoToStore.sub = decodedToken.sub;
    userInfoToStore.iat = decodedToken.iat;
    userInfoToStore.exp = decodedToken.exp;
    // Si nombre/apellido vinieran en el token y no en loginResponse, se podrían tomar de aquí
    if (!userInfoToStore.nombre && decodedToken.nombre) userInfoToStore.nombre = decodedToken.nombre;
    if (!userInfoToStore.apellido && decodedToken.apellido) userInfoToStore.apellido = decodedToken.apellido;
    // Si el token tuviera username, email, roles y estos no vinieran en loginResponse, se podrían tomar de aquí también
    // pero priorizamos loginResponse ya que es más explícito.
  }

  localStorage.setItem("userInfo", JSON.stringify(userInfoToStore));
  console.log("UserInfo almacenado en localStorage por setToken:", userInfoToStore);
}

export function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem("token") : null
}

export function removeToken() {
  localStorage.removeItem("token")
  localStorage.removeItem("userInfo")
}

// Función para decodificar el token JWT y extraer la información del usuario
export function decodeToken(providedToken?: string): UserInfo | null {
  const token = providedToken || getToken()
  
  if (!token) return null
  
  try {
    // Decodificar las partes del token (formato: header.payload.signature)
    const base64Payload = token.split('.')[1]
    if (!base64Payload) {
      console.error('Formato de token JWT inválido: payload faltante.');
      return null;
    }
    const payload = Buffer.from(base64Payload, 'base64').toString('utf-8') // Usar utf-8 para mayor compatibilidad
    const decoded = JSON.parse(payload) as UserInfo; // Castear a UserInfo
    
    console.log("Token decodificado por decodeToken:", decoded);
    return decoded;
  } catch (error) {
    console.error('Error al decodificar el token JWT:', error)
    return null
  }
}

// Función para verificar si el usuario está autenticado
export function isAuthenticated(): boolean {
  return !!getToken()
}

// Función para obtener la información del usuario desde localStorage
export function getUserInfo(): UserInfo | null {
  if (typeof window === 'undefined') return null;
  const userInfoString = localStorage.getItem("userInfo");
  if (userInfoString) {
    try {
      return JSON.parse(userInfoString) as UserInfo;
    } catch (error) {
      console.error("Error al parsear userInfo desde localStorage:", error);
      return null;
    }
  }
  return null;
}
