using Middlewares.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Middleware.Models
{
    [Table("emp-tb-ms-employees")]
    public class Employee
    {
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public decimal Id { get; set; }  // Assuming employee ID is a numeric type
        public string? FirstNameEn { get; set; }
        public string? LastNameEn { get; set; }
        public int? DepartmentId { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Mobile { get; set; }
        public DateTime? JoinDate { get; set; }
        public decimal? RoleId { get; set; }
        public string? EmployeeId { get; set; }
        public string? Company { get; set; }
        public string? Img { get; set; }
        public int? DesignationId { get; set; }
        public bool IsActive { get; set; } = true; // Default value
        public string? FirstNameTh { get; set; }
        public string? LastNameTh { get; set; }
        public int? OrganizationId { get; set; }
        public DateTime? BirthDate { get; set; }
        public DateTime? ResignationDate { get; set; }
        public int? Gender { get; set; }
        public string? Address { get; set; }
        public string? State { get; set; }
        public string? Country { get; set; }
        public string? PinCode { get; set; }
        public int? ReportsTo { get; set; }
        public string? PassportNo { get; set; }
        public DateTime? PassportExpiryDate { get; set; }
        public string? Tel { get; set; }
        public string? Nationality { get; set; }
        public string? Religion { get; set; }
        public int? MaritalStatus { get; set; }
        public string? EmploymentOfSpouse { get; set; }
        public string? NoOfChildren { get; set; }
        public string? FamilyInformations { get; set; }
        public string? EducationInformations { get; set; }
        public string? Experience { get; set; }
        public string? PrimaryContactName { get; set; }
        public string? PrimaryContactRelationship { get; set; }
        public string? PrimaryContactPhone1 { get; set; }
        public string? PrimaryContactPhone2 { get; set; }
        public string? SecondaryContactName { get; set; }
        public string? SecondaryContactRelationship { get; set; }
        public string? SecondaryContactPhone1 { get; set; }
        public string? SecondaryContactPhone2 { get; set; }
        public string? BankName { get; set; }
        public string? BankAccountNo { get; set; }
        public string? BankCode { get; set; }
        public int? BankId { get; set; }
        public string? Branch { get; set; }
        public string? ImgPath { get; set; }    
        public int? ClientId { get; set; }

        public bool? IsSuperadmin { get; set; }

    }
    
}

