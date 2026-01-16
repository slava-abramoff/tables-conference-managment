package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"table-api/internal/handler/dto"
	"table-api/internal/mappers"
	"table-api/internal/service"
	httprespond "table-api/pkg/http"
	"table-api/pkg/utils"
	"time"

	"github.com/julienschmidt/httprouter"
)

type LectureHandlers struct {
	lectureService service.LectureService
}

func NewLectureHandlers(s service.LectureService) *LectureHandlers {
	return &LectureHandlers{lectureService: s}
}

func (l *LectureHandlers) Create(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx := r.Context()

	var req dto.CreateLectureRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	if message, err := dto.Validate(w, req); err != nil {
		httprespond.ErrorResponse(w, message, http.StatusBadRequest)
		return
	}

	newLecture, err := l.lectureService.Create(ctx, req)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	resp := mappers.LectureToDto(newLecture)
	httprespond.JsonResponse(w, resp, 201)
}

func (l *LectureHandlers) CreateMany(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx := r.Context()

	var req dto.CreateLecturesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	if message, err := dto.Validate(w, req); err != nil {
		httprespond.ErrorResponse(w, message, http.StatusBadRequest)
		return
	}

	newLectures, err := l.lectureService.CreateMany(ctx, req.Lectures)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	resp := mappers.ManyLectureToDto(newLectures)
	httprespond.JsonResponse(w, resp, 201)
}

func (l *LectureHandlers) GetDates(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx := r.Context()

	resp, err := l.lectureService.GetDates(ctx)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	httprespond.JsonResponse(w, resp, 200)
}

func (l *LectureHandlers) GetByDates(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	ctx := r.Context()

	dateStr := ps.ByName("date")
	parsedDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	resp, err := l.lectureService.GetByDate(ctx, parsedDate)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	httprespond.JsonResponse(w, resp, 200)
}

func (l *LectureHandlers) GetSchedule(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx := r.Context()

	year := r.URL.Query().Get("year")
	month := r.URL.Query().Get("month")

	parsedYear, parsedMonth, err := utils.ParseYearMonth(year, month)

	schedule, err := l.lectureService.GetSchedule(ctx, parsedYear, parsedMonth)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	resp := dto.DailySchedulesResponse{Data: schedule}

	httprespond.JsonResponse(w, resp, 200)
}

func (l *LectureHandlers) Update(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	ctx := r.Context()

	lectureIdStr := ps.ByName("id")
	id, err := strconv.Atoi(lectureIdStr)
	if err != nil {
		httprespond.ErrorResponse(w, "Invalid lecture ID", http.StatusBadRequest)
		return
	}

	var req dto.UpdateLectureRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	if message, err := dto.Validate(w, req); err != nil {
		httprespond.ErrorResponse(w, message, http.StatusBadRequest)
		return
	}

	resp, err := l.lectureService.Update(ctx, id, req)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	httprespond.JsonResponse(w, resp, http.StatusOK)
}

func (l *LectureHandlers) CreateManyLinks(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx := r.Context()

	var req dto.UpdateManyLinksRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	if message, err := dto.Validate(w, req); err != nil {
		httprespond.ErrorResponse(w, message, http.StatusBadRequest)
		return
	}

	resp, err := l.lectureService.CreateManyLinks(ctx, req)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	httprespond.JsonResponse(w, resp, http.StatusOK)
}

func (l *LectureHandlers) Remove(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	ctx := r.Context()

	lectureIdStr := ps.ByName("id")
	id, err := strconv.Atoi(lectureIdStr)
	if err != nil {
		httprespond.ErrorResponse(w, "Invalid lecture ID", http.StatusBadRequest)
		return
	}

	resp, err := l.lectureService.Remove(ctx, id)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	httprespond.JsonResponse(w, resp, http.StatusOK)
}
