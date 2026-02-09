package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"table-api/internal/config"
	"table-api/internal/database"
	"table-api/internal/entities"

	"table-api/internal/handler"
	"table-api/internal/repository"
	"table-api/internal/router"
	"table-api/internal/service"
	"table-api/pkg/logger"
	"table-api/pkg/validator"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load(".env")

	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal(err.Error())
	}

	logger := logger.NewLogger(cfg.Server.LoggerConsole)

	db, err := database.ConnectDB(&cfg.Db)
	if err != nil {
		logger.Error(err.Error())
		os.Exit(1)
	}
	logger.Info("Database connected and migrated successfully!")

	validator.Init()

	//ShortLink
	sRepo := repository.NewShortLinkRepository(db)
	sService := service.NewShortLinkService(sRepo)
	sHandler := handler.NewShortLinkHandlers(sService)

	// Mailer
	mailer := service.NewMailService(&cfg.Smtp, logger)

	// Meets
	mRepo := repository.NewMeetRepository(db)
	mService := service.NewMeetService(mRepo, mailer, sService, cfg.Server)
	mHandler := handler.NewMeetHandlers(mService)

	// Lectures
	lRepo := repository.NewLectureRepository(db)
	lService := service.NewLectureService(lRepo, sService)
	lHandler := handler.NewLectureHandlers(lService)

	// Users
	uRepo := repository.NewUserRepository(db)
	uService := service.NewUserService(uRepo)
	uHandler := handler.NewUserHandlers(uService)

	if _, err := uService.Create(context.TODO(), entities.User{
		Login:    cfg.Server.Admin,
		Password: cfg.Server.Password,
		Role:     "admin",
	}); err != nil {
		logger.Warn("Failed created admin: " + err.Error())
	} else {
		logger.Info("Successfully created admin!")
	}

	// Auth
	aRepo := repository.NewRefreshTokenRepository(db)
	aService := service.NewAuthService(uRepo, aRepo, cfg.Jwt.SecretKey)
	aHandler := handler.NewAuthHandlers(aService)

	router := router.NewRouter(uHandler, aHandler, lHandler, mHandler, sHandler, logger, *cfg)

	go mService.AutoUpdate(time.Minute)

	logger.Info("Server started successfully!")
	log.Fatal(http.ListenAndServe(":8080", router))
}
