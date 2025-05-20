import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <Loader2 className="h-12 w-12 text-[#006400] animate-spin mb-4" />
      <p className="text-gray-500 text-lg">Cargando materias...</p>
    </div>
  )
}
