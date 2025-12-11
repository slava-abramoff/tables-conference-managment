package main

import (
	"fmt"
	"log"
	"net/http"
	"table-api/internal/handler"
	"table-api/internal/repository"
	"table-api/internal/router"
)

func main() {

	repository.Init()
	uHandler := handler.NewUserHandlers(&repository.MockUserRepo{})
	router := router.NewRouter(uHandler)

	fmt.Println("Server is started...")
	log.Fatal(http.ListenAndServe(":8080", router))
}
