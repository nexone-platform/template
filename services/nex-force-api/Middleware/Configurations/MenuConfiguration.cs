using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middlewares.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Configurations
{
    public class MenuConfiguration : IEntityTypeConfiguration<Menu>
    {
        public void Configure(EntityTypeBuilder<Menu> builder)
        {

            builder.Property(e => e.MenusId)
                        .HasColumnName("menus_id")
                        .HasDefaultValueSql("nextval('\"solution-one\".menus_id'::regclass)")
                        .IsRequired();


            builder.HasKey(m => m.MenusId);

            // Map other properties to their corresponding column names
            builder.Property(m => m.CreateDate)
                .HasColumnName("create_date");

            builder.Property(m => m.CreateBy)
                .HasColumnName("create_by");

            builder.Property(m => m.UpdateDate)
                .HasColumnName("update_date");

            builder.Property(m => m.UpdateBy)
                .HasColumnName("update_by");

            builder.Property(m => m.Title)
                .HasColumnName("title")
                .HasMaxLength(255)
                .IsRequired(false);

            builder.Property(m => m.Icon)
                .HasColumnName("icon");

            builder.Property(m => m.ShowAsTab)
                .HasColumnName("show_as_tab");

            builder.Property(m => m.SeparateRoute)
                .HasColumnName("separate_route");

            builder.Property(m => m.MenuCode)
                .HasColumnName("menu_code");

            builder.Property(m => m.MenuValue)
                .HasColumnName("menu_value");

            builder.Property(m => m.Route)
                .HasColumnName("route");

            builder.Property(m => m.HasSubRoute)
                .HasColumnName("has_sub_route");

            builder.Property(m => m.ShowSubRoute)
                .HasColumnName("show_sub_route");
            builder.Property(p => p.PageKey)
                .HasColumnName("page_key");
            builder.Property(m => m.Base)
                .HasColumnName("base");
            builder.Property(m => m.Page).HasColumnName("page").HasMaxLength(255);
            builder.Property(m => m.Page1).HasColumnName("page1").HasMaxLength(255);
            builder.Property(m => m.Page2).HasColumnName("page2").HasMaxLength(255);
            builder.Property(m => m.Base2).HasColumnName("base2").HasMaxLength(255);
            builder.Property(m => m.Base3).HasColumnName("base3").HasMaxLength(255);
            builder.Property(m => m.Base4).HasColumnName("base4").HasMaxLength(255);
            builder.Property(m => m.Base5).HasColumnName("base5").HasMaxLength(255);
            builder.Property(m => m.Base6).HasColumnName("base6").HasMaxLength(255);
            builder.Property(m => m.Base7).HasColumnName("base7").HasMaxLength(255);
            builder.Property(m => m.Base8).HasColumnName("base8").HasMaxLength(255);

            builder.Property(m => m.Materialicons)
                .HasColumnName("materialicons");

            builder.Property(m => m.Dot)
                .HasColumnName("dot");
            builder.Property(m => m.TitleTh)
                .HasColumnName("title_th");
            builder.Property(m => m.ParentId)
                .HasColumnName("parent_id");

            builder.Property(u => u.IsActive)
                    .HasColumnName("is_active");

            // Self-referencing foreign key (Parent menu)
            builder.HasOne(m => m.ParentMenu)
                .WithMany()  // A menu can have many child menus
                .HasForeignKey(m => m.ParentId)
                .OnDelete(DeleteBehavior.Cascade);  // Cascade delete for child menus if parent is deleted

            // Configure the parent-child relationship
            builder.HasOne(m => m.ParentMenu)
                .WithMany()
                .HasForeignKey(m => m.ParentId)
                .IsRequired(false);


            builder.Property(u => u.MenuSeq)
                    .HasColumnName("menu_seq");
        }
    }
}
