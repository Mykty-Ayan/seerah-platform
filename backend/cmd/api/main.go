package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/ayan/seerah-backend/internal/config"
	"github.com/ayan/seerah-backend/internal/database"
	"github.com/ayan/seerah-backend/internal/handler"
	lecturerHandler "github.com/ayan/seerah-backend/internal/handler/lecturer"
	lecturerRepo "github.com/ayan/seerah-backend/internal/repository/lecturer"
	lecturerSvc "github.com/ayan/seerah-backend/internal/service/lecturer"
	categoryHandler "github.com/ayan/seerah-backend/internal/handler/category"
	categoryRepo "github.com/ayan/seerah-backend/internal/repository/category"
	courseHandler "github.com/ayan/seerah-backend/internal/handler/course"
	courseRepo "github.com/ayan/seerah-backend/internal/repository/course"
	"github.com/ayan/seerah-backend/internal/handler/public"
	"github.com/ayan/seerah-backend/internal/handler/video"
)

func main() {
	log.Println("🚀 Starting Seerah Backend...")

	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("❌ Failed to load config: %v", err)
	}

	// Connect to database
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}

	// Run migrations
	if err := database.Migrate(); err != nil {
		log.Fatalf("❌ Failed to run migrations: %v", err)
	}

	// Create initial admin if not exists
	if err := handler.CreateInitialAdmin(); err != nil {
		log.Printf("⚠️  Warning: Failed to create initial admin: %v", err)
	} else {
		log.Println("✅ Initial admin created (email: admin@seerah.com, password: admin123)")
	}

	// Setup router
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.AllowContentType("application/json"))
	r.Use(middleware.SetHeader("Content-Type", "application/json"))

	// Public routes
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"seerah-backend"}`))
	})

	// Auth routes (public)
	r.Mount("/api/auth", setupAuthRoutes())
	
	// Dashboard routes (protected)
	r.Mount("/api/admin/dashboard", setupDashboardRoutes())
	
	// Lecturer routes (protected)
	r.Mount("/api/admin/lecturers", setupLecturerRoutes())
	
	// Category routes (protected)
	r.Mount("/api/admin/categories", setupCategoryRoutes())
	
	// Course routes (protected)
	r.Mount("/api/admin/courses", setupCourseRoutes())
	
	// Public routes (no auth required)
	r.Mount("/api", setupPublicRoutes())
	
	// Video routes (protected, for admin upload)
	r.Mount("/api/admin/videos", setupVideoRoutes())

	// TODO: Add more routes here

	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("✅ Server started on http://localhost%s", addr)
	
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("❌ Server failed: %v", err)
	}
}

func setupAuthRoutes() chi.Router {
	r := chi.NewRouter()
	authHandler := handler.NewAuthHandler()
	authHandler.RegisterRoutes(r)
	return r
}

func setupDashboardRoutes() chi.Router {
	r := chi.NewRouter()
	dashboardHandler := handler.NewDashboardHandler()
	dashboardHandler.RegisterRoutes(r)
	return r
}

func setupLecturerRoutes() chi.Router {
	r := chi.NewRouter()
	db := database.GetDB()
	repo := lecturerRepo.NewLecturerRepository(db)
	service := lecturerSvc.NewLecturerService(repo)
	h := lecturerHandler.NewLecturerHandler(service)
	h.RegisterRoutes(r)
	return r
}

func setupCategoryRoutes() chi.Router {
	r := chi.NewRouter()
	db := database.GetDB()
	repo := categoryRepo.NewCategoryRepository(db)
	h := categoryHandler.NewCategoryHandler(repo)
	h.RegisterRoutes(r)
	return r
}

func setupCourseRoutes() chi.Router {
	r := chi.NewRouter()
	db := database.GetDB()
	repo := courseRepo.NewCourseRepository(db)
	h := courseHandler.NewCourseHandler(repo)
	h.RegisterRoutes(r)
	return r
}

func setupPublicRoutes() chi.Router {
	r := chi.NewRouter()
	h := public.NewPublicHandler()
	h.RegisterRoutes(r)
	return r
}

func setupVideoRoutes() chi.Router {
	r := chi.NewRouter()
	h := video.NewVideoHandler()
	h.RegisterRoutes(r)
	return r
}
