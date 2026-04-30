package handlers

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nexspeed/backend/database"
)

// OCRResult holds the extracted data from a fuel bill
type OCRResult struct {
	BillID        string `json:"billId"`
	BillNo        string `json:"billNo"`
	FillDate      string `json:"fillDate"`
	Station       string `json:"station"`
	Branch        string `json:"branch"`
	FuelType      string `json:"fuelType"`
	Liters        string `json:"liters"`
	PricePerLiter string `json:"pricePerLiter"`
	TotalAmount   string `json:"totalAmount"`
	Odometer      string `json:"odometer"`
	TaxID         string `json:"taxId"`
	PaymentMethod string `json:"paymentMethod"`
	VehicleID     string `json:"vehicleId"`
	DriverID      string `json:"driverId"`
	DriverName    string `json:"driverName"`
	ScannedAt     string `json:"scannedAt"`
	OcrRawText    string `json:"ocrRawText"`
	ImageData     string `json:"imageData"`
}

// FuelBillRecord for DB
type FuelBillRecord struct {
	ID            int     `json:"id"`
	BillID        string  `json:"bill_id"`
	BillNo        *string `json:"bill_no"`
	FillDate      *string `json:"fill_date"`
	Station       *string `json:"station"`
	Branch        *string `json:"branch"`
	FuelType      *string `json:"fuel_type"`
	Liters        *string `json:"liters"`
	PricePerLiter *string `json:"price_per_liter"`
	TotalAmount   *string `json:"total_amount"`
	Odometer      *string `json:"odometer"`
	TaxID         *string `json:"tax_id"`
	PaymentMethod *string `json:"payment_method"`
	VehicleID     *string `json:"vehicle_id"`
	DriverID      *string `json:"driver_id"`
	DriverName    *string `json:"driver_name"`
	OcrRawText    *string `json:"ocr_raw_text"`
	ImageData     *string `json:"image_data"`
	ScannedAt     *string `json:"scanned_at"`
	CreatedAt     string  `json:"created_at"`
}

