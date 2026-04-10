import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Sidebar } from "../../components/admin/Sidebar"
import { BookOpen, Users, Video, Tag, TrendingUp } from "lucide-react"

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
    { title: "Курсы", value: stats?.total_courses || 0, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Видео", value: stats?.total_videos || 0, icon: Video, color: "text-green-600", bg: "bg-green-50" },
    { title: "Лекторы", value: stats?.total_lecturers || 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Пользователи", value: stats?.total_users || 0, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
  ]

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <div key={stat.title} className={`${stat.bg} rounded-lg p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-10 h-10 ${stat.color}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/courses" className="block p-6 border rounded-lg hover:shadow-md transition">
              <BookOpen className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold">Управление курсами</h3>
              <p className="text-sm text-gray-600">Создавать, редактировать курсы</p>
            </Link>
            <Link to="/lecturers" className="block p-6 border rounded-lg hover:shadow-md transition">
              <Users className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold">Управление лекторами</h3>
              <p className="text-sm text-gray-600">Добавлять лекторов</p>
            </Link>
            <Link to="/categories" className="block p-6 border rounded-lg hover:shadow-md transition">
              <Tag className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold">Управление категориями</h3>
              <p className="text-sm text-gray-600">Создавать категории</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
