package repository

// type LectureRepository interface {
// 	// // Создать одну лекцию
// 	// Create(ctx context.Context, lecture *models.Lecture) (*models.Lecture, error)

// 	// // Создать несколько лекций за один вызов и вернуть их
// 	// CreateMany(ctx context.Context, lectures []*models.Lecture) ([]*models.Lecture, error)

// 	// // Обновить ссылки (url + shortUrl) для группы лекций
// 	// UpdateLinks(ctx context.Context, groupName, url, shortUrl string) error

// 	// // Получить доступные годы и месяцы
// 	// GetAvailableYearsMonths(ctx context.Context) ([]entitys.YearMonth, error)

// 	// // Найти все лекции за определённый год и месяц
// 	// FindAllByYearMonth(ctx context.Context, year int, month string) ([]*models.Lecture, error)

// 	// // Получить лекции по конкретной дате
// 	// GetByDate(ctx context.Context, date time.Time) ([]*models.LectureWithAdmin, error)

// 	// // Обновить лекцию по id
// 	// Update(ctx context.Context, id string, lecture *models.Lecture) (*models.Lecture, error)

// 	// // Удалить лекцию по id
// 	// Delete(ctx context.Context, id string) (*models.Lecture, error)

// 	// // Экспорт данных для Excel (с фильтром по дате и/или группе)
// 	// ExportExcel(ctx context.Context, start, end *time.Time, group *string) ([]*models.LectureExcel, error)
// }
