package database

import (
	"fmt"
	"table-api/internal/config"
	"table-api/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectDB(cfg *config.Database) (*gorm.DB, error) {

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%d sslmode=disable",
		cfg.Host,
		cfg.User,
		cfg.Password,
		cfg.DB,
		cfg.Port,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	if err := db.Exec(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`).Error; err != nil {
		return nil, fmt.Errorf("failed to enable pgcrypto: %v", err)
	}

	// TODO: Ручные миграции, отдельным скриптом
	if cfg.Migrate {
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
