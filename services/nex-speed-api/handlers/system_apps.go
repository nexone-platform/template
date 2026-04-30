package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nexspeed/backend/database"
)

type SystemApp struct {
	ID         int    `json:"id"`
	AppName    string `json:"app_name"`
	DescEn     string `json:"desc_en"`
	DescTh     string `json:"desc_th"`
	IconPath   string `json:"icon_path"`
	ThemeColor string `json:"theme_color"`
	IsActive   bool   `json:"is_active"`
	Status     string `json:"status"` // allow backwards compatibility if struct receives it
	SeqNo      int    `json:"seq_no"`
	CreatedAt  string `json:"created_at"`
	AppGroup   string `json:"app_group"`
	RoutePath  string `json:"route_path"`
	ApiPath    string `json:"api_path"`
}

func GetSystemApps(c *gin.Context) {
	showAll := c.Query("all")
	query := "SELECT app_id, app_name, desc_en, desc_th, icon_path, theme_color, is_active, app_seq_no, create_date, app_group, route_path, api_path FROM nex_core.system_apps"
	if showAll != "true" {
		query += " WHERE is_active = true"
	}
	query += " ORDER BY app_seq_no ASC, app_id ASC"

	rows, err := database.DB.Query(query)
	if err != nil {
		log.Printf("Error fetching system apps: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch system apps"})
		return
	}
	defer rows.Close()

	var apps []SystemApp
	for rows.Next() {
		var a SystemApp
		var appGroup *string
		var routePath *string
		var apiPath *string
		if err := rows.Scan(&a.ID, &a.AppName, &a.DescEn, &a.DescTh, &a.IconPath, &a.ThemeColor, &a.IsActive, &a.SeqNo, &a.CreatedAt, &appGroup, &routePath, &apiPath); err != nil {
			log.Printf("Error scanning system app: %v\n", err)
			continue
		}
		if appGroup != nil {
			a.AppGroup = *appGroup
		}
		if routePath != nil {
			a.RoutePath = *routePath
		}
		if apiPath != nil {
			a.ApiPath = *apiPath
		}
        a.Status = "active"
        if !a.IsActive {
            a.Status = "inactive"
        }
		apps = append(apps, a)
	}

	c.JSON(http.StatusOK, apps)
}

func UpdateSystemApp(c *gin.Context) {
	id := c.Param("id")
	var req SystemApp
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

    // fallback mapping if frontend sends string
    isActive := req.IsActive
    if req.Status == "active" {
        isActive = true
    } else if req.Status == "inactive" {
        isActive = false
    }

	query := `
		UPDATE nex_core.system_apps
		SET app_name = $1, desc_en = $2, desc_th = $3, icon_path = $4, theme_color = $5, is_active = $6, app_seq_no = $7, app_group = $8, route_path = $9, api_path = $10
		WHERE app_id = $11
	`
	_, err := database.DB.Exec(query, req.AppName, req.DescEn, req.DescTh, req.IconPath, req.ThemeColor, isActive, req.SeqNo, req.AppGroup, req.RoutePath, req.ApiPath, id)
	if err != nil {
		log.Printf("Error updating system app: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update system app", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "System app updated successfully"})
}
