package service

import (
	"context"
	"fmt"
	"io"
	"log"
	"strconv"
	"table-api/internal/config"
	"table-api/internal/entities"

	"table-api/internal/handler/dto"
	"table-api/internal/mappers"
	"table-api/internal/models"
	"time"

	"github.com/xuri/excelize/v2"
)

type MeetRepository interface {
	Create(ctx context.Context, meet *models.Meet) (*models.Meet, error)
	Update(ctx context.Context, id int, updates map[string]interface{}) (*models.Meet, error)
	List(ctx context.Context, page, limit int, filter dto.GetQueryMeetDto) ([]*models.Meet, *entities.Pagination, error)
	GetByID(ctx context.Context, id int) (*models.Meet, error)
	FindByDateRange(ctx context.Context, start, end time.Time) ([]*models.Meet, error)
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

func (m *meetService) Export(ctx context.Context, filter dto.ExportMeetsExcelRequest, writer io.Writer) error {
	if filter.Start.IsZero() || filter.End.IsZero() {
		return fmt.Errorf("invalid date range")
	}

	meets, err := m.meetRepo.FindByDateRange(ctx, filter.Start, filter.End)
	if err != nil {
		return err
	}

	f := excelize.NewFile()
	sheet := "Meets"
	index, _ := f.NewSheet(sheet)
	f.SetActiveSheet(index)

	headers := []string{
		"ID", "Название", "ФИО", "Почта", "Телефон", "Начало", "Конец", "Место",
		"Платформа", "Оборудование", "URL", "Короткий URL", "Статус", "Примечание",
		"Админ", "Создано", "Обновлено",
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

	for i, meet := range meets {
		row := i + 2

		f.SetCellValue(sheet, "A"+strconv.Itoa(row), meet.ID)

		if meet.Start != nil {
			f.SetCellValue(sheet, "M"+strconv.Itoa(row), *meet.Start)
		}

		if meet.End != nil {
			f.SetCellValue(sheet, "N"+strconv.Itoa(row), *meet.End)
		}

		cells := map[string]*string{
			"B": meet.EventName,
			"C": meet.CustomerName,
			"D": meet.Email,
			"E": meet.Phone,
			"F": meet.Location,
			"G": meet.Platform,
			"H": meet.Devices,
			"I": meet.URL,
			"J": meet.ShortURL,
			"K": meet.Description,
			"L": meet.Admin,
		}

		for col, val := range cells {
			if val != nil {
				f.SetCellValue(sheet, col+strconv.Itoa(row), *val)
			}
		}

		f.SetCellStyle(sheet, "A"+strconv.Itoa(row), "N"+strconv.Itoa(row), dataStyle)
	}

	for i := 1; i <= len(headers); i++ {
		col, _ := excelize.ColumnNumberToName(i)
		maxLen := len(headers[i-1])

		for j := 0; j < len(meets); j++ {
			var val string

			switch col {
			case "A":
				val = strconv.Itoa(meets[j].ID)
			case "B":
				if meets[j].EventName != nil {
					val = *meets[j].EventName
				}
			case "C":
				if meets[j].CustomerName != nil {
					val = *meets[j].CustomerName
				}
			case "D":
				if meets[j].Email != nil {
					val = *meets[j].Email
				}
			case "E":
				if meets[j].Phone != nil {
					val = *meets[j].Phone
				}
			case "F":
				if meets[j].Location != nil {
					val = *meets[j].Location
				}
			case "G":
				if meets[j].Platform != nil {
					val = *meets[j].Platform
				}
			case "H":
				if meets[j].Devices != nil {
					val = *meets[j].Devices
				}
			case "I":
				if meets[j].URL != nil {
					val = *meets[j].URL
				}
			case "J":
				if meets[j].ShortURL != nil {
					val = *meets[j].ShortURL
				}
			case "K":
				if meets[j].Description != nil {
					val = *meets[j].Description
				}
			case "L":
				if meets[j].Admin != nil {
					val = *meets[j].Admin
				}
			case "M":
				if meets[j].Start != nil {
					val = meets[j].Start.Format("2006-01-02")
				}
			case "N":
				if meets[j].End != nil {
					val = meets[j].End.Format("2006-01-02")
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
