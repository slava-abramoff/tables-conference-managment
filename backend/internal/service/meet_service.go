package service

import (
	"context"
	"fmt"
	"log"
	"os"
	"reflect"
	"strings"
	"table-api/internal/entitys"
	"table-api/internal/handler/dto"
	"table-api/internal/mappers"
	"table-api/internal/models"
	"table-api/pkg/validator"
	"time"
)

type MeetRepository interface {
	Create(ctx context.Context, meet *models.Meet) (*models.Meet, error)
	Update(ctx context.Context, id int, updates map[string]interface{}) (*models.Meet, error)
	List(ctx context.Context, page, limit int, filter dto.GetQueryMeetDto) ([]*models.Meet, *entitys.Pagination, error)
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

func NewMeetService(repo MeetRepository, mail Mailer, s ShortLinkService) *meetService {
	domain := os.Getenv("SERVER_DOMAIN")

	if !validator.IsValidDomain(domain) {
		log.Fatal("Invalid SERVER_DOMAIN")
	}

	return &meetService{meetRepo: repo, mailService: mail, shortLinkService: s, domain: domain}
}

func (m *meetService) Create(ctx context.Context, dto dto.CreateMeetRequest) (*models.Meet, error) {
	meet := mappers.DtoToMeet(&dto)
	return m.meetRepo.Create(ctx, meet)
}

func (m *meetService) Update(ctx context.Context, id int, dto dto.UpdateMeetRequest) (*models.Meet, error) {

	v := reflect.ValueOf(dto)
	t := reflect.TypeOf(dto)

	updates := map[string]interface{}{}

	for i := 0; i < v.NumField(); i++ {
		fieldValue := v.Field(i)

		if fieldValue.Kind() != reflect.Ptr || fieldValue.IsNil() {
			continue
		}

		fieldType := t.Field(i)

		jsonTag := fieldType.Tag.Get("json")
		column := strings.Split(jsonTag, ",")[0]

		if column == "" || column == "-" {
			continue
		}

		updates[column] = fieldValue.Interface()
	}

	url := dto.URL

	if nil != url {
		oldMeet, err := m.meetRepo.GetByID(ctx, id)
		if err != nil {
			return nil, err
		}

		if oldMeet.Status == "new" {
			updates["status"] = "approved"
		}

		if oldMeet.URL != nil && *url != *oldMeet.URL {
			code, err := m.shortLinkService.ShortUrl(ctx, *url)
			if err != nil {
				return nil, err
			}

			updates["shortUrl"] = code
		}
	}

	updatedMeet, err := m.meetRepo.Update(ctx, id, updates)
	if err != nil {
		return nil, err
	}

	isValid := updatedMeet.ShortURL != nil &&
		updatedMeet.Email != nil &&
		updatedMeet.Start != nil &&
		updatedMeet.EventName != nil

	if isValid {
		shortcode := m.domain + "/l/" + *updatedMeet.ShortURL

		subject := fmt.Sprintf("Видеконференция %s", *updatedMeet.EventName)
		msg := fmt.Sprintf("Ссылка для подключения к ВКС: %s", shortcode)
		receiver := *updatedMeet.Email

		go m.mailService.Send(receiver, subject, msg)
	}

	return updatedMeet, nil
}

func (m *meetService) List(ctx context.Context, page, limit int, filter dto.GetQueryMeetDto) ([]*models.Meet, *entitys.Pagination, error) {
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
