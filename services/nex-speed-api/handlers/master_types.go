package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nexspeed/backend/database"
	"github.com/nexspeed/backend/models"
)

// ========== GENERIC HELPER ==========

func scanIntRows[T any](rows interface{ Next() bool; Scan(...any) error; Close() error }, scan func(*T) []any) []T {
	defer rows.Close()
	var items []T
	for rows.Next() {
		var r T
		if err := rows.Scan(scan(&r)...); err != nil {
			continue
		}
		items = append(items, r)
	}
	return items
}

// ========== PARKING TYPES ==========

func GetParkingTypes(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, description, status, created_at, updated_at FROM nex_speed.parking_types ORDER BY id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.ParkingType
	for rows.Next() {
		var r models.ParkingType
		if err := rows.Scan(&r.ID, &r.Name, &r.Description, &r.Status, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateParkingType(c *gin.Context) {
	var r models.ParkingType
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	if r.Status == "" {
		r.Status = "active"
	}
	now := time.Now()
	err := database.DB.QueryRow(`INSERT INTO nex_speed.parking_types (name, description, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
		r.Name, r.Description, r.Status, now, now).Scan(&r.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	r.CreatedAt = now
	r.UpdatedAt = now
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateParkingType(c *gin.Context) {
	id := c.Param("id")
	var r models.ParkingType
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.parking_types SET name=$1, description=$2, status=$3, updated_at=$4 WHERE id=$5`,
		r.Name, r.Description, r.Status, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteParkingType(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.parking_types WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== STORAGE TYPES ==========

func GetStorageTypes(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, description, status, created_at, updated_at FROM nex_speed.storage_types ORDER BY id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.StorageType
	for rows.Next() {
		var r models.StorageType
		if err := rows.Scan(&r.ID, &r.Name, &r.Description, &r.Status, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateStorageType(c *gin.Context) {
	var r models.StorageType
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	if r.Status == "" {
		r.Status = "active"
	}
	now := time.Now()
	err := database.DB.QueryRow(`INSERT INTO nex_speed.storage_types (name, description, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
		r.Name, r.Description, r.Status, now, now).Scan(&r.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	r.CreatedAt = now
	r.UpdatedAt = now
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateStorageType(c *gin.Context) {
	id := c.Param("id")
	var r models.StorageType
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.storage_types SET name=$1, description=$2, status=$3, updated_at=$4 WHERE id=$5`,
		r.Name, r.Description, r.Status, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteStorageType(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.storage_types WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== PART GROUPS ==========

func GetPartGroups(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, description, status, created_at, updated_at FROM nex_speed.part_groups ORDER BY id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.PartGroup
	for rows.Next() {
		var r models.PartGroup
		if err := rows.Scan(&r.ID, &r.Name, &r.Description, &r.Status, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreatePartGroup(c *gin.Context) {
	var r models.PartGroup
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	if r.Status == "" {
		r.Status = "active"
	}
	now := time.Now()
	err := database.DB.QueryRow(`INSERT INTO nex_speed.part_groups (name, description, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
		r.Name, r.Description, r.Status, now, now).Scan(&r.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	r.CreatedAt = now
	r.UpdatedAt = now
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdatePartGroup(c *gin.Context) {
	id := c.Param("id")
	var r models.PartGroup
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.part_groups SET name=$1, description=$2, status=$3, updated_at=$4 WHERE id=$5`,
		r.Name, r.Description, r.Status, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeletePartGroup(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.part_groups WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== PART CATEGORIES ==========

func GetPartCategories(c *gin.Context) {
	rows, err := database.DB.Query(`
		SELECT c.id, c.name, c.description, c.status, c.part_group_id, g.name, c.created_at, c.updated_at 
		FROM nex_speed.part_categories c
		LEFT JOIN nex_speed.part_groups g ON c.part_group_id = g.id
		ORDER BY c.id
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.PartCategory
	for rows.Next() {
		var r models.PartCategory
		if err := rows.Scan(&r.ID, &r.Name, &r.Description, &r.Status, &r.PartGroupID, &r.PartGroupName, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreatePartCategory(c *gin.Context) {
	var r models.PartCategory
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	if r.Status == "" {
		r.Status = "active"
	}
	now := time.Now()
	err := database.DB.QueryRow(`INSERT INTO nex_speed.part_categories (name, description, status, part_group_id, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
		r.Name, r.Description, r.Status, r.PartGroupID, now, now).Scan(&r.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	r.CreatedAt = now
	r.UpdatedAt = now
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdatePartCategory(c *gin.Context) {
	id := c.Param("id")
	var r models.PartCategory
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.part_categories SET name=$1, description=$2, status=$3, part_group_id=$4, updated_at=$5 WHERE id=$6`,
		r.Name, r.Description, r.Status, r.PartGroupID, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeletePartCategory(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.part_categories WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== LIQUID TYPES ==========

func GetLiquidTypes(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, description, status, created_at, updated_at FROM nex_speed.liquid_types ORDER BY id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.LiquidType
	for rows.Next() {
		var r models.LiquidType
		if err := rows.Scan(&r.ID, &r.Name, &r.Description, &r.Status, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateLiquidType(c *gin.Context) {
	var r models.LiquidType
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	if r.Status == "" {
		r.Status = "active"
	}
	now := time.Now()
	err := database.DB.QueryRow(`INSERT INTO nex_speed.liquid_types (name, description, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
		r.Name, r.Description, r.Status, now, now).Scan(&r.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	r.CreatedAt = now
	r.UpdatedAt = now
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateLiquidType(c *gin.Context) {
	id := c.Param("id")
	var r models.LiquidType
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.liquid_types SET name=$1, description=$2, status=$3, updated_at=$4 WHERE id=$5`,
		r.Name, r.Description, r.Status, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteLiquidType(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.liquid_types WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== UNIT TYPES ==========

func GetUnitTypes(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, description, status, created_at, updated_at FROM nex_speed.unit_types ORDER BY id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.UnitType
	for rows.Next() {
		var r models.UnitType
		if err := rows.Scan(&r.ID, &r.Name, &r.Description, &r.Status, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateUnitType(c *gin.Context) {
	var r models.UnitType
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	if r.Status == "" {
		r.Status = "active"
	}
	now := time.Now()
	err := database.DB.QueryRow(`INSERT INTO nex_speed.unit_types (name, description, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
		r.Name, r.Description, r.Status, now, now).Scan(&r.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	r.CreatedAt = now
	r.UpdatedAt = now
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateUnitType(c *gin.Context) {
	id := c.Param("id")
	var r models.UnitType
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.unit_types SET name=$1, description=$2, status=$3, updated_at=$4 WHERE id=$5`,
		r.Name, r.Description, r.Status, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteUnitType(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.unit_types WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== MECHANIC EXPERTISE ==========

func GetMechanicExpertise(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, mechanic_type, description, status, created_at, updated_at FROM nex_speed.mechanic_expertise ORDER BY mechanic_type, name`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.MechanicExpertise
	for rows.Next() {
		var r models.MechanicExpertise
		if err := rows.Scan(&r.ID, &r.Name, &r.MechanicType, &r.Description, &r.Status, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateMechanicExpertise(c *gin.Context) {
	var r models.MechanicExpertise
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	if r.Status == "" {
		r.Status = "active"
	}
	now := time.Now()
	err := database.DB.QueryRow(`INSERT INTO nex_speed.mechanic_expertise (name, mechanic_type, description, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
		r.Name, r.MechanicType, r.Description, r.Status, now, now).Scan(&r.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	r.CreatedAt = now
	r.UpdatedAt = now
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateMechanicExpertise(c *gin.Context) {
	id := c.Param("id")
	var r models.MechanicExpertise
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.mechanic_expertise SET name=$1, mechanic_type=$2, description=$3, status=$4, updated_at=$5 WHERE id=$6`,
		r.Name, r.MechanicType, r.Description, r.Status, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteMechanicExpertise(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.mechanic_expertise WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== MECHANIC TYPES ==========

func GetMechanicTypes(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, description, status, created_at, updated_at FROM nex_speed.mechanic_types ORDER BY id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.MechanicType
	for rows.Next() {
		var r models.MechanicType
		if err := rows.Scan(&r.ID, &r.Name, &r.Description, &r.Status, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateMechanicType(c *gin.Context) {
	var r models.MechanicType
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	if r.Status == "" {
		r.Status = "active"
	}
	now := time.Now()
	err := database.DB.QueryRow(`INSERT INTO nex_speed.mechanic_types (name, description, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
		r.Name, r.Description, r.Status, now, now).Scan(&r.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	r.CreatedAt = now
	r.UpdatedAt = now
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateMechanicType(c *gin.Context) {
	id := c.Param("id")
	var r models.MechanicType
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.mechanic_types SET name=$1, description=$2, status=$3, updated_at=$4 WHERE id=$5`,
		r.Name, r.Description, r.Status, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteMechanicType(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.mechanic_types WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== VEHICLE TYPES ==========

func GetVehicleTypes(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, description, status, created_at, updated_at FROM nex_speed.vehicle_types ORDER BY id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.VehicleType
	for rows.Next() {
		var r models.VehicleType
		if err := rows.Scan(&r.ID, &r.Name, &r.Description, &r.Status, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateVehicleType(c *gin.Context) {
	var r models.VehicleType
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	if r.Status == "" {
		r.Status = "active"
	}
	now := time.Now()
	err := database.DB.QueryRow(`INSERT INTO nex_speed.vehicle_types (name, description, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
		r.Name, r.Description, r.Status, now, now).Scan(&r.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	r.CreatedAt = now
	r.UpdatedAt = now
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateVehicleType(c *gin.Context) {
	id := c.Param("id")
	var r models.VehicleType
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.vehicle_types SET name=$1, description=$2, status=$3, updated_at=$4 WHERE id=$5`,
		r.Name, r.Description, r.Status, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteVehicleType(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.vehicle_types WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}
