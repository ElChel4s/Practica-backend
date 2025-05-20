import SignupForm from "@/components/auth/signup-form"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="hidden md:flex md:w-1/2 bg-gradient-primary items-center justify-center">
        <div className="max-w-md p-8 text-white animate-fade-in">
          <h1 className="text-4xl font-bold mb-6">Sistema Educativo</h1>
          <p className="text-lg mb-8">
            Crea una cuenta para acceder a todas las funcionalidades de nuestra plataforma de gestión educativa.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p>Acceso a todas las funcionalidades</p>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p>Interfaz intuitiva y amigable</p>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p>Soporte técnico disponible</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-slide-in-up">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#003366]">Crear una cuenta</h2>
            <p className="mt-2 text-sm text-gray-600">Completa el formulario para registrarte en el sistema</p>
          </div>
          <div className="mt-8 bg-white p-8 shadow-lg rounded-xl">
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  )
}
