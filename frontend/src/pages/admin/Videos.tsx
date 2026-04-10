import { useState, useEffect } from "react"
import { Sidebar } from "../../components/admin/Sidebar"
import { Plus, Edit, Trash2 } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || "https://backend-production-685a.up.railway.app/api"

interface Video { id: number; course_id: number; title: string; video_url: string; duration: number; order_index: number }
interface Course { id: number; title: string }

export function Videos() {
  const [videos, setVideos] = useState<Video[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Video | null>(null)
  const [formData, setFormData] = useState({ course_id: "", title: "", video_url: "", order_index: "1" })
  const [uploading, setUploading] = useState(false)
  const token = localStorage.getItem("admin_token")

  useEffect(() => { fetchData() }, [])
  const fetchData = async () => {
    try {
      const [videosRes, coursesRes] = await Promise.all([
        fetch(`${API_URL}/admin/videos`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/courses`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const videosData = await videosRes.json()
      const coursesData = await coursesRes.json()
      // Flatten videos from all courses
      const allVideos: Video[] = []
      if (videosData.courses) {
        videosData.courses.forEach((c: any) => { if (c.videos) allVideos.push(...c.videos) })
      }
      setVideos(allVideos)
      setCourses(coursesData.courses || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editing ? "PUT" : "POST"
    const url = editing ? `${API_URL}/admin/videos/${editing.id}` : `${API_URL}/admin/videos`
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...formData, course_id: parseInt(formData.course_id), order_index: parseInt(formData.order_index) }),
    })
    setShowModal(false); setEditing(null); setFormData({ course_id: "", title: "", video_url: "", order_index: "1" }); fetchData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить видео?")) return
    await fetch(`${API_URL}/admin/videos/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
    fetchData()
  }

  const handleCloudflareUpload = async (file: File) => {
    setUploading(true)
    const form = new FormData()
    form.append("file", file)
    form.append("name", formData.title || file.name)
    
    try {
      const res = await fetch(`${API_URL}/admin/videos/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      const data = await res.json()
      setFormData({ ...formData, video_url: data.video_uid })
    } catch (e) { console.error(e) }
    setUploading(false)
  }

  if (loading) return <div className="min-h-screen flex"><Sidebar /><main className="flex-1 p-8">Загрузка...</main></div>

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Видео</h1>
          <button onClick={() => { setEditing(null); setFormData({ course_id: "", title: "", video_url: "", order_index: "1" }); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg">
            <Plus className="w-5 h-5" /> Новое видео
          </button>
        </div>
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Курс</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Длительность</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr></thead>
            <tbody className="divide-y">
              {videos.map((v) => (
                <tr key={v.id}>
                  <td className="px-6 py-4 font-medium">{v.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{courses.find(c => c.id === v.course_id)?.title || "-"}</td>
                  <td className="px-6 py-4 text-sm">{Math.floor(v.duration / 60)} мин</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => { setEditing(v); setFormData({ course_id: String(v.course_id), title: v.title, video_url: v.video_url, order_index: String(v.order_index) }); setShowModal(true) }} className="text-blue-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(v.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editing ? "Редактировать" : "Новое видео"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Курс</label>
                  <select required value={formData.course_id} onChange={(e) => setFormData({ ...formData, course_id: e.target.value })} className="w-full border rounded px-3 py-2">
                    <option value="">Выберите курс</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Название</label><input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                <div>
                  <label className="block text-sm font-medium mb-1">Загрузить видео (Cloudflare Stream)</label>
                  <input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && handleCloudflareUpload(e.target.files[0])} className="w-full border rounded px-3 py-2" disabled={uploading} />
                  {uploading && <p className="text-sm text-blue-600 mt-1">Загрузка...</p>}
                </div>
                <div><label className="block text-sm font-medium mb-1">Cloudflare Video UID</label><input value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} className="w-full border rounded px-3 py-2" placeholder="или вставьте UID вручную" /></div>
                <div><label className="block text-sm font-medium mb-1">Порядок</label><input type="number" min="1" value={formData.order_index} onChange={(e) => setFormData({ ...formData, order_index: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                <div className="flex gap-2 pt-4">
                  <button type="submit" className="flex-1 bg-primary text-white py-2 rounded">Сохранить</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded">Отмена</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
