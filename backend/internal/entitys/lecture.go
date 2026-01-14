package entitys

type LectureDates struct {
	Years []*LectureYear
}

type LectureYear struct {
	Year   string
	Months []*LectureMonth
}

type LectureMonth struct {
	Month string
}

type DailySchedule struct {
	Date         string
	Lectors      []string
	Groups       []string
	LectureCount int
}