func findTesseract() string {
	// Check common paths
	paths := []string{
		"tesseract",
		`C:\Program Files\Tesseract-OCR\tesseract.exe`,
		`C:\Program Files (x86)\Tesseract-OCR\tesseract.exe`,
		`/usr/bin/tesseract`,
		`/usr/local/bin/tesseract`,
	}
	for _, p := range paths {
		if _, err := exec.LookPath(p); err == nil {
			return p
		}
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return ""
}

func runTesseractOCR(imageBytes []byte) (string, error) {
	tesseractPath := findTesseract()
	if tesseractPath == "" {
		return "", fmt.Errorf("tesseract not found")
	}

	// Write image to temp file
	tmpDir := os.TempDir()
	imgFile := filepath.Join(tmpDir, fmt.Sprintf("ocr_%d.png", time.Now().UnixNano()))
	outFile := filepath.Join(tmpDir, fmt.Sprintf("ocr_%d", time.Now().UnixNano()))

	if err := os.WriteFile(imgFile, imageBytes, 0644); err != nil {
		return "", fmt.Errorf("failed to write temp image: %w", err)
	}
	defer os.Remove(imgFile)
	defer os.Remove(outFile + ".txt")

	// Run tesseract: tesseract input.png output -l eng+tha
	cmd := exec.Command(tesseractPath, imgFile, outFile, "-l", "eng+tha")
	if output, err := cmd.CombinedOutput(); err != nil {
		// Try with eng only
		cmd2 := exec.Command(tesseractPath, imgFile, outFile, "-l", "eng")
		if output2, err2 := cmd2.CombinedOutput(); err2 != nil {
			return "", fmt.Errorf("tesseract failed: %s %s", string(output), string(output2))
		}
	}

	// Read output
	result, err := os.ReadFile(outFile + ".txt")
	if err != nil {
		return "", fmt.Errorf("failed to read OCR result: %w", err)
	}
	return string(result), nil
}

func parseOCRText(text string) map[string]string {
	result := map[string]string{
		"station":       "ไม่ระบุ",
		"fuelType":      "ไม่ระบุ",
		"liters":        "ไม่ระบุ",
		"pricePerLiter": "ไม่ระบุ",
		"totalAmount":   "ไม่ระบุ",
		"odometer":      "ไม่ระบุ",
		"taxId":         "ไม่ระบุ",
		"billNo":        "",
		"fillDate":      "",
		"paymentMethod": "ไม่ระบุ",
	}
	if text == "" {
		return result
	}

	// Station
	stationRe := regexp.MustCompile(`(?i)(ปตท|PTT|Shell|เชลล์|Caltex|คาลเท็กซ์|บางจาก|Bangchak|ซัสโก้|Susco)[^\n]*`)
	if m := stationRe.FindString(text); m != "" {
		result["station"] = strings.TrimSpace(m)
	}

	// Fuel type
	fuelRe := regexp.MustCompile(`(?i)(ดีเซล\s*B?\d*|แก๊สโซฮอล์\s*(?:E?\d+)?|Diesel\s*B?\d*|Gasohol\s*\d*|ULG|Premium|Hi-Premium)`)
	if m := fuelRe.FindString(text); m != "" {
		result["fuelType"] = strings.TrimSpace(m)
	}

	// Liters
	literRe := regexp.MustCompile(`(?i)(\d+[.,]\d+)\s*(?:ลิตร|Litre|LTR|L\b)`)
	if m := literRe.FindStringSubmatch(text); len(m) > 1 {
		result["liters"] = strings.Replace(m[1], ",", ".", 1)
	} else {
		literRe2 := regexp.MustCompile(`(?i)(?:ปริมาณ|Volume|จำนวน)\s*[:.]?\s*(\d+[.,]\d+)`)
		if m := literRe2.FindStringSubmatch(text); len(m) > 1 {
			result["liters"] = strings.Replace(m[1], ",", ".", 1)
		}
	}

	// Price per liter
	priceRe := regexp.MustCompile(`(?i)(\d+[.,]\d+)\s*(?:บาท/ลิตร|THB/L|B/L)`)
	if m := priceRe.FindStringSubmatch(text); len(m) > 1 {
		result["pricePerLiter"] = strings.Replace(m[1], ",", ".", 1)
	} else {
		priceRe2 := regexp.MustCompile(`(?i)(?:ราคา/ลิตร|Unit\s*Price|Price)\s*[:.]?\s*(\d+[.,]\d+)`)
		if m := priceRe2.FindStringSubmatch(text); len(m) > 1 {
			result["pricePerLiter"] = strings.Replace(m[1], ",", ".", 1)
		}
	}

	// Total
	totalRe := regexp.MustCompile(`(?i)(?:รวม|Total|ยอดรวม|ยอดสุทธิ|Amount|NET)\s*[:.]?\s*(\d[\d,]*[.,]\d+)`)
	if m := totalRe.FindStringSubmatch(text); len(m) > 1 {
		result["totalAmount"] = strings.Replace(strings.Replace(m[1], ",", "", -1), ",", ".", 1)
	} else {
		totalRe2 := regexp.MustCompile(`(\d[\d,]*[.,]\d+)\s*(?:บาท|THB|Baht)`)
		if m := totalRe2.FindStringSubmatch(text); len(m) > 1 {
			result["totalAmount"] = strings.Replace(strings.Replace(m[1], ",", "", -1), ",", ".", 1)
		}
	}

	// Odometer
	odoRe := regexp.MustCompile(`(?i)(?:เลขไมล์|Odometer|km|กม|Mileage)\s*[:.]?\s*(\d[\d,]*)`)
	if m := odoRe.FindStringSubmatch(text); len(m) > 1 {
		result["odometer"] = m[1]
	}

	// Tax ID
	taxRe := regexp.MustCompile(`(\d{1,2}[-\s]\d{4,5}[-\s]\d{4,5}[-\s]\d{2,3}[-\s]\d)`)
	if m := taxRe.FindString(text); m != "" {
		result["taxId"] = m
	}

	// Bill No
	billRe := regexp.MustCompile(`(?i)(?:เลขที่|No|Invoice|INV|Bill)\s*[.:#]?\s*([A-Z0-9][\w-]*\d)`)
	if m := billRe.FindStringSubmatch(text); len(m) > 1 {
		result["billNo"] = m[1]
	}

	// Date
	dateRe := regexp.MustCompile(`(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})`)
	if m := dateRe.FindString(text); m != "" {
		result["fillDate"] = m
	}

	return result
}

// SubmitFuelBillOCR receives an image, runs OCR, parses it, stores in DB
func SubmitFuelBillOCR(c *gin.Context) {
	var req struct {
		ImageData  string `json:"imageData" binding:"required"`
		VehicleID  string `json:"vehicleId"`
		DriverID   string `json:"driverId"`
		DriverName string `json:"driverName"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "imageData is required"})
		return
	}

	// Decode base64 image
	imageB64 := req.ImageData
	if idx := strings.Index(imageB64, ","); idx != -1 {
		imageB64 = imageB64[idx+1:]
	}
	imageBytes, err := base64.StdEncoding.DecodeString(imageB64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid base64 image"})
		return
	}

	// Run OCR
	ocrText, ocrErr := runTesseractOCR(imageBytes)
	if ocrErr != nil {
		ocrText = "(Tesseract not available: " + ocrErr.Error() + ")"
	}

	// Parse
	parsed := parseOCRText(ocrText)

	now := time.Now()
	billID := fmt.Sprintf("FUEL-%d", now.UnixMilli()%1000000)
	if parsed["billNo"] == "" {
		parsed["billNo"] = fmt.Sprintf("INV-%d", now.UnixMilli()%1000000)
	}
	if parsed["fillDate"] == "" {
		parsed["fillDate"] = now.Format("02/01/2006 15:04")
	}

	// Ensure fuel_bills table exists
	database.DB.Exec(`
		CREATE TABLE IF NOT EXISTS fuel_bills (
			id SERIAL PRIMARY KEY,
			bill_id VARCHAR(50) UNIQUE NOT NULL,
			bill_no VARCHAR(100),
			fill_date VARCHAR(200),
			station VARCHAR(200),
			branch VARCHAR(200),
			fuel_type VARCHAR(100),
			liters VARCHAR(50),
			price_per_liter VARCHAR(50),
			total_amount VARCHAR(50),
			odometer VARCHAR(50),
			tax_id VARCHAR(100),
			payment_method VARCHAR(100),
			vehicle_id VARCHAR(50),
			driver_id VARCHAR(50),
			driver_name VARCHAR(200),
			ocr_raw_text TEXT,
			image_data TEXT,
			scanned_at VARCHAR(200),
			created_at TIMESTAMP DEFAULT NOW()
		)
	`)

	// Save to DB
	_, dbErr := database.DB.Exec(`
		INSERT INTO fuel_bills (
			bill_id, bill_no, fill_date, station, branch, fuel_type,
			liters, price_per_liter, total_amount, odometer, tax_id,
			payment_method, vehicle_id, driver_id, driver_name,
			ocr_raw_text, image_data, scanned_at
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
		billID, parsed["billNo"], parsed["fillDate"], parsed["station"], "",
		parsed["fuelType"], parsed["liters"], parsed["pricePerLiter"],
		parsed["totalAmount"], parsed["odometer"], parsed["taxId"],
		parsed["paymentMethod"], req.VehicleID, req.DriverID, req.DriverName,
		ocrText, req.ImageData, now.Format("2/1/2006 15:04:05"),
	)
	if dbErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": dbErr.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": OCRResult{
			BillID:        billID,
			BillNo:        parsed["billNo"],
			FillDate:      parsed["fillDate"],
			Station:       parsed["station"],
			Branch:        "",
			FuelType:      parsed["fuelType"],
			Liters:        parsed["liters"],
			PricePerLiter: parsed["pricePerLiter"],
			TotalAmount:   parsed["totalAmount"],
			Odometer:      parsed["odometer"],
			TaxID:         parsed["taxId"],
			PaymentMethod: parsed["paymentMethod"],
			VehicleID:     req.VehicleID,
			DriverID:      req.DriverID,
			DriverName:    req.DriverName,
			ScannedAt:     now.Format("2/1/2006 15:04:05"),
			OcrRawText:    ocrText,
		},
	})
}

