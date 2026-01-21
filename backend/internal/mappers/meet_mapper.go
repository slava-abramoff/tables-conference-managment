package mappers

import (
	"table-api/internal/handler/dto"
	"table-api/internal/models"
)

func DtoToMeet(dto *dto.CreateMeetRequest) *models.Meet {
	if dto == nil {
		return nil
	}

	return &models.Meet{
		EventName:    dto.EventName,
		CustomerName: dto.CustomerName,
		Email:        dto.Email,
		Phone:        dto.Phone,
		Location:     dto.Location,
		Platform:     dto.Platform,
		Devices:      dto.Devices,
		URL:          dto.URL,
		ShortURL:     dto.ShortURL,

		Description: dto.Description,
		Admin:       dto.Admin,

		Start: dto.Start,
		End:   dto.End,
	}
}

func MeetToDto(meet *models.Meet) *dto.MeetResponse {
	if meet == nil {
		return nil
	}

	return &dto.MeetResponse{
		Id:           meet.ID,
		EventName:    meet.EventName,
		CustomerName: meet.CustomerName,
		Email:        meet.Email,
		Phone:        meet.Phone,
		Location:     meet.Location,
		Platform:     meet.Platform,
		Devices:      meet.Devices,
		URL:          meet.URL,
		ShortURL:     meet.ShortURL,

		Status:      &meet.Status,
		Description: meet.Description,
		Admin:       meet.Admin,

		Start:     meet.Start,
		End:       meet.End,
		CreatedAt: meet.CreatedAt,
		UpdatedAt: meet.UpdatedAt,
	}
}

func MeetsToDto(meets []*models.Meet) []dto.MeetResponse {
	var result []dto.MeetResponse

	for _, m := range meets {
		mr := MeetToDto(m)
		result = append(result, *mr)
	}

	return result
}
