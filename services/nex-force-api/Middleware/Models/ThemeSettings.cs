using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Middlewares.Models
{
    [Table("adm-tb-ms-theme-settings")]
    public class ThemeSettings
    {
        public int ThemeId { get; set; }

        // ── Brand Colors ──
        public string PrimaryColor { get; set; } = "#6C5CE7";
        public string PrimaryDark { get; set; } = "#5A4BD1";
        public string PrimaryLight { get; set; } = "#F0EEFF";
        public string AccentColor { get; set; } = "#00B4D8";
        public string AccentLight { get; set; } = "#E0F7FA";

        // ── Status Colors ──
        public string SuccessColor { get; set; } = "#059669";
        public string DangerColor { get; set; } = "#DC2626";
        public string WarningColor { get; set; } = "#D97706";

        // ── Background & Surface ──
        public string BgColor { get; set; } = "#EEF0F4";
        public string CardColor { get; set; } = "#FFFFFF";
        public string SidebarColor { get; set; } = "#111113";
        public string SidebarHover { get; set; } = "#1C1C1F";
        public string SidebarTextColor { get; set; } = "#FFFFFF";
        public string HeaderColor { get; set; } = "rgba(255,255,255,0.85)";

        // ── Text Colors ──
        public string TextPrimary { get; set; } = "#1A1A2E";
        public string TextSecondary { get; set; } = "#6B7280";
        public string TextMuted { get; set; } = "#9CA3AF";

        // ── Border Colors ──
        public string BorderColor { get; set; } = "#E5E7EB";
        public string BorderLight { get; set; } = "#F3F4F6";

        // ── Typography ──
        public string FontFamily { get; set; } = "Inter, sans-serif";
        public string FontSizeBase { get; set; } = "14px";
        public string HeadingFontFamily { get; set; } = "Inter, sans-serif";

        // ── Layout ──
        public string SidebarWidth { get; set; } = "260px";
        public string SidebarCollapsedWidth { get; set; } = "70px";
        public string HeaderHeight { get; set; } = "64px";
        public string BorderRadius { get; set; } = "12px";

        // ── Features ──
        public bool DarkModeEnabled { get; set; } = false;
        public bool RtlEnabled { get; set; } = false;
        public bool CompactMode { get; set; } = false;

        // ── Custom CSS ──
        public string? CustomCss { get; set; } = "";

        // ── Audit ──
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
    }
}
