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

interface Lecturer {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
}

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

  useEffect(() => {
    fetchData()
  }, [])

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
    const url = editingCourse
      ? `${API_URL}/admin/courses/${editingCourse.id}`
      : `${API_URL}/admin/courses`

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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

  if (loading) return <div className="min-h-screen flex"><Sidebar /><main className="flex-1 p-8">Загрузка...</main></div>

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Курсы</h1>
          <button
            onClick={() => { setEditingCourse(null); setFormData({ title: "", description: "", lecturer_id: "", category_id: "", thumbnail_url: "", is_featured: false }); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" /> Новый курс
          </button>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Лектор</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Видео</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {courses.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4">{course.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {lecturers.find((l) => l.id === course.lecturer_id)?.name || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {categories.find((c) => c.id === course.category_id)?.name || "-"}
                  </td>
                  <td className="px-6 py-4">{course.total_videos}</td>
                  <td className="px-6 py-4">{course.is_featured ? "✅" : "-"}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(course)} className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingCourse ? "Редактировать курс" : "Новый курс"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Название</label>
                  <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Описание</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded px-3 py-2" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Лектор</label>
                  <select required value={formData.lecturer_id} onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })} className="w-full border rounded px-3 py-2">
                    <option value="">Выберите лектора</option>
                    {lecturers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Категория</label>
                  <select required value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full border rounded px-3 py-2">
                    <option value="">Выберите категорию</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Обложка (URL)</label>
                  <input value={formData.thumbnail_url} onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="https://..." />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} />
                  <label htmlFor="featured" className="text-sm">Featured</label>
                </div>
                <div className="flex gap-2 pt-4">
                  <button type="submit" className="flex-1 bg-primary text-white py-2 rounded hover:bg-primary/90">Сохранить</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300">Отмена</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
