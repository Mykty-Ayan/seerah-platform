import { useState, useEffect } from "react"
import { Sidebar } from "../../components/admin/Sidebar"
import { Plus, Edit, Trash2 } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || "https://backend-production-685a.up.railway.app/api"

interface Category { id: number; name: string; slug: string }

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: "", slug: "" })
  const token = localStorage.getItem("admin_token")

  useEffect(() => { fetchData() }, [])
  const fetchData = () => {
    fetch(`${API_URL}/admin/categories`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setCategories(d.categories || []); setLoading(false) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editing ? "PUT" : "POST"
    const url = editing ? `${API_URL}/admin/categories/${editing.id}` : `${API_URL}/admin/categories`
    await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) })
    setShowModal(false); setEditing(null); setFormData({ name: "", slug: "" }); fetchData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить?")) return
    await fetch(`${API_URL}/admin/categories/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
    fetchData()
  }

  if (loading) return <div className="min-h-screen flex"><Sidebar /><main className="flex-1 p-8">Загрузка...</main></div>

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Категории</h1>
          <button onClick={() => { setEditing(null); setFormData({ name: "", slug: "" }); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg">
            <Plus className="w-5 h-5" /> Новая категория
          </button>
        </div>
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr></thead>
            <tbody className="divide-y">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-4 font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.slug}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => { setEditing(c); setFormData({ name: c.name, slug: c.slug }); setShowModal(true) }} className="text-blue-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editing ? "Редактировать" : "Новая категория"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Название</label><input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} className="w-full border rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Slug</label><input required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
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
