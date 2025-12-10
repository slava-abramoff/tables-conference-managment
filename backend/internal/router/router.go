package router

import (
	"table-api/internal/handler"

	"github.com/julienschmidt/httprouter"
)

func NewRouter(u *handler.UserHandlers) *httprouter.Router {
	router := httprouter.New()

	router.POST("/users", u.Create)
	router.GET("/users/find", u.FindMany)
	router.GET("/users/search", u.Search)
	router.PATCH("/users/:id", u.Update)
	router.DELETE("/users/:id", u.Remove)

	return router
}
