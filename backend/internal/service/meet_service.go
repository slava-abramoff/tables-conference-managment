package service

import (
	"context"
	"reflect"
	"strings"
	"table-api/internal/entitys"
	"table-api/internal/handler/dto"
	"table-api/internal/mappers"
	"table-api/internal/models"
	"table-api/internal/repository"
	"time"
)

type MeetService interface {
	Create(ctx context.Context, dto dto.CreateMeetRequest) (*models.Meet, error)
	Update(ctx context.Context, id int, dto dto.UpdateMeetRequest) (*models.Meet, error)
	List(ctx context.Context, page, limit int, filter dto.GetQueryMeetDto) ([]*models.Meet, *entitys.Pagination, error)
}

type Mailer interface {
	Send(ctx context.Context, message string) error
}

type meetService struct {
	meetRepo         repository.MeetRepository
	shortLinkService ShortLinkService
	mailService      Mailer
}

func NewMeetService(repo repository.MeetRepository, mail Mailer, s ShortLinkService) *meetService {
	return &meetService{meetRepo: repo, mailService: mail, shortLinkService: s}
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

		today := time.Now()

		if !today.After(*oldMeet.Start) {
			updates["Status"] = "approved"
		}

		code, err := m.shortLinkService.ShortUrl(ctx, *url)
		if err != nil {
			return nil, err
		}

		updates["ShortUrl"] = code
	}

	m.mailService.Send(ctx, *url)
	return m.meetRepo.Update(ctx, id, updates)
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
		m.meetRepo.MarkCompletedIfEnded()
		time.Sleep(timeout)
	}
}
