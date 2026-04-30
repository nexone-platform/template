using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;

public class EmployeeService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public class EmployeeDTO : Employee
    {
        public string? RoleName { get; set; }
    }
    public EmployeeService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }
    public async Task<IEnumerable<EmployeeDTO>> GetEmployeesAsync()
    {
        var employees = await (from e in _context.Employees
                               join r in _context.Roles on e.RoleId equals r.RoleId
                               select e).ToListAsync();

        // Map entities to DTOs
        var employeeDtos = _mapper.Map<IEnumerable<EmployeeDTO>>(employees);

        return employeeDtos;
    }
}
