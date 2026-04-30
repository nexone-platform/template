package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nexspeed/backend/database"
	"github.com/nexspeed/backend/models"
)

// ========== BRANDS ==========

func GetBrands(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, name_en, country, logo, models, created_at, updated_at FROM nex_speed.brands ORDER BY id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.Brand
	for rows.Next() {
		var r models.Brand
		if err := rows.Scan(&r.ID, &r.Name, &r.NameEn, &r.Country, &r.Logo, &r.Models, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateBrand(c *gin.Context) {
	var r models.Brand
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	now := time.Now()
	err := database.DB.QueryRow(`INSERT INTO nex_speed.brands (name, name_en, country, logo, models, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
		r.Name, r.NameEn, r.Country, r.Logo, r.Models, now, now).Scan(&r.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	r.CreatedAt = now
	r.UpdatedAt = now
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateBrand(c *gin.Context) {
	id := c.Param("id")
	var r models.Brand
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.brands SET name=$1, name_en=$2, country=$3, logo=$4, models=$5, updated_at=$6 WHERE id=$7`,
		r.Name, r.NameEn, r.Country, r.Logo, r.Models, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteBrand(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.brands WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== PROVINCES ==========

func GetProvinces(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, name_en, abbr, region, created_at, updated_at FROM nex_speed.provinces ORDER BY id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.Province
	for rows.Next() {
		var r models.Province
		if err := rows.Scan(&r.ID, &r.Name, &r.NameEn, &r.Abbr, &r.Region, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateProvince(c *gin.Context) {
	var r models.Province
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	now := time.Now()
	err := database.DB.QueryRow(`INSERT INTO nex_speed.provinces (name, name_en, abbr, region, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
		r.Name, r.NameEn, r.Abbr, r.Region, now, now).Scan(&r.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	r.CreatedAt = now
	r.UpdatedAt = now
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateProvince(c *gin.Context) {
	id := c.Param("id")
	var r models.Province
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.provinces SET name=$1, name_en=$2, abbr=$3, region=$4, updated_at=$5 WHERE id=$6`,
		r.Name, r.NameEn, r.Abbr, r.Region, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteProvince(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.provinces WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== LOCATIONS ==========

func GetLocations(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, name, type, COALESCE(address,''), COALESCE(province,''), lat, lng, COALESCE(status, 'active'), created_at, updated_at FROM nex_speed.locations ORDER BY id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.LocationItem
	for rows.Next() {
		var r models.LocationItem
		if err := rows.Scan(&r.ID, &r.Name, &r.Type, &r.Address, &r.Province, &r.Lat, &r.Lng, &r.Status, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateLocation(c *gin.Context) {
	var r models.LocationItem
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	now := time.Now()
	err := database.DB.QueryRow(`INSERT INTO nex_speed.locations (name, type, address, province, lat, lng, status, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
		r.Name, r.Type, r.Address, r.Province, r.Lat, r.Lng, r.Status, now, now).Scan(&r.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	r.CreatedAt = now
	r.UpdatedAt = now
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateLocation(c *gin.Context) {
	id := c.Param("id")
	var r models.LocationItem
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_speed.locations SET name=$1, type=$2, address=$3, province=$4, lat=$5, lng=$6, status=$7, updated_at=$8 WHERE id=$9`,
		r.Name, r.Type, r.Address, r.Province, r.Lat, r.Lng, r.Status, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteLocation(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_speed.locations WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}

// ========== SYSTEM USERS ==========

func GetSystemUsers(c *gin.Context) {
	rows, err := database.DB.Query(`SELECT id, username, name, COALESCE(email,''), role, COALESCE(avatar,''), is_active, last_login, created_at, updated_at FROM nex_core.users ORDER BY id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	defer rows.Close()
	var items []models.SystemUser
	for rows.Next() {
		var r models.SystemUser
		if err := rows.Scan(&r.ID, &r.Username, &r.Name, &r.Email, &r.Role, &r.Avatar, &r.IsActive, &r.LastLogin, &r.CreatedAt, &r.UpdatedAt); err != nil {
			continue
		}
		items = append(items, r)
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Data: items})
}

func CreateSystemUser(c *gin.Context) {
	var r models.SystemUser
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	now := time.Now()
	// Default password hash for new users (password123)
	defaultHash := "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
	err := database.DB.QueryRow(`INSERT INTO nex_core.users (username, password_hash, name, email, role, avatar, is_active, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
		r.Username, defaultHash, r.Name, r.Email, r.Role, r.Avatar, r.IsActive, now, now).Scan(&r.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	r.CreatedAt = now
	r.UpdatedAt = now
	c.JSON(http.StatusCreated, models.APIResponse{Success: true, Data: r})
}

func UpdateSystemUser(c *gin.Context) {
	id := c.Param("id")
	var r models.SystemUser
	if err := c.ShouldBindJSON(&r); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	_, err := database.DB.Exec(`UPDATE nex_core.users SET name=$1, email=$2, role=$3, avatar=$4, is_active=$5, updated_at=$6 WHERE id=$7`,
		r.Name, r.Email, r.Role, r.Avatar, r.IsActive, time.Now(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "updated"})
}

func DeleteSystemUser(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec(`DELETE FROM nex_core.users WHERE id=$1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{Success: false, Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, models.APIResponse{Success: true, Message: "deleted"})
}
