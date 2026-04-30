
using AutoMapper;
using Kros.Extensions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using System.Security.Claims;
using Middlewares.Models;
using Middlewares;
using Middlewares.Models;
using System.Linq;


namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class EmployeeController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        private readonly ApplicationDbContext _context;
        private readonly ILoggingService _loggingService;
        private readonly IMapper _mapper;
        public class EmployeeDTO : Employee
        {
            public string? RoleName { get; set; }
            public string? Designation { get; set; }
            public string? Department { get; set; }
             public string? Organization { get; set; }
              public string? OrganizationCode { get; set; }

            public string? GenderName { get; set; }
            public string? MaritalStatusName { get; set; }
            public decimal? Salary { get; set; }
            public ReportTo? ReportToData { get; set; }
        }

        public class ReportTo
        {
            public string Name { get; set; }
            public string ProfileImg { get; set; }
            public decimal Id { get; set; } // Manager ID
        }
        public EmployeeController(ApplicationDbContext context, IMapper mapper, ILoggingService loggingService)
        {
            _mapper = mapper; 
            _context = context;

            _loggingService = loggingService;
        }

        [HttpGet("getEmployeeForSelect")]
        public async Task<ActionResult<IEnumerable<EmployeeDTO>>> GetEmployees()
        {

            var employees = await (from e in _context.Employees
                                   where e.IsActive == true && e.IsSuperadmin != true
                                   join employment in _context.Employments on e.Id equals employment.EmployeeId into employmentJoin
                                   from employment in employmentJoin.DefaultIfEmpty()
                                   select new EmployeeDTO
                                   {
                                       Id = e.Id,
                                       FirstNameEn = e.FirstNameEn,
                                       LastNameEn = e.LastNameEn,
                                       FirstNameTh = e.FirstNameTh,
                                       LastNameTh = e.LastNameTh,
                                       DepartmentId = e.DepartmentId,
                                       DesignationId = e.DesignationId,
                                       Phone = e.Phone,
                                       Email = e.Email,
                                       Mobile = e.Mobile,
                                       JoinDate = e.JoinDate,
                                       RoleId = e.RoleId,
                                       EmployeeId = e.EmployeeId,
                                       Company = e.Company,
                                       Img = e.Img,
                                       CreateDate = e.CreateDate,
                                       CreateBy = e.CreateBy,
                                       UpdateDate = e.UpdateDate,
                                       UpdateBy = e.UpdateBy,
                                       OrganizationId = e.OrganizationId,
                                       Salary = employment.Salary,
                                       ImgPath = !string.IsNullOrEmpty(e.ImgPath) ? e.ImgPath : null,
                                   }).ToListAsync();

            var response = new ApiResponse<EmployeeDTO>
            {
                Data = employees,
                TotalData = employees.Count
            };
            return Ok(response);
        }

        [HttpGet("getEmployeeByprojectId/{projectId}")]
        public async Task<ActionResult<IEnumerable<EmployeeDTO>>> GetEmployeeByprojectId(int projectId)
        {

            var project = await _context.Projects
                        .Where(p => p.ProjectId == projectId)
                        .FirstOrDefaultAsync();

            if (project == null || string.IsNullOrEmpty(project.Team))
            {
                return Ok(new ApiResponse<EmployeeDTO>
                {
                    Data = new List<EmployeeDTO>(),
                    TotalData = 0
                });
            }
            var employeeIds = new List<decimal>();
            if (!string.IsNullOrEmpty(project.Team))
            {
                employeeIds = project.Team
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(id => decimal.Parse(id.Trim()))
                    .ToList();
            }

            // ????? project_leader ?????????????????
            if (project.ProjectLeader.HasValue && !employeeIds.Contains(project.ProjectLeader.Value))
            {
                employeeIds.Add(project.ProjectLeader.Value);
            }

            var employees = await (from e in _context.Employees
                                   where employeeIds.Contains(e.Id) && e.IsActive == true && e.IsSuperadmin != true
                                   join employment in _context.Employments on e.Id equals employment.EmployeeId into employmentJoin
                                   from employment in employmentJoin.DefaultIfEmpty()
                                   select new EmployeeDTO
                                   {
                                       Id = e.Id,
                                       FirstNameEn = e.FirstNameEn,
                                       LastNameEn = e.LastNameEn,
                                       FirstNameTh = e.FirstNameTh,
                                       LastNameTh = e.LastNameTh,
                                       DepartmentId = e.DepartmentId,
                                       DesignationId = e.DesignationId,
                                       Phone = e.Phone,
                                       Email = e.Email,
                                       Mobile = e.Mobile,
                                       JoinDate = e.JoinDate,
                                       RoleId = e.RoleId,
                                       EmployeeId = e.EmployeeId,
                                       Company = e.Company,
                                       Img = e.Img,
                                       CreateDate = e.CreateDate,
                                       CreateBy = e.CreateBy,
                                       UpdateDate = e.UpdateDate,
                                       UpdateBy = e.UpdateBy,
                                       OrganizationId = e.OrganizationId,
                                       Salary = employment.Salary,
                                       ImgPath = string.IsNullOrWhiteSpace(e.ImgPath)
                                        ? null
                                        : e.ImgPath
                                   }).ToListAsync();

            var response = new ApiResponse<EmployeeDTO>
            {
                Data = employees,
                TotalData = employees.Count
            };
            return Ok(response);
        }

        [HttpGet("getEmployeeType")]
        public async Task<ActionResult<IEnumerable<EmployeeType>>> GetGender()
        {
            var employeeTypes = await _context.EmployeeTypes.ToListAsync();
            var response = new ApiResponse<EmployeeType>
            {
                Data = employeeTypes,
                TotalData = employeeTypes.Count
            };
            return Ok(response);
        }

        [HttpGet("getAllEmployee")]
        public async Task<ActionResult<IEnumerable<EmployeeDTO>>> GetEmployeesForEmployment()
        {

            var employees = await (
                                    from e in _context.Employees
                                    join r in _context.Roles
                                        on e.RoleId equals r.RoleId into roleJoin
                                    from r in roleJoin.DefaultIfEmpty()
                                    join dept in _context.Departments
                                        on e.DepartmentId equals dept.DepartmentId into deptJoin
                                    from dept in deptJoin.DefaultIfEmpty()
                                    join desig in _context.Designations
                                        on e.DesignationId equals desig.DesignationId into desigJoin
                                    from desig in desigJoin.DefaultIfEmpty()
                                    where e.IsSuperadmin != true
                                   select new EmployeeDTO
                                   {
                                       Id = e.Id,
                                       FirstNameEn = e.FirstNameEn,
                                       LastNameEn = e.LastNameEn,
                                       FirstNameTh = e.FirstNameTh,
                                       LastNameTh = e.LastNameTh,
                                       DepartmentId = e.DepartmentId,
                                       DesignationId = e.DesignationId,
                                       Phone = e.Phone,
                                       Email = e.Email,
                                       Mobile = e.Mobile,
                                       JoinDate = e.JoinDate,
                                       RoleId = e.RoleId,
                                       EmployeeId = e.EmployeeId,
                                       Company = e.Company,
                                       Img = e.Img,
                                       CreateDate = e.CreateDate,
                                       CreateBy = e.CreateBy,
                                       UpdateDate = e.UpdateDate,
                                       UpdateBy = e.UpdateBy,
                                       ResignationDate = e.ResignationDate,
                                       OrganizationId = e.OrganizationId,
                                       ImgPath = !string.IsNullOrEmpty(e.ImgPath)
                                                ? e.ImgPath  
                                                : null,
                                       IsActive = e.IsActive,
                                       RoleName = r != null ? r.RoleName : null,
                                       Department = dept != null ? dept.DepartmentNameTh : null,
                                       Designation = desig != null ? desig.DesignationNameEn : null,
                                   }).ToListAsync();

            var response = new ApiResponse<EmployeeDTO>
            {
                Data = employees,
                TotalData = employees.Count
            };
            return Ok(response);
        }

        [HttpGet("getNewId")]
        public async Task<ActionResult<IEnumerable<EmployeeDTO>>> GetId()
        {
            var maxId = await _context.Employees
                .MaxAsync(e => (decimal?)e.Id);
            if (maxId == null)
            {
                // Handle the case where the table is empty
                maxId = 0;
            }
            else
            {
                maxId = maxId + 1;
            }
            return Ok(maxId);

        }

        [HttpGet("getEmployeeById/{id}")]
        public async Task<ActionResult<EmployeeDTO>> GetEmployeeById(decimal id)
        {
            var employee = await _context.Employees.FindAsync(id);

            if (employee == null || employee.IsSuperadmin == true)
            {
                return NotFound(new { message = $"Employee with ID {id} not found." });
            }
            var designation = await _context.Designations
                .Where(e => e.DesignationId == employee.DesignationId) // Use == for comparison
                .Select(e => e.DesignationNameEn)
                .FirstOrDefaultAsync();

            var department = await _context.Departments
                .Where(e => e.DepartmentId == employee.DepartmentId) // Use == for comparison
                .Select(e => e.DepartmentNameTh)
                .FirstOrDefaultAsync();

            //var organize = await _context.Organizations
            //    .Where(e => e.OrganizationId == employee.OrganizationId) // Use == for comparison
            //    .Select(e => e.OrganizationNameEn)
            //    .FirstOrDefaultAsync();


            var genderName = await _context.Genders
                .Where(e => e.GenderId == employee.Gender) // Use == for comparison
                .Select(e => e.GenderName)
                .FirstOrDefaultAsync();

            var reportTo = await _context.Employees
                .Where(e => e.Id == employee.ReportsTo && e.IsSuperadmin != true)
                .Select(e => new ReportTo
                {
                    Name = e.FirstNameEn + " " + e.LastNameEn, // or any other format
                    ProfileImg = !string.IsNullOrEmpty(e.ImgPath) ? e.ImgPath : null,
                    Id = e.Id
                }).FirstOrDefaultAsync();

            var maritalStatusName = await _context.MaritalStatuss
                      .Where(e => e.MaritalStatusId == employee.MaritalStatus) // Use == for comparison
                      .Select(e => e.MaritalStatusName)
                      .FirstOrDefaultAsync();

            string organizeName = null;
            string organizeCode = null;

            if (employee.OrganizationId.HasValue)
            {
                var org = await _context.Organizations
                    .Where(o => o.OrganizationId == employee.OrganizationId.Value)
                    .Select(o => new
                    {
                        o.OrganizationNameEn,
                        o.OrganizationCode
                    })
                    .FirstOrDefaultAsync();

                if (org != null)
                {
                    organizeName = org.OrganizationNameEn;
                    organizeCode = org.OrganizationCode;
                }
            }
            else if (employee.ClientId.HasValue)
            {
                var client = await _context.Clients
                    .Where(c => c.ClientId == employee.ClientId.Value)
                    .Select(c => new
                    {
                        c.Company,
                        c.ClientCode
                    })
                    .FirstOrDefaultAsync();

                if (client != null)
                {
                    organizeName = client.Company;
                    organizeCode = client.ClientCode;
                }
            }

            var employeeDto = new EmployeeDTO
            {
                Id = employee.Id,
                MaritalStatusName = maritalStatusName,
                FirstNameTh = employee.FirstNameTh,
                LastNameTh = employee.LastNameTh,
                FirstNameEn = employee.FirstNameEn,
                LastNameEn = employee.LastNameEn,
                DepartmentId = employee.DepartmentId,
                Department = department,
                Phone = employee.Phone,
                Email = employee.Email,
                Mobile = employee.Mobile,
                JoinDate = employee.JoinDate,
                RoleId = employee.RoleId,
                EmployeeId = employee.EmployeeId,
                Company = employee.Company,
                Img = employee.Img,
                Designation = designation,
                DesignationId = employee.DesignationId,
                IsActive = employee.IsActive,
                CreateDate = employee.CreateDate,
                CreateBy = employee.CreateBy,
                UpdateDate = employee.UpdateDate,
                UpdateBy = employee.UpdateBy,
                OrganizationId = employee.OrganizationId,
                Organization = organizeName,
                BirthDate = employee.BirthDate,
                Gender = employee.Gender,
                GenderName = genderName,
                Address = employee.Address,
                State = employee.State,
                Country = employee.Country,
                PinCode = employee.PinCode,
                ReportsTo = employee.ReportsTo,
                PassportNo = employee.PassportNo,
                PassportExpiryDate = employee.PassportExpiryDate,
                Tel = employee.Tel,
                Nationality = employee.Nationality,
                Religion = employee.Religion,
                MaritalStatus = employee.MaritalStatus,
                EmploymentOfSpouse = employee.EmploymentOfSpouse,
                NoOfChildren = employee.NoOfChildren,
                PrimaryContactName = employee.PrimaryContactName,
                PrimaryContactRelationship = employee.PrimaryContactRelationship,
                PrimaryContactPhone1 = employee.PrimaryContactPhone1,
                PrimaryContactPhone2 = employee.PrimaryContactPhone2,
                SecondaryContactName = employee.SecondaryContactName,
                SecondaryContactRelationship = employee.SecondaryContactRelationship,
                SecondaryContactPhone1 = employee.SecondaryContactPhone1,
                SecondaryContactPhone2 = employee.SecondaryContactPhone2,
                FamilyInformations = employee.FamilyInformations,
                EducationInformations = employee.EducationInformations,
                Experience = employee.Experience,
                ResignationDate = employee.ResignationDate,
                ReportToData = reportTo,
                BankName = employee.BankName, 
                BankAccountNo = employee.BankAccountNo,
                BankCode = employee.BankCode,
                BankId = employee.BankId,
                ImgPath = !string.IsNullOrEmpty(employee.ImgPath) ? employee.ImgPath : null,
                OrganizationCode = organizeCode,
                Branch = employee.Branch

            };

            return Ok(employeeDto);
        }


        public class Criteria
        {
            public string? EmployeeId { get; set; }
            public string? EmployeeName { get; set; }
            public int? DesignationId { get; set; }

        }
        [HttpPost("search")]
        public async Task<ActionResult<Employee>> searchEmployee([FromBody] Criteria criteria)
        {
            var query = (from e in _context.Employees
                         where e.IsActive == true && e.IsSuperadmin != true
                         select new EmployeeDTO
                         {
                             Id = e.Id,
                             FirstNameEn = e.FirstNameEn,
                             LastNameEn = e.LastNameEn,
                             FirstNameTh = e.FirstNameTh,
                             LastNameTh = e.LastNameTh,
                             DepartmentId = e.DepartmentId,
                             DesignationId = e.DesignationId,
                             Phone = e.Phone,
                             Email = e.Email,
                             Mobile = e.Mobile,
                             JoinDate = e.JoinDate,
                             RoleId = e.RoleId,
                             EmployeeId = e.EmployeeId,
                             Company = e.Company,
                             Img = e.Img,
                             OrganizationId = e.OrganizationId,
                             CreateDate = e.CreateDate,
                             CreateBy = e.CreateBy,
                             UpdateDate = e.UpdateDate,
                             UpdateBy = e.UpdateBy,
                             Branch = e.Branch
                         });

            // Apply filtering
            if (!string.IsNullOrEmpty(criteria.EmployeeId))
            {

               query = query.Where(e =>
                        EF.Functions.ILike(e.EmployeeId, $"%{criteria.EmployeeId}%"));
            }

            if (!string.IsNullOrEmpty(criteria.EmployeeName))
            {
                query = query.Where(e => e.FirstNameEn.Contains(criteria.EmployeeName) || e.FirstNameTh.Contains(criteria.EmployeeName)
                || e.LastNameEn.Contains(criteria.EmployeeName) || e.LastNameEn.Contains(criteria.EmployeeName));
            }

            if (criteria.DesignationId.HasValue)
            {
                query = query.Where(e => e.DesignationId == criteria.DesignationId);
            }

            var employees = await query.ToListAsync();
            var response = new ApiResponse<EmployeeDTO>
            {
                Data = employees,
                TotalData = employees.Count
            };
            return Ok(response);
        }
        public class FileUploadModel
        {
            public IFormFile File { get; set; }
        }
        [HttpPost("update")]
        public async Task<ActionResult<Employee>> CreateOrUpdateEmployee([FromForm] EmployeeInfo employee)
        {
            if (employee == null)
            {
                return BadRequest(new { message = "Invalid employee data." });
            }
            string imgPath = null;

            string? ConvertToNullIfStringIsNull(string? value)
            {
                return value == "null" ? null : value;
            }

            employee.FirstNameEn = ConvertToNullIfStringIsNull(employee.FirstNameEn);
            employee.LastNameEn = ConvertToNullIfStringIsNull(employee.LastNameEn);
            employee.Address = ConvertToNullIfStringIsNull(employee.Address);
            employee.State = ConvertToNullIfStringIsNull(employee.State);
            employee.Country = ConvertToNullIfStringIsNull(employee.Country);
            employee.PinCode = ConvertToNullIfStringIsNull(employee.PinCode);
            employee.Phone = ConvertToNullIfStringIsNull(employee.Phone);
            employee.PassportNo = ConvertToNullIfStringIsNull(employee.PassportNo);
            employee.Tel = ConvertToNullIfStringIsNull(employee.Tel);
            employee.Nationality = ConvertToNullIfStringIsNull(employee.Nationality);
            employee.Religion = ConvertToNullIfStringIsNull(employee.Religion);
            employee.EmploymentOfSpouse = ConvertToNullIfStringIsNull(employee.EmploymentOfSpouse);
            employee.NumberOfChildren = ConvertToNullIfStringIsNull(employee.NumberOfChildren);
            employee.PrimaryContactName = ConvertToNullIfStringIsNull(employee.PrimaryContactName);
            employee.PrimaryContactRelationship = ConvertToNullIfStringIsNull(employee.PrimaryContactRelationship);
            employee.PrimaryContactPhone1 = ConvertToNullIfStringIsNull(employee.PrimaryContactPhone1);
            employee.PrimaryContactPhone2 = ConvertToNullIfStringIsNull(employee.PrimaryContactPhone2);
            employee.SecondaryContactName = ConvertToNullIfStringIsNull(employee.SecondaryContactName);
            employee.SecondaryContactRelationship = ConvertToNullIfStringIsNull(employee.SecondaryContactRelationship);
            employee.SecondaryContactPhone1 = ConvertToNullIfStringIsNull(employee.SecondaryContactPhone1);
            employee.SecondaryContactPhone2 = ConvertToNullIfStringIsNull(employee.SecondaryContactPhone2);
            employee.FamilyInformations = ConvertToNullIfStringIsNull(employee.FamilyInformations);
            employee.EducationInformations = ConvertToNullIfStringIsNull(employee.EducationInformations);
            employee.Experience = ConvertToNullIfStringIsNull(employee.Experience);
            employee.BankName = ConvertToNullIfStringIsNull(employee.BankName);
            employee.BankAccountNo = ConvertToNullIfStringIsNull(employee.BankAccountNo);
            employee.BankCode = ConvertToNullIfStringIsNull(employee.BankCode);
           // employee.BankId = ConvertToNullIfStringIsNull(employee.BankId);
            employee.ImgPath = ConvertToNullIfStringIsNull(employee.ImgPath);
            employee.EmployeeId = ConvertToNullIfStringIsNull(employee.EmployeeId);
            employee.Email = ConvertToNullIfStringIsNull(employee.Email);
            employee.Branch = ConvertToNullIfStringIsNull(employee.Branch);
            employee.ClientId = ConvertToNullIfStringIsNull(employee.ClientId);
            employee.OrganizationId = ConvertToNullIfStringIsNull(employee.OrganizationId);
            // Save the uploaded image if it exists


            if (employee.File != null && employee.File.Length > 0)
            {
                // path จริงใน container (ถูก mount จาก host)
                var uploadRoot = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                      "images",
                        "employees"
                );

                if (!Directory.Exists(uploadRoot))
                    Directory.CreateDirectory(uploadRoot);

                // 🔒 rename ปลอดภัย
                var ext = Path.GetExtension(employee.File.FileName);
                var fileName = $"{Guid.NewGuid()}{ext}";

                var filePath = Path.Combine(uploadRoot, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await employee.File.CopyToAsync(stream);
                }

                // path สำหรับ frontend / DB
                imgPath = $"/images/employees/{fileName}";
            }


            // Check if the employeeId is provided for update
            if (employee.Id > 0)
            {
                // Update existing employee
                var existingEmployee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.Id == employee.Id);
                if (existingEmployee == null)
                {
                    return NotFound(new { message = $"Employee with ID {employee.Id} not found." });
                }

                // 🔒 Prevent modifying superadmin records
                if (existingEmployee.IsSuperadmin == true)
                {
                    return BadRequest(new { message = "Cannot modify superadmin account." });
                }
                existingEmployee = existingEmployee;
                var user = await _context.Users
                            .FirstOrDefaultAsync(u => u.EmployeeId == existingEmployee.EmployeeId);
                if (user != null && user.RoleId != employee.RoleId)
                {
                    user.RoleId = employee.RoleId;
                    user.UpdateDate = DateTime.UtcNow;
                    user.UpdateBy = employee.Username;

                    _context.Users.Update(user);
                }
                existingEmployee.FirstNameEn = employee.FirstNameEn;
                existingEmployee.LastNameEn = employee.LastNameEn;
                existingEmployee.BirthDate = employee.BirthDate;
                existingEmployee.Gender = employee.Gender != 0 ? employee.Gender : existingEmployee.Gender;
                existingEmployee.Address = employee.Address ;
                existingEmployee.State = employee.State;
                existingEmployee.Country = employee.Country ;
                existingEmployee.PinCode = employee.PinCode;
                existingEmployee.Phone = employee.Phone;
                
                // Update department, designation, reportsTo
                existingEmployee.DepartmentId = employee.DepartmentId != 0 ? employee.DepartmentId : existingEmployee.DepartmentId;
                existingEmployee.DesignationId = employee.DesignationId != 0 ? employee.DesignationId : existingEmployee.DesignationId;
                existingEmployee.ReportsTo = employee.ReportsTo != 0 ? employee.ReportsTo : existingEmployee.ReportsTo;

                // Update passport details
                existingEmployee.PassportNo = employee.PassportNo;
                existingEmployee.PassportExpiryDate = employee.PassportExpiryDate != DateTime.MinValue ? employee.PassportExpiryDate : existingEmployee.PassportExpiryDate;

                // Update contact details
                existingEmployee.Tel = employee.Tel;
                existingEmployee.Nationality = employee.Nationality;
                existingEmployee.Religion = employee.Religion;
                existingEmployee.MaritalStatus = employee.MaritalStatus != 0 ? employee.MaritalStatus : existingEmployee.MaritalStatus;
                existingEmployee.EmploymentOfSpouse = employee.EmploymentOfSpouse ;
                existingEmployee.NoOfChildren = employee.NumberOfChildren;

                // Update emergency contacts
                existingEmployee.PrimaryContactName = employee.PrimaryContactName;
                existingEmployee.PrimaryContactRelationship = employee.PrimaryContactRelationship;
                existingEmployee.PrimaryContactPhone1 = employee.PrimaryContactPhone1;
                existingEmployee.PrimaryContactPhone2 = employee.PrimaryContactPhone2;
                existingEmployee.SecondaryContactName = employee.SecondaryContactName;
                existingEmployee.SecondaryContactRelationship = employee.SecondaryContactRelationship;
                existingEmployee.SecondaryContactPhone1 = employee.SecondaryContactPhone1;
                existingEmployee.SecondaryContactPhone2 = employee.SecondaryContactPhone2;
                
                // Update JSON fields (FamilyInformations, EducationInformations, Experience)
                existingEmployee.FamilyInformations = employee.FamilyInformations;
                existingEmployee.EducationInformations = employee.EducationInformations;
                existingEmployee.Experience = employee.Experience;
                existingEmployee.UpdateDate = DateTime.UtcNow;
                existingEmployee.UpdateBy = employee.Username;
                existingEmployee.CreateBy = existingEmployee.CreateBy;
                existingEmployee.CreateDate = existingEmployee.CreateDate;
                existingEmployee.JoinDate = existingEmployee.JoinDate;
                existingEmployee.BankName = employee.BankName;
                existingEmployee.BankAccountNo = employee.BankAccountNo;
                existingEmployee.BankCode = employee.BankCode;
                existingEmployee.BankId = employee.BankId;
                existingEmployee.Branch = employee.Branch;
                existingEmployee.ImgPath = imgPath ?? existingEmployee.ImgPath;
                existingEmployee.RoleId = employee.RoleId;
                existingEmployee.ImgPath = imgPath ?? existingEmployee.ImgPath;
                if (!string.IsNullOrWhiteSpace(employee.ClientId))
                {
                    existingEmployee.ClientId = int.Parse(employee.ClientId);
                }
                else
                {
                    existingEmployee.OrganizationId = null;
                }

                if (!string.IsNullOrWhiteSpace(employee.OrganizationId))
                {
                    existingEmployee.OrganizationId = int.Parse(employee.OrganizationId);
                }
                else
                {
                    existingEmployee.OrganizationId = null;
                }

                var newEmployment  = await _context.Employments
                    .FirstOrDefaultAsync(e => e.EmployeeId == employee.Id);
                if(newEmployment != null)
                {
                    newEmployment.UpdateDate = DateTime.UtcNow;
                    newEmployment.UpdateBy = employee.Username;
                    newEmployment.EffectiveDate = employee.EffectiveDate;
                    newEmployment.Salary = employee.Salary??0;
                    newEmployment.EmployeeId = employee.Id;
                    newEmployment.PaymentTypeId = employee.PaymentTypeId;
                    newEmployment.EmployeeTypeId = employee.EmployeeTypeId;
                    newEmployment.DesignationId = employee.DesignationId;
                    _context.Employments.Update(newEmployment);
                } else
                {
                    var employment = new Employment
                    {
                        EffectiveDate = employee.EffectiveDate,
                        DesignationId = employee.DesignationId,
                        Salary = employee.Salary ?? 0,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = employee.Username,
                        EmployeeId = employee.Id,
                        PaymentTypeId = employee.PaymentTypeId,
                        EmployeeTypeId = employee.EmployeeTypeId
                    };
                    _context.Employments.Add(employment);

                }

                existingEmployee.ResignationDate = null;
                _context.Employees.Update(existingEmployee);
            }
            else
            {
                var maxId = await _context.Employees
                    .MaxAsync(e => (decimal?)e.Id);
                if (maxId == null)
                {
                    // Handle the case where the table is empty
                    maxId = 0;
                }
                else
                {
                    maxId = maxId + 1;
                }
                var ouId = await _context.Organizations
                    .MaxAsync(e => e.OrganizationId);

                // Check if Email already exists
                if (await _context.Employees.AnyAsync(e => e.Email == employee.Email))
                {
                    return BadRequest(new { message = "Email is already taken." });
                }

                // Create new employee
                var newEmployee = new Employee
                {
                    Id = (decimal)maxId,
                    FirstNameEn = employee.FirstNameEn,
                    LastNameEn = employee.LastNameEn,
                    JoinDate = DateTime.UtcNow,
                    BirthDate = employee.BirthDate,
                    Gender = employee.Gender,
                    Address = employee.Address,
                    State = employee.State,
                    Country = employee.Country,
                    PinCode = employee.PinCode,
                    Phone = employee.Phone,
                    DepartmentId = employee.DepartmentId,
                    DesignationId = employee.DesignationId,
                    ReportsTo = employee.ReportsTo??0,
                    PassportNo = employee.PassportNo,
                    PassportExpiryDate = employee.PassportExpiryDate,
                    Tel = employee.Tel,
                    Nationality = employee.Nationality,
                    Religion = employee.Religion,
                    MaritalStatus = employee.MaritalStatus,
                    EmploymentOfSpouse = employee.EmploymentOfSpouse,
                    NoOfChildren = employee.NumberOfChildren,
                    PrimaryContactName = employee.PrimaryContactName,
                    PrimaryContactRelationship = employee.PrimaryContactRelationship,
                    PrimaryContactPhone1 = employee.PrimaryContactPhone1,
                    PrimaryContactPhone2 = employee.PrimaryContactPhone2,
                    SecondaryContactName = employee.SecondaryContactName,
                    SecondaryContactRelationship = employee.SecondaryContactRelationship,
                    SecondaryContactPhone1 = employee.SecondaryContactPhone1,
                    SecondaryContactPhone2 = employee.SecondaryContactPhone2,
                    FamilyInformations = employee.FamilyInformations,
                    EducationInformations = employee.EducationInformations,
                    Experience = employee.Experience,
                    BankAccountNo = employee.BankAccountNo,
                    BankName = employee.BankName,
                    BankCode = employee.BankCode,
                    BankId = employee.BankId,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = employee.Username, // Use a method to get the current user's ID
                    ImgPath = imgPath,
                    EmployeeId = employee.EmployeeId,
                    Email = employee.Email,
                    IsActive = true,
                    ResignationDate = null,
                    RoleId = employee.RoleId,
                    IsSuperadmin = false,
                    Branch = employee.Branch,
                    ClientId = string.IsNullOrWhiteSpace(employee.OrganizationId)
            && int.TryParse(employee.ClientId, out var cId)
                ? cId
                : (int?)null,

                    OrganizationId = int.TryParse(employee.OrganizationId, out var oId)
                ? oId
                : (int?)null

                };

                _context.Employees.Add(newEmployee);
                employee.Id = newEmployee.Id;

                var newEmployment = new Employment
                {
                    EffectiveDate = employee.EffectiveDate,
                    DesignationId = employee.DesignationId,
                    Salary = employee.Salary ?? 0,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = employee.Username,
                    EmployeeId = employee.Id,
                    PaymentTypeId = employee.PaymentTypeId,
                    EmployeeTypeId = employee.EmployeeTypeId
                };
                _context.Employments.Add(newEmployment);
            }

            await _context.SaveChangesAsync();

            // Return updated or newly created EmployeeDTO

            return Ok(new { Id = employee.Id });
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] FileUploadModel model)
        {
            if (model.File == null || model.File.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }

            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads", model.File.FileName);

            using (var stream = new FileStream(path, FileMode.Create))
            {
                await model.File.CopyToAsync(stream);
            }

            return Ok(new { FilePath = $"uploads/{model.File.FileName}" });
        }

        [HttpGet("getBankData")]
        public async Task<ActionResult<IEnumerable<Bank>>> GetBankData()
        {

            try
            {
                var bank = await _context.Banks.ToListAsync();

                var response = new ApiResponse<Bank>
                {
                    Data = bank,
                    TotalData = bank.Count
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "An unexpected error occurred. Please try again later."
                });
            }
        }


        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteEmployee(decimal id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound(new { message = "Employee not found" });
            }

            // 🔒 Prevent deleting superadmin
            if (employee.IsSuperadmin == true)
            {
                return BadRequest(new { message = "Cannot delete superadmin account." });
            }

            _context.Employees.Remove(employee);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Employee deleted successfully" });
        }
        public class UserRequest
        {
            public string Username { get; set; }
        }
        [HttpPost("reactivate/{employeeId}")]
        public async Task<IActionResult> ReactivateEmployee(int employeeId, UserRequest username)
        {
            try
            {
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Id == employeeId);

                if (employee == null)
                {
                    return NotFound(new { message = "Employee not found." });
                }

                if (!employee.IsActive)
                {
                    employee.ResignationDate = null;
                    employee.IsActive = true;
                    employee.UpdateDate = DateTime.UtcNow;
                    employee.UpdateBy = username.Username;

                    _context.Employees.Update(employee);

                    await _context.SaveChangesAsync();

                    return Ok(new { message = "Employee reactivated successfully." });
                }

                return BadRequest(new { message = "Employee is already active." });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "reactivate employee", username.Username);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }
        private string GetCurrentUserId()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            // Example using HttpContext
            /* var userId = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);*/

            return username;
        }
    }
    public class FileUploadModel
    {
        public IFormFile File { get; set; }
    }


    public class EmployeeInfo
    {
        public decimal Id { get; set; }

        [FromForm(Name = "File")]
        public IFormFile? File { get; set; } // Nullable IFormFile

        [FromForm(Name = "FirstNameEn")]
        public string? FirstNameEn { get; set; } // Nullable string

        [FromForm(Name = "LastNameEn")]
        public string? LastNameEn { get; set; } // Nullable string

        [FromForm(Name = "BirthDate")]
        public DateTime? BirthDate { get; set; } // Nullable DateTime

        [FromForm(Name = "Gender")]
        public int? Gender { get; set; } // Nullable int

        [FromForm(Name = "Address")]
        public string? Address { get; set; } // Nullable string

        [FromForm(Name = "State")]
        public string? State { get; set; } // Nullable string

        [FromForm(Name = "Country")]
        public string? Country { get; set; } // Nullable string

        [FromForm(Name = "PinCode")]
        public string? PinCode { get; set; } // Nullable string

        [FromForm(Name = "Phone")]
        public string? Phone { get; set; } // Nullable string

        [FromForm(Name = "DepartmentId")]
        public int? DepartmentId { get; set; } // Nullable int

        [FromForm(Name = "DesignationId")]
        public int? DesignationId { get; set; } // Nullable int

        [FromForm(Name = "ReportsTo")]
        public int? ReportsTo { get; set; } // Nullable int

        [FromForm(Name = "PassportNo")]
        public string? PassportNo { get; set; } // Nullable string

        [FromForm(Name = "PassportExpiryDate")]
        public DateTime? PassportExpiryDate { get; set; } // Nullable DateTime

        [FromForm(Name = "Tel")]
        public string? Tel { get; set; } // Nullable string

        [FromForm(Name = "Nationality")]
        public string? Nationality { get; set; } // Nullable string

        [FromForm(Name = "Religion")]
        public string? Religion { get; set; } // Nullable string

        [FromForm(Name = "MaritalStatus")]
        public int? MaritalStatus { get; set; } // Nullable int

        [FromForm(Name = "EmploymentOfSpouse")]
        public string? EmploymentOfSpouse { get; set; } // Nullable string

        [FromForm(Name = "NumberOfChildren")]
        public string? NumberOfChildren { get; set; } // Nullable string
                                                      // Emergency contact information
        [FromForm(Name = "PrimaryContactName")]
        public string? PrimaryContactName { get; set; }

        [FromForm(Name = "PrimaryContactRelationship")]
        public string? PrimaryContactRelationship { get; set; }

        [FromForm(Name = "PrimaryContactPhone1")]
        public string? PrimaryContactPhone1 { get; set; }

        [FromForm(Name = "PrimaryContactPhone2")]
        public string? PrimaryContactPhone2 { get; set; }

        [FromForm(Name = "SecondaryContactName")]
        public string? SecondaryContactName { get; set; }

        [FromForm(Name = "SecondaryContactRelationship")]
        public string? SecondaryContactRelationship { get; set; }

        [FromForm(Name = "SecondaryContactPhone1")]
        public string? SecondaryContactPhone1 { get; set; }

        [FromForm(Name = "SecondaryContactPhone2")]
        public string? SecondaryContactPhone2 { get; set; }

        // Family informations stored as JSON string
        [FromForm(Name = "FamilyInformations")]
        public string? FamilyInformations { get; set; }

        // Education informations stored as JSON string
        [FromForm(Name = "EducationInformations")]
        public string? EducationInformations { get; set; }

        // Experience informations stored as JSON string
        [FromForm(Name = "Experience")]
        public string? Experience { get; set; }

        [FromForm(Name = "BankName")]
        public string? BankName { get; set; }

        [FromForm(Name = "BankAccountNo")]
        public string? BankAccountNo { get; set; }

        [FromForm(Name = "BankCode")]
        public string? BankCode { get; set; }
        [FromForm(Name = "Branch")]
        public string? Branch { get; set; }

        [FromForm(Name = "BankId")]
        public int? BankId { get; set; }

        [FromForm(Name = "ImgPath")]
        public string? ImgPath { get; set; }
        [FromForm(Name = "EmployeeId")]
        public string? EmployeeId { get; set; }

        [FromForm(Name = "Email")]
        public string? Email { get; set; }
        [FromForm(Name = "Username")]
        public string? Username { get; set; }

        [FromForm(Name = "EffectiveDate")]
        public DateTime? EffectiveDate { get; set; }
        [FromForm(Name = "Salary")]
        public decimal? Salary { get; set; }

        [FromForm(Name = "EmployeeTypeId")]
        public int? EmployeeTypeId { get; set; }

        [FromForm(Name = "PaymentTypeId")]
        public int? PaymentTypeId { get; set; }
        [FromForm(Name = "RoleId")]
        public int? RoleId { get; set; }
        [FromForm(Name = "ClientId")]
        public string? ClientId { get; set; }
        [FromForm(Name = "OrganizationId")]
        public string? OrganizationId { get; set; }
    }
    
}


