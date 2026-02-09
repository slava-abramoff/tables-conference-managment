package service

import (
	"context"
	"log"
	"table-api/internal/config"
	"table-api/internal/entities"

	"table-api/internal/handler/dto"
	"table-api/internal/mappers"
	"table-api/internal/models"
	"time"
)

type MeetRepository interface {
	Create(ctx context.Context, meet *models.Meet) (*models.Meet, error)
	Update(ctx context.Context, id int, updates map[string]interface{}) (*models.Meet, error)
	List(ctx context.Context, page, limit int, filter dto.GetQueryMeetDto) ([]*models.Meet, *entities.Pagination, error)
	GetByID(ctx context.Context, id int) (*models.Meet, error)
	MarkCompletedIfEnded() error
}

type Mailer interface {
	Send(to, subject, body string)
}

type meetService struct {
	meetRepo         MeetRepository
	shortLinkService ShortLinkService
	mailService      Mailer
	domain           string
}

func NewMeetService(repo MeetRepository, mail Mailer, s ShortLinkService, cfg config.Server) *meetService {
	return &meetService{meetRepo: repo, mailService: mail, shortLinkService: s, domain: cfg.Domain}
}

func (m *meetService) Create(ctx context.Context, dto dto.CreateMeetRequest) (*models.Meet, error) {
	meet := mappers.DtoToMeet(&dto)
	return m.meetRepo.Create(ctx, meet)
}

func (m *meetService) Update(ctx context.Context, id int, dto dto.UpdateMeetRequest) (*models.Meet, error) {
	updates := map[string]interface{}{}

	oldMeet, err := m.meetRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	isNotificate := false

	if dto.EventName != nil {
		updates["eventName"] = *dto.EventName
	}

	if dto.CustomerName != nil {
		updates["customerName"] = *dto.CustomerName
	}

	if dto.Email != nil {
		updates["email"] = *dto.Email
	}

	if dto.Phone != nil {
		updates["phone"] = *dto.Phone
	}

	if dto.Location != nil {
		updates["location"] = *dto.Location
	}

	if dto.Platform != nil {
		updates["platform"] = *dto.Platform
	}

	if dto.Devices != nil {
		updates["devices"] = *dto.Devices
	}

	if dto.URL != nil {
		updates["url"] = *dto.URL

		if *dto.URL != "" {
			code, _ := m.shortLinkService.ShortUrl(ctx, *dto.URL)
			if code != nil {
				updates["shortUrl"] = *code
			}
		}

		if oldMeet.Status == "new" || oldMeet.Status == "active" {
			updates["status"] = "active"
			isNotificate = true
		}
	}

	if dto.Status != nil {
		updates["status"] = *dto.Status
	}

	if dto.Description != nil {
		updates["description"] = *dto.Description
	}

	if dto.Admin != nil {
		updates["admin"] = *dto.Admin
	}

	if dto.Start != nil {
		updates["start"] = *dto.Start
	}

	if dto.End != nil {
		updates["end"] = *dto.End
	}

	updatedMeet, err := m.meetRepo.Update(ctx, id, updates)
	if err != nil {
		return nil, err
	}

	isNotificate = updatedMeet.Email != nil &&
		*updatedMeet.Email != "" &&
		updatedMeet.EventName != nil &&
		updatedMeet.ShortURL != nil &&
		*updatedMeet.ShortURL != "" &&
		isNotificate

	if isNotificate {
		subject := "Ccылка для мероприятия " + *updatedMeet.EventName
		body := "Ссылка для подключения: " + m.domain + "/l/" + *updatedMeet.ShortURL
		go m.mailService.Send(*updatedMeet.Email, subject, body)
	}
	return updatedMeet, nil
}

func (m *meetService) List(ctx context.Context, page, limit int, filter dto.GetQueryMeetDto) ([]*models.Meet, *entities.Pagination, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	meets, pagination, err := m.meetRepo.List(ctx, page, limit, filter)
	if err != nil {
		return nil, nil, err
	}

	return meets, pagination, nil
}

func (m *meetService) AutoUpdate(timeout time.Duration) {
	for {
		if err := m.meetRepo.MarkCompletedIfEnded(); err != nil {
			log.Printf("auto update failed: %v", err)
		}
		time.Sleep(timeout)
	}
}
