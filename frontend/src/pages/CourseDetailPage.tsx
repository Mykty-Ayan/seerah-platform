import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { CloudflarePlayer } from "@/components/CloudflarePlayer"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, PlayCircle } from "lucide-react"

interface Video {
  id: number
  title: string
  description: string
  video_url: string
  duration: number
  order_index: number
  is_watched?: boolean
}

interface Course {
  id: number
  title: string
  description: string
  lecturer: {
    id: number
    name: string
    avatar_url: string
  }
  category: {
    id: number
    name: string
  }
  thumbnail_url: string
  total_videos: number
}

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  const currentEpisodeIndex = parseInt(searchParams.get("episode") || "0")

  useEffect(() => {
    if (!id) return

    // Fetch course and videos from API
    fetch(`/api/courses/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCourse(data.course)
        setVideos(data.videos || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch course:", err)
        setLoading(false)
      })
  }, [id])

  const handleVideoEnded = () => {
    // Mark video as watched
    const currentVideo = videos[currentEpisodeIndex]
    if (currentVideo) {
      fetch("/api/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: currentVideo.id,
          course_id: course?.id,
        }),
      }).catch(console.error)
    }

    // Auto-advance to next episode
    if (currentEpisodeIndex < videos.length - 1) {
      setSearchParams({ episode: String(currentEpisodeIndex + 1) })
    }
  }

  const handlePrevEpisode = () => {
    if (currentEpisodeIndex > 0) {
      setSearchParams({ episode: String(currentEpisodeIndex - 1) })
    }
  }

  const handleNextEpisode = () => {
    if (currentEpisodeIndex < videos.length - 1) {
      setSearchParams({ episode: String(currentEpisodeIndex + 1) })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Жүктелуде...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Курс табылмады</p>
      </div>
    )
  }

  const currentVideo = videos[currentEpisodeIndex]

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-4">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto max-w-4xl p-4">
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {course.lecturer.name} • {course.category.name}
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl p-4">
        {/* Video Player */}
        {currentVideo ? (
          <div className="mb-6">
            <CloudflarePlayer
              videoUid={currentVideo.video_url}
              onEnded={handleVideoEnded}
            />

            {/* Episode Info */}
            <div className="mt-4">
              <h2 className="text-lg font-semibold">
                {currentVideo.title}
              </h2>
              {currentVideo.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {currentVideo.description}
                </p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4 gap-4">
              <button
                onClick={handlePrevEpisode}
                disabled={currentEpisodeIndex === 0}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition"
              >
                ← Алдыңғы
              </button>
              <button
                onClick={handleNextEpisode}
                disabled={currentEpisodeIndex === videos.length - 1}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition"
              >
                Келесі →
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-8 text-center border rounded-lg">
            <PlayCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Видео табылмады</p>
          </div>
        )}

        {/* Episode List */}
        <div className="border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="font-semibold">
              Эпизодтар ({videos.length})
            </h3>
          </div>
          <div className="divide-y">
            {videos.map((video, index) => (
              <button
                key={video.id}
                onClick={() => setSearchParams({ episode: String(index) })}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-accent transition ${
                  index === currentEpisodeIndex ? "bg-accent" : ""
                }`}
              >
                <div className="flex-shrink-0">
                  {video.is_watched ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center text-sm text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{video.title}</p>
                  {video.duration > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(video.duration / 60)} мин
                    </p>
                  )}
                </div>
                {index === currentEpisodeIndex && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {course.total_videos > 0 && (
          <div className="mt-6 p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Прогресс</span>
              <span className="text-sm text-muted-foreground">
                {videos.filter((v) => v.is_watched).length} / {course.total_videos}
              </span>
            </div>
            <Progress
              value={
                (videos.filter((v) => v.is_watched).length / course.total_videos) * 100
              }
              className="h-2"
            />
          </div>
        )}
      </div>
    </div>
  )
}
