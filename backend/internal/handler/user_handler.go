package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"table-api/internal/handler/dto"
	"table-api/internal/mappers"
	"table-api/internal/service"
	httprespond "table-api/pkg/http"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
)

const TIMEOUT = 10

type UserHandlers struct {
	service service.UserService
}

func NewUserHandlers(service service.UserService) *UserHandlers {
	return &UserHandlers{service: service}
}

func (u *UserHandlers) Create(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx := r.Context()

	var req dto.CreateUserRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	if message, err := dto.Validate(req); err != nil {
		httprespond.ErrorResponse(w, message, http.StatusBadRequest)
		return
	}

	body := mappers.DtoCreateRequestToUser(req)
	newUser, err := u.service.Create(ctx, body)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	resp := mappers.ToUserResponse(*newUser)

	httprespond.JsonResponse(w, resp, http.StatusOK)
}

func (u *UserHandlers) FindMany(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx := r.Context()

	page := r.URL.Query().Get("page")
	limit := r.URL.Query().Get("limit")

	pageInt, err1 := strconv.Atoi(page)
	limitInt, err2 := strconv.Atoi(limit)
	if err1 != nil || err2 != nil {
		httprespond.ErrorResponse(w, "Page and limit must be int", http.StatusBadRequest)
		return
	}

	users, pagination, err := u.service.FindMany(ctx, pageInt, limitInt)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	usersData := mappers.ToUsersResponse(users)
	paginationData := dto.PaginationResponse{
		CurrentPage:  pagination.CurrentPage,
		TotalItems:   pagination.TotalItems,
		TotalPages:   pagination.TotalPages,
		ItemsPerPage: pagination.ItemsPerPage,
		HasNextPage:  pagination.HasNextPage,
	}

	data := dto.PaginatedResponse[dto.UserResponse]{
		Data:       usersData,
		Pagination: paginationData,
	}

	httprespond.JsonResponse(w, data, http.StatusOK)
}

func (u *UserHandlers) Search(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx := r.Context()

	searchTerm := r.URL.Query().Get("searchTerm")

	data, err := u.service.Search(ctx, searchTerm)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	httprespond.JsonResponse(w, data, http.StatusOK)
}

func (u *UserHandlers) Update(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	ctx := r.Context()

	userIdStr := ps.ByName("id")
	id, err := uuid.Parse(userIdStr)
	if err != nil {
		httprespond.ErrorResponse(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var req dto.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	if message, err := dto.Validate(req); err != nil {
		httprespond.ErrorResponse(w, message, http.StatusBadRequest)
		return
	}

	updated, err := u.service.Update(ctx, id, req)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	resp := mappers.ToUserResponse(*updated)

	httprespond.JsonResponse(w, resp, http.StatusOK)
}

func (u *UserHandlers) Remove(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	ctx := r.Context()

	userIdStr := ps.ByName("id")
	id, err := uuid.Parse(userIdStr)
	if err != nil {
		httprespond.ErrorResponse(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	deleted, err := u.service.Remove(ctx, id)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
		return
	}

	resp := mappers.ToUserResponse(*deleted)

	httprespond.JsonResponse(w, resp, http.StatusOK)
}
