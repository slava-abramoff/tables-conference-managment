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
