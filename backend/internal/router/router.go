package router

import (
	"log/slog"
	"net/http"
	"table-api/internal/config"
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
	cfg config.Config,
) *httprouter.Router {
	router := httprouter.New()

	chain := middleware.Chain
	auth := middleware.AuthMiddleware(cfg.Jwt.SecretKey)
	logs := middleware.LoggingMiddleware
	roles := middleware.RoleMiddleware
	cors := middleware.CorsMiddleware(cfg.Server.Frontend)

	// Auth
	router.POST("/api/auth/login", chain(a.Login, logs(logger), cors))
	router.POST("/api/auth/refresh", chain(a.Refresh, logs(logger), cors))
	router.POST("/api/auth/logout", chain(a.Logout, logs(logger), cors))

	// ShortLink
	router.GET("/l/:code", chain(sl.GetUrl, logs(logger), cors))

	// Meets
	router.POST("/api/meets", chain(
		m.Create,
		logs(logger),
		cors,
	))
	router.GET("/api/meets/find", chain(
		m.FindMany,
		logs(logger),
		cors,
		auth(),
	))
	router.PATCH("/api/meets/:id", chain(
		m.Update,
		logs(logger),
		cors,
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	// router.GET("/api/meets/export", chain(
	// 	m.ExportExcel,
	// 	logs(logger),
	// 	cors,
	// 	// auth(),
	// ))

	// Lectures
	router.POST("/api/lectures", chain(
		l.Create,
		logs(logger),
		cors,
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.POST("/api/lectures/advanced", chain(
		l.CreateMany,
		logs(logger),
		cors,
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.POST("/api/lectures/links", chain(
		l.CreateManyLinks,
		logs(logger),
		cors,
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.GET("/api/lectures/dates", chain(
		l.GetDates,
		logs(logger),
		cors,
		auth(),
	))
	router.GET("/api/lectures/days", chain(
		l.GetSchedule,
		logs(logger),
		cors,
		auth(),
	))
	router.GET("/api/lectures/schedule/:date", chain(
		l.GetByDates,
		logs(logger),
		cors,
		auth(),
	))
	router.PATCH("/api/lectures/:id", chain(
		l.Update,
		logs(logger),
		cors,
		auth(),
		roles([]string{"admin", "moderator"}),
	))
	router.GET("/api/lectures/export", chain(
		l.ExportExcel,
		logs(logger),
		cors,
	))
	router.DELETE("/api/lectures/:id", chain(
		l.Remove,
		logs(logger),
		cors,
		auth(),
		roles([]string{"admin", "moderator"}),
	))

	// Users
	router.POST("/api/users", chain(
		u.Create,
		logs(logger),
		cors,
		auth(),
		roles([]string{"admin"}),
	))

	router.GET("/api/users/find", chain(
		u.FindMany,
		logs(logger),
		cors,
		auth(),
		roles([]string{"admin"}),
	))

	router.GET("/api/users/search", chain(
		u.Search,
		logs(logger),
		cors,
		auth(),
		roles([]string{"admin"}),
	))

	router.PATCH("/api/users/:id", chain(
		u.Update,
		logs(logger),
		cors,
		auth(),
		roles([]string{"admin"}),
	))

	router.DELETE("/api/users/:id", chain(
		u.Remove,
		logs(logger),
		cors,
		auth(),
		roles([]string{"admin"}),
	))

	router.GlobalOPTIONS = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		allowedOrigins := map[string]bool{
			cfg.Server.Frontend:     true,
			"http://localhost:5173": true,
			"http://127.0.0.1:5173": true,
		}

		if allowedOrigins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			// w.Header().Set("Access-Control-Expose-Headers", "Content-Disposition")
		}

		w.Header().Set("Access-Control-Expose-Headers", "Content-Disposition")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		w.WriteHeader(http.StatusNoContent)
	})

	return router
}
