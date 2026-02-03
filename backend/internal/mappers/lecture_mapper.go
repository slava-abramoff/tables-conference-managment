package mappers

import (
	"table-api/internal/handler/dto"
	"table-api/internal/models"
)

func DtoToLecture(dto dto.CreateLectureRequest) (*models.Lecture, error) {
	return &models.Lecture{
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
		Start:        dto.Start,
		End:          dto.End,
		AbnormalTime: dto.AbnormalTime,
	}, nil
}

func LectureToDto(lecture *models.Lecture) *dto.LectureResponse {
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
		Start:        lecture.Start,
		End:          lecture.End,
		AbnormalTime: lecture.AbnormalTime,
		CreatedAt:    lecture.CreatedAt,
		UpdatedAt:    lecture.UpdatedAt,
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
