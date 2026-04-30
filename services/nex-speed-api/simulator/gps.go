package simulator

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
	"time"

	"github.com/nexspeed/backend/database"
	"github.com/nexspeed/backend/ws"
)

type GPSUpdate struct {
	Type      string  `json:"type"`
	VehicleID string  `json:"vehicleId"`
	TripID    string  `json:"tripId"`
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
	Speed     float64 `json:"speed"`
	Heading   float64 `json:"heading"`
	FuelLevel int     `json:"fuelLevel"`
	Progress  int     `json:"progress"`
	Status    string  `json:"status"`
	Timestamp string  `json:"timestamp"`
}

// Thai route pool for recycling completed trips
type RouteTemplate struct {
	Origin      string
	Destination string
	OriginLat   float64
	OriginLng   float64
	DestLat     float64
	DestLng     float64
	Distance    int
}

// Waypoint for multi-segment routes (to stay on roads, not cut through sea)
type Waypoint struct {
	Lat, Lng float64
}

var routePool = []RouteTemplate{
	// กรุงเทพ → EEC: ผ่านถนนมอเตอร์เวย์ 7 (ทางบก วิ่งผ่านฉะเชิงเทรา)
	{"คลังสินค้าสระบุรี", "ท่าเรือแหลมฉบัง", 14.5289, 100.9103, 13.0957, 100.9050, 185},
	{"DC ลาดกระบัง", "คลังสินค้าชลบุรี", 13.7230, 100.7780, 13.3622, 100.9850, 95},
	{"DC บางนา", "คลังสินค้าขอนแก่น", 13.6670, 100.6397, 16.4321, 102.8236, 445},
	{"คลังน้ำมันศรีราชา", "ปั๊ม ปตท. นครราชสีมา", 13.1740, 100.9120, 14.9799, 102.0978, 280},
	{"โรงงานบางเลน", "ดีลเลอร์เชียงใหม่", 14.0168, 100.1686, 18.7883, 98.9853, 700},
	{"โกดังรังสิต", "โรงงานระยอง", 13.9825, 100.6230, 12.7560, 101.2780, 180},
	{"คลัง IT ลาดพร้าว", "สาขาหาดใหญ่", 13.8231, 100.5752, 7.0042, 100.4747, 950},
	{"โรงงานบางบัวทอง", "คลังสินค้าภูเก็ต", 13.9137, 100.4219, 7.8900, 98.4050, 870},
	{"โรงงานท่าหลวง", "ไซต์งานเชียงราย", 15.2680, 100.4750, 19.9071, 99.8305, 750},
	{"DC มหาชัย", "สาขาอุดรธานี", 13.5466, 100.2761, 17.4156, 102.7872, 560},
	{"โรงงานปราจีนบุรี", "คลังกระดาษสุราษฎร์ธานี", 14.0508, 101.3717, 9.1382, 99.3217, 680},
	{"โรงงานบ้านโป่ง", "ไซต์งานอุบลราชธานี", 13.8191, 99.8607, 15.2286, 104.8574, 620},
	{"คลังสินค้าบางพลี", "สาขาสุรินทร์", 13.5938, 100.7165, 14.8847, 103.4937, 420},
	{"โรงงานสมุทรสาคร", "สาขาพิษณุโลก", 13.5475, 100.2740, 16.8211, 100.2659, 380},
	{"โรงงานอมตะ", "คลังปทุมธานี", 13.2210, 101.0015, 14.0139, 100.5251, 120},
	{"DC ศรีนครินทร์", "คลังสินค้าสงขลา", 13.6512, 100.6402, 7.1899, 100.5955, 970},
	{"คลังเขาดิน", "สาขาลำปาง", 14.3780, 100.9920, 18.2888, 99.4908, 550},
	{"โรงงานรามคำแหง", "คลังสินค้านครพนม", 13.7580, 100.6420, 17.3921, 104.7698, 610},
}

