package service

import (
	"context"
	"fmt"
	"io"
	"reflect"
	"strconv"
	"strings"
	"table-api/internal/entitys"
	"table-api/internal/handler/dto"
	"table-api/internal/mappers"
	"table-api/internal/models"
	"time"

	"github.com/xuri/excelize/v2"
)

type LectureRepository interface {
	Create(ctx context.Context, lecture *models.Lecture) (*models.Lecture, error)
	CreateMany(ctx context.Context, lectures []*models.Lecture) ([]*models.Lecture, error)
	Update(ctx context.Context, id int, updates map[string]interface{}) (*models.Lecture, error)
	Delete(ctx context.Context, id int) (*models.Lecture, error)
	UpdateURLsByGroup(ctx context.Context, groupName string, url string, shortURL string) ([]*models.Lecture, error)
	FindByDateRange(ctx context.Context, start, end time.Time) ([]*models.Lecture, error)
	FindByExactDate(ctx context.Context, date time.Time) ([]*models.Lecture, error)
	FindForSchedule(ctx context.Context, year, month int) ([]*models.Lecture, error)
	FindWithUniqueDates(ctx context.Context) ([]*models.Lecture, error)
	FindByDatesAndGroup(ctx context.Context, startDate, endDate time.Time, groupName *string) ([]*models.Lecture, error)
}

type ShortLinkService interface {
	GetUrl(ctx context.Context, code string) (*string, error)
	ShortUrl(ctx context.Context, url string) (*string, error)
}

type lectureService struct {
	lectureRepo      LectureRepository
	shortLinkService ShortLinkService
}

func NewLectureService(
	repo LectureRepository,
	s ShortLinkService,
) *lectureService {
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
			yearEntity.Months = append(yearEntity.Months, &month)
		}

		result.Years = append(result.Years, yearEntity)
	}

	return result, nil
}

