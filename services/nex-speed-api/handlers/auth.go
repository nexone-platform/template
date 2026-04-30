package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nexspeed/backend/database"
	"golang.org/x/crypto/bcrypt"
)

// ========== Types ==========

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UserResponse struct {
	ID        int       `json:"id"`
	Username  string    `json:"username"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	Avatar    string    `json:"avatar"`
	IsActive  bool      `json:"isActive"`
	LastLogin *string   `json:"lastLogin"`
	CreatedAt time.Time `json:"createdAt"`
}

type CreateUserRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

type UpdateUserRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Password string `json:"password"`
	IsActive *bool  `json:"isActive"`
}

// ========== INIT — Create users table ==========

func InitUsersTable() {
	createSQL := `
	CREATE TABLE IF NOT EXISTS nex_core.users (
		id              SERIAL PRIMARY KEY,
		username        VARCHAR(50) NOT NULL UNIQUE,
		password_hash   VARCHAR(255) NOT NULL,
		name            VARCHAR(100) NOT NULL,
		email           VARCHAR(100),
		role            VARCHAR(20) NOT NULL DEFAULT 'viewer',
		avatar          VARCHAR(10) DEFAULT '',
		is_active       BOOLEAN NOT NULL DEFAULT true,
		last_login      TIMESTAMP,
		created_at      TIMESTAMP DEFAULT NOW(),
		updated_at      TIMESTAMP DEFAULT NOW()
	);`
	database.DB.Exec(createSQL)

	// Seed default admin if table is empty
	var count int
	err := database.DB.QueryRow("SELECT COUNT(*) FROM nex_core.users").Scan(&count)
	if err != nil || count == 0 {
		// Hash the default password "admin123"
		hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		seedSQL := `
		INSERT INTO nex_core.users (username, password_hash, name, email, role, avatar) VALUES
		($1, $2, 'ผู้ดูแลระบบ', 'admin@nex_speed.co.th', 'admin', '👨‍💼'),
		($3, $4, 'สมชาย มั่นคง', 'somchai@nex_speed.co.th', 'manager', '👨'),
		($5, $6, 'วิภา แจ่มใส', 'vipa@nex_speed.co.th', 'dispatcher', '👩'),
		($7, $8, 'บัญชี Demo', 'demo@nex_speed.co.th', 'admin', '🧑‍💻')
		ON CONFLICT (username) DO NOTHING;`
		database.DB.Exec(seedSQL,
			"admin", string(hash),
			"somchai", string(hash),
			"dispatch1", string(hash),
			"demo", string(hash),
		)
	}
}

// ========== LOGIN ==========

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "กรุณากรอก username และ password"})
		return
	}

	var user struct {
		ID           int
		Username     string
		PasswordHash string
		Name         string
		Email        sql.NullString
		Role         string
		Avatar       sql.NullString
		IsActive     bool
	}

	err := database.DB.QueryRow(`
		SELECT id, username, password_hash, name, email, role, avatar, is_active
		FROM nex_core.users WHERE username = $1
	`, req.Username).Scan(
		&user.ID, &user.Username, &user.PasswordHash,
		&user.Name, &user.Email, &user.Role, &user.Avatar, &user.IsActive,
	)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"})
		return
	}

	if !user.IsActive {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "บัญชีถูกระงับ กรุณาติดต่อผู้ดูแลระบบ"})
		return
	}

	// Verify password with bcrypt
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"})
		return
	}

	// Update last login
	database.DB.Exec("UPDATE nex_core.users SET last_login = NOW() WHERE id = $1", user.ID)

	email := ""
	if user.Email.Valid {
		email = user.Email.String
	}
	avatar := ""
	if user.Avatar.Valid {
		avatar = user.Avatar.String
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"name":     user.Name,
			"email":    email,
			"role":     user.Role,
			"avatar":   avatar,
		},
	})
}

// ========== GET CURRENT USER (verify session) ==========

func GetCurrentUser(c *gin.Context) {
	username := c.Query("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "username required"})
		return
	}

	var resp UserResponse
	var email, avatar sql.NullString
	var lastLogin sql.NullTime

	err := database.DB.QueryRow(`
		SELECT id, username, name, email, role, avatar, is_active, last_login, created_at
		FROM nex_core.users WHERE username = $1 AND is_active = true
	`, username).Scan(
		&resp.ID, &resp.Username, &resp.Name, &email, &resp.Role,
		&avatar, &resp.IsActive, &lastLogin, &resp.CreatedAt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "ไม่พบผู้ใช้"})
		return
	}

	if email.Valid {
		resp.Email = email.String
	}
	if avatar.Valid {
		resp.Avatar = avatar.String
	}
	if lastLogin.Valid {
		t := lastLogin.Time.Format("02/01/2006 15:04")
		resp.LastLogin = &t
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": resp})
}

// ========== LIST USERS ==========

func GetUsers(c *gin.Context) {
	rows, err := database.DB.Query(`
		SELECT id, username, name, email, role, avatar, is_active, last_login, created_at
		FROM nex_core.users ORDER BY id
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	defer rows.Close()

	var users []UserResponse
	for rows.Next() {
		var u UserResponse
		var email, avatar sql.NullString
		var lastLogin sql.NullTime

		rows.Scan(&u.ID, &u.Username, &u.Name, &email, &u.Role, &avatar, &u.IsActive, &lastLogin, &u.CreatedAt)

		if email.Valid {
			u.Email = email.String
		}
		if avatar.Valid {
			u.Avatar = avatar.String
		}
		if lastLogin.Valid {
			t := lastLogin.Time.Format("02/01/2006 15:04")
			u.LastLogin = &t
		}
		users = append(users, u)
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": users})
}

// ========== CREATE USER ==========

func CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "กรุณากรอกข้อมูลให้ครบ"})
		return
	}

	if req.Role == "" {
		req.Role = "viewer"
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "ไม่สามารถเข้ารหัสรหัสผ่านได้"})
		return
	}

	var id int
	err = database.DB.QueryRow(`
		INSERT INTO nex_core.users (username, password_hash, name, email, role)
		VALUES ($1, $2, $3, $4, $5) RETURNING id
	`, req.Username, string(hash), req.Name, req.Email, req.Role).Scan(&id)

	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"success": false, "error": "ชื่อผู้ใช้ซ้ำ"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data": gin.H{
			"id":       id,
			"username": req.Username,
			"name":     req.Name,
			"email":    req.Email,
			"role":     req.Role,
		},
	})
}

// ========== UPDATE USER ==========

func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	// Build dynamic update
	if req.Password != "" {
		hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		database.DB.Exec("UPDATE nex_core.users SET password_hash = $1, updated_at = NOW() WHERE id = $2", string(hash), id)
	}
	if req.Name != "" {
		database.DB.Exec("UPDATE nex_core.users SET name = $1, updated_at = NOW() WHERE id = $2", req.Name, id)
	}
	if req.Email != "" {
		database.DB.Exec("UPDATE nex_core.users SET email = $1, updated_at = NOW() WHERE id = $2", req.Email, id)
	}
	if req.Role != "" {
		database.DB.Exec("UPDATE nex_core.users SET role = $1, updated_at = NOW() WHERE id = $2", req.Role, id)
	}
	if req.IsActive != nil {
		database.DB.Exec("UPDATE nex_core.users SET is_active = $1, updated_at = NOW() WHERE id = $2", *req.IsActive, id)
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "อัปเดตผู้ใช้สำเร็จ"})
}

// ========== DELETE USER ==========

func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	_, err := database.DB.Exec("DELETE FROM nex_core.users WHERE id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "ลบผู้ใช้สำเร็จ"})
}
