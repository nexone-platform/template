package config

import (
	"os"
)

type Config struct {
	ServerPort string
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSchema   string
	DBSSLMode  string
	CORSOrigin string
}

func Load() *Config {
	return &Config{
		ServerPort: getEnv("SERVER_PORT", "8108"),
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", "qwerty"),
		DBName:     getEnv("DB_NAME", "nexone_techbiz"),
		DBSchema:   getEnv("DB_SCHEMA", "nex_speed"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),
		CORSOrigin: getEnv("CORS_ORIGIN", "http://localhost:3100"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
