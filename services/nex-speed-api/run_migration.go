//go:build ignore

package main

import (
	"database/sql"
	"io/ioutil"
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
	defer DB.Close()

	file, err := ioutil.ReadFile("database/migrate_master_types.sql")
	if err != nil {
		log.Fatal(err)
	}

	_, err = DB.Exec(string(file))
	if err != nil {
		log.Fatal("Migration failed:", err)
	}

	log.Println("Migration successful.")
}
