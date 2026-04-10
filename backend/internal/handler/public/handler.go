package public

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/ayan/seerah-backend/internal/database"
	"github.com/ayan/seerah-backend/internal/domain"
)

type PublicHandler struct{}

func NewPublicHandler() *PublicHandler {
	return &PublicHandler{}
}

func (h *PublicHandler) RegisterRoutes(r chi.Router) {
	// Public routes - no auth required
	r.Get("/courses", h.ListCourses)
	r.Get("/courses/{id}", h.GetCourse)
	r.Get("/categories", h.ListCategories)
	r.Get("/lecturers", h.ListLecturers)
}

// ListCourses returns paginated list of courses with optional filters
func (h *PublicHandler) ListCourses(w http.ResponseWriter, r *http.Request) {
	db := database.GetDB()

	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	categoryStr := r.URL.Query().Get("category_id")
	featuredStr := r.URL.Query().Get("featured")

	page := 1
	limit := 20

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	offset := (page - 1) * limit
	query := db.Model(&domain.Course{}).Preload("Lecturer").Preload("Category")

	if categoryStr != "" {
		if cid, err := strconv.ParseUint(categoryStr, 10, 32); err == nil {
			query = query.Where("category_id = ?", cid)
		}
	}

	if featuredStr == "true" {
		query = query.Where("is_featured = ?", true)
	}

	var total int64
	query.Count(&total)

	var courses []domain.Course
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&courses).Error; err != nil {
		http.Error(w, `{"error":"failed to fetch courses"}`, http.StatusInternalServerError)
		return
	}

	// Count videos for each course
	for i := range courses {
		var videoCount int64
		db.Model(&domain.Video{}).Where("course_id = ?", courses[i].ID).Count(&videoCount)
		courses[i].TotalVideos = int(videoCount)
	}

	resp := map[string]interface{}{
		"courses": courses,
		"meta": map[string]interface{}{
			"total": total,
			"page":  page,
			"limit": limit,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// GetCourse returns course details with videos list
func (h *PublicHandler) GetCourse(w http.ResponseWriter, r *http.Request) {
	db := database.GetDB()

	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, `{"error":"invalid course ID"}`, http.StatusBadRequest)
		return
	}

	var course domain.Course
	if err := db.Preload("Lecturer").Preload("Category").First(&course, id).Error; err != nil {
		http.Error(w, `{"error":"course not found"}`, http.StatusNotFound)
		return
	}

	// Count videos
	var videoCount int64
	db.Model(&domain.Video{}).Where("course_id = ?", course.ID).Count(&videoCount)
	course.TotalVideos = int(videoCount)

	// Get videos for this course
	var videos []domain.Video
	db.Where("course_id = ?", course.ID).Order("order_index ASC").Find(&videos)

	resp := map[string]interface{}{
		"course": course,
		"videos": videos,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// ListCategories returns all categories
func (h *PublicHandler) ListCategories(w http.ResponseWriter, r *http.Request) {
	db := database.GetDB()

	var categories []domain.Category
	if err := db.Order("name ASC").Find(&categories).Error; err != nil {
		http.Error(w, `{"error":"failed to fetch categories"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"categories": categories,
		"total":      len(categories),
	})
}

// ListLecturers returns all lecturers
func (h *PublicHandler) ListLecturers(w http.ResponseWriter, r *http.Request) {
	db := database.GetDB()

	var lecturers []domain.Lecturer
	if err := db.Order("name ASC").Find(&lecturers).Error; err != nil {
		http.Error(w, `{"error":"failed to fetch lecturers"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"lecturers": lecturers,
		"total":     len(lecturers),
	})
}
