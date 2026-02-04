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
	frontend string,
) *httprouter.Router {
	router := httprouter.New()

	chain := middleware.Chain
	auth := middleware.AuthMiddleware
	logs := middleware.LoggingMiddleware
	roles := middleware.RoleMiddleware
	cors := middleware.CorsMiddleware(frontend)

	// Auth
	router.POST("/api/auth/login", chain(a.Login, cors, logs(logger)))
	router.POST("/api/auth/refresh", chain(a.Refresh, cors, logs(logger)))
	router.POST("/api/auth/logout", chain(a.Logout, cors, logs(logger)))

	// ShortLink
	router.GET("/l/:code", chain(sl.GetUrl, cors, logs(logger)))

	// Meets
	router.POST("/api/meets", chain(
		m.Create,
		cors,
		logs(logger),
	))
	router.GET("/api/meets/find", chain(
		m.FindMany,
		cors,
		logs(logger),
		auth(),
	))
	router.PATCH("/api/meets/:id", chain(
		m.Update,
		cors,
		logs(logger),
		auth(),
		roles([]string{"admin", "moderator"}),
	))

	// Lectures
	router.POST("/api/lectures", chain(
		l.Create,
		cors,
		logs(logger),
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.POST("/api/lectures/advanced", chain(
		l.CreateMany,
		cors,
		logs(logger),
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.POST("/api/lectures/links", chain(
		l.CreateManyLinks,
		cors,
		logs(logger),
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.GET("/api/lectures/dates", chain(
		l.GetDates,
		cors,
		logs(logger),
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.GET("/api/lectures/days", chain(
		l.GetSchedule,
		cors,
		logs(logger),
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.GET("/api/lectures/schedule/:date", chain(
		l.GetByDates,
		cors,
		logs(logger),
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.PATCH("/api/lectures/:id", chain(
		l.Update,
		cors,
		logs(logger),
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.GET("/api/lectures/export", chain(
		l.ExportExcel,
		cors,
		logs(logger),
		auth(),
	))
	router.DELETE("/api/lectures/:id", chain(
		l.Remove,
		cors,
		logs(logger),
		auth(),
		roles([]string{"admin"}),
	))

	// Users
	router.POST("/api/users", chain(
		u.Create,
		cors,
		logs(logger),
		auth(),
		roles([]string{"admin"}),
	))

	router.GET("/api/users/find", chain(
		u.FindMany,
		cors,
		logs(logger),
		auth(),
		roles([]string{"admin"}),
	))

	router.GET("/api/users/search", chain(
		u.Search,
		cors,
		logs(logger),
		auth(),
		roles([]string{"admin"}),
	))

	router.PATCH("/api/users/:id", chain(
		u.Update,
		cors,
		logs(logger),
		auth(),
		roles([]string{"admin"}),
	))

	router.DELETE("/api/users/:id", chain(
		u.Remove,
		cors,
		logs(logger),
		auth(),
		roles([]string{"admin"}),
	))

	router.GlobalOPTIONS = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		allowedOrigins := map[string]bool{
			frontend: true,
			// Для обратной совместимости с локальной разработкой
			"http://localhost:5173": true,
			"http://127.0.0.1:5173": true,
			"http://localhost:4444": true,
		}

		if allowedOrigins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		w.WriteHeader(http.StatusNoContent)
	})

	return router
}
