package lecturer

import (
	"github.com/ayan/seerah-backend/internal/domain"
	lecturerRepo "github.com/ayan/seerah-backend/internal/repository/lecturer"
)

type LecturerService interface {
	Create(name, bio, avatarURL string) (*domain.Lecturer, error)
	GetByID(id uint) (*domain.Lecturer, error)
	List(page, limit int) ([]domain.Lecturer, int64, error)
	Update(id uint, name, bio, avatarURL string) (*domain.Lecturer, error)
	Delete(id uint) error
}

type lecturerService struct {
	repo lecturerRepo.LecturerRepository
}

func NewLecturerService(repo lecturerRepo.LecturerRepository) LecturerService {
	return &lecturerService{repo: repo}
}

func (s *lecturerService) Create(name, bio, avatarURL string) (*domain.Lecturer, error) {
	lecturer := &domain.Lecturer{
		Name:      name,
		Bio:       bio,
		AvatarURL: avatarURL,
	}

	err := s.repo.Create(lecturer)
	if err != nil {
		return nil, err
	}

	return lecturer, nil
}

func (s *lecturerService) GetByID(id uint) (*domain.Lecturer, error) {
	return s.repo.GetByID(id)
}

func (s *lecturerService) List(page, limit int) ([]domain.Lecturer, int64, error) {
	return s.repo.List(page, limit)
}

func (s *lecturerService) Update(id uint, name, bio, avatarURL string) (*domain.Lecturer, error) {
	lecturer, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	lecturer.Name = name
	lecturer.Bio = bio
	lecturer.AvatarURL = avatarURL

	err = s.repo.Update(lecturer)
	if err != nil {
		return nil, err
	}

	return lecturer, nil
}

func (s *lecturerService) Delete(id uint) error {
	return s.repo.Delete(id)
}
