package service

import (
	"context"
	"table-api/internal/repository"
	"table-api/pkg/utils"
)

type ShortLinkService interface {
	GetUrl(ctx context.Context, code string) (*string, error)
	ShortUrl(ctx context.Context, url string) (*string, error)
}

type shortLinkService struct {
	shortLinkRepo repository.ShortLinkRepository
}

func NewShortLinkService(repo repository.ShortLinkRepository) ShortLinkService {
	return &shortLinkService{shortLinkRepo: repo}
}

func (s *shortLinkService) GetUrl(ctx context.Context, code string) (*string, error) {
	shortLink, err := s.shortLinkRepo.GetByCode(ctx, code)
	if err != nil {
		return nil, err
	}

	if err := s.shortLinkRepo.IncrementClickCount(ctx, shortLink.ID); err != nil {
		return nil, err
	}

	return &shortLink.URL, nil
}

func (s *shortLinkService) ShortUrl(ctx context.Context, url string) (*string, error) {
	var code string

	for {
		newCode, err := utils.GenerateCode(3)
		if err != nil {
			return nil, err
		}

		if s.shortLinkRepo.IsUnique(ctx, newCode) {
			code = newCode
			break
		}
	}

	shortLink, err := s.shortLinkRepo.Create(ctx, url, code)
	if err != nil {
		return nil, err
	}

	return &shortLink.Code, nil
}
