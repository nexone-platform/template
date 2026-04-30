package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nexspeed/backend/database"
	"github.com/nexspeed/backend/models"
)

func GetInvoices(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, customer_name, trip_id, order_id, amount, status,
		COALESCE(issue_date::text,''), due_date, paid_date, created_at, updated_at FROM invoices ORDER BY created_at DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()

	invoices := []models.Invoice{}
	for rows.Next() {
		var inv models.Invoice
		rows.Scan(&inv.ID, &inv.CustomerName, &inv.TripID, &inv.OrderID, &inv.Amount, &inv.Status,
			&inv.IssueDate, &inv.DueDate, &inv.PaidDate, &inv.CreatedAt, &inv.UpdatedAt)
		invoices = append(invoices, inv)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: invoices})
}

func CreateInvoice(c *gin.Context) {
	var inv models.Invoice
	if err := c.ShouldBindJSON(&inv); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`INSERT INTO invoices (id,customer_name,trip_id,order_id,amount,status,issue_date,due_date)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
		inv.ID, inv.CustomerName, inv.TripID, inv.OrderID, inv.Amount, inv.Status, inv.IssueDate, inv.DueDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Message: "Invoice created", Data: inv})
}

func UpdateInvoice(c *gin.Context) {
	var inv models.Invoice
	if err := c.ShouldBindJSON(&inv); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE invoices SET customer_name=$1,amount=$2,status=$3,due_date=$4,paid_date=$5,updated_at=NOW() WHERE id=$6`,
		inv.CustomerName, inv.Amount, inv.Status, inv.DueDate, inv.PaidDate, c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Invoice updated"})
}

func DeleteInvoice(c *gin.Context) {
	_, err := database.DB.Exec("DELETE FROM invoices WHERE id=$1", c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "Invoice deleted"})
}
