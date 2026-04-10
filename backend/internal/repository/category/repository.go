package category

import (
	"github.com/ayan/seerah-backend/internal/domain"
	"gorm.io/gorm"
	"strings"
	"unicode"
)

type CategoryRepository interface {
	Create(category *domain.Category) error
	GetByID(id uint) (*domain.Category, error)
	GetBySlug(slug string) (*domain.Category, error)
	List() ([]domain.Category, error)
	Update(category *domain.Category) error
	Delete(id uint) error
}

type categoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) CategoryRepository {
	return &categoryRepository{db: db}
}

func generateSlug(name string) string {
	// Simple slugify: lowercase, replace spaces with hyphens, remove non-alphanumeric
	slug := strings.ToLower(name)
	var result []rune
	for _, r := range slug {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			result = append(result, r)
		} else if r == ' ' {
			result = append(result, '-')
		}
	}
	return string(result)
}

func (r *categoryRepository) Create(category *domain.Category) error {
	if category.Slug == "" {
		category.Slug = generateSlug(category.Name)
	}
	return r.db.Create(category).Error
}

func (r *categoryRepository) GetByID(id uint) (*domain.Category, error) {
	var category domain.Category
	err := r.db.First(&category, id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *categoryRepository) GetBySlug(slug string) (*domain.Category, error) {
	var category domain.Category
	err := r.db.Where("slug = ?", slug).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *categoryRepository) List() ([]domain.Category, error) {
	var categories []domain.Category
	err := r.db.Order("name ASC").Find(&categories).Error
	return categories, err
}

func (r *categoryRepository) Update(category *domain.Category) error {
	return r.db.Save(category).Error
}

func (r *categoryRepository) Delete(id uint) error {
	return r.db.Delete(&domain.Category{}, id).Error
}
