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

	db := database.ConnectDB()
	validator.Init()

	uRepo := repository.NewUserRepository(db)
	uService := service.NewUserService(uRepo)
	uHandler := handler.NewUserHandlers(uService)
	router := router.NewRouter(uHandler)

	fmt.Println("Server is started...")
	log.Fatal(http.ListenAndServe(":8080", router))
}
