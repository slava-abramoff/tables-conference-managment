package config

type server struct {
	Port          int
	Domain        string
	LoggerConsole bool
	Admin         string
	Password      string
}
