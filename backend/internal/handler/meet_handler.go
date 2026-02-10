package handler

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"time"

	"table-api/internal/entities"
	"table-api/internal/handler/dto"
	"table-api/internal/mappers"
	"table-api/internal/models"
	httprespond "table-api/pkg/http"

	"github.com/julienschmidt/httprouter"
)

type MeetService interface {
	Create(ctx context.Context, dto dto.CreateMeetRequest) (*models.Meet, error)
	Update(ctx context.Context, id int, dto dto.UpdateMeetRequest) (*models.Meet, error)
	List(ctx context.Context, page, limit int, filter dto.GetQueryMeetDto) ([]*models.Meet, *entities.Pagination, error)
	Export(ctx context.Context, filter dto.ExportMeetsExcelRequest, writer io.Writer) error
}

type MeetHandlers struct {
	meetService MeetService
}

func NewMeetHandlers(s MeetService) *MeetHandlers {
	return &MeetHandlers{meetService: s}
}

func (m *MeetHandlers) Create(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx := r.Context()

	var req dto.CreateMeetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	if message, err := dto.Validate(req); err != nil {
		httprespond.ErrorResponse(w, message, http.StatusBadRequest)
		return
	}

	newMeet, err := m.meetService.Create(ctx, req)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	resp := mappers.MeetToDto(newMeet)
	httprespond.JsonResponse(w, resp, 201)
}

func (m *MeetHandlers) FindMany(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx := r.Context()
	q := r.URL.Query()

	page := q.Get("page")
	limit := q.Get("limit")

	pageInt, err1 := strconv.Atoi(page)
	limitInt, err2 := strconv.Atoi(limit)
	if err1 != nil || err2 != nil {
		httprespond.ErrorResponse(w, "Page and limit must be int", http.StatusBadRequest)
		return
	}

	var filters dto.GetQueryMeetDto

	if statusStr := q.Get("status"); statusStr != "" {
		status := dto.Status(statusStr)
		filters.Status = &status
	}

	if sortBy := q.Get("sortBy"); sortBy != "" {
		filters.SortBy = &sortBy
	}

	if orderStr := q.Get("order"); orderStr != "" {
		order := dto.SortOrder(orderStr)
		filters.Order = &order
	}

	if message, err := dto.Validate(filters); err != nil {
		httprespond.ErrorResponse(w, message, http.StatusBadRequest)
		return
	}

	meets, pagination, err := m.meetService.List(ctx, pageInt, limitInt, filters)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	meetsData := mappers.MeetsToDto(meets)
	paginationData := dto.PaginationResponse{
		CurrentPage:  pagination.CurrentPage,
		TotalItems:   pagination.TotalItems,
		TotalPages:   pagination.TotalPages,
		ItemsPerPage: pagination.ItemsPerPage,
		HasNextPage:  pagination.HasNextPage,
	}

	resp := dto.PaginatedResponse[dto.MeetResponse]{
		Data:       meetsData,
		Pagination: paginationData,
	}

	httprespond.JsonResponse(w, resp, http.StatusOK)
}

func (m *MeetHandlers) Update(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	ctx := r.Context()

	meetIdStr := ps.ByName("id")
	id, err := strconv.Atoi(meetIdStr)
	if err != nil {
		httprespond.ErrorResponse(w, "Invalid lecture ID", http.StatusBadRequest)
		return
	}

	var req dto.UpdateMeetRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	if message, err := dto.Validate(req); err != nil {
		httprespond.ErrorResponse(w, message, http.StatusBadRequest)
		return
	}

	updatedMeet, err := m.meetService.Update(ctx, id, req)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	resp := mappers.MeetToDto(updatedMeet)

	httprespond.JsonResponse(w, resp, http.StatusOK)
}

func (m *MeetHandlers) ExportExcel(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx := r.Context()

	q := r.URL.Query()
	start := q.Get("start")
	end := q.Get("end")

	startDate, err := time.Parse("2006-01-02", start)
	if err != nil {
		httprespond.ErrorResponse(w, "Start must be date YYYY-MM-DD", http.StatusBadRequest)
		return
	}
	endDate, err := time.Parse("2006-01-02", end)
	if err != nil {
		httprespond.ErrorResponse(w, "End must be date YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	filter := dto.ExportMeetsExcelRequest{
		Start: startDate,
		End:   endDate,
	}

	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set(`Content-Disposition`, `attachment; filename="meets.xlsx"`)

	if err := m.meetService.Export(ctx, filter, w); err != nil {
		httprespond.HandleErrorResponse(w, err)
	}
}
