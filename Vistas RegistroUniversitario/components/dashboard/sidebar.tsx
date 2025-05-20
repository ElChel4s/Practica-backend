"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, GraduationCap, BookOpen, ClipboardList, LogOut, Menu, X, ChevronRight, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { removeToken, decodeToken, getUserInfo, UserInfo } from "@/lib/auth" // getUserInfo sí existe

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [userName, setUserName] = useState("Usuario")
  const [userFullName, setUserFullName] = useState("")
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Función para formatear roles y asignar colores
  const formatRole = (role: string): { text: string; className: string } => {
    const cleanRole = role.replace("ROL_", "").toLowerCase();
    let displayText = cleanRole.charAt(0).toUpperCase() + cleanRole.slice(1);
    let className = "text-gray-300"; // Color por defecto para roles sobre fondo oscuro

    switch (cleanRole) {
      case "admin":
        displayText = "Administrador";
        className = "text-red-400 font-semibold";
        break;
      case "docente":
        displayText = "Docente";
        className = "text-blue-400 font-semibold";
        break;
      case "estudiante":
        displayText = "Estudiante";
        className = "text-green-400 font-semibold";
        break;
      default:
        // Mantener el rol capitalizado si no es uno de los conocidos
        break;
    }
    return { text: displayText, className };
  };
  
  useEffect(() => {
    const processUserInfo = (info: UserInfo | null) => {
      if (!info) return;
      setUserInfo(info);
      setUserName(info.username || "Usuario");
      setUserRoles(info.roles || []);
      if (info.nombre || info.apellido) {
        const fullName = [info.nombre || "", info.apellido || ""].filter(Boolean).join(" ");
        setUserFullName(fullName);
      }
    };
    
    const storedUserInfo = getUserInfo();
    if (storedUserInfo) {
      processUserInfo(storedUserInfo);
    } else {
      const decodedTokenInfo = decodeToken();
      processUserInfo(decodedTokenInfo);
    }
  }, [])

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, [])

  const handleLogout = () => {
    removeToken(); // Limpia el token y userInfo de localStorage
    // Opcional: podrías querer limpiar el estado local del sidebar también
    setUserInfo(null);
    setUserName("Usuario");
    setUserFullName("");
    setUserRoles([]);
    router.push("/login"); // Redirige a la página de login
  }

  const menuItems = [
    { title: "Inicio", icon: Home, path: "/dashboard" },
    { title: "Estudiantes", icon: GraduationCap, path: "/dashboard/students" },
    { title: "Materias", icon: BookOpen, path: "/dashboard/subjects" },
    { title: "Inscripciones", icon: ClipboardList, path: "/dashboard/enrollments" },
  ];

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const renderUserAvatar = () => (
    <Avatar className="h-10 w-10 border-2 border-white/20">
      <AvatarImage src="/placeholder-user.jpg" alt={userFullName || userName} />
      <AvatarFallback className="bg-white/10 text-white">
        {userFullName 
          ? userFullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
          : userName.substring(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  const renderUserInfo = (collapsed = false) => (
    <>
      <p className={`text-sm font-medium text-white truncate ${collapsed ? 'max-w-[150px]' : 'max-w-[120px]'}`}>
        {userFullName || userName}
      </p>
      <div className="text-xs text-white/70 truncate">
        {userRoles && userRoles.length > 0 
          ? userRoles.map((role, index) => {
              const { text, className: roleClassName } = formatRole(role);
              return (
                <span key={index} className={`mr-1 ${roleClassName}`}>
                  {text}
                  {index < userRoles.length - 1 && ", "}
                </span>
              );
            })
          : <span className="text-gray-300">Usuario</span>}
      </div>
    </>
  );

  // Sidebar para móvil
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 shadow-md rounded-full h-10 w-10"
        >
          <Menu size={20} />
        </Button>

        {isMobileOpen && <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={toggleMobileSidebar} />}

        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-primary text-white transform transition-transform duration-300 ease-in-out ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-[#002244]">
            <h1 className="text-xl font-bold">Sistema Educativo</h1>
            <Button variant="ghost" size="icon" onClick={toggleMobileSidebar} className="text-white">
              <X size={20} />
            </Button>
          </div>

          <div className="flex flex-col justify-between flex-1 overflow-y-auto">
            <nav className="mt-6 space-y-1 px-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center rounded-md px-4 py-3 text-sm font-medium transition-all duration-300 ${
                      isActive ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    <span>{item.title}</span>
                    {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-[#002244]">
              <div className="flex items-center">
                {renderUserAvatar()}
                <div className="ml-3 overflow-hidden">
                  {renderUserInfo(true)}
                </div>
              </div>
              <Button
                onClick={handleLogout}
                className="mt-4 w-full justify-start bg-[#800000]/80 hover:bg-[#800000] text-white border-none"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Sidebar para escritorio
  return (
    <div
      className={`relative bg-gradient-primary text-white transition-all duration-300 ease-in-out ${
        isCollapsed ? "sidebar-collapsed" : "sidebar-expanded"
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#002244]">
        {!isCollapsed && <h1 className="text-xl font-bold">Sistema Educativo</h1>}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={`text-white ${isCollapsed ? "mx-auto" : "ml-auto"}`}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <div className={`flex flex-col justify-between flex-1 h-[calc(100vh-4rem)] ${isCollapsed ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <nav className={`mt-6 space-y-1 px-2 ${isCollapsed ? '' : 'overflow-y-auto'}`}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center rounded-md px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.title : undefined}
              >
                <item.icon className={`${isCollapsed ? "" : "mr-3"} h-5 w-5`} />
                {!isCollapsed && <span>{item.title}</span>}
                {!isCollapsed && isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </Link>
            );
          })}
        </nav>

        <div className={`p-4 border-t border-[#002244] ${isCollapsed ? "text-center" : ""}`}>
          {isCollapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 p-0">
                  {renderUserAvatar()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#001a33] border-[#002244] text-white w-56">
                <DropdownMenuLabel className="text-white/90 px-3 py-2">
                  {userFullName || userName}
                </DropdownMenuLabel>
                <div className="px-3 py-1.5 text-sm">
                  {userInfo?.email && <p className="truncate text-white/70 text-xs">{userInfo.email}</p>}
                  <div className="text-xs mt-1">
                    {userRoles && userRoles.length > 0 
                      ? userRoles.map((role, index) => {
                          const { text, className: roleClassName } = formatRole(role);
                          return (
                            <span key={index} className={`mr-1 ${roleClassName}`}>
                              {text}
                              {index < userRoles.length - 1 && ", "}
                            </span>
                          );
                        })
                      : <span className="text-gray-300">Usuario</span>}
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem className="cursor-pointer hover:bg-white/10 focus:bg-white/10 m-1 rounded">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-red-400 hover:bg-red-500/20 focus:bg-red-500/20 hover:text-red-300 focus:text-red-300 m-1 rounded" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center">
              {renderUserAvatar()}
              <div className="ml-3 overflow-hidden">
                {renderUserInfo()}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="ml-auto text-white hover:bg-[#800000]/50 p-2 rounded-full"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
