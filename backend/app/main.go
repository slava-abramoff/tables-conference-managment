package main

import (
	"fmt"
	"log"
	"net/http"
	"table-api/internal/database"
	"table-api/internal/handler"
	"table-api/internal/repository"
	"table-api/internal/router"
	"table-api/internal/service"
	"table-api/pkg/validator"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// TODO: slog logger

	db := database.ConnectDB()
	validator.Init()

	//ShortLink
	sRepo := repository.NewShortLinkRepository(db)
	sService := service.NewShortLinkService(sRepo)
	// shortenHandler

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

	router := router.NewRouter(uHandler, aHandler, lHandler)

	fmt.Println("Server is started...")
	log.Fatal(http.ListenAndServe(":8080", router))
}
