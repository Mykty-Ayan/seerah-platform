import { Link, useLocation } from "react-router-dom"
import { BookOpen, Users, Tag, Video, LayoutDashboard, LogOut } from "lucide-react"

export function Sidebar() {
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    window.location.href = "/login"
  }

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/courses", label: "Курсы", icon: BookOpen },
    { path: "/lecturers", label: "Лекторы", icon: Users },
    { path: "/categories", label: "Категории", icon: Tag },
    { path: "/videos", label: "Видео", icon: Video },
  ]

  return (
    <aside className="w-64 glass-panel border-r min-h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
          Seerah Admin
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Управление контентом</p>
      </div>
      
      <nav className="p-4 flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-primary' : ''
                  }`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg w-full transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Выйти</span>
        </button>
      </div>
    </aside>
  )
}
