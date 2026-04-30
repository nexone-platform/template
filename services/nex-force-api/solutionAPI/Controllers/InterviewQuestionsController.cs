using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Elfie.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares.Models;
using System.Linq;
using System.Security.Claims;
using static solutionAPI.Controllers.DesignationsController;

namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class InterviewQuestionsController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public InterviewQuestionsController(ApplicationDbContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }

        //[HttpGet("getAllCategory")]
        //public async Task<ActionResult<IEnumerable<Category>>> GetAllCategory()
        //{
        //    var category = await _context.Category.ToListAsync();
        //    var response = new ApiResponse<Category>
        //    {
        //        Data = category,
        //        TotalData = category.Count
        //    };
        //    return Ok(response);
        //}

        [HttpGet("getAllCategory")]
        public async Task<List<object>> GetAllCategory()
        {
            return await _context.Set<Category>() // entity map -> [Table("emp-tb-ms-employee-type")]
                .OrderBy(x => x.CategoryId)
                .Select(x => new {
                    categoryId = x.CategoryId,
                    categoryDescription = x.CategoryDescription
                })
                .ToListAsync<object>();
        }

        //[HttpGet("getAllCategory")]
        //public async Task<ActionResult<ApiResponse<InterviewDto>>> GetAllCategory()
        //{
        //    // LEFT JOIN
        //    var query =
        //        from c in _context.Category

        //        join q0 in _context.Questions
        //            on c.CategoryId equals q0.CategoryId into ctr
        //        from q in ctr.DefaultIfEmpty()

        //        select new InterviewDto
        //        {
        //            CategoryId = c.CategoryId,
        //            CategoryDescription = c.CategoryDescription,
        //            CreateDate = c.CreateDate,
        //            CreateBy = c.CreateBy,
        //            UpdateDate = c.UpdateDate,
        //            UpdateBy = c.UpdateBy,
        //        };

        //    // ถ้าไม่ต้องการกันแถวซ้ำ สามารถใช้ GroupBy เหมือนเดิม
        //    var list = await query
        //        .GroupBy(x => x.CategoryId)
        //        .Select(g => g.First())
        //        .ToListAsync();

        //    var response = new ApiResponse<InterviewDto>
        //    {
        //        Data = list,
        //        TotalData = list.Count
        //    };

        //    return Ok(response);
        //}

        [HttpGet("getAllQuestion")]
        public async Task<ActionResult<ApiResponse<InterviewDto>>> GetAllQuestion()
        {
            // LEFT JOIN
            var query =
                from q in _context.Questions

                join c0 in _context.Category
                    on q.CategoryId equals c0.CategoryId into ctr
                from c in ctr.DefaultIfEmpty()

                join p0 in _context.Designations
                    on q.Position equals p0.DesignationId into pst
                from p in pst.DefaultIfEmpty()

                select new InterviewDto
                {
                    QuestionsId = q.QuestionsId,
                    CategoryId = q.CategoryId,
                    PositionId = q.Position,

                    // Display names (ป้องกัน null)
                    PositionName = p.DesignationNameTh ?? p.DesignationNameEn,
                    CategoryDescription = c.CategoryDescription,

                    // ฟิลด์อื่น ๆ (ป้องกัน null)
                    Position = p.DesignationNameEn,
                    Question = q.Question,
                    OptionA = q.OptionA,
                    OptionB = q.OptionB,
                    OptionC = q.OptionC,
                    OptionD = q.OptionD,
                    CorrectAns = q.CorrectAns,
                    CodeSnippets = q.CodeSnippets,
                    AnsExplanation = q.AnsExplanation,
                    VideoIink = q.VideoIink,
                    ImgPath = q.ImgPath,
                    CreateDate = q.CreateDate,
                    CreateBy = q.CreateBy,
                    UpdateDate = q.UpdateDate,
                    UpdateBy = q.UpdateBy,
                };

            // ถ้าไม่ต้องการกันแถวซ้ำ สามารถใช้ GroupBy เหมือนเดิม
            var list = await query
                .GroupBy(x => x.QuestionsId)
                .Select(g => g.First())
                .ToListAsync();

            var response = new ApiResponse<InterviewDto>
            {
                Data = list,
                TotalData = list.Count
            };

            return Ok(response);
        }

        [HttpGet("getQuestionById/{id:int}")]
        public async Task<ActionResult<InterviewDto>> GetQuestionById(int id)
        {
            var dto = await (
                from q in _context.Questions
                where q.QuestionsId == id

                // Position (Designation)
                join d0 in _context.Designations
                    on q.Position equals d0.DesignationId into dgrp
                from d in dgrp.DefaultIfEmpty()

                    // Location (Client)
                join c0 in _context.Category
                    on q.CategoryId equals c0.CategoryId into ctgr
                from c in ctgr.DefaultIfEmpty()

                select new InterviewDto
                {
                    QuestionsId = q.QuestionsId,
                    CategoryId = q.CategoryId,

                    // Display names (ป้องกัน null)
                    PositionName = d.DesignationNameTh ?? d.DesignationNameEn,

                    // ฟิลด์อื่น ๆ (ป้องกัน null)
                    Position = d.DesignationNameEn,
                    Question = q.Question,
                    OptionA = q.OptionA,
                    OptionB = q.OptionB,
                    OptionC = q.OptionC,
                    OptionD = q.OptionD,
                    CorrectAns = q.CorrectAns,
                    CodeSnippets = q.CodeSnippets,
                    AnsExplanation = q.AnsExplanation,
                    VideoIink = q.VideoIink,
                    ImgPath = q.ImgPath,
                    CreateDate = q.CreateDate,
                    CreateBy = q.CreateBy,
                    UpdateDate = q.UpdateDate,
                    UpdateBy = q.UpdateBy
                }
            ).FirstOrDefaultAsync();

            if (dto == null)
                return NotFound(new { message = $"Resume with ID {id} not found." });

            return Ok(dto);
        }

        [HttpPost("updateCategory")]
        public async Task<IActionResult> CreateOrUpdateCategory([FromBody] Category category)
        {
            if (category == null) return BadRequest(new { message = "Invalid category data." });

            try
            {
                if (category.CategoryId > 0)
                {
                    var existing = await _context.Category
                        .FirstOrDefaultAsync(e => e.CategoryId == category.CategoryId);
                    if (existing == null) return NotFound(new { message = $"Category with ID {category.CategoryId} not found." });

                    existing.UpdateBy = category.UpdateBy;
                    existing.UpdateDate = DateTime.UtcNow;
                    existing.CategoryDescription = category.CategoryDescription;

                    _context.Category.Update(existing);
                }
                else
                {
                    var maxId = await _context.Category
                                .MaxAsync(e => (int?)e.CategoryId);
                    if (maxId == null)
                    {
                        // Handle the case where the table is empty
                        maxId = 1;
                    }
                    else
                    {
                        maxId = maxId + 1;
                    }

                    var newDocument = new Category
                    {
                        CategoryId = (int)maxId,
                        CategoryDescription = category.CategoryDescription,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = category.CreateBy
                    };

                    _context.Category.Add(newDocument);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Category save successfully" });
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

        [HttpPost("updateQuestion")]
        public async Task<IActionResult> CreateOrUpdateQuestion([FromForm] InterviewDto questions)
        {
            if (questions == null) return BadRequest(new { message = "Invalid Manage Resume data." });

            try
            {
                string imgPath = null;
                if (questions.ImgFile != null)
                {
                    var uploadDir = Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "wwwroot/images/questions"
                    );

                    if (!Directory.Exists(uploadDir))
                    {
                        Directory.CreateDirectory(uploadDir);
                    }

                    // แยกชื่อไฟล์ + นามสกุล
                    var extension = Path.GetExtension(questions.ImgFile.FileName);

                    // วันที่และเวลา
                    var dateTimeNow = DateTime.Now.ToString("yyyyMMdd_HHmmss");

                    // ชื่อไฟล์ใหม่
                    var fileName = $"{dateTimeNow}_{Guid.NewGuid()}{extension}";
                    var imagePath = Path.Combine(uploadDir, fileName);

                    using (var stream = new FileStream(imagePath, FileMode.Create))
                    {
                        await questions.ImgFile.CopyToAsync(stream);
                    }

                    // path สำหรับใช้ใน frontend / เก็บ DB
                    imgPath = $"/images/questions/{fileName}";
                }

                if (questions.QuestionsId > 0)
                {
                    var existing = await _context.Questions
                        .FirstOrDefaultAsync(e => e.QuestionsId == questions.QuestionsId);
                    if (existing == null) return NotFound(new { message = $"Manage Jobs with ID {questions.QuestionsId} not found." });

                    existing.UpdateBy = questions.UpdateBy;
                    existing.UpdateDate = DateTime.UtcNow;
                    existing.CategoryId = questions.CategoryId;
                    existing.Position = questions.PositionId;
                    existing.Question = questions.Question;
                    existing.OptionA = questions.OptionA;
                    existing.OptionB = questions.OptionB;
                    existing.OptionC = questions.OptionC;
                    existing.OptionD = questions.OptionD;
                    existing.CorrectAns = questions.CorrectAns;
                    existing.CodeSnippets = questions.CodeSnippets;
                    existing.AnsExplanation = questions.AnsExplanation;
                    existing.VideoIink = questions.VideoIink;
                    if (imgPath != null)
                    {
                        existing.ImgPath = imgPath;
                    }
                    else
                    {
                        existing.ImgPath = existing.ImgPath;
                    }

                    _context.Questions.Update(existing);
                }
                else
                {
                    var maxId = await _context.Questions
                                .MaxAsync(e => (int?)e.QuestionsId);
                    if (maxId == null)
                    {
                        // Handle the case where the table is empty
                        maxId = 1;
                    }
                    else
                    {
                        maxId = maxId + 1;
                    }

                    var newDocument = new Questions
                    {
                        QuestionsId = (int)maxId,
                        CategoryId = questions.CategoryId,
                        Position = questions.PositionId,
                        Question = questions.Question,
                        OptionA = questions.OptionA,
                        OptionB = questions.OptionB,
                        OptionC = questions.OptionC,
                        OptionD = questions.OptionD,
                        CorrectAns = questions.CorrectAns,
                        CodeSnippets = questions.CodeSnippets,
                        AnsExplanation = questions.AnsExplanation,
                        VideoIink = questions.VideoIink,
                        ImgPath = imgPath,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = questions.CreateBy
                    };

                    _context.Questions.Add(newDocument);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Question save successfully" });
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


        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            // Find the holiday by its ID
            var questions = await _context.Questions.FindAsync(id);
            if (questions == null)
            {
                // If not found, return 404 Not Found
                return NotFound(new { message = "Questions not found" });
            }

            // Remove the holiday from the database
            _context.Questions.Remove(questions);

            // Save the changes asynchronously
            await _context.SaveChangesAsync();

            // Return a success response
            return Ok(new { message = "Questions deleted successfully" });
        }

        [HttpGet("getAllEmployeeType")]
        public async Task<List<object>> GetEmployeeTypeAsync()
        {
            return await _context.Set<EmployeeType>() // entity map -> [Table("emp-tb-ms-employee-type")]
                .OrderBy(x => x.EmployeeTypeId)
                .Select(x => new {
                    employee_type_id = x.EmployeeTypeId,
                    employee_type_code = x.EmployeeTypeCode,
                    employee_type_name_en = x.EmployeeTypeNameEn
                })
                .ToListAsync<object>();
        }

        [HttpGet("getAllLocationJob")]
        public async Task<List<object>> GetLocationJobAsync()
        {
            return await _context.Set<Client>() // entity map -> [Table("emp-tb-ms-employee-type")]
                .OrderBy(x => x.ClientId)
                .Select(x => new {
                    client_id = x.ClientId,
                    client_code = x.ClientCode,
                    client_name_en = x.Company
                })
                .ToListAsync<object>();
        }

        [HttpGet("getAllDesignation")]
        public async Task<List<object>> GetLDesignationAsync()
        {
            return await _context.Set<Designation>() // entity map -> [Table("emp-tb-ms-employee-type")]
                .OrderBy(x => x.DesignationId)
                .Select(x => new {
                    designation_id = x.DesignationId,
                    designation_code = x.DesignationCode,
                    designation_name_en = x.DesignationNameEn
                })
                .ToListAsync<object>();
        }

        [HttpGet("getAllTitle")]
        public async Task<List<object>> GetTitleNameAsync()
        {
            return await _context.Set<Title>()
                .OrderBy(x => x.TitleID)
                .Select(x => new
                {
                    titleId = x.TitleID,
                    titleNameTh = x.TitleNameTh,
                    titleNameEn = x.TitleNameEn,
                    titleNameCode = x.TitleNameCode
                })
                .ToListAsync<object>();
        }

        public class questionSearchDto
        {
            public int? CategoryId { get; set; }   // = PositionId
            public int? Position { get; set; }
            public string? Question { get; set; }
            //public string? Skills { get; set; }
        }

        [HttpPost("searchQuestion")]
        public async Task<ActionResult<ApiResponse<InterviewDto>>> SearchQuestion(
            [FromBody] questionSearchDto searchDto)
        {
            // Base query + LEFT JOIN
            var query =
                from q in _context.Questions.AsNoTracking()

                    // Location
                join c0 in _context.Category.AsNoTracking()
                    on q.CategoryId equals c0.CategoryId into ctgr
                from c in ctgr.DefaultIfEmpty()

                    // Position
                join p0 in _context.Designations.AsNoTracking()
                    on q.Position equals p0.DesignationId into pgrp
                from p in pgrp.DefaultIfEmpty()

                select new
                {
                    q,                        // entity หลัก
                    PositionName = p.DesignationNameEn,
                    CategoryDescription = c.CategoryDescription
                };

            // ---------- Filters ----------
            if (searchDto.CategoryId.HasValue)
            {
                query = query.Where(x => x.q.CategoryId == searchDto.CategoryId.Value);
            }

            if (searchDto.Position.HasValue)
            {
                // filter ด้วย id ตำแหน่ง
                query = query.Where(x => x.q.Position == searchDto.Position.Value);
            }

            if (!string.IsNullOrWhiteSpace(searchDto.Question))
            {
                query = query.Where(x => x.q.Question.Contains(searchDto.Question));
            }

            // ---------- Select ออกเป็น DTO ----------
            var list = await query
                .Select(x => new InterviewDto
                {
                    QuestionsId = x.q.QuestionsId,
                    CategoryId = x.q.CategoryId,
                    CategoryDescription = x.CategoryDescription,
                    Question = x.q.Question,
                    OptionA = x.q.OptionA,
                    OptionB = x.q.OptionB,
                    OptionC = x.q.OptionC,
                    OptionD = x.q.OptionD,
                    CorrectAns = x.q.CorrectAns,
                    CodeSnippets = x.q.CodeSnippets,
                    AnsExplanation = x.q.AnsExplanation,
                    VideoIink = x.q.VideoIink, 
                    ImgPath = x.q.ImgPath, 
                    CreateDate = x.q.CreateDate,
                    CreateBy = x.q.CreateBy,
                    UpdateDate = x.q.UpdateDate,
                    UpdateBy = x.q.UpdateBy,

                    // FK + ชื่อที่ join มา
                    PositionId = x.q.Position,
                    PositionName = x.PositionName,
                    Position = x.PositionName
                })
                .ToListAsync();

            var response = new ApiResponse<InterviewDto>
            {
                Data = list,
                TotalData = list.Count
            };

            return Ok(response);
        }


        public sealed class InterviewDto
        {
            public int? CategoryId { get; set; }
            public int? QuestionsId { get; set; }
            public int? PositionId { get; set; }

            // ชื่อที่ได้จากตารางอ้างอิง (ไว้แสดงผล)
            public string? PositionName { get; set; }

            // ฟิลด์เดิมอื่น ๆ ที่ต้องการส่งกลับ
            public string? Position { get; set; }
            public string? CategoryDescription { get; set; }
            public string? Question { get; set; }
            public string? OptionA { get; set; }
            public string? OptionB { get; set; }
            public string? OptionC { get; set; }
            public string? OptionD { get; set; }
            public string? CorrectAns { get; set; }
            public string? CodeSnippets { get; set; }
            public string? AnsExplanation { get; set; }
            public string? VideoIink { get; set; }
            public string? ImgPath { get; set; }
            public IFormFile? ImgFile { get; set; }
            public DateTime? CreateDate { get; set; }
            public string? CreateBy { get; set; }
            public DateTime? UpdateDate { get; set; }
            public string? UpdateBy { get; set; }

        }


        private string GetCurrentUserId()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            return username;
        }

    }
}
