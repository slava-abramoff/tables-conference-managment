package database

import (
	"fmt"
	"os"
	"table-api/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectDB() (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("POSTGRES_HOST"),
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("POSTGRES_DB"),
		os.Getenv("POSTGRES_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	if err := db.Exec(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`).Error; err != nil {
		return nil, fmt.Errorf("failed to enable pgcrypto: %v", err)
	}

	// TODO: Ручные миграции, отдельным скриптом
	if os.Getenv("AUTO_MIGRATE") == "true" {
		err = db.AutoMigrate(
			&models.User{},
			&models.Meet{},
			&models.Lecture{},
			&models.ShortLink{},
			&models.RefreshToken{},
		)
		if err != nil {
			return nil, fmt.Errorf("failed to migrate database: %w", err)
		}
	}
	return db, nil
}
