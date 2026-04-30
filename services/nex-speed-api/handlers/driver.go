package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nexspeed/backend/database"
	"github.com/nexspeed/backend/models"
)

func GetDrivers(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, phone, license_type, COALESCE(license_expiry::text,''),
		status, safety_score, hours_today, total_trips, vehicle_id, created_at, updated_at FROM drivers ORDER BY id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()

	drivers := []models.Driver{}
	for rows.Next() {
		var d models.Driver
		rows.Scan(&d.ID, &d.Name, &d.Phone, &d.LicenseType, &d.LicenseExpiry,
			&d.Status, &d.SafetyScore, &d.HoursToday, &d.TotalTrips, &d.VehicleID, &d.CreatedAt, &d.UpdatedAt)
		drivers = append(drivers, d)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: drivers})
}

func CreateDriver(c *gin.Context) {
	var d models.Driver
	if err := c.ShouldBindJSON(&d); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`INSERT INTO drivers (id,name,phone,license_type,license_expiry,status,safety_score,hours_today,total_trips)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, d.ID, d.Name, d.Phone, d.LicenseType, d.LicenseExpiry, d.Status, d.SafetyScore, d.HoursToday, d.TotalTrips)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Message: "Driver created", Data: d})
}

func UpdateDriver(c *gin.Context) {
	var d models.Driver
	if err := c.ShouldBindJSON(&d); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE drivers SET name=$1,phone=$2,license_type=$3,license_expiry=$4,status=$5,
		safety_score=$6,hours_today=$7,total_trips=$8,vehicle_id=$9,updated_at=NOW() WHERE id=$10`,
		d.Name, d.Phone, d.LicenseType, d.LicenseExpiry, d.Status, d.SafetyScore, d.HoursToday, d.TotalTrips, d.VehicleID, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Driver updated"})
}

func DeleteDriver(c *gin.Context) {
	_, err := database.DB.Exec("DELETE FROM drivers WHERE id=$1", c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Driver deleted"})
}
