package main

import (
	"fmt"
	"log"
	"net/http"
	"table-api/internal/handler"
	"table-api/internal/router"
	"table-api/internal/service"
)

func main() {

	uHandler := handler.NewUserHandlers(&service.MockUserService{})
	router := router.NewRouter(uHandler)

	fmt.Println("Server is started...")
	log.Fatal(http.ListenAndServe(":8080", router))
}
