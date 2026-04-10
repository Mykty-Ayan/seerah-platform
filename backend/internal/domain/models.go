package domain

import (
	"time"

	"gorm.io/gorm"
)

// Lecturer represents a lecturer/speaker
type Lecturer struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	Bio       string         `json:"bio"`
	AvatarURL string         `json:"avatar_url"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Category represents course categories (Құран, Ақида, Фиқһ, etc.)
type Category struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	Slug      string         `gorm:"uniqueIndex;not null" json:"slug"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Course represents a course/series of video lectures
type Course struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Title        string         `gorm:"not null" json:"title"`
	Description  string         `json:"description"`
	LecturerID   uint           `json:"lecturer_id"`
	Lecturer     Lecturer       `gorm:"foreignKey:LecturerID" json:"lecturer,omitempty"`
	CategoryID   uint           `json:"category_id"`
	Category     Category       `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	ThumbnailURL string         `json:"thumbnail_url"`
	TotalVideos  int            `gorm:"default:0" json:"total_videos"`
	IsFeatured   bool           `gorm:"default:false;index" json:"is_featured"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// Video represents a single video episode in a course
type Video struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	CourseID     uint           `gorm:"index;not null" json:"course_id"`
	Title        string         `gorm:"not null" json:"title"`
	Description  string         `json:"description"`
	VideoURL     string         `gorm:"not null" json:"video_url"`
	ThumbnailURL string         `json:"thumbnail_url"`
	Duration     int            `json:"duration"` // in seconds
	OrderIndex   int            `gorm:"not null" json:"order_index"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// User represents a platform user (anonymous with device_id for MVP)
type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	DeviceID  string         `gorm:"uniqueIndex" json:"device_id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// UserCourseProgress tracks user progress in courses
type UserCourseProgress struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	UserID         uint           `gorm:"index;not null" json:"user_id"`
	CourseID       uint           `gorm:"index;not null" json:"course_id"`
	CompletedVideos int           `gorm:"default:0" json:"completed_videos"`
	LastWatchedAt  *time.Time     `json:"last_watched_at"`
	IsCompleted    bool           `gorm:"default:false" json:"is_completed"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

// UserVideoWatched tracks which videos a user has watched
type UserVideoWatched struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"index;not null" json:"user_id"`
	VideoID   uint           `gorm:"index;not null" json:"video_id"`
	WatchedAt time.Time      `json:"watched_at"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Admin represents admin users
type Admin struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Email        string         `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string         `gorm:"not null" json:"-"`
	Name         string         `json:"name"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
