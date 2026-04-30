package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nexspeed/backend/database"
	"github.com/nexspeed/backend/models"
)

func GetVehicles(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, plate_number, type, brand, model, year, status, fuel_level,
		mileage, COALESCE(next_maintenance::text,''), COALESCE(insurance_expiry::text,''),
		driver_id, current_lat, current_lng, capacity, created_at, updated_at FROM vehicles ORDER BY id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()

	vehicles := []models.Vehicle{}
	for rows.Next() {
		var v models.Vehicle
		rows.Scan(&v.ID, &v.PlateNumber, &v.Type, &v.Brand, &v.Model, &v.Year,
			&v.Status, &v.FuelLevel, &v.Mileage, &v.NextMaintenance, &v.InsuranceExpiry,
			&v.DriverID, &v.CurrentLat, &v.CurrentLng, &v.Capacity, &v.CreatedAt, &v.UpdatedAt)
		vehicles = append(vehicles, v)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: vehicles})
}

func GetVehicleByID(c *gin.Context) {
	var v models.Vehicle
	err := database.DB.QueryRow(`SELECT id, plate_number, type, brand, model, year, status, fuel_level,
		mileage, COALESCE(next_maintenance::text,''), COALESCE(insurance_expiry::text,''),
		driver_id, current_lat, current_lng, capacity, created_at, updated_at FROM vehicles WHERE id=$1`, c.Param("id")).
		Scan(&v.ID, &v.PlateNumber, &v.Type, &v.Brand, &v.Model, &v.Year,
			&v.Status, &v.FuelLevel, &v.Mileage, &v.NextMaintenance, &v.InsuranceExpiry,
			&v.DriverID, &v.CurrentLat, &v.CurrentLng, &v.Capacity, &v.CreatedAt, &v.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{Success: false, Message: "Vehicle not found"})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: v})
}

func CreateVehicle(c *gin.Context) {
	var v models.Vehicle
	if err := c.ShouldBindJSON(&v); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`INSERT INTO vehicles (id,plate_number,type,brand,model,year,status,fuel_level,mileage,next_maintenance,insurance_expiry,capacity)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
		v.ID, v.PlateNumber, v.Type, v.Brand, v.Model, v.Year, v.Status, v.FuelLevel, v.Mileage, v.NextMaintenance, v.InsuranceExpiry, v.Capacity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Message: "Vehicle created", Data: v})
}

func UpdateVehicle(c *gin.Context) {
	var v models.Vehicle
	if err := c.ShouldBindJSON(&v); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE vehicles SET plate_number=$1,type=$2,brand=$3,model=$4,year=$5,status=$6,
		fuel_level=$7,mileage=$8,next_maintenance=$9,insurance_expiry=$10,capacity=$11,updated_at=NOW() WHERE id=$12`,
		v.PlateNumber, v.Type, v.Brand, v.Model, v.Year, v.Status, v.FuelLevel, v.Mileage, v.NextMaintenance, v.InsuranceExpiry, v.Capacity, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Vehicle updated"})
}

func DeleteVehicle(c *gin.Context) {
	_, err := database.DB.Exec("DELETE FROM vehicles WHERE id=$1", c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Vehicle deleted"})
}
