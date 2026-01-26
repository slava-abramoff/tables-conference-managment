package router

import (
	"log/slog"
	"net/http"
	"table-api/internal/handler"
	"table-api/pkg/middleware"

	"github.com/julienschmidt/httprouter"
)

func NewRouter(
	u *handler.UserHandlers,
	a *handler.AuthHandlers,
	l *handler.LectureHandlers,
	m *handler.MeetHandlers,
	sl *handler.ShortLinkHandlers,
	logger *slog.Logger,
) *httprouter.Router {
	router := httprouter.New()

	chain := middleware.Chain
	auth := middleware.AuthMiddleware
	logs := middleware.LoggingMiddleware
	roles := middleware.RoleMiddleware
	cors := middleware.CorsMiddleware

	// Auth
	router.POST("/auth/login", chain(a.Login, cors, logs(logger)))
	router.POST("/auth/refresh", chain(a.Refresh, logs(logger)))
	router.POST("/auth/logout", chain(a.Logout, logs(logger)))

	// ShortLink
	router.GET("/l/:code", chain(sl.GetUrl, logs(logger)))

	// Meets
	router.POST("/meets", chain(
		m.Create,
		logs(logger),
	))
	router.GET("/meets/find", chain(
		m.FindMany,
		logs(logger),
		auth(),
	))
	router.PATCH("/meets/:id", chain(
		m.Update,
		logs(logger),
		auth(),
		roles([]string{"admin", "moderator"}),
	))

	// Lectures
	router.POST("/lectures", chain(
		l.Create,
		logs(logger),
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.POST("/lectures/advanced", chain(
		l.CreateMany,
		logs(logger),
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.POST("/lectures/links", chain(
		l.CreateManyLinks,
		logs(logger),
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.GET("/lectures/dates", chain(
		l.GetDates,
		logs(logger),
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.GET("/lectures/days", chain(
		l.GetSchedule,
		logs(logger),
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.GET("/lectures/schedule/:date", chain(
		l.GetByDates,
		logs(logger),
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.PATCH("/lectures/:id", chain(
		l.Update,
		logs(logger),
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.GET("/lectures/export", chain(
		l.ExportExcel,
		logs(logger),
		auth(),
	))
	router.DELETE("/lectures/:id", chain(
		l.Remove,
		logs(logger),
		auth(),
		roles([]string{"admin"}),
	))

	// Users
	router.POST("/users", chain(
		u.Create,
		logs(logger),
		auth(),
		roles([]string{"admin"}),
	))

	router.GET("/users/find", chain(
		u.FindMany,
		logs(logger),
		auth(),
		roles([]string{"admin"}),
	))

	router.GET("/users/search", chain(
		u.Search,
		logs(logger),
		auth(),
	))

	router.PATCH("/users/:id", chain(
		u.Update,
		logs(logger),
		auth(),
		roles([]string{"admin"}),
	))

	router.DELETE("/users/:id", chain(
		u.Remove,
		logs(logger),
		auth(),
		roles([]string{"admin"}),
	))

	router.GlobalOPTIONS = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		allowedOrigins := map[string]bool{
			"http://localhost:5173": true,
			"http://127.0.0.1:5173": true,
		}

		if allowedOrigins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		w.WriteHeader(http.StatusNoContent)
	})

	return router
}
