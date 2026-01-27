package entitys

type LectureDates struct {
	Years []*LectureYear `json:"years"`
}

type LectureYear struct {
	Year   string    `json:"year"`
	Months []*string `json:"months"`
}

// type LectureMonth struct {
// 	Month string `json:"month"`
// }

type DailySchedule struct {
	Date         string   `json:"date"`
	Lectors      []string `json:"lectors"`
	Groups       []string `json:"groups"`
	LectureCount int      `json:"lectureCount"`
}
