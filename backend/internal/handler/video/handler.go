package video

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/ayan/seerah-backend/internal/domain"
	"github.com/ayan/seerah-backend/internal/database"
	cf "github.com/ayan/seerah-backend/pkg/cloudflare"
	"github.com/ayan/seerah-backend/internal/middleware"
)

type VideoHandler struct {
	streamClient *cf.StreamClient
}

func NewVideoHandler() *VideoHandler {
	return &VideoHandler{
		streamClient: cf.NewStreamClient(),
	}
}

func (h *VideoHandler) RegisterRoutes(r chi.Router) {
	r.Use(middleware.AuthMiddleware)
	
	r.Post("/", h.UploadVideo)
	r.Post("/upload-url", h.GetUploadURL)
	r.Get("/{course_id}", h.ListVideos)
	r.Put("/{id}", h.UpdateVideo)
	r.Delete("/{id}", h.DeleteVideo)
}

type UploadVideoRequest struct {
	CourseID   uint   `json:"course_id"`
	Title      string `json:"title"`
	Description string `json:"description"`
	OrderIndex int    `json:"order_index"`
}

type UploadVideoResponse struct {
	VideoUID  string `json:"video_uid"`
	Video     *domain.Video `json:"video"`
}

// UploadVideo handles direct file upload to Cloudflare Stream
func (h *VideoHandler) UploadVideo(w http.ResponseWriter, r *http.Request) {
	// Parse form
	err := r.ParseMultipartForm(32 << 20) // 32MB max
	if err != nil {
		http.Error(w, `{"error":"failed to parse form"}`, http.StatusBadRequest)
		return
	}
	
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, `{"error":"no file provided"}`, http.StatusBadRequest)
		return
	}
	defer file.Close()
	
	// Get metadata from form
	courseIDStr := r.FormValue("course_id")
	title := r.FormValue("title")
	description := r.FormValue("description")
	orderIndexStr := r.FormValue("order_index")
	
	courseID, err := strconv.ParseUint(courseIDStr, 10, 32)
	if err != nil {
		http.Error(w, `{"error":"invalid course_id"}`, http.StatusBadRequest)
		return
	}
	
	orderIndex := 1
	if orderIndexStr != "" {
		if oi, err := strconv.Atoi(orderIndexStr); err == nil {
			orderIndex = oi
		}
	}
	
	// Save file temporarily
	tempFilePath := fmt.Sprintf("/tmp/%d_%s", time.Now().UnixNano(), header.Filename)
	tempFile, err := os.Create(tempFilePath)
	if err != nil {
		http.Error(w, `{"error":"failed to create temp file"}`, http.StatusInternalServerError)
		return
	}
	_, _ = io.Copy(tempFile, file)
	tempFile.Close()
	defer os.Remove(tempFilePath)
	
	// Upload to Cloudflare Stream
	uploadResp, err := h.streamClient.UploadVideo(tempFilePath, title)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"upload failed: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}
	
	// Save video record to database
	db := database.GetDB()
	video := &domain.Video{
		CourseID:   uint(courseID),
		Title:      title,
		Description: description,
		VideoURL:   uploadResp.Result.UID, // Store Cloudflare Stream UID
		Duration:   int(uploadResp.Result.Duration),
		OrderIndex: orderIndex,
	}
	
	if err := db.Create(video).Error; err != nil {
		// Rollback: delete from Cloudflare
		_ = h.streamClient.DeleteVideo(uploadResp.Result.UID)
		http.Error(w, `{"error":"failed to save video record"}`, http.StatusInternalServerError)
		return
	}
	
	resp := UploadVideoResponse{
		VideoUID: uploadResp.Result.UID,
		Video:    video,
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resp)
}

// GetUploadURL returns a signed upload URL for direct client upload
func (h *VideoHandler) GetUploadURL(w http.ResponseWriter, r *http.Request) {
	// For MVP, we'll use direct upload. Later can implement TUS protocol for resumable uploads.
	http.Error(w, `{"error":"use direct upload endpoint instead"}`, http.StatusNotImplemented)
}

type ListVideosResponse struct {
	Videos []domain.Video `json:"videos"`
	Total  int            `json:"total"`
}

// ListVideos returns all videos for a course
func (h *VideoHandler) ListVideos(w http.ResponseWriter, r *http.Request) {
	db := database.GetDB()
	
	courseIDStr := chi.URLParam(r, "course_id")
	courseID, err := strconv.ParseUint(courseIDStr, 10, 32)
	if err != nil {
		http.Error(w, `{"error":"invalid course_id"}`, http.StatusBadRequest)
		return
	}
	
	var videos []domain.Video
	db.Where("course_id = ?", courseID).Order("order_index ASC").Find(&videos)
	
	resp := ListVideosResponse{
		Videos: videos,
		Total:  len(videos),
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

type UpdateVideoRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	OrderIndex  *int   `json:"order_index"`
}

// UpdateVideo updates video metadata
func (h *VideoHandler) UpdateVideo(w http.ResponseWriter, r *http.Request) {
	db := database.GetDB()
	
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, `{"error":"invalid video ID"}`, http.StatusBadRequest)
		return
	}
	
	var req UpdateVideoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}
	
	var video domain.Video
	if err := db.First(&video, id).Error; err != nil {
		http.Error(w, `{"error":"video not found"}`, http.StatusNotFound)
		return
	}
	
	if req.Title != "" {
		video.Title = req.Title
	}
	if req.Description != "" {
		video.Description = req.Description
	}
	if req.OrderIndex != nil {
		video.OrderIndex = *req.OrderIndex
	}
	
	if err := db.Save(&video).Error; err != nil {
		http.Error(w, `{"error":"failed to update video"}`, http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(video)
}

// DeleteVideo deletes a video
func (h *VideoHandler) DeleteVideo(w http.ResponseWriter, r *http.Request) {
	db := database.GetDB()
	
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, `{"error":"invalid video ID"}`, http.StatusBadRequest)
		return
	}
	
	var video domain.Video
	if err := db.First(&video, id).Error; err != nil {
		http.Error(w, `{"error":"video not found"}`, http.StatusNotFound)
		return
	}
	
	// Delete from Cloudflare Stream
	_ = h.streamClient.DeleteVideo(video.VideoURL)
	
	// Delete from database
	if err := db.Delete(&video).Error; err != nil {
		http.Error(w, `{"error":"failed to delete video"}`, http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"message":"video deleted successfully"}`))
}
