package router

import (
	"table-api/internal/handler"
	"table-api/pkg/middleware"

	"github.com/julienschmidt/httprouter"
)

func NewRouter(u *handler.UserHandlers, a *handler.AuthHandlers, l *handler.LectureHandlers) *httprouter.Router {
	router := httprouter.New()

	// Auth
	router.POST("/login", a.Login)
	router.POST("/refresh", a.Refresh)
	router.POST("/logout", a.Logout)

	// Lectures
	router.POST("/lectures", l.Create)
	router.POST("/lectures/advanced", l.CreateMany)
	router.POST("/lectures/links", l.CreateManyLinks)
	router.GET("/lectures/dates", l.GetDates)
	router.GET("/lectures/days", l.GetSchedule)
	router.GET("/lectures/schedule/:date", l.GetByDates)
	router.PATCH("/lectures/:id", l.Update)
	router.DELETE("/lectures/:id", l.Remove)

	// Users
	router.POST("/users", middleware.AuthMiddleware(middleware.RoleMiddleware("admin", u.Create)))
	router.GET("/users/find", middleware.AuthMiddleware(middleware.RoleMiddleware("admin", u.FindMany)))
	router.GET("/users/search", middleware.AuthMiddleware(u.Search))
	router.PATCH("/users/:id", middleware.AuthMiddleware(middleware.RoleMiddleware("admin", u.Update)))
	router.DELETE("/users/:id", middleware.AuthMiddleware(middleware.RoleMiddleware("admin", u.Remove)))

	return router
}
