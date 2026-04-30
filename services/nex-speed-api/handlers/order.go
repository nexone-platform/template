package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nexspeed/backend/database"
	"github.com/nexspeed/backend/models"
)

func GetOrders(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, customer_name, origin, destination, cargo_type, weight,
		status, priority, COALESCE(delivery_date::text,''), estimated_cost, vehicle_id, driver_id, created_at, updated_at
		FROM orders ORDER BY created_at DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()

	orders := []models.Order{}
	for rows.Next() {
		var o models.Order
		rows.Scan(&o.ID, &o.CustomerName, &o.Origin, &o.Destination, &o.CargoType, &o.Weight,
			&o.Status, &o.Priority, &o.DeliveryDate, &o.EstimatedCost, &o.VehicleID, &o.DriverID, &o.CreatedAt, &o.UpdatedAt)
		orders = append(orders, o)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: orders})
}

func CreateOrder(c *gin.Context) {
	var o models.Order
	if err := c.ShouldBindJSON(&o); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`INSERT INTO orders (id,customer_name,origin,destination,cargo_type,weight,status,priority,delivery_date,estimated_cost)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
		o.ID, o.CustomerName, o.Origin, o.Destination, o.CargoType, o.Weight, o.Status, o.Priority, o.DeliveryDate, o.EstimatedCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Message: "Order created", Data: o})
}

func UpdateOrder(c *gin.Context) {
	var o models.Order
	if err := c.ShouldBindJSON(&o); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE orders SET customer_name=$1,origin=$2,destination=$3,cargo_type=$4,weight=$5,
		status=$6,priority=$7,delivery_date=$8,estimated_cost=$9,vehicle_id=$10,driver_id=$11,updated_at=NOW() WHERE id=$12`,
		o.CustomerName, o.Origin, o.Destination, o.CargoType, o.Weight, o.Status, o.Priority, o.DeliveryDate, o.EstimatedCost, o.VehicleID, o.DriverID, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Order updated"})
}

func DeleteOrder(c *gin.Context) {
	_, err := database.DB.Exec("DELETE FROM orders WHERE id=$1", c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Order deleted"})
}
