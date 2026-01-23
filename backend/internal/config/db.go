package config

type database struct {
	Port     int
	Host     string
	User     string
	Password string
	DB       string
	Migrate  bool
}
