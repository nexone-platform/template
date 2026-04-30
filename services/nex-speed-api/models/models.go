package models

import "time"

type Vehicle struct {
	ID              string    `json:"id"`
	PlateNumber     string    `json:"plateNumber"`
	Type            string    `json:"type"`
	Brand           string    `json:"brand"`
	Model           string    `json:"model"`
	Year            int       `json:"year"`
	Status          string    `json:"status"`
	FuelLevel       int       `json:"fuelLevel"`
	Mileage         float64   `json:"mileage"`
	NextMaintenance string    `json:"nextMaintenance"`
	InsuranceExpiry string    `json:"insuranceExpiry"`
	DriverID        *string   `json:"driverId,omitempty"`
	CurrentLat      *float64  `json:"currentLat,omitempty"`
	CurrentLng      *float64  `json:"currentLng,omitempty"`
	Capacity        float64   `json:"capacity"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

type Driver struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Phone         string    `json:"phone"`
	LicenseType   string    `json:"licenseType"`
	LicenseExpiry string    `json:"licenseExpiry"`
	Status        string    `json:"status"`
	SafetyScore   int       `json:"safetyScore"`
	HoursToday    float64   `json:"hoursToday"`
	TotalTrips    int       `json:"totalTrips"`
	VehicleID     *string   `json:"vehicleId,omitempty"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type Order struct {
	ID            string    `json:"id"`
	CustomerName  string    `json:"customerName"`
	Origin        string    `json:"origin"`
	Destination   string    `json:"destination"`
	CargoType     string    `json:"cargoType"`
	Weight        float64   `json:"weight"`
	Status        string    `json:"status"`
	Priority      string    `json:"priority"`
	DeliveryDate  string    `json:"deliveryDate"`
	EstimatedCost float64   `json:"estimatedCost"`
	VehicleID     *string   `json:"vehicleId,omitempty"`
	DriverID      *string   `json:"driverId,omitempty"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type Trip struct {
	ID               string    `json:"id"`
	OrderID          string    `json:"orderId"`
	VehicleID        string    `json:"vehicleId"`
	DriverID         string    `json:"driverId"`
	Status           string    `json:"status"`
	Origin           string    `json:"origin"`
	Destination      string    `json:"destination"`
	DepartureTime    string    `json:"departureTime"`
	EstimatedArrival string    `json:"estimatedArrival"`
	ActualArrival    *string   `json:"actualArrival,omitempty"`
	Distance         float64   `json:"distance"`
	Progress         int       `json:"progress"`
	CurrentLat       float64   `json:"currentLat"`
	CurrentLng       float64   `json:"currentLng"`
	OriginLat        float64   `json:"originLat"`
	OriginLng        float64   `json:"originLng"`
	DestLat          float64   `json:"destLat"`
	DestLng          float64   `json:"destLng"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

type Invoice struct {
	ID           string    `json:"id"`
	CustomerName string    `json:"customerName"`
	TripID       *string   `json:"tripId,omitempty"`
	OrderID      *string   `json:"orderId,omitempty"`
	Amount       float64   `json:"amount"`
	Status       string    `json:"status"`
	IssueDate    string    `json:"issueDate"`
	DueDate      *string   `json:"dueDate,omitempty"`
	PaidDate     *string   `json:"paidDate,omitempty"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Subcontractor struct {
	ID               string    `json:"id"`
	CompanyName      string    `json:"companyName"`
	ContactPerson    string    `json:"contactPerson"`
	Phone            string    `json:"phone"`
	Tier             string    `json:"tier"`
	VehicleCount     int       `json:"vehicleCount"`
	PerformanceScore int       `json:"performanceScore"`
	OnTimeRate       float64   `json:"onTimeRate"`
	BounceRate       float64   `json:"bounceRate"`
	Status           string    `json:"status"`
	TotalTrips       int       `json:"totalTrips"`
	LicenseValid     bool      `json:"licenseValid"`
	InsuranceValid   bool      `json:"insuranceValid"`
	JoinDate         string    `json:"joinDate"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

type Alert struct {
	ID         int       `json:"id"`
	Type       string    `json:"type"`
	Title      string    `json:"title"`
	Message    *string   `json:"message,omitempty"`
	Severity   string    `json:"severity"`
	IsRead     bool      `json:"isRead"`
	EntityType *string   `json:"entityType,omitempty"`
	EntityID   *string   `json:"entityId,omitempty"`
	CreatedAt  time.Time `json:"createdAt"`
}

type RevenueMonthly struct {
	Month   string  `json:"month"`
	Year    int     `json:"year"`
	Revenue float64 `json:"revenue"`
	Cost    float64 `json:"cost"`
	Profit  float64 `json:"profit"`
}

type DashboardStats struct {
	TotalVehicles  int     `json:"totalVehicles"`
	ActiveVehicles int     `json:"activeVehicles"`
	TotalDrivers   int     `json:"totalDrivers"`
	OnDutyDrivers  int     `json:"onDutyDrivers"`
	PendingOrders  int     `json:"pendingOrders"`
	ActiveTrips    int     `json:"activeTrips"`
	MonthlyRevenue float64 `json:"monthlyRevenue"`
	OnTimeRate     float64 `json:"onTimeRate"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

type MaintenanceRecord struct {
	ID            string    `json:"id"`
	VehicleID     string    `json:"vehicleId"`
	Type          string    `json:"type"`
	Description   string    `json:"description"`
	Status        string    `json:"status"`
	Priority      string    `json:"priority"`
	ScheduledDate *string   `json:"scheduledDate,omitempty"`
	CompletedDate *string   `json:"completedDate,omitempty"`
	Cost          float64   `json:"cost"`
	Mechanic      string    `json:"mechanic"`
	Garage        string    `json:"garage"`
	MileageAt     float64   `json:"mileageAt"`
	Notes         string    `json:"notes"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type Mechanic struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	Phone          string    `json:"phone"`
	Specialization string    `json:"specialization"`
	Experience     int       `json:"experience"`
	Rating         float64   `json:"rating"`
	Garage         string    `json:"garage"`
	Address        string    `json:"address"`
	Certification  string    `json:"certification"`
	Status         string    `json:"status"`
	Notes          string    `json:"notes"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type ContainerMechanic struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	Phone          string    `json:"phone"`
	Specialization string    `json:"specialization"`
	Experience     int       `json:"experience"`
	Rating         float64   `json:"rating"`
	Garage         string    `json:"garage"`
	Address        string    `json:"address"`
	Certification  string    `json:"certification"`
	Status         string    `json:"status"`
	Notes          string    `json:"notes"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type PartsShop struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	ContactPerson string    `json:"contactPerson"`
	Phone         string    `json:"phone"`
	LineID        string    `json:"lineId"`
	Category      string    `json:"category"`
	Address       string    `json:"address"`
	Rating        float64   `json:"rating"`
	Status        string    `json:"status"`
	Notes         string    `json:"notes"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type StockPart struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	PartNumber string    `json:"partNumber"`
	Category   string    `json:"category"`
	Quantity   int       `json:"quantity"`
	MinStock   int       `json:"minStock"`
	Unit       string    `json:"unit"`
	UnitPrice  float64   `json:"unitPrice"`
	Location   string    `json:"location"`
	Supplier   string    `json:"supplier"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type StockOil struct {
	ID         string    `json:"id"`
	Name       string    `json:"name"`
	Type       string    `json:"type"`
	Brand      string    `json:"brand"`
	Quantity   int       `json:"quantity"`
	MinStock   int       `json:"minStock"`
	Unit       string    `json:"unit"`
	UnitPrice  float64   `json:"unitPrice"`
	Location   string    `json:"location"`
	Supplier   string    `json:"supplier"`
	ExpiryDate *string   `json:"expiryDate,omitempty"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type StorageLocation struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Type          string    `json:"type"`
	Address       string    `json:"address"`
	Capacity      string    `json:"capacity"`
	CurrentUsage  string    `json:"currentUsage"`
	ContactPerson string    `json:"contactPerson"`
	Phone         string    `json:"phone"`
	Status        string    `json:"status"`
	Notes         string    `json:"notes"`
	Latitude      *float64  `json:"latitude,omitempty"`
	Longitude     *float64  `json:"longitude,omitempty"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type ParkingLot struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Address       string    `json:"address"`
	TotalSlots    int       `json:"totalSlots"`
	UsedSlots     int       `json:"usedSlots"`
	Type          string    `json:"type"`
	Facilities    string    `json:"facilities"`
	ContactPerson string    `json:"contactPerson"`
	Phone         string    `json:"phone"`
	MonthlyRent   float64   `json:"monthlyRent"`
	Latitude      *float64  `json:"latitude,omitempty"`
	Longitude     *float64  `json:"longitude,omitempty"`
	Status        string    `json:"status"`
	Notes         string    `json:"notes"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type Brand struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	NameEn    string    `json:"nameEn"`
	Country   string    `json:"country"`
	Logo      string    `json:"logo"`
	Models    string    `json:"models"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Province struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	NameEn    string    `json:"nameEn"`
	Abbr      string    `json:"abbr"`
	Region    string    `json:"region"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type LocationItem struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Type      string    `json:"type"`
	Address   string    `json:"address"`
	Province  string    `json:"province"`
	Lat       float64   `json:"lat"`
	Lng       float64   `json:"lng"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type SystemUser struct {
	ID        int        `json:"id"`
	Username  string     `json:"username"`
	Name      string     `json:"name"`
	Email     string     `json:"email"`
	Role      string     `json:"role"`
	Avatar    string     `json:"avatar"`
	IsActive  bool       `json:"isActive"`
	LastLogin *time.Time `json:"lastLogin"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
}

// ========== MASTER DATA TYPES ==========

type ParkingType struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type StorageType struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type PartGroup struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type PartCategory struct {
	ID            int       `json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Status        string    `json:"status"`
	PartGroupID   *int      `json:"partGroupId,omitempty"`
	PartGroupName *string   `json:"partGroupName,omitempty"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type LiquidType struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type UnitType struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type MechanicExpertise struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	MechanicType string    `json:"mechanicType"`
	Description  string    `json:"description"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type MechanicType struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type VehicleType struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

