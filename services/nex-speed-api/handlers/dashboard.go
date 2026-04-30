package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nexspeed/backend/database"
	"github.com/nexspeed/backend/models"
)

func GetDashboardStats(c *gin.Context) {
	var stats models.DashboardStats
	database.DB.QueryRow("SELECT COUNT(*) FROM vehicles").Scan(&stats.TotalVehicles)
	database.DB.QueryRow("SELECT COUNT(*) FROM vehicles WHERE status='on-trip'").Scan(&stats.ActiveVehicles)
	database.DB.QueryRow("SELECT COUNT(*) FROM drivers").Scan(&stats.TotalDrivers)
	database.DB.QueryRow("SELECT COUNT(*) FROM drivers WHERE status='on-duty'").Scan(&stats.OnDutyDrivers)
	database.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE status='pending'").Scan(&stats.PendingOrders)
	database.DB.QueryRow("SELECT COUNT(*) FROM trips WHERE status IN ('in-transit','loading')").Scan(&stats.ActiveTrips)
	database.DB.QueryRow("SELECT COALESCE(SUM(estimated_cost),0) FROM orders WHERE created_at >= date_trunc('month', NOW())").Scan(&stats.MonthlyRevenue)

	var completed, total int
	database.DB.QueryRow("SELECT COUNT(*) FROM trips").Scan(&total)
	database.DB.QueryRow("SELECT COUNT(*) FROM trips WHERE status='completed' OR (actual_arrival IS NOT NULL AND actual_arrival <= estimated_arrival)").Scan(&completed)
	if total > 0 {
		stats.OnTimeRate = float64(completed) / float64(total) * 100
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: stats})
}

func GetAlerts(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, type, title, message, severity, is_read, entity_type, entity_id, created_at
		FROM alerts ORDER BY created_at DESC LIMIT 20`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()

	alerts := []models.Alert{}
	for rows.Next() {
		var a models.Alert
		rows.Scan(&a.ID, &a.Type, &a.Title, &a.Message, &a.Severity, &a.IsRead, &a.EntityType, &a.EntityID, &a.CreatedAt)
		alerts = append(alerts, a)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: alerts})
}

func GetRevenueMonthly(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT month, year, revenue, cost, profit FROM revenue_monthly ORDER BY year, id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()

	data := []models.RevenueMonthly{}
	for rows.Next() {
		var r models.RevenueMonthly
		rows.Scan(&r.Month, &r.Year, &r.Revenue, &r.Cost, &r.Profit)
		data = append(data, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: data})
}

func HealthCheck(c *gin.Context) {
	dbStatus := "disconnected"
	if database.DB != nil {
		if err := database.DB.Ping(); err == nil {
			dbStatus = "connected"
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"status": "ok", "service": "nexspeed-tms-api", "version": "1.0.0", "database": dbStatus,
	})
}
