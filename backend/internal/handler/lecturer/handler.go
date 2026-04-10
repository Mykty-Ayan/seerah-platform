package lecturer

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/ayan/seerah-backend/internal/domain"
	lecturerSvc "github.com/ayan/seerah-backend/internal/service/lecturer"
	"github.com/ayan/seerah-backend/internal/middleware"
)

type LecturerHandler struct {
	service lecturerSvc.LecturerService
}

func NewLecturerHandler(service lecturerSvc.LecturerService) *LecturerHandler {
	return &LecturerHandler{service: service}
}

func (h *LecturerHandler) RegisterRoutes(r chi.Router) {
	// Protected routes - require auth
	r.Use(middleware.AuthMiddleware)
	
	r.Post("/", h.Create)
	r.Get("/", h.List)
	r.Get("/{id}", h.GetByID)
	r.Put("/{id}", h.Update)
	r.Delete("/{id}", h.Delete)
}

type CreateLecturerRequest struct {
	Name      string `json:"name"`
	Bio       string `json:"bio"`
	AvatarURL string `json:"avatar_url"`
}

func (h *LecturerHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateLecturerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Validation
	if req.Name == "" {
		http.Error(w, `{"error":"name is required"}`, http.StatusBadRequest)
		return
	}

	lecturer, err := h.service.Create(req.Name, req.Bio, req.AvatarURL)
	if err != nil {
		http.Error(w, `{"error":"failed to create lecturer"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(lecturer)
}

func (h *LecturerHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, `{"error":"invalid ID"}`, http.StatusBadRequest)
		return
	}

	lecturer, err := h.service.GetByID(uint(id))
	if err != nil {
		http.Error(w, `{"error":"lecturer not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(lecturer)
}

type ListResponse struct {
	Lecturers []domain.Lecturer `json:"lecturers"`
	Total     int64             `json:"total"`
	Page      int               `json:"page"`
	Limit     int               `json:"limit"`
}

func (h *LecturerHandler) List(w http.ResponseWriter, r *http.Request) {
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

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

	lecturers, total, err := h.service.List(page, limit)
	if err != nil {
		http.Error(w, `{"error":"failed to list lecturers"}`, http.StatusInternalServerError)
		return
	}

	resp := ListResponse{
		Lecturers: lecturers,
		Total:     total,
		Page:      page,
		Limit:     limit,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *LecturerHandler) Update(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, `{"error":"invalid ID"}`, http.StatusBadRequest)
		return
	}

	var req CreateLecturerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	lecturer, err := h.service.Update(uint(id), req.Name, req.Bio, req.AvatarURL)
	if err != nil {
		http.Error(w, `{"error":"failed to update lecturer"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(lecturer)
}

func (h *LecturerHandler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, `{"error":"invalid ID"}`, http.StatusBadRequest)
		return
	}

	err = h.service.Delete(uint(id))
	if err != nil {
		http.Error(w, `{"error":"failed to delete lecturer"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"message":"lecturer deleted successfully"}`))
}
