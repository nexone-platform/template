using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares.Models;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Security.Claims;
using static solutionAPI.Controllers.BranchController;
using static solutionAPI.Controllers.HolidayController;
using static solutionAPI.Controllers.ScheduleTimingController;

namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ClientController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        public class ResponeCompany
        {
            public int? ClientId { get; set; }
            public string? Company { get; set; }
        }

        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public ClientController(ApplicationDbContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }
        [HttpGet("getAllClient")]
        public async Task<ActionResult<IEnumerable<Client>>> GetClient()
        {
            var clients = await (from c in _context.Clients
                                 select new Client
                                 {
                                     ClientId = c.ClientId,
                                     ClientCode = c.ClientCode,
                                     Company = c.Company,
                                     Address = c.Address,
                                     TaxId = c.TaxId,
                                     HeadOffice = c.HeadOffice,
                                     BranchNo = c.BranchNo,
                                     BranchName = c.BranchName,
                                     CreditTerm = c.CreditTerm,
                                     OfficeNo = c.OfficeNo,
                                     ImgPath = c.ImgPath,
                                     ContractName = c.ContractName,
                                     ContractNo = c.ContractNo,
                                     ContractEmail = c.ContractEmail,
                                     IsActive = c.IsActive,
                                     CreateDate = c.CreateDate,
                                     CreateBy = c.CreateBy,
                                     UpdateDate = c.UpdateDate,
                                     UpdateBy = c.UpdateBy
                                 }).ToListAsync();

            var response = new ApiResponse<Client>
            {
                Data = clients,
                TotalData = clients.Count
            };
            return Ok(response);
        }

        [HttpGet("getClientById/{id}")]
        public async Task<ActionResult<Client>> GetClientById(int id)
        {
            var client = await _context.Clients
                                       .Where(c => c.ClientId == id)
                                       .Select(c => new Client
                                       {
                                           ClientId = c.ClientId,
                                           ClientCode = c.ClientCode,
                                           Company = c.Company,
                                           Address = c.Address,
                                           TaxId = c.TaxId,
                                           HeadOffice = c.HeadOffice,
                                           BranchNo = c.BranchNo,
                                           BranchName = c.BranchName,
                                           CreditTerm = c.CreditTerm,
                                           OfficeNo = c.OfficeNo,
                                           ImgPath = c.ImgPath,
                                           ContractName = c.ContractName,
                                           ContractNo = c.ContractNo,
                                           ContractEmail = c.ContractEmail,
                                           CreateDate = c.CreateDate,
                                           CreateBy = c.CreateBy,
                                           UpdateDate = c.UpdateDate,
                                           UpdateBy = c.UpdateBy
                                       })
                                       .FirstOrDefaultAsync();

            if (client == null)
            {
                return NotFound(new { message = $"Client with ID {id} not found." });
            }

            return Ok(client);
        }


        public class ClientSearchDto
        {
            public string? ClientCode { get; set; }
            public int? ClientId { get; set; }
        }

        [HttpPost("searchClients")]
        public async Task<ActionResult<ApiResponse<Client>>> SearchClients([FromBody] ClientSearchDto searchDto)
        {
            var query = _context.Clients.AsQueryable();

            // Apply filters based on the search criteria
            if (!string.IsNullOrEmpty(searchDto.ClientCode))
            {
                query = query.Where(c => c.ClientCode.Contains(searchDto.ClientCode));
            }

            if (searchDto.ClientId.HasValue)
            {
                query = query.Where(c => c.ClientId == searchDto.ClientId);
            }

            var clients = await query.Select(c => new Client
            {
                ClientId = c.ClientId,
                ClientCode = c.ClientCode,
                Company = c.Company,
                Address = c.Address,
                TaxId = c.TaxId,
                HeadOffice = c.HeadOffice,
                BranchNo = c.BranchNo,
                BranchName = c.BranchName,
                CreditTerm = c.CreditTerm,
                OfficeNo = c.OfficeNo,
                ImgPath = c.ImgPath,
                ContractName = c.ContractName,
                ContractNo = c.ContractNo,
                ContractEmail = c.ContractEmail,
                CreateDate = c.CreateDate,
                CreateBy = c.CreateBy,
                UpdateDate = c.UpdateDate,
                UpdateBy = c.UpdateBy
            }).ToListAsync();

            var response = new ApiResponse<Client>
            {
                Data = clients,
                TotalData = clients.Count
            };

            return Ok(response);
        }

        [HttpGet("getCompany")]
        public async Task<ActionResult<IEnumerable<ResponeCompany>>> GetCompany()
        {
            var companies = await (from c in _context.Clients
                                 select new ResponeCompany
                                 {
                                     ClientId = c.ClientId,
                                     Company = c.Company,

                                 }).ToListAsync();
            return Ok(companies);

        }
        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
            {
                return NotFound(new { message = "Client not found" });
            }
            _context.Clients.Remove(client);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Employee deleted successfully" });
        }

        [HttpPost("update")]
        public async Task<IActionResult> CreateOrUpdateClient([FromForm] ClientDTO client)
        {
            if (client == null)
            {
                return BadRequest(new { message = "Invalid client data." });
            }

            try {
                string imgPath = null;
                if (client.ImgFile != null && client.ImgFile.Length > 0)
                {
                    var uploadsFolder = Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "wwwroot/images/clients"
                    );

                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);

                    var extension = Path.GetExtension(client.ImgFile.FileName);

                    var fileName =
                        $"{Guid.NewGuid()}_{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";

                    var imagePath = Path.Combine(uploadsFolder, fileName);

                    using (var stream = new FileStream(imagePath, FileMode.Create))
                    {
                        await client.ImgFile.CopyToAsync(stream);
                    }

                    imgPath = $"/images/clients/{fileName}";
                }

                if (client.ClientId > 0)

                {
                    // Update existing client
                    var existingClient = await _context.Clients
                        .FirstOrDefaultAsync(c => c.ClientId == client.ClientId);

                    if (existingClient == null)
                    {
                        return NotFound(new { message = $"Client with ID {client.ClientId} not found." });
                    }

                    // Update fields
                    existingClient.UpdateBy = client.Username;
                    existingClient.UpdateDate = DateTime.UtcNow;
                    existingClient.ClientCode = client.ClientCode;
                    existingClient.Company = client.Company;
                    existingClient.Address = client.Address;
                    existingClient.TaxId = client.TaxId;
                    existingClient.HeadOffice = client.HeadOffice;
                    existingClient.BranchNo = client.BranchNo;
                    existingClient.BranchName = client.BranchName;
                    existingClient.CreditTerm = client.CreditTerm;
                    existingClient.OfficeNo = client.OfficeNo;
                    existingClient.ContractName = client.ContractName;
                    existingClient.ContractNo = client.ContractNo;
                    existingClient.ContractEmail = client.ContractEmail;
                    existingClient.IsActive = client.IsActive;
                    if (imgPath != null)
                    {
                        existingClient.ImgPath = imgPath;
                    }
                    else
                    {
                        existingClient.ImgPath = existingClient.ImgPath;
                    }

                    _context.Clients.Update(existingClient);
                }
                else
                {

                    // Create new client
                    var newClient = new Client
                    {
                        ClientCode = client.ClientCode,
                        Company = client.Company,
                        Address = client.Address,
                        TaxId = client.TaxId,
                        HeadOffice = client.HeadOffice,
                        BranchNo = client.BranchNo,
                        BranchName = client.BranchName,
                        CreditTerm = client.CreditTerm,
                        OfficeNo = client.OfficeNo,
                        ImgPath = imgPath,
                        ContractName = client.ContractName,
                        ContractNo = client.ContractNo,
                        ContractEmail = client.ContractEmail,
                        IsActive = client.IsActive,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = client.Username,

                        // No need to set ClientId since it's auto-incrementing using sequence
                    };

                    _context.Clients.Add(newClient);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Client saved successfully." });
            }
            catch (DbUpdateException ex)
            {
                // ดู ex.Message / ex.InnerException?.Message เพื่อตอบลูกความยาวเกิน/constraint
                return StatusCode(409, new { message = "DB constraint failed", detail = ex.InnerException?.Message ?? ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", detail = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetClientById(long id)
        {
            if (id <= 0)
            {
                return BadRequest(new { message = "Invalid client ID." });
            }

            // Retrieve the client from the database
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.ClientId == id);

            if (client == null)
            {
                return NotFound(new { message = $"Client with ID {id} not found." });
            }

            // Map the client entity to a DTO or return the client directly
            var clientDTO = new Client
            {
                ClientCode = client.ClientCode,
                Company = client.Company,
                Address = client.Address,
                TaxId = client.TaxId,
                HeadOffice = client.HeadOffice,
                BranchNo = client.BranchNo,
                BranchName = client.BranchName,
                CreditTerm = client.CreditTerm,
                OfficeNo = client.OfficeNo,
                ImgPath =  client.ImgPath,
                ContractName = client.ContractName,
                ContractNo = client.ContractNo,
                ContractEmail = client.ContractEmail,
            };

            return Ok(clientDTO);
        }
        private string GetCurrentUserId()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            return username?? "";
        }

        public class FileUploadModel
        {
            public IFormFile File { get; set; }
        }
        public class ClientDTO
        {
            [FromForm(Name = "CreateDate")]
            public DateTime? CreateDate { get; set; }   // Creation date

            [FromForm(Name = "CreateBy")]
            public string? CreateBy { get; set; }        // Creator's name

            [FromForm(Name = "UpdateDate")]
            public DateTime? UpdateDate { get; set; }   // Update date

            [FromForm(Name = "UpdateBy")]
            public string? UpdateBy { get; set; }        // Updater's name

            [FromForm(Name = "ClientId")]
            public int? ClientId { get; set; }            // Auto-incrementing ID

            [FromForm(Name = "ClientCode")]
            public string? ClientCode { get; set; }      // Client code

            [FromForm(Name = "Company")]
            public string? Company { get; set; }         // Company name

            [FromForm(Name = "Address")]
            public string? Address { get; set; }         // Address

            [FromForm(Name = "TaxId")]
            public string? TaxId { get; set; }    // Client name in English


            [FromForm(Name = "HeadOffice")]
            public Boolean? HeadOffice { get; set; }           // Phone number


            [FromForm(Name = "BranchNo")]
            public string? BranchNo { get; set; }           // Email address

            [FromForm(Name = "BranchName")]
            public string? BranchName { get; set; }         // Image path

            [FromForm(Name = "CreditTerm")]
            public int? CreditTerm { get; set; }     // Client's phone number

            [FromForm(Name = "OfficeNo")]
            public string? OfficeNo { get; set; }     // Client's phone number

            [FromForm(Name = "ImgFile")]
            public IFormFile? ImgFile { get; set; }      // Image file for upload

            [FromForm(Name = "ContractName")]
            public string? ContractName { get; set; }     // Client's phone number

            [FromForm(Name = "ContractNo")]
            public string? ContractNo { get; set; }     // Client's phone number

            [FromForm(Name = "ContractEmail")]
            public string? ContractEmail { get; set; }     // Client's phone number

            [FromForm(Name = "IsActive")]
            public bool? IsActive { get; set; }

            [FromForm(Name = "Username")]
            public string? Username { get; set; }
        }
    }
}
