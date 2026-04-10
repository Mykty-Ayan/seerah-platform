package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/ayan/seerah-backend/internal/database"
	"github.com/ayan/seerah-backend/internal/domain"
	"github.com/ayan/seerah-backend/internal/middleware"
)

type DashboardHandler struct{}

type DashboardStats struct {
	TotalCourses    int64 `json:"total_courses"`
	TotalVideos     int64 `json:"total_videos"`
	TotalLecturers  int64 `json:"total_lecturers"`
	TotalUsers      int64 `json:"total_users"`
	TodayViews     int64 `json:"today_views"`
}

func NewDashboardHandler() *DashboardHandler {
	return &DashboardHandler{}
}

func (h *DashboardHandler) RegisterRoutes(r chi.Router) {
	// Protected route - requires auth
	r.Use(middleware.AuthMiddleware)
	r.Get("/", h.GetStats)
}

func (h *DashboardHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	// Check if user is authenticated
	_, ok := middleware.GetAdminIDFromContext(r)
	if !ok {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	db := database.GetDB()
	
	var stats DashboardStats
	
	// Count courses
	db.Model(&domain.Course{}).Count(&stats.TotalCourses)
	
	// Count videos
	db.Model(&domain.Video{}).Count(&stats.TotalVideos)
	
	// Count lecturers
	db.Model(&domain.Lecturer{}).Count(&stats.TotalLecturers)
	
	// Count users
	db.Model(&domain.User{}).Count(&stats.TotalUsers)
	
	// Today's views (from user_video_watched)
	// TODO: Implement proper view tracking
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
