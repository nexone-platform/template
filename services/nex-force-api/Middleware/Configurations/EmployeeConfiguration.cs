using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
    {
        public void Configure(EntityTypeBuilder<Employee> builder)
        {

            builder.HasKey(e => e.Id)
                  .HasName("pk_employees"); // Optionally specify a primary key constraint

            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.Id)
                .HasColumnName("id")
                .HasDefaultValueSql("nextval('\"solution-one\".employee_id_seq'::regclass)")
                .IsRequired();
            builder.Property(e => e.FirstNameEn).HasColumnName("first_name_en");
            builder.Property(e => e.LastNameEn).HasColumnName("last_name_en");
            builder.Property(e => e.DepartmentId).HasColumnName("department_id");
            builder.Property(e => e.Phone).HasColumnName("phone");
            builder.Property(e => e.Email).HasColumnName("email");
            builder.Property(e => e.Mobile).HasColumnName("mobile");
            builder.Property(e => e.JoinDate).HasColumnName("join_date");
            builder.Property(e => e.RoleId).HasColumnName("role_id");
            builder.Property(e => e.EmployeeId).HasColumnName("employee_id");
            builder.Property(e => e.Company).HasColumnName("company");
            builder.Property(e => e.Img).HasColumnName("img");
            builder.Property(e => e.DesignationId).HasColumnName("designation_id");
            builder.Property(e => e.IsActive)
                .HasColumnName("isactive")
                .HasDefaultValue(true)
                .IsRequired();
            builder.Property(e => e.FirstNameTh).HasColumnName("first_name_th");
            builder.Property(e => e.LastNameTh).HasColumnName("last_name_th");
            builder.Property(e => e.OrganizationId).HasColumnName("organization_id");
            builder.Property(e => e.BirthDate).HasColumnName("birth_date");
            builder.Property(e => e.Gender).HasColumnName("gender");
            builder.Property(e => e.Address).HasColumnName("address");
            builder.Property(e => e.State).HasColumnName("state");
            builder.Property(e => e.Country).HasColumnName("country");
            builder.Property(e => e.PinCode).HasColumnName("pin_code");
            builder.Property(e => e.ReportsTo).HasColumnName("reports_to");
            builder.Property(e => e.PassportNo).HasColumnName("passport_no");
            builder.Property(e => e.PassportExpiryDate).HasColumnName("passport_expiry_date");
            builder.Property(e => e.Tel).HasColumnName("tel");
            builder.Property(e => e.Nationality).HasColumnName("nationality");
            builder.Property(e => e.Religion).HasColumnName("religion");
            builder.Property(e => e.MaritalStatus).HasColumnName("marital_status");
            builder.Property(e => e.EmploymentOfSpouse).HasColumnName("employment_of_spouse");
            builder.Property(e => e.NoOfChildren).HasColumnName("no_of_children");
            builder.Property(e => e.FamilyInformations).HasColumnName("family_informations");
            builder.Property(e => e.EducationInformations).HasColumnName("education_informations");
            builder.Property(e => e.Experience).HasColumnName("experience");
            builder.Property(e => e.ResignationDate).HasColumnName("resignation_date");
            // New contact information mappings
            builder.Property(e => e.PrimaryContactName).HasColumnName("primary_contact_name");
            builder.Property(e => e.PrimaryContactRelationship).HasColumnName("primary_contact_relationship");
            builder.Property(e => e.PrimaryContactPhone1).HasColumnName("primary_contact_phone1");
            builder.Property(e => e.PrimaryContactPhone2).HasColumnName("primary_contact_phone2");

            builder.Property(e => e.SecondaryContactName).HasColumnName("secondary_contact_name");
            builder.Property(e => e.SecondaryContactRelationship).HasColumnName("secondary_contact_relationship");
            builder.Property(e => e.SecondaryContactPhone1).HasColumnName("secondary_contact_phone1");
            builder.Property(e => e.SecondaryContactPhone2).HasColumnName("secondary_contact_phone2");

            builder.Property(e => e.BankCode).HasColumnName("bank_code");
            builder.Property(e => e.BankId).HasColumnName("bank_id");
            builder.Property(e => e.BankName).HasColumnName("bank_name");
            builder.Property(e => e.BankAccountNo).HasColumnName("bank_account_no");
            builder.Property(e => e.Branch).HasColumnName("branch");
            builder.Property(e => e.ImgPath).HasColumnName("img_path");
            builder.Property(e => e.IsSuperadmin)
                .HasColumnName("is_superadmin");

            builder.Property(c => c.ClientId)
                .HasColumnName("client_id");

            // 🔒 Global Query Filter: ซ่อน superadmin จากทุก query อัตโนมัติ
            // ถ้าต้องการ query superadmin ให้ใช้ .IgnoreQueryFilters()
            builder.HasQueryFilter(e => e.IsSuperadmin != true);
        }
    }
}