func (l *lectureService) GetSchedule(
	ctx context.Context,
	year, month int,
) ([]*entitys.DailySchedule, error) {

	lectures, err := l.lectureRepo.FindForSchedule(ctx, year, month)
	if err != nil {
		return nil, err
	}

	byDate := make(map[string][]*models.Lecture)

	for _, lecture := range lectures {
		key := lecture.Date.Format("2006-01-02")
		byDate[key] = append(byDate[key], lecture)
	}

	var schedules []*entitys.DailySchedule

	for date, dayLectures := range byDate {
		schedule := &entitys.DailySchedule{
			Date:         date,
			LectureCount: len(dayLectures),
		}

		groupSet := make(map[string]struct{})
		lectorSet := make(map[string]struct{})

		for _, lecture := range dayLectures {
			if lecture.Group != nil {
				groupSet[*lecture.Group] = struct{}{}
			}

			if lecture.Lector != nil {
				lectorSet[*lecture.Lector] = struct{}{}
			}
		}

		for g := range groupSet {
			schedule.Groups = append(schedule.Groups, g)
		}

		for l := range lectorSet {
			schedule.Lectors = append(schedule.Lectors, l)
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
		updates["start"] = *dto.Start
	}

	if dto.End != nil {
		updates["end"] = *dto.End
	}

	return l.lectureRepo.Update(ctx, id, updates)
}

func (l *lectureService) Remove(ctx context.Context, id int) (*models.Lecture, error) {
	return l.lectureRepo.Delete(ctx, id)
}

func (l *lectureService) Export(
	ctx context.Context,
	filter dto.ExportLecturesExcelRequest,
	writer io.Writer,
) error {
	if filter.StartDate.IsZero() || filter.EndDate.IsZero() {
		return fmt.Errorf("invalid date range")
	}

	lectures, err := l.lectureRepo.FindByDatesAndGroup(
		ctx,
		filter.StartDate,
		filter.EndDate,
		filter.Group,
	)
	if err != nil {
		return err
	}

	f := excelize.NewFile()
	sheet := "Lectures"
	index, _ := f.NewSheet(sheet)
	f.SetActiveSheet(index)

	headers := []string{
		"ID", "Дата", "Начало", "Конец", "Группа", "Лектор",
		"Платформа", "Корпус", "Место", "Ссылка", "Ключ потока",
		"Описание", "Админ",
	}

	headerStyle, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Bold:  true,
			Color: "#FFFFFF",
			Size:  12,
		},
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#4CAF50"},
			Pattern: 1,
		},
		Alignment: &excelize.Alignment{
			Horizontal: "center",
			Vertical:   "center",
		},
		Border: []excelize.Border{
			{Type: "left", Color: "000000", Style: 1},
			{Type: "top", Color: "000000", Style: 1},
			{Type: "right", Color: "000000", Style: 1},
			{Type: "bottom", Color: "000000", Style: 1},
		},
	})

	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
		f.SetCellStyle(sheet, cell, cell, headerStyle)
	}

	dataStyle, _ := f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{
			Horizontal: "left",
			Vertical:   "center",
		},
		Border: []excelize.Border{
			{Type: "left", Color: "000000", Style: 1},
			{Type: "top", Color: "000000", Style: 1},
			{Type: "right", Color: "000000", Style: 1},
			{Type: "bottom", Color: "000000", Style: 1},
		},
	})

	for i, lecture := range lectures {
		row := i + 2

		f.SetCellValue(sheet, "A"+strconv.Itoa(row), lecture.ID)
		f.SetCellValue(sheet, "B"+strconv.Itoa(row), lecture.Date.Format("2006-01-02"))

		if lecture.Start != nil {
			f.SetCellValue(sheet, "C"+strconv.Itoa(row), *lecture.Start)
		}
		if lecture.End != nil {
			f.SetCellValue(sheet, "D"+strconv.Itoa(row), *lecture.End)
		}

		cells := map[string]*string{
			"E": lecture.Group,
			"F": lecture.Lector,
			"G": lecture.Platform,
			"H": lecture.Unit,
			"I": lecture.Location,
			"J": lecture.ShortURL,
			"K": lecture.StreamKey,
			"L": lecture.Description,
			"M": lecture.Admin,
		}

		for col, val := range cells {
			if val != nil {
				f.SetCellValue(sheet, col+strconv.Itoa(row), *val)
			}
		}

		f.SetCellStyle(sheet, "A"+strconv.Itoa(row), "M"+strconv.Itoa(row), dataStyle)
	}

	// Автоматическая ширина колонок
	for i := 1; i <= len(headers); i++ {
		col, _ := excelize.ColumnNumberToName(i)
		maxLen := len(headers[i-1])

		for j := 0; j < len(lectures); j++ {
			var val string

			switch col {
			case "A":
				val = strconv.Itoa(lectures[j].ID)
			case "B":
				val = lectures[j].Date.Format("2006-01-02")
			case "C":
				if lectures[j].Start != nil {
					val = *lectures[j].Start
				}
			case "D":
				if lectures[j].End != nil {
					val = *lectures[j].End
				}
			case "E":
				if lectures[j].Group != nil {
					val = *lectures[j].Group
				}
			case "F":
				if lectures[j].Lector != nil {
					val = *lectures[j].Lector
				}
			case "G":
				if lectures[j].Platform != nil {
					val = *lectures[j].Platform
				}
			case "H":
				if lectures[j].Unit != nil {
					val = *lectures[j].Unit
				}
			case "I":
				if lectures[j].Location != nil {
					val = *lectures[j].Location
				}
			case "J":
				if lectures[j].ShortURL != nil {
					val = *lectures[j].ShortURL
				}
			case "K":
				if lectures[j].StreamKey != nil {
					val = *lectures[j].StreamKey
				}
			case "L":
				if lectures[j].Description != nil {
					val = *lectures[j].Description
				}
			case "M":
				if lectures[j].Admin != nil {
					val = *lectures[j].Admin
				}
			}

			if len(val) > maxLen {
				maxLen = len(val)
			}
		}

		f.SetColWidth(sheet, col, col, float64(maxLen+2))
	}

	return f.Write(writer)
}
