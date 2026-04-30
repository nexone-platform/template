package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nexspeed/backend/database"
	"github.com/nexspeed/backend/models"
)

// ========== MAINTENANCE RECORDS ==========

func GetMaintenanceRecords(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, vehicle_id, type, description, status, priority,
		scheduled_date, completed_date, cost, mechanic, garage, mileage_at, COALESCE(notes,''), created_at, updated_at
		FROM nex_speed.maintenance_records ORDER BY created_at DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.MaintenanceRecord
	for rows.Next() {
		var r models.MaintenanceRecord
		if err := rows.Scan(&r.ID, &r.VehicleID, &r.Type, &r.Description, &r.Status, &r.Priority,
			&r.ScheduledDate, &r.CompletedDate, &r.Cost, &r.Mechanic, &r.Garage, &r.MileageAt, &r.Notes, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateMaintenanceRecord(c *gin.Context) {
	var r models.MaintenanceRecord
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	now := time.Now()
	_, err := database.DB.Exec(`INSERT INTO nex_speed.maintenance_records (id, vehicle_id, type, description, status, priority, scheduled_date, completed_date, cost, mechanic, garage, mileage_at, notes, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
		r.ID, r.VehicleID, r.Type, r.Description, r.Status, r.Priority, r.ScheduledDate, r.CompletedDate, r.Cost, r.Mechanic, r.Garage, r.MileageAt, r.Notes, now, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateMaintenanceRecord(c *gin.Context) {
	id := c.Param("id")
	var r models.MaintenanceRecord
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.maintenance_records SET vehicle_id=$1, type=$2, description=$3, status=$4, priority=$5, scheduled_date=$6, completed_date=$7, cost=$8, mechanic=$9, garage=$10, mileage_at=$11, notes=$12, updated_at=$13 WHERE id=$14`,
		r.VehicleID, r.Type, r.Description, r.Status, r.Priority, r.ScheduledDate, r.CompletedDate, r.Cost, r.Mechanic, r.Garage, r.MileageAt, r.Notes, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteMaintenanceRecord(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.maintenance_records WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== MECHANICS ==========

func GetMechanics(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, phone, specialization, experience, rating, garage, address, certification, status, COALESCE(notes,''), created_at, updated_at FROM nex_speed.mechanics ORDER BY name`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.Mechanic
	for rows.Next() {
		var r models.Mechanic
		if err := rows.Scan(&r.ID, &r.Name, &r.Phone, &r.Specialization, &r.Experience, &r.Rating, &r.Garage, &r.Address, &r.Certification, &r.Status, &r.Notes, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateMechanic(c *gin.Context) {
	var r models.Mechanic
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	now := time.Now()
	_, err := database.DB.Exec(`INSERT INTO nex_speed.mechanics (id, name, phone, specialization, experience, rating, garage, address, certification, status, notes, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
		r.ID, r.Name, r.Phone, r.Specialization, r.Experience, r.Rating, r.Garage, r.Address, r.Certification, r.Status, r.Notes, now, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateMechanic(c *gin.Context) {
	id := c.Param("id")
	var r models.Mechanic
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.mechanics SET name=$1, phone=$2, specialization=$3, experience=$4, rating=$5, garage=$6, address=$7, certification=$8, status=$9, notes=$10, updated_at=$11 WHERE id=$12`,
		r.Name, r.Phone, r.Specialization, r.Experience, r.Rating, r.Garage, r.Address, r.Certification, r.Status, r.Notes, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteMechanic(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.mechanics WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== CONTAINER MECHANICS ==========

func GetContainerMechanics(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, phone, specialization, experience, rating, garage, address, certification, status, COALESCE(notes,''), created_at, updated_at FROM nex_speed.container_mechanics ORDER BY name`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.ContainerMechanic
	for rows.Next() {
		var r models.ContainerMechanic
		if err := rows.Scan(&r.ID, &r.Name, &r.Phone, &r.Specialization, &r.Experience, &r.Rating, &r.Garage, &r.Address, &r.Certification, &r.Status, &r.Notes, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateContainerMechanic(c *gin.Context) {
	var r models.ContainerMechanic
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	now := time.Now()
	_, err := database.DB.Exec(`INSERT INTO nex_speed.container_mechanics (id, name, phone, specialization, experience, rating, garage, address, certification, status, notes, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
		r.ID, r.Name, r.Phone, r.Specialization, r.Experience, r.Rating, r.Garage, r.Address, r.Certification, r.Status, r.Notes, now, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateContainerMechanic(c *gin.Context) {
	id := c.Param("id")
	var r models.ContainerMechanic
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.container_mechanics SET name=$1, phone=$2, specialization=$3, experience=$4, rating=$5, garage=$6, address=$7, certification=$8, status=$9, notes=$10, updated_at=$11 WHERE id=$12`,
		r.Name, r.Phone, r.Specialization, r.Experience, r.Rating, r.Garage, r.Address, r.Certification, r.Status, r.Notes, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteContainerMechanic(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.container_mechanics WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== PARTS SHOPS ==========

func GetPartsShops(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, contact_person, phone, COALESCE(line_id,''), category, COALESCE(address,''), rating, status, COALESCE(notes,''), created_at, updated_at FROM nex_speed.parts_shops ORDER BY name`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.PartsShop
	for rows.Next() {
		var r models.PartsShop
		if err := rows.Scan(&r.ID, &r.Name, &r.ContactPerson, &r.Phone, &r.LineID, &r.Category, &r.Address, &r.Rating, &r.Status, &r.Notes, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreatePartsShop(c *gin.Context) {
	var r models.PartsShop
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	now := time.Now()
	_, err := database.DB.Exec(`INSERT INTO nex_speed.parts_shops (id, name, contact_person, phone, line_id, category, address, rating, status, notes, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
		r.ID, r.Name, r.ContactPerson, r.Phone, r.LineID, r.Category, r.Address, r.Rating, r.Status, r.Notes, now, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdatePartsShop(c *gin.Context) {
	id := c.Param("id")
	var r models.PartsShop
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.parts_shops SET name=$1, contact_person=$2, phone=$3, line_id=$4, category=$5, address=$6, rating=$7, status=$8, notes=$9, updated_at=$10 WHERE id=$11`,
		r.Name, r.ContactPerson, r.Phone, r.LineID, r.Category, r.Address, r.Rating, r.Status, r.Notes, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeletePartsShop(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.parts_shops WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== STOCK PARTS ==========

func GetStockParts(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, part_number, category, quantity, min_stock, unit, unit_price, COALESCE(location,''), COALESCE(supplier,''), status, created_at, updated_at FROM nex_speed.stock_parts ORDER BY name`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.StockPart
	for rows.Next() {
		var r models.StockPart
		if err := rows.Scan(&r.ID, &r.Name, &r.PartNumber, &r.Category, &r.Quantity, &r.MinStock, &r.Unit, &r.UnitPrice, &r.Location, &r.Supplier, &r.Status, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateStockPart(c *gin.Context) {
	var r models.StockPart
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	now := time.Now()
	_, err := database.DB.Exec(`INSERT INTO nex_speed.stock_parts (id, name, part_number, category, quantity, min_stock, unit, unit_price, location, supplier, status, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
		r.ID, r.Name, r.PartNumber, r.Category, r.Quantity, r.MinStock, r.Unit, r.UnitPrice, r.Location, r.Supplier, r.Status, now, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateStockPart(c *gin.Context) {
	id := c.Param("id")
	var r models.StockPart
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.stock_parts SET name=$1, part_number=$2, category=$3, quantity=$4, min_stock=$5, unit=$6, unit_price=$7, location=$8, supplier=$9, status=$10, updated_at=$11 WHERE id=$12`,
		r.Name, r.PartNumber, r.Category, r.Quantity, r.MinStock, r.Unit, r.UnitPrice, r.Location, r.Supplier, r.Status, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteStockPart(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.stock_parts WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== STOCK OIL ==========

func GetStockOil(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, type, brand, quantity, min_stock, unit, unit_price, COALESCE(location,''), COALESCE(supplier,''), expiry_date, status, created_at, updated_at FROM nex_speed.stock_oil ORDER BY name`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.StockOil
	for rows.Next() {
		var r models.StockOil
		if err := rows.Scan(&r.ID, &r.Name, &r.Type, &r.Brand, &r.Quantity, &r.MinStock, &r.Unit, &r.UnitPrice, &r.Location, &r.Supplier, &r.ExpiryDate, &r.Status, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateStockOil(c *gin.Context) {
	var r models.StockOil
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	now := time.Now()
	_, err := database.DB.Exec(`INSERT INTO nex_speed.stock_oil (id, name, type, brand, quantity, min_stock, unit, unit_price, location, supplier, expiry_date, status, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
		r.ID, r.Name, r.Type, r.Brand, r.Quantity, r.MinStock, r.Unit, r.UnitPrice, r.Location, r.Supplier, r.ExpiryDate, r.Status, now, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateStockOil(c *gin.Context) {
	id := c.Param("id")
	var r models.StockOil
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.stock_oil SET name=$1, type=$2, brand=$3, quantity=$4, min_stock=$5, unit=$6, unit_price=$7, location=$8, supplier=$9, expiry_date=$10, status=$11, updated_at=$12 WHERE id=$13`,
		r.Name, r.Type, r.Brand, r.Quantity, r.MinStock, r.Unit, r.UnitPrice, r.Location, r.Supplier, r.ExpiryDate, r.Status, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteStockOil(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.stock_oil WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== STORAGE LOCATIONS ==========

func GetStorageLocations(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, type, COALESCE(address,''), COALESCE(capacity,''), COALESCE(current_usage,'0%'), COALESCE(contact_person,''), COALESCE(phone,''), status, COALESCE(notes,''), latitude, longitude, created_at, updated_at FROM nex_speed.storage_locations ORDER BY name`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.StorageLocation
	for rows.Next() {
		var r models.StorageLocation
		if err := rows.Scan(&r.ID, &r.Name, &r.Type, &r.Address, &r.Capacity, &r.CurrentUsage, &r.ContactPerson, &r.Phone, &r.Status, &r.Notes, &r.Latitude, &r.Longitude, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateStorageLocation(c *gin.Context) {
	var r models.StorageLocation
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	now := time.Now()
	_, err := database.DB.Exec(`INSERT INTO nex_speed.storage_locations (id, name, type, address, capacity, current_usage, contact_person, phone, status, notes, latitude, longitude, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
		r.ID, r.Name, r.Type, r.Address, r.Capacity, r.CurrentUsage, r.ContactPerson, r.Phone, r.Status, r.Notes, r.Latitude, r.Longitude, now, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateStorageLocation(c *gin.Context) {
	id := c.Param("id")
	var r models.StorageLocation
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.storage_locations SET name=$1, type=$2, address=$3, capacity=$4, current_usage=$5, contact_person=$6, phone=$7, status=$8, notes=$9, latitude=$10, longitude=$11, updated_at=$12 WHERE id=$13`,
		r.Name, r.Type, r.Address, r.Capacity, r.CurrentUsage, r.ContactPerson, r.Phone, r.Status, r.Notes, r.Latitude, r.Longitude, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteStorageLocation(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.storage_locations WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== PARKING LOTS ==========

func GetParkingLots(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, COALESCE(address,''), total_slots, used_slots, type, COALESCE(facilities,''), COALESCE(contact_person,''), COALESCE(phone,''), monthly_rent, latitude, longitude, status, COALESCE(notes,''), created_at, updated_at FROM nex_speed.parking_lots ORDER BY name`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.ParkingLot
	for rows.Next() {
		var r models.ParkingLot
		if err := rows.Scan(&r.ID, &r.Name, &r.Address, &r.TotalSlots, &r.UsedSlots, &r.Type, &r.Facilities, &r.ContactPerson, &r.Phone, &r.MonthlyRent, &r.Latitude, &r.Longitude, &r.Status, &r.Notes, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateParkingLot(c *gin.Context) {
	var r models.ParkingLot
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	now := time.Now()
	_, err := database.DB.Exec(`INSERT INTO nex_speed.parking_lots (id, name, address, total_slots, used_slots, type, facilities, contact_person, phone, monthly_rent, latitude, longitude, status, notes, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
		r.ID, r.Name, r.Address, r.TotalSlots, r.UsedSlots, r.Type, r.Facilities, r.ContactPerson, r.Phone, r.MonthlyRent, r.Latitude, r.Longitude, r.Status, r.Notes, now, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateParkingLot(c *gin.Context) {
	id := c.Param("id")
	var r models.ParkingLot
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.parking_lots SET name=$1, address=$2, total_slots=$3, used_slots=$4, type=$5, facilities=$6, contact_person=$7, phone=$8, monthly_rent=$9, latitude=$10, longitude=$11, status=$12, notes=$13, updated_at=$14 WHERE id=$15`,
		r.Name, r.Address, r.TotalSlots, r.UsedSlots, r.Type, r.Facilities, r.ContactPerson, r.Phone, r.MonthlyRent, r.Latitude, r.Longitude, r.Status, r.Notes, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteParkingLot(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.parking_lots WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}
