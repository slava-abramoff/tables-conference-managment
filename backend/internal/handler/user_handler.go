package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"table-api/internal/handler/dto"
	"table-api/internal/mappers"
	"table-api/internal/service"
	httprespond "table-api/pkg/http"
	"time"

	"github.com/julienschmidt/httprouter"
)

type UserHandlers struct {
	service service.UserService
}

func NewUserHandlers(service service.UserService) *UserHandlers {
	return &UserHandlers{service: service}
}

const TIMEOUT = 3

func (u *UserHandlers) Create(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx, cancel := context.WithTimeout(r.Context(), TIMEOUT*time.Second)
	defer cancel()
	var dtoBody dto.CreateUserRequest

	err := json.NewDecoder(r.Body).Decode(&dtoBody)
	if err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	body := mappers.DtoCreateRequestToUser(dtoBody)
	newUser, err := u.service.Create(ctx, body)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
	}

	data := mappers.ToUserResponse(*newUser)

	httprespond.JsonResponse(w, data, http.StatusOK)
}

func (u *UserHandlers) FindMany(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx, cancel := context.WithTimeout(r.Context(), TIMEOUT*time.Second)
	defer cancel()

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
	ctx, cancel := context.WithTimeout(r.Context(), TIMEOUT*time.Second)
	defer cancel()

	searchTerm := r.URL.Query().Get("searchTerm")

	data, err := u.service.Search(ctx, searchTerm)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
	}

	httprespond.JsonResponse(w, data, http.StatusOK)
}

func (u *UserHandlers) Update(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	ctx, cancel := context.WithTimeout(r.Context(), TIMEOUT*time.Second)
	defer cancel()

	var dtobody dto.UpdateUserRequest
	userId := ps.ByName("id")

	err := json.NewDecoder(r.Body).Decode(&dtobody)
	if err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	body := mappers.DtoUpdateRequestToUser(dtobody)
	updatedUser, err := u.service.Update(ctx, userId, body)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
	}

	data := dto.UserResponse(*updatedUser)

	httprespond.JsonResponse(w, data, http.StatusOK)
}

func (u *UserHandlers) Remove(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	ctx, cancel := context.WithTimeout(r.Context(), TIMEOUT*time.Second)
	defer cancel()

	userId := ps.ByName("id")

	user, err := u.service.Remove(ctx, userId)
	if err != nil {
		httprespond.HandleErrorResponse(w, err)
	}

	data := dto.UserResponse(*user)

	httprespond.JsonResponse(w, data, http.StatusOK)
}
