import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto p-6">
        {children}
        <Toaster />
      </main>
    </div>
  )
}