// Waypoints for routes that cross water if interpolated linearly
// Key: "origin|destination" → list of waypoints to follow along actual highways
var routeWaypoints = map[string][]Waypoint{
	// === EEC routes (ตัดอ่าวไทยฝั่งตะวันออก) ===
	// ลาดกระบัง→ชลบุรี: มอเตอร์เวย์ 7 ผ่านฉะเชิงเทรา
	"DC ลาดกระบัง|คลังสินค้าชลบุรี": {{13.6900, 100.8500}, {13.5300, 100.9200}},
	// รังสิต→ระยอง: ผ่าน ฉะเชิงเทรา, ชลบุรี
	"โกดังรังสิต|โรงงานระยอง": {{13.8500, 100.7500}, {13.5300, 100.9200}, {13.1500, 101.1500}},
	// อมตะ→ปทุมธานี: ผ่านฉะเชิงเทรา, กรุงเทพ
	"โรงงานอมตะ|คลังปทุมธานี": {{13.4500, 100.9000}, {13.7500, 100.6500}},
	// สระบุรี→แหลมฉบัง: ผ่านฉะเชิงเทรา
	"คลังสินค้าสระบุรี|ท่าเรือแหลมฉบัง": {{14.0500, 100.9200}, {13.5300, 100.9200}},
	// ศรีราชา→โคราช: ผ่านฉะเชิงเทรา, นครนายก
	"คลังน้ำมันศรีราชา|ปั๊ม ปตท. นครราชสีมา": {{13.5000, 100.9500}, {14.2000, 101.2000}},

	// === เส้นทางใต้ (ตัดอ่าวไทยฝั่งตะวันตก) ===
	// ลาดพร้าว→หาดใหญ่: ถนนเพชรเกษม ผ่าน เพชรบุรี,ชุมพร,สุราษฎร์ฯ,นครศรีฯ
	"คลัง IT ลาดพร้าว|สาขาหาดใหญ่": {
		{13.5000, 100.1000}, // ผ่านนครปฐม
		{12.9200, 99.9700},  // เพชรบุรี
		{11.8000, 99.8200},  // ประจวบคีรีขันธ์
		{10.4900, 99.1800},  // ชุมพร
		{9.1400, 99.3300},   // สุราษฎร์ธานี
		{8.4300, 99.9600},   // นครศรีธรรมราช
	},
	// บางบัวทอง→ภูเก็ต: ถนนเพชรเกษม ผ่าน เพชรบุรี,ชุมพร,ระนอง
	"โรงงานบางบัวทอง|คลังสินค้าภูเก็ต": {
		{13.5000, 100.1000}, // นครปฐม
		{12.9200, 99.9700},  // เพชรบุรี
		{11.8000, 99.8200},  // ประจวบฯ
		{10.4900, 99.1800},  // ชุมพร
		{9.5200, 98.6300},   // ระนอง/พังงา
		{8.4500, 98.5200},   // พังงา
	},
	// ปราจีนบุรี→สุราษฎร์ฯ: ผ่านกรุงเทพ,เพชรบุรี,ชุมพร
	"โรงงานปราจีนบุรี|คลังกระดาษสุราษฎร์ธานี": {
		{13.7500, 100.6500}, // กรุงเทพ
		{13.1000, 99.9500},  // ราชบุรี
		{11.8000, 99.8200},  // ประจวบฯ
		{10.4900, 99.1800},  // ชุมพร
	},
	// ศรีนครินทร์→สงขลา: ผ่านเพชรบุรี,ชุมพร,สุราษฎร์ฯ,นครศรีฯ
	"DC ศรีนครินทร์|คลังสินค้าสงขลา": {
		{13.5000, 100.1000}, // นครปฐม
		{12.9200, 99.9700},  // เพชรบุรี
		{11.8000, 99.8200},  // ประจวบฯ
		{10.4900, 99.1800},  // ชุมพร
		{9.1400, 99.3300},   // สุราษฎร์ฯ
		{8.4300, 99.9600},   // นครศรีฯ
	},
}

func StartGPSSimulator() {
	log.Println("🛰️  GPS Simulator started (15s interval, auto-recycle mode)")

	go func() {
		for {
			simulateUpdates()
			time.Sleep(15 * time.Second)
		}
	}()
}

