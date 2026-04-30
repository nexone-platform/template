//go:build ignore

package main

import (
	"log"

	"github.com/nexspeed/backend/config"
	"github.com/nexspeed/backend/database"
)

func main() {
	cfg := config.Load()
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("DB connection failed: %v", err)
	}

	query := `ALTER TABLE nex_speed.parking_lots ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7), ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);`
	_, err := database.DB.Exec(query)
	if err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	log.Println("Migration successful!")
}
