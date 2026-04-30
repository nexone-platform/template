package router

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/nexspeed/backend/config"
	"github.com/nexspeed/backend/handlers"
	"github.com/nexspeed/backend/ws"
)

func Setup(cfg *config.Config) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: false,
	}))

	r.GET("/health", handlers.HealthCheck)
	r.GET("/ws/gps", ws.HandleWebSocket)

	v1 := r.Group("/api/v1")
	{
		v1.GET("/dashboard/stats", handlers.GetDashboardStats)
		v1.GET("/dashboard/alerts", handlers.GetAlerts)
		v1.GET("/dashboard/revenue", handlers.GetRevenueMonthly)

		vehicles := v1.Group("/vehicles")
		{
			vehicles.GET("", handlers.GetVehicles)
			vehicles.GET("/:id", handlers.GetVehicleByID)
			vehicles.POST("", handlers.CreateVehicle)
			vehicles.PUT("/:id", handlers.UpdateVehicle)
			vehicles.DELETE("/:id", handlers.DeleteVehicle)
		}

		drivers := v1.Group("/drivers")
		{
			drivers.GET("", handlers.GetDrivers)
			drivers.POST("", handlers.CreateDriver)
			drivers.PUT("/:id", handlers.UpdateDriver)
			drivers.DELETE("/:id", handlers.DeleteDriver)
		}

		orders := v1.Group("/orders")
		{
			orders.GET("", handlers.GetOrders)
			orders.POST("", handlers.CreateOrder)
			orders.PUT("/:id", handlers.UpdateOrder)
			orders.DELETE("/:id", handlers.DeleteOrder)
		}

		trips := v1.Group("/trips")
		{
			trips.GET("", handlers.GetTrips)
			trips.POST("", handlers.CreateTrip)
			trips.PUT("/:id", handlers.UpdateTrip)
			trips.DELETE("/:id", handlers.DeleteTrip)
		}

		invoices := v1.Group("/invoices")
		{
			invoices.GET("", handlers.GetInvoices)
			invoices.POST("", handlers.CreateInvoice)
			invoices.PUT("/:id", handlers.UpdateInvoice)
			invoices.DELETE("/:id", handlers.DeleteInvoice)
		}

		subs := v1.Group("/subcontractors")
		{
			subs.GET("", handlers.GetSubcontractors)
			subs.POST("", handlers.CreateSubcontractor)
			subs.PUT("/:id", handlers.UpdateSubcontractor)
			subs.DELETE("/:id", handlers.DeleteSubcontractor)
		}

		epod := v1.Group("/epod")
		{
			epod.GET("", handlers.GetEPODs)
			epod.GET("/:tripId", handlers.GetEPODByTrip)
			epod.POST("", handlers.SubmitEPOD)
		}

		// Phase 4: AI & Notifications
		ai := v1.Group("/ai")
		{
			ai.POST("/optimize-route", handlers.OptimizeRoute)
			ai.GET("/insights", handlers.GetAIInsights)
		}

		v1.GET("/notifications", handlers.GetNotifications)

		// Fuel Bills OCR
		fuel := v1.Group("/fuel-bills")
		{
			fuel.GET("", handlers.GetFuelBills)
			fuel.POST("/ocr", handlers.SubmitFuelBillOCR)
		}

		// Odometer OCR
		v1.POST("/odometer/ocr", handlers.SubmitOdometerOCR)

		// Auth
		auth := v1.Group("/auth")
		{
			auth.POST("/login", handlers.Login)
			auth.GET("/me", handlers.GetCurrentUser)
		}

		// Users CRUD
		users := v1.Group("/users")
		{
			users.GET("", handlers.GetUsers)
			users.POST("", handlers.CreateUser)
			users.PUT("/:id", handlers.UpdateUser)
			users.DELETE("/:id", handlers.DeleteUser)
		}

		// Maintenance Records
		maint := v1.Group("/maintenance")
		{
			maint.GET("", handlers.GetMaintenanceRecords)
			maint.POST("", handlers.CreateMaintenanceRecord)
			maint.PUT("/:id", handlers.UpdateMaintenanceRecord)
			maint.DELETE("/:id", handlers.DeleteMaintenanceRecord)
		}

		// Mechanics
		mechanics := v1.Group("/mechanics")
		{
			mechanics.GET("", handlers.GetMechanics)
			mechanics.POST("", handlers.CreateMechanic)
			mechanics.PUT("/:id", handlers.UpdateMechanic)
			mechanics.DELETE("/:id", handlers.DeleteMechanic)
		}

		// Container Mechanics
		containerMech := v1.Group("/container-mechanics")
		{
			containerMech.GET("", handlers.GetContainerMechanics)
			containerMech.POST("", handlers.CreateContainerMechanic)
			containerMech.PUT("/:id", handlers.UpdateContainerMechanic)
			containerMech.DELETE("/:id", handlers.DeleteContainerMechanic)
		}

		// Parts Shops
		partsShops := v1.Group("/parts-shops")
		{
			partsShops.GET("", handlers.GetPartsShops)
			partsShops.POST("", handlers.CreatePartsShop)
			partsShops.PUT("/:id", handlers.UpdatePartsShop)
			partsShops.DELETE("/:id", handlers.DeletePartsShop)
		}

		// Stock Parts
		stockParts := v1.Group("/stock-parts")
		{
			stockParts.GET("", handlers.GetStockParts)
			stockParts.POST("", handlers.CreateStockPart)
			stockParts.PUT("/:id", handlers.UpdateStockPart)
			stockParts.DELETE("/:id", handlers.DeleteStockPart)
		}

		// Stock Oil
		stockOil := v1.Group("/stock-oil")
		{
			stockOil.GET("", handlers.GetStockOil)
			stockOil.POST("", handlers.CreateStockOil)
			stockOil.PUT("/:id", handlers.UpdateStockOil)
			stockOil.DELETE("/:id", handlers.DeleteStockOil)
		}

		// Storage Locations
		storage := v1.Group("/storage")
		{
			storage.GET("", handlers.GetStorageLocations)
			storage.POST("", handlers.CreateStorageLocation)
			storage.PUT("/:id", handlers.UpdateStorageLocation)
			storage.DELETE("/:id", handlers.DeleteStorageLocation)
		}

		// Parking Lots
		parking := v1.Group("/parking")
		{
			parking.GET("", handlers.GetParkingLots)
			parking.POST("", handlers.CreateParkingLot)
			parking.PUT("/:id", handlers.UpdateParkingLot)
			parking.DELETE("/:id", handlers.DeleteParkingLot)
		}

		// Brands
		brands := v1.Group("/brands")
		{
			brands.GET("", handlers.GetBrands)
			brands.POST("", handlers.CreateBrand)
			brands.PUT("/:id", handlers.UpdateBrand)
			brands.DELETE("/:id", handlers.DeleteBrand)
		}

		// Provinces
		provinces := v1.Group("/provinces")
		{
			provinces.GET("", handlers.GetProvinces)
			provinces.POST("", handlers.CreateProvince)
			provinces.PUT("/:id", handlers.UpdateProvince)
			provinces.DELETE("/:id", handlers.DeleteProvince)
		}

		// Locations
		locations := v1.Group("/locations")
		{
			locations.GET("", handlers.GetLocations)
			locations.POST("", handlers.CreateLocation)
			locations.PUT("/:id", handlers.UpdateLocation)
			locations.DELETE("/:id", handlers.DeleteLocation)
		}

		// System Users
		sysUsers := v1.Group("/system-users")
		{
			sysUsers.GET("", handlers.GetSystemUsers)
			sysUsers.POST("", handlers.CreateSystemUser)
			sysUsers.PUT("/:id", handlers.UpdateSystemUser)
			sysUsers.DELETE("/:id", handlers.DeleteSystemUser)
		}

		// Parking Types
		parkingTypes := v1.Group("/parking-types")
		{
			parkingTypes.GET("", handlers.GetParkingTypes)
			parkingTypes.POST("", handlers.CreateParkingType)
			parkingTypes.PUT("/:id", handlers.UpdateParkingType)
			parkingTypes.DELETE("/:id", handlers.DeleteParkingType)
		}

		// Storage Types
		storageTypes := v1.Group("/storage-types")
		{
			storageTypes.GET("", handlers.GetStorageTypes)
			storageTypes.POST("", handlers.CreateStorageType)
			storageTypes.PUT("/:id", handlers.UpdateStorageType)
			storageTypes.DELETE("/:id", handlers.DeleteStorageType)
		}

		// Part Groups
		partGroups := v1.Group("/part-groups")
		{
			partGroups.GET("", handlers.GetPartGroups)
			partGroups.POST("", handlers.CreatePartGroup)
			partGroups.PUT("/:id", handlers.UpdatePartGroup)
			partGroups.DELETE("/:id", handlers.DeletePartGroup)
		}

		// Part Categories
		partCategories := v1.Group("/part-categories")
		{
			partCategories.GET("", handlers.GetPartCategories)
			partCategories.POST("", handlers.CreatePartCategory)
			partCategories.PUT("/:id", handlers.UpdatePartCategory)
			partCategories.DELETE("/:id", handlers.DeletePartCategory)
		}

		// Liquid Types
		liquidTypes := v1.Group("/liquid-types")
		{
			liquidTypes.GET("", handlers.GetLiquidTypes)
			liquidTypes.POST("", handlers.CreateLiquidType)
			liquidTypes.PUT("/:id", handlers.UpdateLiquidType)
			liquidTypes.DELETE("/:id", handlers.DeleteLiquidType)
		}

		// Unit Types
		unitTypes := v1.Group("/unit-types")
		{
			unitTypes.GET("", handlers.GetUnitTypes)
			unitTypes.POST("", handlers.CreateUnitType)
			unitTypes.PUT("/:id", handlers.UpdateUnitType)
			unitTypes.DELETE("/:id", handlers.DeleteUnitType)
		}

		// System Apps
		systemApps := v1.Group("/system-apps")
		{
			systemApps.GET("", handlers.GetSystemApps)
			systemApps.PUT("/:id", handlers.UpdateSystemApp)
		}

		// Mechanic Expertise
		mechanicExpertise := v1.Group("/mechanic-expertise")
		{
			mechanicExpertise.GET("", handlers.GetMechanicExpertise)
			mechanicExpertise.POST("", handlers.CreateMechanicExpertise)
			mechanicExpertise.PUT("/:id", handlers.UpdateMechanicExpertise)
			mechanicExpertise.DELETE("/:id", handlers.DeleteMechanicExpertise)
		}

		// Mechanic Types
		mechanicTypes := v1.Group("/mechanic-types")
		{
			mechanicTypes.GET("", handlers.GetMechanicTypes)
			mechanicTypes.POST("", handlers.CreateMechanicType)
			mechanicTypes.PUT("/:id", handlers.UpdateMechanicType)
			mechanicTypes.DELETE("/:id", handlers.DeleteMechanicType)
		}

		// Vehicle Types
		vehicleTypes := v1.Group("/vehicle-types")
		{
			vehicleTypes.GET("", handlers.GetVehicleTypes)
			vehicleTypes.POST("", handlers.CreateVehicleType)
			vehicleTypes.PUT("/:id", handlers.UpdateVehicleType)
			vehicleTypes.DELETE("/:id", handlers.DeleteVehicleType)
		}
	}

	return r
}
