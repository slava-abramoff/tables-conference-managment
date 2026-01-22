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

func LectureToDto(lecture *models.Lecture) *dto.LectureResponse {
	var startStr, endStr *string

	if lecture.Start != nil {
		s := lecture.Start.Format("15:04")
		startStr = &s
	}

	if lecture.End != nil {
		e := lecture.End.Format("15:04")
		endStr = &e
	}

	return &dto.LectureResponse{
		ID:           lecture.ID,
		Group:        lecture.Group,
		Lector:       lecture.Lector,
		Platform:     lecture.Platform,
		Unit:         lecture.Unit,
		Location:     lecture.Location,
		URL:          lecture.URL,
		ShortURL:     lecture.ShortURL,
		StreamKey:    lecture.StreamKey,
		Description:  lecture.Description,
		Admin:        lecture.Admin,
		Date:         lecture.Date,
		Start:        startStr,
		End:          endStr,
		AbnormalTime: lecture.AbnormalTime,

		CreatedAt: lecture.CreatedAt,
		UpdatedAt: lecture.UpdatedAt,
	}
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

func ManyLectureToDto(lectures []*models.Lecture) []dto.LectureResponse {
	var dtos []dto.LectureResponse
	for _, v := range lectures {
		lecture := LectureToDto(v)

		dtos = append(dtos, *lecture)
	}

	return dtos
}
