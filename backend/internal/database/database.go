package database

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectDB() *gorm.DB {
	dsn := "host=localhost user=postgres password=postgres dbname=testdb port=5432 sslmode=disable"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect to database:", err)
	}

	// err = db.AutoMigrate(&User{}, &Conference{}, &Lecture{}, &ShortLink{})
	// if err != nil {
	// 	log.Fatal("failed to migrate database:", err)
	// }

	log.Println("Database connected successfully!")
	return db
}
