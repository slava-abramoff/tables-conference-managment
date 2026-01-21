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
	common "table-api/pkg"
	"time"
)

type LectureService interface {
	Create(ctx context.Context, dto dto.CreateLectureRequest) (*models.Lecture, error)
	CreateMany(ctx context.Context, dtos []dto.CreateLectureRequest) ([]*models.Lecture, error)
	CreateManyLinks(ctx context.Context, dto dto.UpdateManyLinksRequest) ([]*models.Lecture, error)
	GetDates(ctx context.Context) (*entitys.LectureDates, error)
	GetSchedule(ctx context.Context, year, month int) ([]*entitys.DailySchedule, error)
	GetByDate(ctx context.Context, date time.Time) ([]*models.Lecture, error)
	Update(ctx context.Context, id int, dto dto.UpdateLectureRequest) (*models.Lecture, error)

	// ExportExcel(dto GetExcelLecturesDTO) ([]map[string]interface{}, error)
	// GetAll(ctx context.Context, page, limit int) ([]*models.Lecture, *entitys.Pagination, error)

	Remove(ctx context.Context, id int) (*models.Lecture, error)
}

type lectureService struct {
	lectureRepo      repository.LectureRepository
	shortLinkService ShortLinkService
}

func NewLectureService(
	repo repository.LectureRepository,
	s ShortLinkService,
) LectureService {
	return &lectureService{
		lectureRepo:      repo,
		shortLinkService: s,
	}
}

func (l *lectureService) Create(ctx context.Context, dto dto.CreateLectureRequest) (*models.Lecture, error) {
	newLecture, err := mappers.DtoToLecture(dto)
	if err != nil {
		return nil, err
	}

	if newLecture.URL != nil {
		shortUrl, err := l.shortLinkService.ShortUrl(ctx, *newLecture.URL)
		if err != nil {
			return nil, err
		}

		newLecture.ShortURL = shortUrl
	}

	return l.lectureRepo.Create(ctx, newLecture)
}

func (l *lectureService) CreateMany(ctx context.Context, dto []dto.CreateLectureRequest) ([]*models.Lecture, error) {
	newLectures, err := mappers.DtoToManyLecture(dto)
	if err != nil {
		return nil, err
	}

	return l.lectureRepo.CreateMany(ctx, newLectures)
}

func (l *lectureService) CreateManyLinks(ctx context.Context, dto dto.UpdateManyLinksRequest) ([]*models.Lecture, error) {
	shortUrl, err := l.shortLinkService.ShortUrl(ctx, dto.Url)
	if err != nil {
		return nil, err
	}

	return l.lectureRepo.UpdateURLsByGroup(ctx, dto.GroupName, dto.Url, *shortUrl)
}

func (l *lectureService) GetDates(ctx context.Context) (*entitys.LectureDates, error) {
	lectures, err := l.lectureRepo.FindWithUniqueDates(ctx)
	if err != nil {
		return nil, err
	}

	yearMap := make(map[string]map[string]struct{})

	for _, lecture := range lectures {
		year := lecture.Date.Format("2006")
		month := lecture.Date.Format("January")

		if _, ok := yearMap[year]; !ok {
			yearMap[year] = make(map[string]struct{})
		}

		yearMap[year][month] = struct{}{}
	}

	result := &entitys.LectureDates{}

	for year, monthsMap := range yearMap {
		yearEntity := &entitys.LectureYear{
			Year: year,
		}

		for month := range monthsMap {
			yearEntity.Months = append(yearEntity.Months, &entitys.LectureMonth{
				Month: month,
			})
		}

		result.Years = append(result.Years, yearEntity)
	}

	return result, nil
}

func (l *lectureService) GetSchedule(ctx context.Context, year, month int) ([]*entitys.DailySchedule, error) {
	lectures, err := l.lectureRepo.FindForSchedule(ctx, year, month)
	if err != nil {
		return nil, err
	}

	var schedules []*entitys.DailySchedule
	m := make(map[string][]*models.Lecture)

	for _, v := range lectures {
		key := v.Date.Format("2006-01-02")
		m[key] = append(m[key], v)
	}

	for key, v := range m {
		schedule := &entitys.DailySchedule{}

		schedule.Date = key
		schedule.LectureCount = len(v)

		for _, el := range v {
			schedule.Groups = append(schedule.Groups, *el.Group)
			schedule.Lectors = append(schedule.Lectors, *el.Lector)
		}

		schedules = append(schedules, schedule)
	}

	return schedules, nil
}

func (l *lectureService) GetByDate(ctx context.Context, date time.Time) ([]*models.Lecture, error) {
	return l.lectureRepo.FindByExactDate(ctx, date)
}

func (l *lectureService) Update(
	ctx context.Context,
	id int,
	dto dto.UpdateLectureRequest,
) (*models.Lecture, error) {

	updates := map[string]interface{}{}

	if dto.URL != nil && dto.ShortURL == nil {
		shortUrl, err := l.shortLinkService.ShortUrl(ctx, *dto.URL)
		if err != nil {
			return nil, err
		}
		dto.ShortURL = shortUrl
	}

	v := reflect.ValueOf(dto)
	t := reflect.TypeOf(dto)

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

		if column == "start" || column == "end" {
			continue
		}

		updates[column] = fieldValue.Interface()
	}

	if dto.Start != nil {
		t, err := time.Parse("15:04", *dto.Start)
		if err != nil {
			return nil, common.ErrInvalidInput
		}
		updates["Start"] = &t
	}

	if dto.End != nil {
		t, err := time.Parse("15:04", *dto.End)
		if err != nil {
			return nil, common.ErrInvalidInput
		}
		updates["End"] = &t
	}

	return l.lectureRepo.Update(ctx, id, updates)
}

func (l *lectureService) Remove(ctx context.Context, id int) (*models.Lecture, error) {
	return l.lectureRepo.Delete(ctx, id)
}
