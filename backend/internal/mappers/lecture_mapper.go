package mappers

import (
	"table-api/internal/handler/dto"
	"table-api/internal/models"
	common "table-api/pkg"
	"time"
)

func DtoToLecture(dto dto.CreateLectureRequest) (*models.Lecture, error) {
	lecture := models.Lecture{
		Group:        dto.Group,
		Lector:       dto.Lector,
		Platform:     dto.Platform,
		Unit:         dto.Unit,
		Location:     dto.Location,
		URL:          dto.URL,
		ShortURL:     dto.ShortURL,
		StreamKey:    dto.StreamKey,
		Description:  dto.Description,
		Admin:        dto.Admin,
		Date:         dto.Date,
		AbnormalTime: dto.AbnormalTime,
	}

	if dto.Start != nil {
		t, err := time.Parse("15:04", *dto.Start)
		if err != nil {
			return nil, common.ErrInvalidInput
		}
		lecture.Start = &t
	}

	if dto.End != nil {
		t, err := time.Parse("15:04", *dto.End)
		if err != nil {
			return nil, common.ErrInvalidInput
		}
		lecture.End = &t
	}

	return &lecture, nil
}

func DtoToManyLecture(dtos []dto.CreateLectureRequest) ([]*models.Lecture, error) {
	var lectures []*models.Lecture
	for _, v := range dtos {
		lecture, err := DtoToLecture(v)
		if err != nil {
			return nil, err
		}

		lectures = append(lectures, lecture)
	}

	return lectures, nil
}
