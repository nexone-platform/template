using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Middlewares.Models;

namespace Middlewares.Configurations
{
    public class ThemeSettingsConfiguration : IEntityTypeConfiguration<ThemeSettings>
    {
        public void Configure(EntityTypeBuilder<ThemeSettings> builder)
        {
            builder.HasKey(x => x.ThemeId);

            builder.Property(x => x.ThemeId)
                   .HasColumnName("theme_id")
                   .HasDefaultValueSql("nextval('\"solution-one\".\"adm-sq-theme-settings-id\"'::regclass)");

            // ── Brand Colors ──
            builder.Property(x => x.PrimaryColor).HasColumnName("primary_color").HasMaxLength(20);
            builder.Property(x => x.PrimaryDark).HasColumnName("primary_dark").HasMaxLength(20);
            builder.Property(x => x.PrimaryLight).HasColumnName("primary_light").HasMaxLength(20);
            builder.Property(x => x.AccentColor).HasColumnName("accent_color").HasMaxLength(20);
            builder.Property(x => x.AccentLight).HasColumnName("accent_light").HasMaxLength(20);

            // ── Status Colors ──
            builder.Property(x => x.SuccessColor).HasColumnName("success_color").HasMaxLength(20);
            builder.Property(x => x.DangerColor).HasColumnName("danger_color").HasMaxLength(20);
            builder.Property(x => x.WarningColor).HasColumnName("warning_color").HasMaxLength(20);

            // ── Background & Surface ──
            builder.Property(x => x.BgColor).HasColumnName("bg_color").HasMaxLength(20);
            builder.Property(x => x.CardColor).HasColumnName("card_color").HasMaxLength(20);
            builder.Property(x => x.SidebarColor).HasColumnName("sidebar_color").HasMaxLength(20);
            builder.Property(x => x.SidebarHover).HasColumnName("sidebar_hover").HasMaxLength(20);
            builder.Property(x => x.SidebarTextColor).HasColumnName("sidebar_text_color").HasMaxLength(20);
            builder.Property(x => x.HeaderColor).HasColumnName("header_color").HasMaxLength(30);

            // ── Text Colors ──
            builder.Property(x => x.TextPrimary).HasColumnName("text_primary").HasMaxLength(20);
            builder.Property(x => x.TextSecondary).HasColumnName("text_secondary").HasMaxLength(20);
            builder.Property(x => x.TextMuted).HasColumnName("text_muted").HasMaxLength(20);

            // ── Border Colors ──
            builder.Property(x => x.BorderColor).HasColumnName("border_color").HasMaxLength(20);
            builder.Property(x => x.BorderLight).HasColumnName("border_light").HasMaxLength(20);

            // ── Typography ──
            builder.Property(x => x.FontFamily).HasColumnName("font_family").HasMaxLength(100);
            builder.Property(x => x.FontSizeBase).HasColumnName("font_size_base").HasMaxLength(10);
            builder.Property(x => x.HeadingFontFamily).HasColumnName("heading_font_family").HasMaxLength(100);

            // ── Layout ──
            builder.Property(x => x.SidebarWidth).HasColumnName("sidebar_width").HasMaxLength(10);
            builder.Property(x => x.SidebarCollapsedWidth).HasColumnName("sidebar_collapsed_width").HasMaxLength(10);
            builder.Property(x => x.HeaderHeight).HasColumnName("header_height").HasMaxLength(10);
            builder.Property(x => x.BorderRadius).HasColumnName("border_radius").HasMaxLength(10);

            // ── Features ──
            builder.Property(x => x.DarkModeEnabled).HasColumnName("dark_mode_enabled").HasDefaultValue(false);
            builder.Property(x => x.RtlEnabled).HasColumnName("rtl_enabled").HasDefaultValue(false);
            builder.Property(x => x.CompactMode).HasColumnName("compact_mode").HasDefaultValue(false);

            // ── Custom CSS ──
            builder.Property(x => x.CustomCss).HasColumnName("custom_css").HasColumnType("text");

            // ── Audit ──
            builder.Property(x => x.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");
            builder.Property(x => x.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
            builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            builder.Property(x => x.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
        }
    }
}
