using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Middlewares.Models;
using static Middlewares.Constant.StatusConstant;
using static solutionAPI.Controllers.PayrolItemController;

namespace HrService.Services
{
    public class PayrolItemService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        public PayrolItemService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;
        }

        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        public async Task<IActionResult> AddDeductionAsync(DeductionRequest model)
        {
            // Create new Addition
            var addition = new Deduction
            {
                DeductionType = model.DeductionType,
                DeductionName = model.DeductionName,
                IsActive = model.IsActive,
                UnitAmount = model.UnitAmount,
                PercentAmount = model.PercentAmount,
                CreateDate = DateTime.UtcNow,
                CreateBy = "system", // Replace with actual user info
                UpdateDate = DateTime.UtcNow,
                UpdateBy = "system" // Replace with actual user info
            };

            _context.Add(addition);
            await _context.SaveChangesAsync();

            // Create AdditionEmployeeAssignment based on Assignee Type
            await CreateDeductionAssignmentsAsync(model, addition.DeductionId);

            return new OkObjectResult(new { message = "Deduction added successfully!" });
        }

        public async Task<IActionResult> AddAdditionAsync(AdditionRequest model)
        {
            // Create new Addition
            var addition = new Additions
            {
                AdditionsName = model.AdditionsName,
                AdditionType = model.AdditionType,
                IsActive = model.IsActive,
                UnitAmount = model.UnitAmount,
                PercentAmount = model.PercentAmount ,
                CreateDate = DateTime.UtcNow,
                CreateBy = "system", // Replace with actual user info
                UpdateDate = DateTime.UtcNow,
                UpdateBy = "system" // Replace with actual user info
            };

            _context.Add(addition);
            await _context.SaveChangesAsync();

            // Create AdditionEmployeeAssignment based on Assignee Type
            await CreateAssignmentsAsync(model, addition.AdditionsId);

            return new OkObjectResult(new { message = "Addition added successfully!" });
        }

        private async Task CreateAssignmentsAsync(AdditionRequest model, int additionsId)
        {
            if (model.Assignees != null)
            {
                // Handle assignments based on the Assignees type
                if (model.Assignees.Type == AssignmentType.Specific && model.Assignees.EmployeeIds?.Any() == true)
                {
                    // For specific employees
                    foreach (var employeeId in model.Assignees.EmployeeIds)
                    {
                        var assignment = new AdditionEmployeeAssignment
                        {
                            AdditionsId = additionsId,
                            AssignmentType = (int)AssignmentType.Specific, // Use enum value
                            EmployeeId = employeeId,
                            AssignedDate = DateTime.UtcNow,
                            IsActive = true,
                            CreateDate = DateTime.UtcNow,
                            CreateBy = "system", // Replace with actual user info
                            UpdateDate = DateTime.UtcNow,
                            UpdateBy = "system" // Replace with actual user info
                        };
                        _context.Add(assignment);
                    }
                }
                else if (model.Assignees.Type == AssignmentType.Project && model.ProjectId?.Any() == true)
                {
                    // For Department assignments
                    foreach (var projectId in model.ProjectId)
                    {
                        if (model.ExceptedEmployees?.Any() == true)
                        {
                            foreach (var employeeId in model.ExceptedEmployees)
                            {
                                var assignment = new AdditionEmployeeAssignment
                                {
                                    AdditionsId = additionsId,
                                    AssignmentType = (int)AssignmentType.Project, // Use enum value
                                    ExceptedEmployeeIds = employeeId,
                                    ProjectId = projectId,
                                    AssignedDate = DateTime.UtcNow,
                                    IsActive = true,
                                    CreateDate = DateTime.UtcNow,
                                    CreateBy = "system", // Replace with actual user info
                                };
                                _context.Add(assignment);
                            }
                        }
                        else
                        {

                            var assignment = new AdditionEmployeeAssignment
                            {
                                AdditionsId = additionsId,
                                AssignmentType = (int)AssignmentType.Department, // Use enum value
                                ProjectId = projectId,
                                AssignedDate = DateTime.UtcNow,
                                IsActive = true,
                                CreateDate = DateTime.UtcNow,
                                CreateBy = "system", // Replace with actual user info
                            };
                            _context.Add(assignment);
                        }
                    }

                }
                else if (model.Assignees.Type == AssignmentType.Department && model.DepartmentId?.Any() == true)
                {
                    // For Department assignments
                    foreach (var departmentId in model.DepartmentId)
                    {
                        if (model.ExceptedEmployees?.Any() == true)
                        {
                            foreach (var employeeId in model.ExceptedEmployees)
                            {
                                var assignment = new AdditionEmployeeAssignment
                                {
                                    AdditionsId = additionsId,
                                    AssignmentType = (int)AssignmentType.Department, // Use enum value
                                    ExceptedEmployeeIds = employeeId,
                                    DepartmentId = departmentId,
                                    AssignedDate = DateTime.UtcNow,
                                    IsActive = true,
                                    CreateDate = DateTime.UtcNow,
                                    CreateBy = "system", // Replace with actual user info
                                   
                                };
                                _context.Add(assignment);
                            }
                        } else {
                            
                                var assignment = new AdditionEmployeeAssignment
                                {
                                    AdditionsId = additionsId,
                                    AssignmentType = (int)AssignmentType.Department, // Use enum value
                                    DepartmentId = departmentId,
                                    AssignedDate = DateTime.UtcNow,
                                    IsActive = true,
                                    CreateDate = DateTime.UtcNow,
                                    CreateBy = "system", // Replace with actual user info
                                  
                                };
                            _context.Add(assignment);
                        }     
                    }

                }
                // Add else block for 'option1' - No Assignee
                else if (model.Assignees.Type == AssignmentType.NoAssignee)
                {
                    // No Assignee
                    var assignment = new AdditionEmployeeAssignment
                    {
                        AdditionsId = additionsId,
                        AssignmentType = (int)AssignmentType.NoAssignee, // Use enum value
                        IsActive = false, // No assignee, so mark as inactive
                        AssignedDate = DateTime.UtcNow,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = "system", // Replace with actual user info
                        
                    };
                    _context.Add(assignment);
                }
                // Add else block for 'option2' - All Employees
                else if (model.Assignees.Type == AssignmentType.AllEmployees)
                {
                    if (model.ExceptedEmployees?.Any() == true)
                    {
                        foreach (var employeeId in model.ExceptedEmployees)
                        {
                            var assignment = new AdditionEmployeeAssignment
                            {
                                AdditionsId = additionsId,
                                AssignmentType = (int)AssignmentType.AllEmployees, // Use enum value
                                ExceptedEmployeeIds= employeeId,
                                IsActive = true, // Active for all employees
                                AssignedDate = DateTime.UtcNow,
                                CreateDate = DateTime.UtcNow,
                                CreateBy = "system", // Replace with actual user info
                               
                            };
                            _context.Add(assignment);
                        }
                    } else
                    {
                        var assignment = new AdditionEmployeeAssignment
                        {
                            AdditionsId = additionsId,
                            AssignmentType = (int)AssignmentType.AllEmployees, // Use enum value
                            IsActive = true, // Active for all employees
                            AssignedDate = DateTime.UtcNow,
                            CreateDate = DateTime.UtcNow,
                            CreateBy = "system", // Replace with actual user info
                           
                        };
                        _context.Add(assignment);
                    }    

                }
            }
            else
            {
                if (model.AssigneeType.ToString() == AssignmentType.AllEmployees.ToString())
                {
                    if (model.ExceptedEmployees?.Any() == true)
                    {
                        foreach (var employeeId in model.ExceptedEmployees)
                        {
                            var assignment = new AdditionEmployeeAssignment
                            {
                                AdditionsId = additionsId,
                                AssignmentType = (int)AssignmentType.AllEmployees, // Use enum value
                                ExceptedEmployeeIds = employeeId,
                                IsActive = true, // Active for all employees
                                AssignedDate = DateTime.UtcNow,
                                CreateDate = DateTime.UtcNow,
                                CreateBy = "system", // Replace with actual user info
                                
                            };
                            _context.Add(assignment);
                        }
                    }
                    else
                    {
                        var assignment = new AdditionEmployeeAssignment
                        {
                            AdditionsId = additionsId,
                            AssignmentType = (int)AssignmentType.AllEmployees, // Use enum value
                            IsActive = true, // Active for all employees
                            AssignedDate = DateTime.UtcNow,
                            CreateDate = DateTime.UtcNow,
                            CreateBy = "system", // Replace with actual user info
                            
                        };
                        _context.Add(assignment);
                    }
                }
                if (model.AssigneeType.ToString() == AssignmentType.NoAssignee.ToString())
                {
                    // All Employees
                    var assignment = new AdditionEmployeeAssignment
                    {
                        AdditionsId = additionsId,
                        AssignmentType = (int)AssignmentType.NoAssignee, // Use enum value
                        IsActive = true, // Active for all employees
                        AssignedDate = DateTime.UtcNow,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = "system", // Replace with actual user info
                        
                    };
                    _context.Add(assignment);
                }
            }

            await _context.SaveChangesAsync();
        }
        private async Task CreateDeductionAssignmentsAsync(DeductionRequest model, int id)
        {
            if (model.Assignees != null)
            {
                // Handle assignments based on the Assignees type
                if (model.Assignees.Type == AssignmentType.Specific && model.Assignees.EmployeeIds?.Any() == true)
                {
                    // For specific employees
                    foreach (var employeeId in model.Assignees.EmployeeIds)
                    {
                        var assignment = new DeductionEmployeeAssignment
                        {
                            DeductionId = id,
                            AssignmentType = (int)AssignmentType.Specific, // Use enum value
                            EmployeeId = employeeId,
                            AssignedDate = DateTime.UtcNow,
                            IsActive = true,
                            CreateDate = DateTime.UtcNow,
                            CreateBy = "system", // Replace with actual user info
                         
                        };
                        _context.Add(assignment);
                    }
                }
                else if (model.Assignees.Type == AssignmentType.Project && model.ProjectId?.Any() == true)
                {
                    // For Department assignments
                    foreach (var projectId in model.ProjectId)
                    {
                        if (model.ExceptedEmployees?.Any() == true)
                        {
                            foreach (var employeeId in model.ExceptedEmployees)
                            {
                                var assignment = new DeductionEmployeeAssignment
                                {
                                    DeductionId = id,
                                    AssignmentType = (int)AssignmentType.Project, // Use enum value
                                    ExceptedEmployeeIds = employeeId,
                                    ProjectId = projectId,
                                    AssignedDate = DateTime.UtcNow,
                                    IsActive = true,
                                    CreateDate = DateTime.UtcNow,
                                    CreateBy = "system", // Replace with actual user info
                                  
                                };
                                _context.Add(assignment);
                            }
                        }
                        else
                        {

                            var assignment = new DeductionEmployeeAssignment
                            {
                                DeductionId = id,
                                AssignmentType = (int)AssignmentType.Department, // Use enum value
                                ProjectId = projectId,
                                AssignedDate = DateTime.UtcNow,
                                IsActive = true,
                                CreateDate = DateTime.UtcNow,
                                CreateBy = "system", // Replace with actual user info
                               
                            };
                            _context.Add(assignment);
                        }
                    }
                }
                else if (model.Assignees.Type == AssignmentType.Department && model.DepartmentId?.Any() == true)
                {
                    // For Department assignments
                    foreach (var departmentId in model.DepartmentId)
                    {
                        if (model.ExceptedEmployees?.Any() == true)
                        {
                            foreach (var employeeId in model.ExceptedEmployees)
                            {
                                var assignment = new DeductionEmployeeAssignment
                                {
                                    DeductionId = id,
                                    AssignmentType = (int)AssignmentType.Department, // Use enum value
                                    DepartmentId = departmentId,
                                    ExceptedEmployeeIds = employeeId,
                                    AssignedDate = DateTime.UtcNow,
                                    IsActive = true,
                                    CreateDate = DateTime.UtcNow,
                                    CreateBy = "system", // Replace with actual user info
                                  
                                };
                                _context.Add(assignment);
                            }
                        }
                        else
                        {
                            var assignment = new DeductionEmployeeAssignment
                            {
                                DeductionId = id,
                                AssignmentType = (int)AssignmentType.Department, // Use enum value
                                DepartmentId = departmentId,
                                AssignedDate = DateTime.UtcNow,
                                IsActive = true,
                                CreateDate = DateTime.UtcNow,
                                CreateBy = "system", // Replace with actual user info
  
                            };
                            _context.Add(assignment);
                        }
                    }
                }
                // Add else block for 'option1' - No Assignee
                else if (model.Assignees.Type == AssignmentType.NoAssignee)
                {
                    // No Assignee
                    var assignment = new DeductionEmployeeAssignment
                    {
                        DeductionId = id,
                        AssignmentType = (int)AssignmentType.NoAssignee, // Use enum value
                        IsActive = false, // No assignee, so mark as inactive
                        AssignedDate = DateTime.UtcNow,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = "system", // Replace with actual user info

                    };
                    _context.Add(assignment);
                }
                // Add else block for 'option2' - All Employees
                else if (model.Assignees.Type == AssignmentType.AllEmployees)
                {
                    if (model.ExceptedEmployees?.Any() == false)
                    {
                        var assignment = new DeductionEmployeeAssignment
                        {
                            DeductionId = id,
                            AssignmentType = (int)AssignmentType.AllEmployees, // Use enum value
                            IsActive = true, // Active for all employees
                            AssignedDate = DateTime.UtcNow,
                            CreateDate = DateTime.UtcNow,
                            CreateBy = "system", // Replace with actual user info
 
                        };
                        _context.Add(assignment);
                    }
                    else
                    {
                        foreach (var employeeId in model.ExceptedEmployees)
                        {
                            var assignment = new DeductionEmployeeAssignment
                            {
                                DeductionId = id,
                                AssignmentType = (int)AssignmentType.AllEmployees, // Use enum value
                                ExceptedEmployeeIds = employeeId,
                                IsActive = true, // Active for all employees
                                AssignedDate = DateTime.UtcNow,
                                CreateDate = DateTime.UtcNow,
                                CreateBy = "system", // Replace with actual user info

                            };
                            _context.Add(assignment);
                        }
                    }
                }
                else
                {
                    if (model.AssigneeType.ToString() == AssignmentType.AllEmployees.ToString())
                    {
                        if (model.ExceptedEmployees?.Any() == false)
                        {
                            var assignment = new DeductionEmployeeAssignment
                            {
                                DeductionId = id,
                                AssignmentType = (int)AssignmentType.AllEmployees, // Use enum value
                                IsActive = true, // Active for all employees
                                AssignedDate = DateTime.UtcNow,
                                CreateDate = DateTime.UtcNow,
                                CreateBy = "system", // Replace with actual user info

                            };
                            _context.Add(assignment);
                        }
                        else
                        {
                            foreach (var employeeId in model.ExceptedEmployees)
                            {
                                var assignment = new DeductionEmployeeAssignment
                                {
                                    DeductionId = id,
                                    AssignmentType = (int)AssignmentType.AllEmployees, // Use enum value
                                    ExceptedEmployeeIds = employeeId,
                                    IsActive = true, // Active for all employees
                                    AssignedDate = DateTime.UtcNow,
                                    CreateDate = DateTime.UtcNow,
                                    CreateBy = "system", // Replace with actual user info
                 
                                };
                                _context.Add(assignment);
                            }
                        }
                    }
                    if (model.AssigneeType.ToString() == AssignmentType.NoAssignee.ToString())
                    {
                        // All Employees
                        var assignment = new DeductionEmployeeAssignment
                        {
                            DeductionId = id,
                            AssignmentType = (int)AssignmentType.NoAssignee, // Use enum value
                            IsActive = true, // Active for all employees
                            AssignedDate = DateTime.UtcNow,
                            CreateDate = DateTime.UtcNow,
                            CreateBy = "system", // Replace with actual user info

                        };
                        _context.Add(assignment);
                    }
                }

                await _context.SaveChangesAsync();
            }
        }
        public async Task<List<AdditionsWithAssignmentsDto>> GetAdditionsWithAssignments()
        {
            var additionsWithAssignments = await _context.Additions
                //.Where(a => a.IsActive == true) // Optional: Filter by IsActive
                .Select(a => new AdditionsWithAssignmentsDto
                {
                    AdditionsId = a.AdditionsId,
                    AdditionsName = a.AdditionsName,
                    AdditionsCode = a.AdditionsCode,
                    AdditionsCategory = a.AdditionsCategory,
                    IsActive = a.IsActive,
                    UnitAmount = a.UnitAmount,
                    PercentAmount = a.PercentAmount,
                    AdditionType = a.AdditionType,
                    Assignments = _context.AdditionEmployeeAssignments
                        .Where(assignment => assignment.AdditionsId == a.AdditionsId)
                        .Select(assignment => new AdditionEmployeeAssignmentDto
                        {
                            AssignmentId = assignment.AssignmentId,
                            AdditionsId = assignment.AdditionsId,
                            AssignmentType = assignment.AssignmentType,
                            EmployeeId = assignment.EmployeeId,
                            DepartmentId = assignment.DepartmentId,
                            ExceptedEmployeeIds = assignment.ExceptedEmployeeIds,
                            AssignedDate = assignment.AssignedDate,
                            ProjectId = assignment.ProjectId, 
                            IsActive = assignment.IsActive
                        }).ToList()
                })
                .ToListAsync();

            return additionsWithAssignments;
        }

        public async Task<List<DeductionsWithAssignmentsDto>> GetDeductionWithAssignments()
        {
            var additionsWithAssignments = await _context.Deductions
                //.Where(a => a.IsActive == true) // Optional: Filter by IsActive
                .Select(a => new DeductionsWithAssignmentsDto
                {
                    DeductionId = a.DeductionId,
                    DeductionName = a.DeductionName,
                    DeductionCode = a.DeductionCode,
                    IsActive = a.IsActive,
                    UnitAmount = a.UnitAmount,
                    DedutionType = a.DeductionType,
                    PercentAmount = a.PercentAmount,
                    Assignments = _context.DeductionEmployeeAssignments
                        .Where(assignment => assignment.DeductionId == a.DeductionId)
                        .Select(assignment => new DeductionsEmployeeAssignmentDto
                        {
                            AssignmentId = assignment.AssignmentId,
                            DeductionId = assignment.DeductionId,
                            AssignmentType = assignment.AssignmentType,
                            EmployeeId = assignment.EmployeeId,
                            DepartmentId = assignment.DepartmentId,
                            ExceptedEmployeeIds = assignment.ExceptedEmployeeIds,
                            AssignedDate = assignment.AssignedDate,
                            IsActive = assignment.IsActive,
                            ProjectId = assignment.ProjectId,
                        }).ToList()
                })
                .ToListAsync();

            return additionsWithAssignments;
        }

        public async Task<IActionResult> UpdateAdditionAsync(AdditionRequest model)
        {
            // Find the existing addition record
            var addition = await _context.Additions
                                          .FirstOrDefaultAsync(a => a.AdditionsId == model.AdditionsId);

            if (addition == null)
            {
                return new NotFoundObjectResult(new { message = "Addition not found" });
            }
            if (model.AdditionType.HasValue)
            {
                if (Enum.TryParse<AdditionTypeEnum>(model.AdditionType.ToString(), out var parsedType))
                {
                    addition.AdditionType = parsedType;
                }
            }
            // Update fields
            addition.AdditionsName = model.AdditionsName;
            addition.IsActive = model.IsActive;
            addition.UnitAmount = model.UnitAmount ?? addition.UnitAmount;
            addition.PercentAmount = model.PercentAmount ?? addition.PercentAmount;
            addition.UpdateDate = DateTime.UtcNow;
            addition.UpdateBy = "system"; // Replace with actual user info

            // Remove old assignments if necessary
            var existingAssignments = _context.AdditionEmployeeAssignments
                                              .Where(a => a.AdditionsId == model.AdditionsId);

            _context.AdditionEmployeeAssignments.RemoveRange(existingAssignments);

            // Create new assignments
            await UpdateAssignmentsAsync(model, model.AdditionsId);

            // Save changes
            await _context.SaveChangesAsync();

            return new OkObjectResult(new { message = "Addition updated successfully!" });
        }

        public async Task<IActionResult> UpdateDeductionAsync(DeductionRequest model)
        {
            // Find the existing addition record
            var addition = await _context.Deductions
                                          .FirstOrDefaultAsync(a => a.DeductionId == model.DeductionId);

            if (addition == null)
            {
                return new NotFoundObjectResult(new { message = "Addition not found" });
            }
            if (model.DeductionType.HasValue)
            {
                if (Enum.TryParse<DeductionTypeEnum>(model.DeductionType.ToString(), out var parsedType))
                {
                    addition.DeductionType = parsedType;
                }
            }

            // Update fields
            addition.DeductionName = model.DeductionName;
            addition.IsActive = model.IsActive;
            addition.UnitAmount = model.UnitAmount ?? addition.UnitAmount;
            addition.PercentAmount = model.PercentAmount ?? addition.PercentAmount;
            addition.UpdateDate = DateTime.UtcNow;
            addition.UpdateBy = "system"; // Replace with actual user info

            // Remove old assignments if necessary
            var existingAssignments = _context.DeductionEmployeeAssignments
                                              .Where(a => a.DeductionId == model.DeductionId);
            _context.DeductionEmployeeAssignments.RemoveRange(existingAssignments);

            // Create new assignments
            await UpdateDeductionAssignmentsAsync(model, model.DeductionId);

            // Save changes
            await _context.SaveChangesAsync();

            return new OkObjectResult(new { message = "Deduction updated successfully!" });
        }
        private async Task UpdateAssignmentsAsync(AdditionRequest model, int additionsId)
        {
            // Fetch existing assignments from the database
            var existingAssignments = _context.AdditionEmployeeAssignments
                                              .Where(a => a.AdditionsId == additionsId)
                                              .ToList();

            // Remove assignments that are no longer valid
            _context.AdditionEmployeeAssignments.RemoveRange(existingAssignments);

            // Add or update assignments based on the new request
            if (model.Assignees != null)
            {
                if (model.Assignees.Type == AssignmentType.Specific && model.Assignees.EmployeeIds?.Any() == true)
                {
                    // Specific employees
                    foreach (var employeeId in model.Assignees.EmployeeIds)
                    {
                        var assignment = new AdditionEmployeeAssignment
                        {   
                            AdditionsId = additionsId,
                            AssignmentType = (int)AssignmentType.Specific,
                            EmployeeId = employeeId,
                            AssignedDate = DateTime.UtcNow,
                            IsActive = true,

                            UpdateDate = DateTime.UtcNow,
                            UpdateBy = "system"
                        };
                        _context.Add(assignment);
                    }
                }
                else if (model.Assignees.Type == AssignmentType.Project && model.ProjectId?.Any() == true)
                {
                    // For Department assignments
                    foreach (var projectId in model.ProjectId)
                    {
                        if (model.ExceptedEmployees?.Any() == true)
                        {
                            foreach (var employeeId in model.ExceptedEmployees)
                            {
                                var assignment = new AdditionEmployeeAssignment
                                {
                                    AdditionsId = additionsId,
                                    AssignmentType = (int)AssignmentType.Project, // Use enum value
                                    ExceptedEmployeeIds = employeeId,
                                    ProjectId = projectId,
                                    AssignedDate = DateTime.UtcNow,
                                    IsActive = true,
                                    UpdateDate = DateTime.UtcNow,
                                    UpdateBy = "system", // Replace with actual user info
                                };
                                _context.Add(assignment);
                            }
                        }
                        else
                        {

                            var assignment = new AdditionEmployeeAssignment
                            {
                                AdditionsId = additionsId,
                                AssignmentType = (int)AssignmentType.Department, // Use enum value
                                ProjectId = projectId,
                                AssignedDate = DateTime.UtcNow,
                                IsActive = true,
                                UpdateDate = DateTime.UtcNow,
                                UpdateBy = "system", // Replace with actual user info
                            };
                            _context.Add(assignment);
                        }
                    }

                }
                if (model.Assignees.Type == AssignmentType.Department && model.DepartmentId?.Any() == true)
                {
                    // Departments
                    foreach (var departmentId in model.DepartmentId)
                    {
                        if (model.ExceptedEmployees?.Any() == true)
                        {
                            foreach (var employeeId in model.ExceptedEmployees)
                            {
                                var assignment = new AdditionEmployeeAssignment
                                {
                                    AdditionsId = additionsId,
                                    AssignmentType = (int)AssignmentType.Department,
                                    ExceptedEmployeeIds = employeeId,
                                    DepartmentId =  departmentId,
                                    AssignedDate = DateTime.UtcNow,
                                    IsActive = true,
              
                                    UpdateDate = DateTime.UtcNow,
                                    UpdateBy = "system"
                                };
                                _context.Add(assignment);
                            }
                        }
                        else
                        {
                            var assignment = new AdditionEmployeeAssignment
                            {
                                AdditionsId = additionsId,
                                AssignmentType = (int)AssignmentType.Department,
                                DepartmentId = departmentId,
                                AssignedDate = DateTime.UtcNow,
                                IsActive = true,
         
                                UpdateDate = DateTime.UtcNow,
                                UpdateBy = "system"
                            };
                            _context.Add(assignment);
                        }
                    }
                }
                else if (model.Assignees.Type == AssignmentType.NoAssignee)
                {
                    // No Assignee
                    var assignment = new AdditionEmployeeAssignment
                    {
                        AdditionsId = additionsId,
                        AssignmentType = (int)AssignmentType.NoAssignee,
                        IsActive = false,
                        AssignedDate = DateTime.UtcNow,
      
                        UpdateDate = DateTime.UtcNow,
                        UpdateBy = "system"
                    };
                    _context.Add(assignment);
                }
                else if (model.Assignees.Type == AssignmentType.AllEmployees)
                {
                    if (model.ExceptedEmployees?.Any() == true)
                    {
                        foreach (var employeeId in model.ExceptedEmployees)
                        {
                            var assignment = new AdditionEmployeeAssignment
                            {
                                AdditionsId = additionsId,
                                AssignmentType = (int)AssignmentType.AllEmployees,
                                ExceptedEmployeeIds = employeeId,
                                AssignedDate = DateTime.UtcNow,
                                IsActive = true,

                                UpdateDate = DateTime.UtcNow,
                                UpdateBy = "system"
                            };
                            _context.Add(assignment);
                        }
                    }
                    else
                    {
                        var assignment = new AdditionEmployeeAssignment
                        {
                            AdditionsId = additionsId,
                            AssignmentType = (int)AssignmentType.AllEmployees,
                            IsActive = true,
                            AssignedDate = DateTime.UtcNow,
       
                            UpdateDate = DateTime.UtcNow,
                            UpdateBy = "system"
                        };
                        _context.Add(assignment);
                    }
                }
            }

            await _context.SaveChangesAsync();
        }

        private async Task UpdateDeductionAssignmentsAsync(DeductionRequest model, int id)
        {
            // Fetch existing assignments from the database
            var existingAssignments = _context.DeductionEmployeeAssignments
                                              .Where(a => a.DeductionId == id)
                                              .ToList();

            // Remove assignments that are no longer valid
            _context.DeductionEmployeeAssignments.RemoveRange(existingAssignments);

            // Add or update assignments based on the new request
            if (model.Assignees != null)
            {
                if (model.Assignees.Type == AssignmentType.Specific && model.Assignees.EmployeeIds?.Any() == true)
                {
                    // Specific employees
                    foreach (var employeeId in model.Assignees.EmployeeIds)
                    {
                        var assignment = new DeductionEmployeeAssignment
                        {
                            DeductionId = id,
                            AssignmentType = (int)AssignmentType.Specific,
                            EmployeeId = employeeId,
                            AssignedDate = DateTime.UtcNow,
                            IsActive = true,
            
                            UpdateDate = DateTime.UtcNow,
                            UpdateBy = "system"
                        };
                        _context.Add(assignment);
                    }
                }
          
                else if (model.Assignees.Type == AssignmentType.Department && model.DepartmentId?.Any() == true)
                {
                    // Departments
                    foreach (var departmentId in model.DepartmentId)
                    {
                        if (model.ExceptedEmployees?.Any() == true)
                        {
                            foreach (var employeeId in model.ExceptedEmployees)
                            {
                                var assignment = new DeductionEmployeeAssignment
                                {
                                    DeductionId = id,
                                    AssignmentType = (int)AssignmentType.Department,
                                    ExceptedEmployeeIds = employeeId,
                                    DepartmentId = departmentId,
                                    AssignedDate = DateTime.UtcNow,
                                    IsActive = true,
                                    UpdateDate = DateTime.UtcNow,
                                    UpdateBy = "system"
                                };
                                _context.Add(assignment);
                            }
                        }
                        else
                        {
                            var assignment = new DeductionEmployeeAssignment
                            {
                                DeductionId = id,
                                AssignmentType = (int)AssignmentType.Department,
                                DepartmentId = departmentId,
                                AssignedDate = DateTime.UtcNow,
                                IsActive = true,
                                UpdateDate = DateTime.UtcNow,
                                UpdateBy = "system"
                            };
                            _context.Add(assignment);
                        }
                    }
                }
                else if (model.Assignees.Type == AssignmentType.Project && model.ProjectId?.Any() == true)
                {
                    // For Department assignments
                    foreach (var projectId in model.ProjectId)
                    {
                        if (model.ExceptedEmployees?.Any() == true)
                        {
                            foreach (var employeeId in model.ExceptedEmployees)
                            {
                                var assignment = new DeductionEmployeeAssignment
                                {
                                    DeductionId = id,
                                    AssignmentType = (int)AssignmentType.Project, // Use enum value
                                    ExceptedEmployeeIds = employeeId,
                                    ProjectId = projectId,
                                    AssignedDate = DateTime.UtcNow,
                                    IsActive = true,
                                    UpdateDate = DateTime.UtcNow,
                                    UpdateBy = "system" // Replace with actual user info
                                };
                                _context.Add(assignment);
                            }
                        }
                        else
                        {

                            var assignment = new DeductionEmployeeAssignment
                            {
                                DeductionId = id,
                                AssignmentType = (int)AssignmentType.Department, // Use enum value
                                ProjectId = projectId,
                                AssignedDate = DateTime.UtcNow,
                                IsActive = true,
                                UpdateDate = DateTime.UtcNow,
                                UpdateBy = "system" // Replace with actual user info
                            };
                            _context.Add(assignment);
                        }
                    }
                }
                else if (model.Assignees.Type == AssignmentType.NoAssignee)
                {
                    // No Assignee
                    var assignment = new DeductionEmployeeAssignment
                    {
                        DeductionId = id,
                        AssignmentType = (int)AssignmentType.NoAssignee,
                        IsActive = false,
                        AssignedDate = DateTime.UtcNow,
                        UpdateDate = DateTime.UtcNow,
                        UpdateBy = "system"
                    };
                    _context.Add(assignment);
                }
                else if (model.Assignees.Type == AssignmentType.AllEmployees)
                {
                    if (model.ExceptedEmployees?.Any() == true) {
                        foreach (var employeeId in model.ExceptedEmployees)
                        {
                            var assignment = new DeductionEmployeeAssignment
                            {
                                DeductionId = id,
                                AssignmentType = (int)AssignmentType.AllEmployees,
                                ExceptedEmployeeIds = employeeId,
                                AssignedDate = DateTime.UtcNow,
                                IsActive = true,
                                UpdateDate = DateTime.UtcNow,
                                UpdateBy = "system"
                            };
                            _context.Add(assignment);
                        }
                    }
                    else
                    {
                        var assignment = new DeductionEmployeeAssignment
                        {
                            DeductionId = id,
                            AssignmentType = (int)AssignmentType.AllEmployees,
                            IsActive = true,
                            AssignedDate = DateTime.UtcNow,
                            UpdateDate = DateTime.UtcNow,
                            UpdateBy = "system"
                        };
                        _context.Add(assignment);
                    }
                    
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
