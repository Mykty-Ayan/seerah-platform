package lecturer

import (
	"github.com/ayan/seerah-backend/internal/domain"
	"gorm.io/gorm"
)

type LecturerRepository interface {
	Create(lecturer *domain.Lecturer) error
	GetByID(id uint) (*domain.Lecturer, error)
	List(page, limit int) ([]domain.Lecturer, int64, error)
	Update(lecturer *domain.Lecturer) error
	Delete(id uint) error
}

type lecturerRepository struct {
	db *gorm.DB
}

func NewLecturerRepository(db *gorm.DB) LecturerRepository {
	return &lecturerRepository{db: db}
}

func (r *lecturerRepository) Create(lecturer *domain.Lecturer) error {
	return r.db.Create(lecturer).Error
}

func (r *lecturerRepository) GetByID(id uint) (*domain.Lecturer, error) {
	var lecturer domain.Lecturer
	err := r.db.First(&lecturer, id).Error
	if err != nil {
		return nil, err
	}
	return &lecturer, nil
}

func (r *lecturerRepository) List(page, limit int) ([]domain.Lecturer, int64, error) {
	var lecturers []domain.Lecturer
	var total int64

	offset := (page - 1) * limit
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	err := r.db.Model(&domain.Lecturer{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = r.db.Offset(offset).Limit(limit).Order("created_at DESC").Find(&lecturers).Error
	if err != nil {
		return nil, 0, err
	}

	return lecturers, total, nil
}

func (r *lecturerRepository) Update(lecturer *domain.Lecturer) error {
	return r.db.Save(lecturer).Error
}

func (r *lecturerRepository) Delete(id uint) error {
	return r.db.Delete(&domain.Lecturer{}, id).Error
}
