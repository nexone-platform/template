package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/nexspeed/backend/database"
	"github.com/nexspeed/backend/models"
)

// Route coordinate lookup for origin/destination
var routeCoords = map[string][2]float64{
	"คลังสินค้าสระบุรี":         {14.5289, 100.9103},
	"ท่าเรือแหลมฉบัง":          {13.0780, 100.8850},
	"DC ลาดกระบัง":             {13.7230, 100.7780},
	"คลังสินค้าชลบุรี":          {13.3611, 100.9847},
	"DC บางนา":                 {13.6670, 100.6397},
	"คลังสินค้าขอนแก่น":         {16.4321, 102.8236},
	"คลังน้ำมันศรีราชา":         {13.1683, 100.9267},
	"ปั๊ม ปตท. นครราชสีมา":      {14.9799, 102.0978},
	"โรงงานบางเลน":             {14.0168, 100.1686},
	"ดีลเลอร์เชียงใหม่":         {18.7883, 98.9853},
	"โกดังรังสิต":                {13.9825, 100.6230},
	"โรงงานระยอง":              {12.7083, 101.1379},
	"คลัง IT ลาดพร้าว":         {13.8231, 100.5752},
	"สาขาหาดใหญ่":              {7.0042, 100.4747},
	"โรงงานบางบัวทอง":           {13.9137, 100.4219},
	"คลังสินค้าภูเก็ต":          {7.8804, 98.3923},
	"โรงงานท่าหลวง":            {15.2680, 100.4750},
	"ไซต์งานเชียงราย":           {19.9071, 99.8305},
	"DC มหาชัย":                {13.5466, 100.2761},
	"สาขาอุดรธานี":              {17.4156, 102.7872},
	"โรงงานปราจีนบุรี":          {14.0508, 101.3717},
	"คลังกระดาษสุราษฎร์ธานี":     {9.1382, 99.3217},
	"โรงงานบ้านโป่ง":            {13.8191, 99.8607},
	"ไซต์งานอุบลราชธานี":        {15.2286, 104.8574},
	"คลังสินค้าบางพลี":          {13.5938, 100.7165},
	"สาขาสุรินทร์":              {14.8847, 103.4937},
	"โรงงานสมุทรสาคร":           {13.5475, 100.2740},
	"สาขาพิษณุโลก":             {16.8211, 100.2659},
	"โรงงานเกตเวย์":             {13.2210, 101.0015},
	"คลังปทุมธานี":              {14.0139, 100.5251},
	"โรงงานอมตะ":               {13.2210, 101.0015},
	"DC ศรีนครินทร์":           {13.6512, 100.6402},
	"คลังสินค้าสงขลา":          {7.1899, 100.5955},
	"คลังเขาดิน":               {14.3780, 100.9920},
	"สาขาลำปาง":                {18.2888, 99.4908},
	"โรงงานรามคำแหง":           {13.7580, 100.6420},
	"คลังสินค้านครพนม":          {17.3921, 104.7698},
}

func findRouteCoord(name string) (float64, float64) {
	if c, ok := routeCoords[name]; ok {
		return c[0], c[1]
	}
	// Fuzzy match: check if name contains any key
	for k, c := range routeCoords {
		if strings.Contains(name, k) || strings.Contains(k, name) {
			return c[0], c[1]
		}
	}
	return 0, 0
}

func GetTrips(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, order_id, vehicle_id, driver_id, status, origin, destination,
		COALESCE(departure_time::text,''), COALESCE(estimated_arrival::text,''), actual_arrival,
		distance, progress, current_lat, current_lng, created_at, updated_at FROM trips ORDER BY created_at DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()

	trips := []models.Trip{}
	for rows.Next() {
		var t models.Trip
		rows.Scan(&t.ID, &t.OrderID, &t.VehicleID, &t.DriverID, &t.Status, &t.Origin, &t.Destination,
			&t.DepartureTime, &t.EstimatedArrival, &t.ActualArrival, &t.Distance, &t.Progress,
			&t.CurrentLat, &t.CurrentLng, &t.CreatedAt, &t.UpdatedAt)

		// Populate origin/destination coordinates from route lookup
		t.OriginLat, t.OriginLng = findRouteCoord(t.Origin)
		t.DestLat, t.DestLng = findRouteCoord(t.Destination)

		trips = append(trips, t)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: trips})
}

func CreateTrip(c *gin.Context) {
	var t models.Trip
	if err := c.ShouldBindJSON(&t); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`INSERT INTO trips (id,order_id,vehicle_id,driver_id,status,origin,destination,departure_time,estimated_arrival,distance,progress,current_lat,current_lng)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
		t.ID, t.OrderID, t.VehicleID, t.DriverID, t.Status, t.Origin, t.Destination, t.DepartureTime, t.EstimatedArrival, t.Distance, t.Progress, t.CurrentLat, t.CurrentLng)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Message: "Trip created", Data: t})
}

func UpdateTrip(c *gin.Context) {
	var t models.Trip
	if err := c.ShouldBindJSON(&t); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE trips SET status=$1,progress=$2,current_lat=$3,current_lng=$4,actual_arrival=$5,updated_at=NOW() WHERE id=$6`,
		t.Status, t.Progress, t.CurrentLat, t.CurrentLng, t.ActualArrival, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Trip updated"})
}

func DeleteTrip(c *gin.Context) {
	_, err := database.DB.Exec("DELETE FROM trips WHERE id=$1", c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Trip deleted"})
}