// GetFuelBills returns all fuel bills, filterable by driver_id or vehicle_id
func GetFuelBills(c *gin.Context) {
	driverID := c.Query("driver_id")
	vehicleID := c.Query("vehicle_id")

	query := "SELECT id, bill_id, bill_no, fill_date, station, branch, fuel_type, liters, price_per_liter, total_amount, odometer, tax_id, payment_method, vehicle_id, driver_id, driver_name, ocr_raw_text, image_data, scanned_at, created_at FROM fuel_bills"
	args := []interface{}{}
	conditions := []string{}

	if driverID != "" {
		conditions = append(conditions, fmt.Sprintf("driver_id = $%d", len(args)+1))
		args = append(args, driverID)
	}
	if vehicleID != "" {
		conditions = append(conditions, fmt.Sprintf("vehicle_id = $%d", len(args)+1))
		args = append(args, vehicleID)
	}
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	query += " ORDER BY created_at DESC LIMIT 100"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	defer rows.Close()

	var bills []FuelBillRecord
	for rows.Next() {
		var b FuelBillRecord
		if err := rows.Scan(&b.ID, &b.BillID, &b.BillNo, &b.FillDate, &b.Station, &b.Branch, &b.FuelType, &b.Liters, &b.PricePerLiter, &b.TotalAmount, &b.Odometer, &b.TaxID, &b.PaymentMethod, &b.VehicleID, &b.DriverID, &b.DriverName, &b.OcrRawText, &b.ImageData, &b.ScannedAt, &b.CreatedAt); err != nil {
			continue
		}
		bills = append(bills, b)
	}
	if bills == nil {
		bills = []FuelBillRecord{}
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": bills})
}

// OdometerResult holds the extracted odometer reading
type OdometerResult struct {
	Reading    string `json:"reading"`
	VehicleID  string `json:"vehicleId"`
	DriverID   string `json:"driverId"`
	DriverName string `json:"driverName"`
	ScannedAt  string `json:"scannedAt"`
	OcrRawText string `json:"ocrRawText"`
}

// runOdometerOCR runs Tesseract optimized for digit reading (single line mode)
func runOdometerOCR(imageBytes []byte) (string, error) {
	tesseractPath := findTesseract()
	if tesseractPath == "" {
		return "", fmt.Errorf("tesseract not found")
	}

	tmpDir := os.TempDir()
	imgFile := filepath.Join(tmpDir, fmt.Sprintf("odo_%d.png", time.Now().UnixNano()))
	outFile := filepath.Join(tmpDir, fmt.Sprintf("odo_%d", time.Now().UnixNano()))

	if err := os.WriteFile(imgFile, imageBytes, 0644); err != nil {
		return "", fmt.Errorf("failed to write temp image: %w", err)
	}
	defer os.Remove(imgFile)
	defer os.Remove(outFile + ".txt")

	// Try psm 7 (single text line) with digits config for odometer
	cmd := exec.Command(tesseractPath, imgFile, outFile,
		"-l", "eng",
		"--psm", "7",
		"-c", "tessedit_char_whitelist=0123456789.,")
	if _, err := cmd.CombinedOutput(); err != nil {
		// Fallback: try normal mode
		cmd2 := exec.Command(tesseractPath, imgFile, outFile, "-l", "eng+tha")
		if _, err2 := cmd2.CombinedOutput(); err2 != nil {
			// Fallback: try eng only
			cmd3 := exec.Command(tesseractPath, imgFile, outFile, "-l", "eng")
			if _, err3 := cmd3.CombinedOutput(); err3 != nil {
				return "", fmt.Errorf("tesseract failed on all attempts")
			}
		}
	}

	result, err := os.ReadFile(outFile + ".txt")
	if err != nil {
		return "", fmt.Errorf("failed to read OCR result: %w", err)
	}
	return strings.TrimSpace(string(result)), nil
}

// parseOdometerReading extracts a numeric odometer value from OCR text
func parseOdometerReading(text string) string {
	text = strings.TrimSpace(text)
	if text == "" {
		return "ไม่ระบุ"
	}

	// Pattern 1: look for labeled odometer (เลขไมล์, Odometer, km, etc.)
	odoLabelRe := regexp.MustCompile(`(?i)(?:เลขไมล์|odometer|mileage|km|กม)\s*[:.]?\s*(\d[\d,.]*)`)
	if m := odoLabelRe.FindStringSubmatch(text); len(m) > 1 {
		return strings.Replace(strings.Replace(m[1], ",", "", -1), ".", "", -1)
	}

	// Pattern 2: long number sequence (odometer typically 4-7 digits)
	longNumRe := regexp.MustCompile(`(\d{4,7})`)
	matches := longNumRe.FindAllString(text, -1)
	if len(matches) > 0 {
		// Return the longest match (most likely the odometer)
		best := matches[0]
		for _, m := range matches {
			if len(m) > len(best) {
				best = m
			}
		}
		return best
	}

	// Pattern 3: any number with comma separators (e.g., 123,456)
	commaNumRe := regexp.MustCompile(`(\d{1,3}(?:,\d{3})+)`)
	if m := commaNumRe.FindString(text); m != "" {
		return strings.Replace(m, ",", "", -1)
	}

	// Pattern 4: any decimal number
	decRe := regexp.MustCompile(`(\d+[.,]\d+)`)
	if m := decRe.FindString(text); m != "" {
		return strings.Replace(m, ",", "", -1)
	}

	return "ไม่ระบุ"
}

// SubmitOdometerOCR receives an odometer image, runs OCR to extract the reading
func SubmitOdometerOCR(c *gin.Context) {
	var req struct {
		ImageData  string `json:"imageData" binding:"required"`
		VehicleID  string `json:"vehicleId"`
		DriverID   string `json:"driverId"`
		DriverName string `json:"driverName"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "imageData is required"})
		return
	}

	// Decode base64 image
	imageB64 := req.ImageData
	if idx := strings.Index(imageB64, ","); idx != -1 {
		imageB64 = imageB64[idx+1:]
	}
	imageBytes, err := base64.StdEncoding.DecodeString(imageB64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid base64 image"})
		return
	}

	// Run OCR optimized for odometer digits
	ocrText, ocrErr := runOdometerOCR(imageBytes)
	if ocrErr != nil {
		ocrText = ""
	}

	// Parse the odometer reading
	reading := parseOdometerReading(ocrText)

	now := time.Now()

	// Ensure table exists
	database.DB.Exec(`
		CREATE TABLE IF NOT EXISTS odometer_readings (
			id SERIAL PRIMARY KEY,
			reading VARCHAR(50),
			vehicle_id VARCHAR(50),
			driver_id VARCHAR(50),
			driver_name VARCHAR(200),
			ocr_raw_text TEXT,
			image_data TEXT,
			scanned_at TIMESTAMP DEFAULT NOW()
		)
	`)

	// Save to DB
	database.DB.Exec(`
		INSERT INTO odometer_readings (reading, vehicle_id, driver_id, driver_name, ocr_raw_text, image_data, scanned_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		reading, req.VehicleID, req.DriverID, req.DriverName,
		ocrText, req.ImageData, now,
	)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": OdometerResult{
			Reading:    reading,
			VehicleID:  req.VehicleID,
			DriverID:   req.DriverID,
			DriverName: req.DriverName,
			ScannedAt:  now.Format("2/1/2006 15:04:05"),
			OcrRawText: ocrText,
		},
	})
}
