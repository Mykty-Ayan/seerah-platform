package course

import (
	"github.com/ayan/seerah-backend/internal/domain"
	"gorm.io/gorm"
)

type CourseRepository interface {
	Create(course *domain.Course) error
	GetByID(id uint) (*domain.Course, error)
	List(page, limit int, categoryID *uint, featured *bool) ([]domain.Course, int64, error)
	Update(course *domain.Course) error
	Delete(id uint) error
	SetFeatured(id uint, featured bool) error
}

type courseRepository struct {
	db *gorm.DB
}

func NewCourseRepository(db *gorm.DB) CourseRepository {
	return &courseRepository{db: db}
}

func (r *courseRepository) Create(course *domain.Course) error {
	return r.db.Create(course).Error
}

func (r *courseRepository) GetByID(id uint) (*domain.Course, error) {
	var course domain.Course
	err := r.db.Preload("Lecturer").Preload("Category").First(&course, id).Error
	if err != nil {
		return nil, err
	}
	
	// Count videos
	var videoCount int64
	r.db.Model(&domain.Video{}).Where("course_id = ?", id).Count(&videoCount)
	course.TotalVideos = int(videoCount)
	
	return &course, nil
}

func (r *courseRepository) List(page, limit int, categoryID *uint, featured *bool) ([]domain.Course, int64, error) {
	var courses []domain.Course
	var total int64

	offset := (page - 1) * limit
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	query := r.db.Model(&domain.Course{}).Preload("Lecturer").Preload("Category")

	if categoryID != nil && *categoryID > 0 {
		query = query.Where("category_id = ?", *categoryID)
	}

	if featured != nil {
		query = query.Where("is_featured = ?", *featured)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&courses).Error
	if err != nil {
		return nil, 0, err
	}

	// Count videos for each course
	for i := range courses {
		var videoCount int64
		r.db.Model(&domain.Video{}).Where("course_id = ?", courses[i].ID).Count(&videoCount)
		courses[i].TotalVideos = int(videoCount)
	}

	return courses, total, nil
}

func (r *courseRepository) Update(course *domain.Course) error {
	return r.db.Save(course).Error
}

func (r *courseRepository) Delete(id uint) error {
	return r.db.Delete(&domain.Course{}, id).Error
}

func (r *courseRepository) SetFeatured(id uint, featured bool) error {
	return r.db.Model(&domain.Course{}).Where("id = ?", id).Update("is_featured", featured).Error
}
