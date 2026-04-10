package course

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/ayan/seerah-backend/internal/domain"
	courseRepo "github.com/ayan/seerah-backend/internal/repository/course"
	"github.com/ayan/seerah-backend/internal/middleware"
)

type CourseHandler struct {
	repo courseRepo.CourseRepository
}

func NewCourseHandler(repo courseRepo.CourseRepository) *CourseHandler {
	return &CourseHandler{repo: repo}
}

func (h *CourseHandler) RegisterRoutes(r chi.Router) {
	r.Use(middleware.AuthMiddleware)

	r.Post("/", h.Create)
	r.Get("/", h.List)
	r.Get("/{id}", h.GetByID)
	r.Put("/{id}", h.Update)
	r.Delete("/{id}", h.Delete)
	r.Post("/{id}/feature", h.SetFeatured)
}

type CreateCourseRequest struct {
	Title        string `json:"title"`
	Description  string `json:"description"`
	LecturerID   uint   `json:"lecturer_id"`
	CategoryID   uint   `json:"category_id"`
	ThumbnailURL string `json:"thumbnail_url"`
	IsFeatured   bool   `json:"is_featured"`
}

func (h *CourseHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateCourseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Title == "" {
		http.Error(w, `{"error":"title is required"}`, http.StatusBadRequest)
		return
	}

	course := &domain.Course{
		Title:        req.Title,
		Description:  req.Description,
		LecturerID:   req.LecturerID,
		CategoryID:   req.CategoryID,
		ThumbnailURL: req.ThumbnailURL,
		IsFeatured:   req.IsFeatured,
	}

	err := h.repo.Create(course)
	if err != nil {
		http.Error(w, `{"error":"failed to create course"}`, http.StatusInternalServerError)
		return
	}

	// Reload with associations
	course, _ = h.repo.GetByID(course.ID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(course)
}

func (h *CourseHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, `{"error":"invalid ID"}`, http.StatusBadRequest)
		return
	}

	course, err := h.repo.GetByID(uint(id))
	if err != nil {
		http.Error(w, `{"error":"course not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(course)
}

type ListResponse struct {
	Courses []domain.Course `json:"courses"`
	Total   int64           `json:"total"`
	Page    int             `json:"page"`
	Limit   int             `json:"limit"`
}

func (h *CourseHandler) List(w http.ResponseWriter, r *http.Request) {
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

	var categoryID *uint
	if categoryStr != "" {
		if cid, err := strconv.ParseUint(categoryStr, 10, 32); err == nil {
			id := uint(cid)
			categoryID = &id
		}
	}

	var featured *bool
	if featuredStr != "" {
		if featuredStr == "true" {
			f := true
			featured = &f
		} else if featuredStr == "false" {
			f := false
			featured = &f
		}
	}

	courses, total, err := h.repo.List(page, limit, categoryID, featured)
	if err != nil {
		http.Error(w, `{"error":"failed to list courses"}`, http.StatusInternalServerError)
		return
	}

	resp := ListResponse{
		Courses: courses,
		Total:   total,
		Page:    page,
		Limit:   limit,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *CourseHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, `{"error":"invalid ID"}`, http.StatusBadRequest)
		return
	}

	var req CreateCourseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	course, err := h.repo.GetByID(uint(id))
	if err != nil {
		http.Error(w, `{"error":"course not found"}`, http.StatusNotFound)
		return
	}

	course.Title = req.Title
	course.Description = req.Description
	course.LecturerID = req.LecturerID
	course.CategoryID = req.CategoryID
	course.ThumbnailURL = req.ThumbnailURL
	course.IsFeatured = req.IsFeatured

	err = h.repo.Update(course)
	if err != nil {
		http.Error(w, `{"error":"failed to update course"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(course)
}

func (h *CourseHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, `{"error":"invalid ID"}`, http.StatusBadRequest)
		return
	}

	err = h.repo.Delete(uint(id))
	if err != nil {
		http.Error(w, `{"error":"failed to delete course"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"message":"course deleted successfully"}`))
}

func (h *CourseHandler) SetFeatured(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, `{"error":"invalid ID"}`, http.StatusBadRequest)
		return
	}

	err = h.repo.SetFeatured(uint(id), true)
	if err != nil {
		http.Error(w, `{"error":"failed to set featured"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"message":"course marked as featured"}`))
}
