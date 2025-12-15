package main

import (
	"fmt"
	"log"
	"net/http"
	"table-api/internal/handler"
	"table-api/internal/repository"
	"table-api/internal/router"
	"table-api/internal/service"
)

func main() {

	uRepo := repository.NewUserRepoMock()
	uService := service.NewUserService(uRepo)
	uHandler := handler.NewUserHandlers(uService)
	router := router.NewRouter(uHandler)

	fmt.Println("Server is started...")
	log.Fatal(http.ListenAndServe(":8080", router))
}
