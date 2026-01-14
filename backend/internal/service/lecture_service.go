package service

import (
	"context"
	"reflect"
	"table-api/internal/entitys"
	"table-api/internal/handler/dto"
	"table-api/internal/mappers"
	"table-api/internal/models"
	"table-api/internal/repository"
	"time"
)

type LectureService interface {
	Create(ctx context.Context, dto dto.CreateLectureRequest) (*models.Lecture, error)
	CreateMany(ctx context.Context, dtos []dto.CreateLectureRequest) ([]*models.Lecture, error)
	CreateManyLinks(ctx context.Context, dto dto.UpdateManyLinksRequest) ([]*models.Lecture, error)
	GetDates(ctx context.Context) (*entitys.LectureDates, error)
	GetSchedule(ctx context.Context, year, month string) ([]*entitys.DailySchedule, error)
	GetByDate(ctx context.Context, date time.Time) ([]*models.Lecture, error)
	Update(ctx context.Context, id int, dto dto.UpdateLectureRequest) (*models.Lecture, error)

	// ExportExcel(dto GetExcelLecturesDTO) ([]map[string]interface{}, error)

	Remove(ctx context.Context, id int) (*models.Lecture, error)
}

type lectureService struct {
	repo repository.LectureRepository
}

func NewLectureService(repo repository.LectureRepository) LectureService {
	return &lectureService{repo: repo}
}

func (l *lectureService) Create(ctx context.Context, dto dto.CreateLectureRequest) (*models.Lecture, error) {
	newLecture, err := mappers.DtoToLecture(dto)
	if err != nil {
		return nil, err
	}

	if newLecture.URL != nil {
		// TODO: shorted url
	}

	return l.repo.Create(ctx, newLecture)
}

func (l *lectureService) CreateMany(ctx context.Context, dto []dto.CreateLectureRequest) ([]*models.Lecture, error) {
	newLectures, err := mappers.DtoToManyLecture(dto)
	if err != nil {
		return nil, err
	}

	return l.repo.CreateMany(ctx, newLectures)
}

func (l *lectureService) CreateManyLinks(ctx context.Context, dto dto.UpdateManyLinksRequest) ([]*models.Lecture, error) {
	// TODO: shorted url
	return l.repo.UpdateURLsByGroup(ctx, dto.GroupName, dto.Url, "Short")
}

func (l *lectureService) GetDates(ctx context.Context) (*entitys.LectureDates, error) {
	lectures, err := l.repo.FindWithUniqueDates(ctx)
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

func (l *lectureService) GetSchedule(ctx context.Context, year, month string) ([]*entitys.DailySchedule, error) {
	lectures, err := l.repo.FindForSchedule(ctx, year, month)
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
	return l.repo.FindByExactDate(ctx, date)
}

func (l *lectureService) Update(ctx context.Context, id int, dto dto.UpdateLectureRequest) (*models.Lecture, error) {
	updates := map[string]interface{}{}

	v := reflect.ValueOf(dto)
	t := reflect.TypeOf(dto)

	for i := 0; i < v.NumField(); i++ {
		fieldName := t.Field(i).Name
		fieldValue := v.Field(i).Interface()

		if fieldValue != nil && fieldValue != "" {
			updates[fieldName] = fieldValue
		}
	}

	return l.repo.Update(ctx, id, updates)
}

func (l *lectureService) Remove(ctx context.Context, id int) (*models.Lecture, error) {
	return l.repo.Delete(ctx, id)
}
