import { useState, useEffect } from "react"
import { CircularProgress } from "@/components/CircularProgress"
import { Progress } from "@/components/ui/progress"
import { Link } from "react-router-dom"
import { BookOpen, Award } from "lucide-react"

interface CourseProgress {
  id: number
  title: string
  thumbnail_url: string
  total_videos: number
  completed_videos: number
  is_completed: boolean
  last_watched_at?: string
}

interface Stats {
  courses_started: number
  courses_completed: number
  total_hours: number
}

export function MyCoursesPage() {
  const [courses, setCourses] = useState<CourseProgress[]>([])
  const [stats, setStats] = useState<Stats>({ courses_started: 0, courses_completed: 0, total_hours: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"in_progress" | "completed">("in_progress")

  useEffect(() => {
    // Fetch user's courses
    fetch("/api/user/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch courses:", err)
        setLoading(false)
      })

    // Fetch stats
    fetch("/api/user/progress-summary")
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
      })
      .catch(console.error)
  }, [])

  const filteredCourses = courses.filter((course) =>
    activeTab === "in_progress" ? !course.is_completed : course.is_completed
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Жүктелуде...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto max-w-4xl p-4">
          <h1 className="text-2xl font-bold">Менің иманым</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Менің оқу прогрессім
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border rounded-lg p-4 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.courses_started}</p>
            <p className="text-xs text-muted-foreground">Басталған</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.courses_completed}</p>
            <p className="text-xs text-muted-foreground">Аяқталған</p>
          </div>
          <div className="border rounded-lg p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center text-primary">
              🕐
            </div>
            <p className="text-2xl font-bold">{Math.round(stats.total_hours)}</p>
            <p className="text-xs text-muted-foreground">Сағат</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("in_progress")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === "in_progress"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Басталған ({courses.filter((c) => !c.is_completed).length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === "completed"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Аяқталған ({courses.filter((c) => c.is_completed).length})
          </button>
        </div>

        {/* Course List */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {activeTab === "in_progress"
                ? "Сіз әлі курс бастамадыңыз"
                : "Сіз әлі курс аяқтамадыңыз"}
            </p>
            <Link
              to="/"
              className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
            >
              Курстарды қарау
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course) => {
              const percentage =
                course.total_videos > 0
                  ? (course.completed_videos / course.total_videos) * 100
                  : 0

              return (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="block border rounded-lg overflow-hidden hover:shadow-md transition"
                >
                  <div className="flex">
                    {/* Thumbnail */}
                    <div className="w-32 h-24 bg-gray-200 flex-shrink-0">
                      {course.thumbnail_url && (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4">
                      <h3 className="font-semibold mb-2">{course.title}</h3>

                      {/* Progress */}
                      <div className="flex items-center gap-3">
                        <CircularProgress
                          value={course.completed_videos}
                          max={course.total_videos}
                          size={40}
                          strokeWidth={3}
                        />
                        <div className="flex-1">
                          <Progress value={percentage} className="h-2 mb-1" />
                          <p className="text-xs text-muted-foreground">
                            {course.completed_videos} / {course.total_videos} видео
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
