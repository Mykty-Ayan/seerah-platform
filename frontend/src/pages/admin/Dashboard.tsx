import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Sidebar } from "../../components/admin/Sidebar"
import { BookOpen, Users, Video, Tag, TrendingUp, ArrowRight } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || "https://backend-production-685a.up.railway.app/api"

interface Stats {
  total_courses: number
  total_videos: number
  total_lecturers: number
  total_users: number
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem("admin_token")

  useEffect(() => {
    fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token])

  const statCards = [
    { 
      title: "Курсы", 
      value: stats?.total_courses || 0, 
      icon: BookOpen, 
      gradient: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400",
      border: "border-blue-500/20"
    },
    { 
      title: "Видео", 
      value: stats?.total_videos || 0, 
      icon: Video, 
      gradient: "from-green-500/20 to-green-600/5",
      iconColor: "text-green-400",
      border: "border-green-500/20"
    },
    { 
      title: "Лекторы", 
      value: stats?.total_lecturers || 0, 
      icon: Users, 
      gradient: "from-purple-500/20 to-purple-600/5",
      iconColor: "text-purple-400",
      border: "border-purple-500/20"
    },
    { 
      title: "Пользователи", 
      value: stats?.total_users || 0, 
      icon: TrendingUp, 
      gradient: "from-orange-500/20 to-orange-600/5",
      iconColor: "text-orange-400",
      border: "border-orange-500/20"
    },
  ]

  const quickActions = [
    { 
      title: "Управление курсами", 
      desc: "Создавать, редактировать курсы",
      icon: BookOpen, 
      to: "/courses",
      gradient: "from-blue-500/10 to-blue-600/5"
    },
    { 
      title: "Управление лекторами", 
      desc: "Добавлять лекторов",
      icon: Users, 
      to: "/lecturers",
      gradient: "from-purple-500/10 to-purple-600/5"
    },
    { 
      title: "Управление категориями", 
      desc: "Создавать категории",
      icon: Tag, 
      to: "/categories",
      gradient: "from-green-500/10 to-green-600/5"
    },
  ]

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">Обзор платформы Seerah</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-secondary/30 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, i) => (
              <div 
                key={stat.title}
                className={`glass-panel rounded-xl p-6 gradient-border transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-4xl font-bold font-[Space Grotesk]">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.gradient} ${stat.border} border`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-6 font-[Space Grotesk]">Быстрые действия</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, i) => (
              <Link
                key={action.to}
                to={action.to}
                className="glass-panel rounded-xl p-6 gradient-border transition-all duration-300 hover:scale-105 hover:shadow-2xl group block"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{action.desc}</p>
                <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                  <span>Перейти</span>
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
