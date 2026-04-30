package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"

	"github.com/nexspeed/backend/config"
)

var DB *sql.DB

func Connect(cfg *config.Config) error {
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s search_path=%s",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBSSLMode, cfg.DBSchema,
	)

	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(5)

	// Verify schema
	var schemaExists bool
	err = DB.QueryRow("SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = $1)", cfg.DBSchema).Scan(&schemaExists)
	if err != nil || !schemaExists {
		return fmt.Errorf("schema '%s' does not exist", cfg.DBSchema)
	}

	log.Printf("✅ Connected to PostgreSQL (%s:%s/%s schema=%s)", cfg.DBHost, cfg.DBPort, cfg.DBName, cfg.DBSchema)
	return nil
}
