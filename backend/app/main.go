package main

import (
	"log"
	"net/http"
	"os"
	"table-api/internal/database"
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
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	logger := logger.NewLogger(true)

	db, err := database.ConnectDB()
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
	mailer := service.NewMailService(logger)

	// Meets
	mRepo := repository.NewMeetRepository(db)
	mService := service.NewMeetService(mRepo, mailer, sService)
	mHandler := handler.NewMeetHandlers(mService)

	// Lectures
	lRepo := repository.NewLectureRepository(db)
	lService := service.NewLectureService(lRepo, sService)
	lHandler := handler.NewLectureHandlers(lService)

	// Users
	uRepo := repository.NewUserRepository(db)
	uService := service.NewUserService(uRepo)
	uHandler := handler.NewUserHandlers(uService)

	// Auth
	aRepo := repository.NewRefreshTokenRepository(db)
	aService := service.NewAuthService(uRepo, aRepo)
	aHandler := handler.NewAuthHandlers(aService)

	router := router.NewRouter(uHandler, aHandler, lHandler, mHandler, sHandler, logger)

	go mService.AutoUpdate(time.Minute)

	logger.Info("Server started successfully!")
	log.Fatal(http.ListenAndServe(":8080", router))
}
