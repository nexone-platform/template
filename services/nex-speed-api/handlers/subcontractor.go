package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nexspeed/backend/database"
	"github.com/nexspeed/backend/models"
)

func GetSubcontractors(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, company_name, contact_person, phone, tier, vehicle_count,
		performance_score, on_time_rate, bounce_rate, status, total_trips, license_valid, insurance_valid,
		COALESCE(join_date::text,''), created_at, updated_at FROM subcontractors ORDER BY id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()

	subs := []models.Subcontractor{}
	for rows.Next() {
		var s models.Subcontractor
		rows.Scan(&s.ID, &s.CompanyName, &s.ContactPerson, &s.Phone, &s.Tier, &s.VehicleCount,
			&s.PerformanceScore, &s.OnTimeRate, &s.BounceRate, &s.Status, &s.TotalTrips,
			&s.LicenseValid, &s.InsuranceValid, &s.JoinDate, &s.CreatedAt, &s.UpdatedAt)
		subs = append(subs, s)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: subs})
}

func CreateSubcontractor(c *gin.Context) {
	var s models.Subcontractor
	if err := c.ShouldBindJSON(&s); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`INSERT INTO subcontractors (id,company_name,contact_person,phone,tier,vehicle_count,performance_score,on_time_rate,bounce_rate,status,total_trips,license_valid,insurance_valid,join_date)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
		s.ID, s.CompanyName, s.ContactPerson, s.Phone, s.Tier, s.VehicleCount, s.PerformanceScore, s.OnTimeRate, s.BounceRate, s.Status, s.TotalTrips, s.LicenseValid, s.InsuranceValid, s.JoinDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Message: "Subcontractor created", Data: s})
}

func UpdateSubcontractor(c *gin.Context) {
	var s models.Subcontractor
	if err := c.ShouldBindJSON(&s); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE subcontractors SET company_name=$1,contact_person=$2,phone=$3,tier=$4,vehicle_count=$5,
		performance_score=$6,on_time_rate=$7,bounce_rate=$8,status=$9,total_trips=$10,license_valid=$11,insurance_valid=$12,updated_at=NOW() WHERE id=$13`,
		s.CompanyName, s.ContactPerson, s.Phone, s.Tier, s.VehicleCount, s.PerformanceScore, s.OnTimeRate, s.BounceRate, s.Status, s.TotalTrips, s.LicenseValid, s.InsuranceValid, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Subcontractor updated"})
}

func DeleteSubcontractor(c *gin.Context) {
	_, err := database.DB.Exec("DELETE FROM subcontractors WHERE id=$1", c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Subcontractor deleted"})
}
