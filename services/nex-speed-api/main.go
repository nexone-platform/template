package main

import (
	"fmt"
	"log"

	"github.com/nexspeed/backend/config"
	"github.com/nexspeed/backend/database"
	"github.com/nexspeed/backend/handlers"
	"github.com/nexspeed/backend/router"
	"github.com/nexspeed/backend/simulator"
	"github.com/nexspeed/backend/ws"
)

// @title NexSpeed TMS API
// @version 2.0.0
// @description The NextOne ERP Speed API
// @host localhost:8108
// @BasePath /api/v1

func main() {
	log.Println("🚀 Starting NexSpeed TMS API Server...")

	cfg := config.Load()

	if err := database.Connect(cfg); err != nil {
		log.Fatalf("❌ Database connection failed: %v", err)
	}

	// Init users table
	handlers.InitUsersTable()

	// Start WebSocket hub
	go ws.GPSHub.Run()

	// Start GPS simulator
	simulator.StartGPSSimulator()

	r := router.Setup(cfg)

	fmt.Println("╔══════════════════════════════════════════════════╗")
	fmt.Println("║        NexSpeed TMS API Server v2.0.0           ║")
	fmt.Println("║        Phase 3: Real-time GPS + ePOD            ║")
	fmt.Println("╠══════════════════════════════════════════════════╣")
	fmt.Printf("║  🌐 HTTP:      http://localhost:%s              ║\n", cfg.ServerPort)
	fmt.Printf("║  📡 WebSocket: ws://localhost:%s/ws/gps         ║\n", cfg.ServerPort)
	fmt.Println("║  🛰️  GPS Sim:   Active (5s interval)             ║")
	fmt.Println("╠══════════════════════════════════════════════════╣")
	fmt.Println("║  CRUD /api/v1/vehicles|drivers|orders|trips     ║")
	fmt.Println("║  CRUD /api/v1/invoices|subcontractors           ║")
	fmt.Println("║  POST /api/v1/epod                              ║")
	fmt.Println("║  GET  /api/v1/dashboard/stats|alerts|revenue    ║")
	fmt.Println("║  WS   /ws/gps  (real-time GPS updates)         ║")
	fmt.Println("╚══════════════════════════════════════════════════╝")

	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
