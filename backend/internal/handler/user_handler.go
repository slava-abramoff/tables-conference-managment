package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"table-api/internal/handler/dto"
	"table-api/internal/mappers"
	"table-api/internal/service"
	httprespond "table-api/pkg/http"

	"github.com/julienschmidt/httprouter"
)

type UserHandlers struct {
	service service.UserService
}

func NewUserHandlers(service service.UserService) *UserHandlers {
	return &UserHandlers{service: service}
}

func (u *UserHandlers) Create(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var dtoBody dto.CreateUserRequest

	err := json.NewDecoder(r.Body).Decode(&dtoBody)
	if err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	body := mappers.DtoCreateRequestToUser(dtoBody)
	newUser := u.service.Create(body)
	data := dto.UserResponse(newUser)

	httprespond.JsonResponse(w, data, http.StatusOK)
}

func (u *UserHandlers) FindMany(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	page := r.URL.Query().Get("page")
	limit := r.URL.Query().Get("limit")

	pageInt, err1 := strconv.Atoi(page)
	limitInt, err2 := strconv.Atoi(limit)
	if err1 != nil || err2 != nil {
		httprespond.ErrorResponse(w, "Page and limit must be int", http.StatusBadRequest)
		return
	}

	users, pagination := u.service.FindMany(pageInt, limitInt)

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
	searchTerm := r.URL.Query().Get("searchTerm")

	data := u.service.Search(searchTerm)

	httprespond.JsonResponse(w, data, http.StatusOK)
}

func (u *UserHandlers) Update(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	var dtobody dto.UpdateUserRequest
	userId := ps.ByName("id")

	err := json.NewDecoder(r.Body).Decode(&dtobody)
	if err != nil {
		httprespond.ErrorResponse(w, "Bad request", http.StatusBadRequest)
		return
	}

	body := mappers.DtoUpdateRequestToUser(dtobody)
	updatedUser := u.service.Update(userId, body)
	data := dto.UserResponse(updatedUser)

	httprespond.JsonResponse(w, data, http.StatusOK)
}

func (u *UserHandlers) Remove(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	userId := ps.ByName("id")

	user := u.service.Remove(userId)
	data := dto.UserResponse(user)

	httprespond.JsonResponse(w, data, http.StatusOK)
}
