package database

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/ayan/seerah-backend/internal/config"
	"github.com/ayan/seerah-backend/internal/domain"
)

var DB *gorm.DB

func Connect(cfg *config.Config) error {
	dsn := cfg.GetDatabaseURL()
	
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("✅ Connected to database successfully")
	return nil
}

func Migrate() error {
	if DB == nil {
		return fmt.Errorf("database not connected")
	}

	log.Println("🔄 Running migrations...")
	
	err := DB.AutoMigrate(
		&domain.Lecturer{},
		&domain.Category{},
		&domain.Course{},
		&domain.Video{},
		&domain.User{},
		&domain.UserCourseProgress{},
		&domain.UserVideoWatched{},
		&domain.Admin{},
	)
	
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("✅ Migrations completed successfully")
	return nil
}

func GetDB() *gorm.DB {
	return DB
}
