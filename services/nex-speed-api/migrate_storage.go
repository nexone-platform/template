//go:build ignore

package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	db, err := sql.Open("postgres", dbUrl)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	_, err = db.Exec(`ALTER TABLE nex_speed.storage_locations ADD COLUMN latitude NUMERIC(10, 6)`)
	if err != nil {
		fmt.Printf("Adding latitude potentially failed or column already exists: %v\n", err)
	}

	_, err = db.Exec(`ALTER TABLE nex_speed.storage_locations ADD COLUMN longitude NUMERIC(10, 6)`)
	if err != nil {
		fmt.Printf("Adding longitude potentially failed or column already exists: %v\n", err)
	}

	fmt.Println("Migrate storage logic completed.")
}
