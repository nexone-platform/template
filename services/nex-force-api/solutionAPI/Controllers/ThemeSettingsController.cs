using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares.Models;

namespace solutionAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ThemeSettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ThemeSettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET /themesettings
        /// Returns the active theme settings (single row).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var theme = await _context.ThemeSettings
                .Where(t => t.IsActive)
                .FirstOrDefaultAsync();

            if (theme == null)
            {
                // Return defaults if no row exists
                return Ok(new ThemeSettings());
            }

            return Ok(theme);
        }

        /// <summary>
        /// PUT /themesettings
        /// Update or insert theme settings.
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] ThemeSettings dto)
        {
            try
            {
                var existing = await _context.ThemeSettings
                    .Where(t => t.IsActive)
                    .FirstOrDefaultAsync();

                if (existing == null)
                {
                    // Insert new row — let DB sequence assign the ID
                    dto.ThemeId = 0;
                    dto.CreatedAt = DateTime.UtcNow;
                    dto.IsActive = true;
                    _context.ThemeSettings.Add(dto);
                }
                else
                {
                    // Update existing
                    existing.PrimaryColor = dto.PrimaryColor;
                    existing.PrimaryDark = dto.PrimaryDark;
                    existing.PrimaryLight = dto.PrimaryLight;
                    existing.AccentColor = dto.AccentColor;
                    existing.AccentLight = dto.AccentLight;

                    existing.SuccessColor = dto.SuccessColor;
                    existing.DangerColor = dto.DangerColor;
                    existing.WarningColor = dto.WarningColor;

                    existing.BgColor = dto.BgColor;
                    existing.CardColor = dto.CardColor;
                    existing.SidebarColor = dto.SidebarColor;
                    existing.SidebarHover = dto.SidebarHover;
                    existing.SidebarTextColor = dto.SidebarTextColor;
                    existing.HeaderColor = dto.HeaderColor;

                    existing.TextPrimary = dto.TextPrimary;
                    existing.TextSecondary = dto.TextSecondary;
                    existing.TextMuted = dto.TextMuted;

                    existing.BorderColor = dto.BorderColor;
                    existing.BorderLight = dto.BorderLight;

                    existing.FontFamily = dto.FontFamily;
                    existing.FontSizeBase = dto.FontSizeBase;
                    existing.HeadingFontFamily = dto.HeadingFontFamily;

                    existing.SidebarWidth = dto.SidebarWidth;
                    existing.SidebarCollapsedWidth = dto.SidebarCollapsedWidth;
                    existing.HeaderHeight = dto.HeaderHeight;
                    existing.BorderRadius = dto.BorderRadius;

                    existing.DarkModeEnabled = dto.DarkModeEnabled;
                    existing.RtlEnabled = dto.RtlEnabled;
                    existing.CompactMode = dto.CompactMode;

                    existing.CustomCss = dto.CustomCss;

                    existing.UpdatedAt = DateTime.UtcNow;
                    existing.UpdatedBy = dto.UpdatedBy;
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Theme settings saved successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Failed to save theme: {ex.Message}", detail = ex.InnerException?.Message });
            }
        }

        /// <summary>
        /// POST /themesettings/reset
        /// Reset theme to defaults.
        /// </summary>
        [HttpPost("reset")]
        public async Task<IActionResult> Reset()
        {
            var existing = await _context.ThemeSettings
                .Where(t => t.IsActive)
                .FirstOrDefaultAsync();

            if (existing != null)
            {
                var defaults = new ThemeSettings();

                existing.PrimaryColor = defaults.PrimaryColor;
                existing.PrimaryDark = defaults.PrimaryDark;
                existing.PrimaryLight = defaults.PrimaryLight;
                existing.AccentColor = defaults.AccentColor;
                existing.AccentLight = defaults.AccentLight;
                existing.SuccessColor = defaults.SuccessColor;
                existing.DangerColor = defaults.DangerColor;
                existing.WarningColor = defaults.WarningColor;
                existing.BgColor = defaults.BgColor;
                existing.CardColor = defaults.CardColor;
                existing.SidebarColor = defaults.SidebarColor;
                existing.SidebarHover = defaults.SidebarHover;
                existing.SidebarTextColor = defaults.SidebarTextColor;
                existing.HeaderColor = defaults.HeaderColor;
                existing.TextPrimary = defaults.TextPrimary;
                existing.TextSecondary = defaults.TextSecondary;
                existing.TextMuted = defaults.TextMuted;
                existing.BorderColor = defaults.BorderColor;
                existing.BorderLight = defaults.BorderLight;
                existing.FontFamily = defaults.FontFamily;
                existing.FontSizeBase = defaults.FontSizeBase;
                existing.HeadingFontFamily = defaults.HeadingFontFamily;
                existing.SidebarWidth = defaults.SidebarWidth;
                existing.SidebarCollapsedWidth = defaults.SidebarCollapsedWidth;
                existing.HeaderHeight = defaults.HeaderHeight;
                existing.BorderRadius = defaults.BorderRadius;
                existing.DarkModeEnabled = defaults.DarkModeEnabled;
                existing.RtlEnabled = defaults.RtlEnabled;
                existing.CompactMode = defaults.CompactMode;
                existing.CustomCss = defaults.CustomCss;

                existing.UpdatedAt = DateTime.UtcNow;
                existing.UpdatedBy = "system";

                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Theme reset to defaults." });
        }
    }
}
