package middleware

import (
	"context"
	"net/http"
	"strings"

	seerahjwt "github.com/ayan/seerah-backend/pkg/jwt"
)

type contextKey string

const AdminIDKey contextKey = "admin_id"

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error":"missing authorization header"}`, http.StatusUnauthorized)
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, `{"error":"invalid authorization format"}`, http.StatusUnauthorized)
			return
		}

		claims, err := seerahjwt.ValidateToken(parts[1])
		if err != nil {
			http.Error(w, `{"error":"invalid or expired token"}`, http.StatusUnauthorized)
			return
		}

		// Add admin ID to context
		ctx := context.WithValue(r.Context(), AdminIDKey, claims.AdminID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func GetAdminIDFromContext(r *http.Request) (uint, bool) {
	adminID, ok := r.Context().Value(AdminIDKey).(uint)
	return adminID, ok
}
