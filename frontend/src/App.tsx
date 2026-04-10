import { BrowserRouter, Routes, Route } from "react-router-dom"
import { BottomNav } from "./components/BottomNav"

// Placeholder pages (will be implemented in future sprints)
function HomePage() {
  return (
    <div className="min-h-screen bg-background p-4 pb-20 md:pb-4">
      <h1 className="text-2xl font-bold mb-4">Бас бет</h1>
      <p className="text-muted-foreground">Home page - Coming soon</p>
    </div>
  )
}

function MyCoursesPage() {
  return (
    <div className="min-h-screen bg-background p-4 pb-20 md:pb-4">
      <h1 className="text-2xl font-bold mb-4">Менің иманым</h1>
      <p className="text-muted-foreground">My Courses page - Coming soon</p>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="min-h-screen bg-background p-4 pb-20 md:pb-4">
      <h1 className="text-2xl font-bold mb-4">Баптаулар</h1>
      <p className="text-muted-foreground">Settings page - Coming soon</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-4xl">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/my-courses" element={<MyCoursesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default App
