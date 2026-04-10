package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/ayan/seerah-backend/internal/database"
	"github.com/ayan/seerah-backend/internal/domain"
	"github.com/ayan/seerah-backend/internal/middleware"
	seerahjwt "github.com/ayan/seerah-backend/pkg/jwt"
)

type AuthHandler struct{}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
	Admin struct {
		ID    uint   `json:"id"`
		Email string `json:"email"`
		Name  string `json:"name"`
	} `json:"admin"`
}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

func (h *AuthHandler) RegisterRoutes(r chi.Router) {
	r.Post("/login", h.Login)
	r.Post("/logout", h.Logout)
	r.Get("/me", h.Me)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Find admin by email
	var admin domain.Admin
	db := database.GetDB()
	if err := db.Where("email = ?", req.Email).First(&admin).Error; err != nil {
		http.Error(w, `{"error":"invalid credentials"}`, http.StatusUnauthorized)
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)); err != nil {
		http.Error(w, `{"error":"invalid credentials"}`, http.StatusUnauthorized)
		return
	}

	// Generate JWT token
	token, err := seerahjwt.GenerateToken(admin.ID, admin.Email)
	if err != nil {
		http.Error(w, `{"error":"failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	// Build response
	resp := LoginResponse{
		Token: token,
	}
	resp.Admin.ID = admin.ID
	resp.Admin.Email = admin.Email
	resp.Admin.Name = admin.Name

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// JWT is stateless, so logout is handled client-side by removing the token
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"message":"logged out successfully"}`))
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	adminID, ok := middleware.GetAdminIDFromContext(r)
	if !ok {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var admin domain.Admin
	db := database.GetDB()
	if err := db.First(&admin, adminID).Error; err != nil {
		http.Error(w, `{"error":"admin not found"}`, http.StatusNotFound)
		return
	}

	resp := map[string]interface{}{
		"id":    admin.ID,
		"email": admin.Email,
		"name":  admin.Name,
		"created_at": admin.CreatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// Helper to create initial admin (for development)
func CreateInitialAdmin() error {
	db := database.GetDB()
	
	// Check if admin already exists
	var count int64
	db.Model(&domain.Admin{}).Count(&count)
	if count > 0 {
		return nil // Admin already exists
	}

	hashedPassword, err := HashPassword("admin123") // TODO: Change in production
	if err != nil {
		return err
	}

	admin := domain.Admin{
		Email:        "admin@seerah.com",
		PasswordHash: hashedPassword,
		Name:         "Admin",
	}

	return db.Create(&admin).Error
}
