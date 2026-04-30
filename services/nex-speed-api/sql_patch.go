//go:build ignore

package main

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
	"github.com/nexspeed/backend/config"
)

func main() {
	cfg := config.Load()
	connStr := "host=" + cfg.DBHost + " port=" + cfg.DBPort + " user=" + cfg.DBUser + " password=" + cfg.DBPassword + " dbname=" + cfg.DBName + " sslmode=" + cfg.DBSSLMode + " search_path=" + cfg.DBSchema
	DB, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	_, err = DB.Exec("ALTER TABLE nex_speed.parking_types ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';")
	if err != nil {
		log.Println("Error:", err)
	} else {
		log.Println("Added column successfully")
	}
}
