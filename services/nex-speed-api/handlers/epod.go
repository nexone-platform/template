package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nexspeed/backend/database"
	"github.com/nexspeed/backend/models"
)

// ePOD — Electronic Proof of Delivery

type EPODSubmission struct {
	TripID           string  `json:"tripId"`
	ReceiverName     string  `json:"receiverName"`
	SignatureURL     string  `json:"signatureUrl"`
	PhotoURL         string  `json:"photoUrl"`
	ProductPhotoURL  string  `json:"productPhotoUrl"`
	DeliveryPhotoURL string  `json:"deliveryPhotoUrl"`
	Notes            string  `json:"notes"`
	Lat              float64 `json:"lat"`
	Lng              float64 `json:"lng"`
}

type EPODRecord struct {
	ID               int       `json:"id"`
	TripID           string    `json:"tripId"`
	ReceiverName     string    `json:"receiverName"`
	SignatureURL     string    `json:"signatureUrl"`
	PhotoURL         string    `json:"photoUrl"`
	ProductPhotoURL  string    `json:"productPhotoUrl"`
	DeliveryPhotoURL string    `json:"deliveryPhotoUrl"`
	Notes            string    `json:"notes"`
	Lat              float64   `json:"lat"`
	Lng              float64   `json:"lng"`
	SubmittedAt      time.Time `json:"submittedAt"`
}

func SubmitEPOD(c *gin.Context) {
	var body EPODSubmission
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}

	// Upsert: if trip_id exists, update; otherwise insert
	_, err := database.DB.Exec(`INSERT INTO epod (trip_id, receiver_name, signature_url, photo_url, product_photo_url, delivery_photo_url, notes, lat, lng)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (trip_id) DO UPDATE SET
			receiver_name = EXCLUDED.receiver_name,
			signature_url = EXCLUDED.signature_url,
			photo_url = EXCLUDED.photo_url,
			product_photo_url = EXCLUDED.product_photo_url,
			delivery_photo_url = EXCLUDED.delivery_photo_url,
			notes = EXCLUDED.notes,
			lat = EXCLUDED.lat,
			lng = EXCLUDED.lng,
			submitted_at = NOW()`,
		body.TripID, body.ReceiverName, body.SignatureURL, body.PhotoURL,
		body.ProductPhotoURL, body.DeliveryPhotoURL, body.Notes, body.Lat, body.Lng)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}

	// Mark trip as delivered
	database.DB.Exec("UPDATE trips SET status='completed', actual_arrival=NOW(), progress=100, updated_at=NOW() WHERE id=$1", body.TripID)

	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Message: "ePOD submitted successfully"})
}

func GetEPODs(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, trip_id, receiver_name, COALESCE(signature_url,''), COALESCE(photo_url,''),
		COALESCE(product_photo_url,''), COALESCE(delivery_photo_url,''),
		COALESCE(notes,''), lat, lng, submitted_at FROM epod ORDER BY submitted_at DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()

	records := []EPODRecord{}
	for rows.Next() {
		var r EPODRecord
		rows.Scan(&r.ID, &r.TripID, &r.ReceiverName, &r.SignatureURL, &r.PhotoURL,
			&r.ProductPhotoURL, &r.DeliveryPhotoURL, &r.Notes, &r.Lat, &r.Lng, &r.SubmittedAt)
		records = append(records, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: records})
}

// GetEPODByTrip returns the ePOD for a specific trip
func GetEPODByTrip(c *gin.Context) {
	tripID := c.Param("tripId")

	var r EPODRecord
	err := database.DB.QueryRow(`SELECT id, trip_id, receiver_name, COALESCE(signature_url,''), COALESCE(photo_url,''),
		COALESCE(product_photo_url,''), COALESCE(delivery_photo_url,''),
		COALESCE(notes,''), lat, lng, submitted_at FROM epod WHERE trip_id=$1`, tripID).Scan(
		&r.ID, &r.TripID, &r.ReceiverName, &r.SignatureURL, &r.PhotoURL,
		&r.ProductPhotoURL, &r.DeliveryPhotoURL, &r.Notes, &r.Lat, &r.Lng, &r.SubmittedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: nil})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: r})
}
