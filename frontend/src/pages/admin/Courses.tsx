import { useState, useEffect } from "react"
import { Sidebar } from "../../components/admin/Sidebar"
import { Plus, Edit, Trash2 } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || "https://backend-production-685a.up.railway.app/api"

interface Course {
  id: number
  title: string
  description: string
  lecturer_id: number
  category_id: number
  thumbnail_url: string
  is_featured: boolean
  total_videos: number
  created_at: string
}

interface Lecturer { id: number; name: string }
interface Category { id: number; name: string }

export function Courses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    lecturer_id: "",
    category_id: "",
    thumbnail_url: "",
    is_featured: false,
  })
  const token = localStorage.getItem("admin_token")

  useEffect(() => { fetchData() }, [])

  const fetchData = () => {
    Promise.all([
      fetch(`${API_URL}/admin/courses`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_URL}/admin/lecturers`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_URL}/admin/categories`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([coursesData, lecturersData, categoriesData]) => {
      setCourses(coursesData.courses || [])
      setLecturers(lecturersData.lecturers || [])
      setCategories(categoriesData.categories || [])
      setLoading(false)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editingCourse ? "PUT" : "POST"
    const url = editingCourse ? `${API_URL}/admin/courses/${editingCourse.id}` : `${API_URL}/admin/courses`

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...formData,
        lecturer_id: parseInt(formData.lecturer_id),
        category_id: parseInt(formData.category_id),
      }),
    })

    setShowModal(false)
    setEditingCourse(null)
    setFormData({ title: "", description: "", lecturer_id: "", category_id: "", thumbnail_url: "", is_featured: false })
    fetchData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить курс?")) return
    await fetch(`${API_URL}/admin/courses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchData()
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      description: course.description,
      lecturer_id: String(course.lecturer_id),
      category_id: String(course.category_id),
      thumbnail_url: course.thumbnail_url,
      is_featured: course.is_featured,
    })
    setShowModal(true)
  }

  if (loading) return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar /><main className="flex-1 ml-64 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </main>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-[Space Grotesk] mb-2">Курсы</h1>
            <p className="text-muted-foreground">Управление учебными курсами</p>
          </div>
          <button
            onClick={() => { setEditingCourse(null); setFormData({ title: "", description: "", lecturer_id: "", category_id: "", thumbnail_url: "", is_featured: false }); setShowModal(true) }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-green-600 text-white rounded-lg hover:from-primary/90 hover:to-green-600/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl font-medium"
          >
            <Plus className="w-5 h-5" /> Новый курс
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Название</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Лектор</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Категория</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Видео</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Featured</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-green-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {course.thumbnail_url && (
                        <img src={course.thumbnail_url} alt={course.title} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                      )}
                      <span className="font-medium">{course.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {lecturers.find((l) => l.id === course.lecturer_id)?.name || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {categories.find((c) => c.id === course.category_id)?.name || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{course.total_videos}</td>
                  <td className="px-6 py-4">
                    {course.is_featured ? (
                      <span className="text-yellow-500">⭐</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(course)} className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold font-[Space Grotesk] mb-6">
                {editingCourse ? "Редактировать курс" : "Новый курс"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Название</label>
                  <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Описание</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Лектор</label>
                  <select required value={formData.lecturer_id} onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all">
                    <option value="">Выберите лектора</option>
                    {lecturers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Категория</label>
                  <select required value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all">
                    <option value="">Выберите категорию</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Обложка (URL)</label>
                  <input value={formData.thumbnail_url} onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="https://..." />
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <input type="checkbox" id="featured" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/50" />
                  <label htmlFor="featured" className="text-sm font-medium">Featured курс</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-primary to-green-600 text-white py-3 rounded-lg hover:from-primary/90 hover:to-green-600/90 transition-all font-medium shadow-lg shadow-primary/25">
                    Сохранить
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 border-2 border-gray-200 py-3 rounded-lg hover:bg-gray-200 transition-all font-medium">
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