func simulateUpdates() {
	if database.DB == nil {
		return
	}

	rows, err := database.DB.Query(`
		SELECT t.id, t.vehicle_id, t.driver_id, t.current_lat, t.current_lng, t.progress, t.status,
			   v.fuel_level, t.origin, t.destination
		FROM trips t
		JOIN vehicles v ON v.id = t.vehicle_id
		WHERE t.status IN ('in-transit', 'loading')
	`)
	if err != nil {
		return
	}
	defer rows.Close()

	for rows.Next() {
		var tripID, vehicleID, driverID, status, origin, destination string
		var lat, lng float64
		var progress, fuelLevel int

		rows.Scan(&tripID, &vehicleID, &driverID, &lat, &lng, &progress, &status, &fuelLevel, &origin, &destination)

		if status == "loading" {
			if rand.Float64() < 0.1 {
				status = "in-transit"
				database.DB.Exec("UPDATE trips SET status='in-transit', updated_at=NOW() WHERE id=$1", tripID)
			}
			continue
		}

		// Simulate movement (slower: 0 or 1 per tick)
		newProgress := progress
		if rand.Float64() < 0.6 {
			newProgress = progress + 1
		}
		if newProgress > 100 {
			newProgress = 100
		}

		// Route-based interpolation: find matching route and interpolate position
		var destLat, destLng, origLat, origLng float64
		routeFound := false
		var routeOrigin, routeDest string
		for _, r := range routePool {
			if r.Origin == origin && r.Destination == destination {
				origLat, origLng = r.OriginLat, r.OriginLng
				destLat, destLng = r.DestLat, r.DestLng
				routeOrigin, routeDest = r.Origin, r.Destination
				routeFound = true
				break
			}
		}

		var newLat, newLng float64
		if routeFound {
			t := float64(newProgress) / 100.0

			// Check if this route has waypoints
			key := routeOrigin + "|" + routeDest
			if wps, ok := routeWaypoints[key]; ok {
				// Build full path: origin → waypoints → destination
				points := make([]Waypoint, 0, len(wps)+2)
				points = append(points, Waypoint{origLat, origLng})
				points = append(points, wps...)
				points = append(points, Waypoint{destLat, destLng})

				// Find which segment we're on
				totalSegments := len(points) - 1
				scaledT := t * float64(totalSegments)
				segIdx := int(scaledT)
				if segIdx >= totalSegments {
					segIdx = totalSegments - 1
				}
				segT := scaledT - float64(segIdx)

				p1 := points[segIdx]
				p2 := points[segIdx+1]
				newLat = p1.Lat + (p2.Lat-p1.Lat)*segT + (rand.Float64()-0.5)*0.001
				newLng = p1.Lng + (p2.Lng-p1.Lng)*segT + (rand.Float64()-0.5)*0.001
			} else {
				// Simple linear interpolation for routes that don't cross water
				newLat = origLat + (destLat-origLat)*t + (rand.Float64()-0.5)*0.002
				newLng = origLng + (destLng-origLng)*t + (rand.Float64()-0.5)*0.002
			}
		} else {
			// Fallback: small movement
			newLat = lat + (rand.Float64()-0.5)*0.003
			newLng = lng + (rand.Float64()-0.5)*0.003
		}

		// Clamp to Thailand land boundaries
		newLat = math.Max(5.5, math.Min(20.5, newLat))
		newLng = math.Max(97.0, math.Min(106.0, newLng))

		// Decrease fuel slightly
		newFuel := fuelLevel
		if rand.Float64() < 0.3 {
			newFuel = max(5, fuelLevel-1)
		}

		speed := 40 + rand.Float64()*50
		heading := math.Atan2(newLng-lng, newLat-lat) * 180 / math.Pi

		// Update DB
		database.DB.Exec("UPDATE trips SET current_lat=$1, current_lng=$2, progress=$3, updated_at=NOW() WHERE id=$4",
			newLat, newLng, newProgress, tripID)
		database.DB.Exec("UPDATE vehicles SET current_lat=$1, current_lng=$2, fuel_level=$3, updated_at=NOW() WHERE id=$4",
			newLat, newLng, newFuel, vehicleID)

		// Complete trip → auto-recycle
		if newProgress >= 100 {
			recycleTrip(tripID, vehicleID, driverID)
			status = "in-transit" // keep broadcasting as active (recycled)
			newProgress = 0
		}

		// Broadcast to WebSocket clients
		update := GPSUpdate{
			Type:      "gps_update",
			VehicleID: vehicleID,
			TripID:    tripID,
			Lat:       newLat,
			Lng:       newLng,
			Speed:     math.Round(speed*10) / 10,
			Heading:   math.Round(heading*10) / 10,
			FuelLevel: newFuel,
			Progress:  newProgress,
			Status:    status,
			Timestamp: time.Now().Format(time.RFC3339),
		}

		data, _ := json.Marshal(update)
		ws.GPSHub.Broadcast(data)
	}
}

// recycleTrip resets a completed trip with new route from pool
func recycleTrip(tripID, vehicleID, driverID string) {
	route := routePool[rand.Intn(len(routePool))]

	// Refuel vehicle
	newFuel := 70 + rand.Intn(30) // 70-99%

	now := time.Now().Format("2006-01-02 15:04:05")
	newProgress := rand.Intn(5) + 1 // start at 1-5%

	// Update trip with new route
	database.DB.Exec(`
		UPDATE trips SET
			origin = $1, destination = $2, distance = $3,
			current_lat = $4, current_lng = $5,
			progress = $6, status = 'in-transit',
			scheduled_departure = $7, actual_departure = $7,
			actual_arrival = NULL, updated_at = NOW()
		WHERE id = $8`,
		route.Origin, route.Destination, route.Distance,
		route.OriginLat, route.OriginLng,
		newProgress, now, tripID)

	// Keep vehicle & driver active
	database.DB.Exec("UPDATE vehicles SET status='on-trip', fuel_level=$1, current_lat=$2, current_lng=$3, updated_at=NOW() WHERE id=$4",
		newFuel, route.OriginLat, route.OriginLng, vehicleID)
	database.DB.Exec("UPDATE drivers SET status='on-duty', hours_today=0, updated_at=NOW() WHERE id=$1", driverID)

	log.Printf("🔄 Trip %s recycled: %s → %s (%d กม.)", tripID, route.Origin, route.Destination, route.Distance)

	// Broadcast recycle notification
	notification := map[string]interface{}{
		"type":    "trip_recycled",
		"tripId":  tripID,
		"origin":  route.Origin,
		"dest":    route.Destination,
		"message": fmt.Sprintf("ทริป %s เริ่มเส้นทางใหม่: %s → %s", tripID, route.Origin, route.Destination),
	}
	data, _ := json.Marshal(notification)
	ws.GPSHub.Broadcast(data)
}
