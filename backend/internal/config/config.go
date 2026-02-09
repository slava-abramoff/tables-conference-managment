package config

type Config struct {
	Server Server
	Smtp   Smtp
	Jwt    Jwt
	Db     Database
}

func LoadConfig() (*Config, error) {
	serverCfg, err := getServerConfig()
	if err != nil {
		return nil, err
	}

	smtpCfg, err := getSmtpConfig()
	if err != nil {
		return nil, err
	}

	databaseCfg, err := getDatabaseConfig()
	if err != nil {
		return nil, err
	}

	jwtCfg := getJwtConfig()

	return &Config{
		Server: *serverCfg,
		Smtp:   *smtpCfg,
		Jwt:    *jwtCfg,
		Db:     *databaseCfg,
	}, nil
}
