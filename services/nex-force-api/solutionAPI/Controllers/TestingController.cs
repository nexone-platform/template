using AutoMapper;
using Consul;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Elfie.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares.Models;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using static solutionAPI.Controllers.DesignationsController;
using static solutionAPI.Controllers.ManageResumeController;

namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TestingController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public TestingController(ApplicationDbContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }

        [HttpGet("getAllManageResume")]
        public async Task<ActionResult<ApiResponse<TestingDto>>> GetAllManageResume()
        {
            // LEFT JOIN
            var query =
                from j in _context.ManageResume

                join p0 in _context.Designations
                    on j.Position equals p0.DesignationId into pst
                from p in pst.DefaultIfEmpty()

                join l0 in _context.Clients
                    on j.Location equals l0.ClientId into lct
                from l in lct.DefaultIfEmpty()

                join t0 in _context.Title
                    on j.Title equals t0.TitleID into tte
                from t in tte.DefaultIfEmpty()

                join s0 in _context.ManageApplicantTesting
                    on j.ManageResumeId equals s0.ManageResumeId into scdt
                from s in scdt.DefaultIfEmpty()

                join c0 in _context.Category
                    on s.CategoryId equals c0.CategoryId into ctgr   // ← ปรับชื่อ field ให้ตรง Entity จริง
                from ct in ctgr.DefaultIfEmpty()

                join te0 in _context.Testing
                    on j.ManageResumeId equals te0.ManageResumeId into test
                from te in test.DefaultIfEmpty()

                select new TestingDto
                {
                    ManageResumeId = j.ManageResumeId,

                    // FK ids
                    PositionId = j.Position,
                    LocationId = j.Location,
                    TitleId    = j.Title,
                    CategoryId = ct.CategoryId,
                    ManageApplicantTestingId = s.ManageApplicantTestingId,

                    // Display names (ป้องกัน null)
                    PositionName = p.DesignationNameTh ?? p.DesignationNameEn,
                    LocationName = l.Company ,
                    TitleName    = t.TitleNameTh ?? t.TitleNameEn ?? t.TitleNameCode,
                    CategoryName = ct.CategoryDescription,

                    // ฟิลด์อื่น ๆ (ป้องกัน null)
                    Title = t.TitleNameEn,
                    FirstName = j.FirstName,
                    LastName = j.LastName,
                    Email = j.Email,
                    Status = s.Status,
                    Experiences = j.Experiences,
                    Educations = j.Educations,
                    CreateDate = j.CreateDate,
                    CreateBy = j.CreateBy,
                    UpdateDate = j.UpdateDate,
                    UpdateBy = j.UpdateBy,
                    Phone = j.Phone,
                    Position = p.DesignationNameEn,
                    Location = l.Company,
                    Skills = j.Skills,
                    Gender = j.Gender,
                    Score = te.Score,
                    Time = te.Time,
                    StartCreateResume = j.CreateDate
                };

            // ถ้าไม่ต้องการกันแถวซ้ำ สามารถใช้ GroupBy เหมือนเดิม
            var list = await query
                .GroupBy(x => x.ManageResumeId)
                .Select(g => g.First())
                .ToListAsync();

            var response = new ApiResponse<TestingDto>
            {
                Data = list,
                TotalData = list.Count
            };

            return Ok(response);
        }

        [HttpGet("getManageResumeById/{id:int}")]
        public async Task<ActionResult<TestingDto>> GetManageResumeById(int id)
        {
            // ถ้า j.Position / j.Location เป็น int? ให้ cast ด้านขวาเป็น int? ให้ตรงชนิด
            var dto = await (
                from j in _context.ManageResume
                where j.ManageResumeId == id

                // Position (Designation)
                join d0 in _context.Designations
                    on j.Position equals d0.DesignationId into dgrp
                from d in dgrp.DefaultIfEmpty()

                    // Location (Client)
                join c0 in _context.Clients
                    on j.Location equals c0.ClientId into cgrp
                from c in cgrp.DefaultIfEmpty()

                join t0 in _context.Title
                    on j.Title equals t0.TitleID into tte
                from t in tte.DefaultIfEmpty()

                join te0 in _context.Testing
                    on j.ManageResumeId equals te0.ManageResumeId into test
                from te in test.DefaultIfEmpty()

                select new TestingDto
                {
                    ManageResumeId = j.ManageResumeId,

                    // FK + display
                    PositionId = j.Position,
                    PositionName = d.DesignationNameTh ?? d.DesignationNameEn ?? d.DesignationCode,
                    LocationId = j.Location,
                    LocationName = c.ClientCode ?? c.Company,
                    TitleId = j.Title,
                    TitleName = t.TitleNameEn ?? t.TitleNameTh ?? t.TitleNameCode,

                    // fields
                    Title = t.TitleNameEn,
                    FirstName = j.FirstName,
                    LastName = j.LastName,
                    Phone = j.Phone,
                    Email = j.Email,
                    Gender = j.Gender,
                    Position = d.DesignationNameEn,
                    Location = c.Company,
                    Skills = j.Skills,
                    Score = te.Score,
                    Experiences = j.Experiences,
                    Educations = j.Educations,
                    CreateBy = j.CreateBy,
                    CreateDate = j.CreateDate,
                    UpdateBy = j.UpdateBy,
                    UpdateDate = j.UpdateDate
                }
            ).FirstOrDefaultAsync();

            if (dto == null)
                return NotFound(new { message = $"Resume with ID {id} not found." });

            return Ok(dto);
        }

        //[HttpGet("getQuestionsByManageResume/{manageResumeId}")]
        //public async Task<ActionResult<ApiResponse<QuestionTestingDto>>> GetQuestionsByManageResume(int manageResumeId)
        //{
        //    // 1) หา record การสอบล่าสุดของผู้สมัคร (จะได้ category_id)
        //    var latestTesting = await _context.ManageApplicantTesting
        //        .Where(x => x.ManageResumeId == manageResumeId)
        //        .OrderByDescending(x => x.CreateDate) // ถ้าไม่มี CreateDate ใช้ ManageApplicantTestingId แทน
        //        .Select(x => new { x.ManageApplicantTestingId, x.ManageResumeId, x.CategoryId, x.Status })
        //        .FirstOrDefaultAsync();

        //    if (latestTesting == null || latestTesting.CategoryId == null)
        //    {
        //        return Ok(new ApiResponse<QuestionTestingDto>
        //        {
        //            Data = new List<QuestionTestingDto>(),
        //            TotalData = 0
        //        });
        //    }

        //    // 2) ดึงข้อสอบตาม category นั้น (tb Questions เป็นหลัก)
        //    var query =
        //        from q in _context.Questions
        //        where q.CategoryId == latestTesting.CategoryId
        //        orderby q.Position, q.QuestionsId
        //        select new QuestionTestingDto
        //        {
        //            QuestionsId = q.QuestionsId,
        //            CategoryId = q.CategoryId,
        //            Position = q.Position,

        //            Questions = q.Question,
        //            OptionA = q.OptionA,
        //            OptionB = q.OptionB,
        //            OptionC = q.OptionC,
        //            OptionD = q.OptionD,

        //            CorrectAns = q.CorrectAns,          // ถ้าไม่อยากส่งเฉลย ให้ลบทิ้ง
        //            CodeSnippets = q.CodeSnippets,
        //            AnsExplanation = q.AnsExplanation,
        //            VideoLink = q.VideoIink,
        //            ImgPath = q.ImgPath,

        //            ManageApplicantTestingId = latestTesting.ManageApplicantTestingId,
        //            ManageResumeId = latestTesting.ManageResumeId,
        //            Status = latestTesting.Status
        //        };

        //    var list = await query.ToListAsync();

        //    return Ok(new ApiResponse<QuestionTestingDto>
        //    {
        //        Data = list,
        //        TotalData = list.Count
        //    });
        //}

        [HttpGet("getQuestionsByManageResume/{manageResumeId}")]
        public async Task<ActionResult<ApiResponse<QuestionTestingDto>>> GetQuestionsByManageResume(int manageResumeId)
        {
            // 1) หา record ล่าสุดของผู้สมัคร (เอา CategoriesJson + Status)
            var latest = await _context.ManageApplicantTesting
                .Where(x => x.ManageResumeId == manageResumeId)
                .OrderByDescending(x => x.CreateDate) // ถ้าไม่มี CreateDate ใช้ ManageApplicantTestingId แทน
                .Select(x => new
                {
                    x.ManageApplicantTestingId,
                    x.ManageResumeId,
                    x.CategoryId,
                    x.CategoriesJson,
                    x.Status
                })
                .FirstOrDefaultAsync();

            if (latest == null)
            {
                return Ok(new ApiResponse<QuestionTestingDto>
                {
                    Data = new List<QuestionTestingDto>(),
                    TotalData = 0
                });
            }

            // 2) แปลง CategoriesJson -> List<int>
            var categoryIds = new List<int>();

            if (!string.IsNullOrWhiteSpace(latest.CategoriesJson))
            {
                try
                {
                    categoryIds = JsonSerializer.Deserialize<List<int>>(latest.CategoriesJson,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<int>();
                }
                catch
                {
                    categoryIds = new List<int>();
                }
            }

            // fallback: ถ้า json ว่าง/แปลงไม่ได้ ให้ใช้ CategoryId เดิม (กันพัง)
            if (categoryIds.Count == 0 && latest.CategoryId.HasValue)
            {
                categoryIds.Add(latest.CategoryId.Value);
            }

            // ถ้ายังไม่มี category เลย
            if (categoryIds.Count == 0)
            {
                return Ok(new ApiResponse<QuestionTestingDto>
                {
                    Data = new List<QuestionTestingDto>(),
                    TotalData = 0
                });
            }

            // 3) ดึงข้อสอบตาม categoryIds (หลายหมวด)
            var query =
                from q in _context.Questions
                where q.CategoryId != null && categoryIds.Contains(q.CategoryId.Value)
                orderby q.CategoryId, q.Position, q.QuestionsId
                select new QuestionTestingDto
                {
                    QuestionsId = q.QuestionsId,
                    CategoryId = q.CategoryId,
                    Position = q.Position,

                    Questions = q.Question,
                    OptionA = q.OptionA,
                    OptionB = q.OptionB,
                    OptionC = q.OptionC,
                    OptionD = q.OptionD,

                    CorrectAns = q.CorrectAns,     // ถ้าไม่อยากส่งเฉลย -> ลบทิ้ง
                    CodeSnippets = q.CodeSnippets,
                    AnsExplanation = q.AnsExplanation,
                    VideoLink = q.VideoIink,
                    ImgPath = q.ImgPath,

                    ManageApplicantTestingId = latest.ManageApplicantTestingId,
                    ManageResumeId = latest.ManageResumeId,
                    Status = latest.Status
                };

            var list = await query.ToListAsync();

            return Ok(new ApiResponse<QuestionTestingDto>
            {
                Data = list,
                TotalData = list.Count
            });
        }

        [HttpGet("getAssignedCategories/{manageResumeId:int}")]
        public async Task<ActionResult<ApiResponse<AssignedCategoryDto>>> GetAssignedCategories(int manageResumeId)
        {
            // 1) ดึง rows ของ ManageApplicantTesting ของคนนี้
            var mats = await _context.ManageApplicantTesting
                .Where(x => x.ManageResumeId == manageResumeId)
                .Select(x => new
                {
                    x.ManageApplicantTestingId,
                    x.ManageResumeId,
                    x.CategoryId,
                    x.CategoriesJson,
                    x.Status
                })
                .ToListAsync();

            if (mats.Count == 0)
            {
                return Ok(new ApiResponse<AssignedCategoryDto>
                {
                    Data = new List<AssignedCategoryDto>(),
                    TotalData = 0,
                    //Message = "No assigned categories"
                });
            }

            // 2) รวม CategoryId ทั้งจาก field CategoryId และจาก CategoriesJson
            //    map เก็บ ManageApplicantTestingId/Status ต่อ category (ถ้ามีหลาย row ซ้ำ category จะเอาอันแรก)
            var catMeta = new Dictionary<int, (int? matId, string? status)>();

            foreach (var mat in mats)
            {
                // 2.1 CategoryId ตรง ๆ
                if (mat.CategoryId.HasValue)
                {
                    var cid = mat.CategoryId.Value;
                    if (!catMeta.ContainsKey(cid))
                        catMeta[cid] = (mat.ManageApplicantTestingId, mat.Status);
                }

                // 2.2 CategoriesJson (เช่น [1,2,3])
                if (!string.IsNullOrWhiteSpace(mat.CategoriesJson))
                {
                    try
                    {
                        var ids = JsonSerializer.Deserialize<List<int>>(mat.CategoriesJson,
                            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();

                        foreach (var cid in ids.Distinct())
                        {
                            if (!catMeta.ContainsKey(cid))
                                catMeta[cid] = (mat.ManageApplicantTestingId, mat.Status);
                        }
                    }
                    catch
                    {
                        // ถ้า CategoriesJson ไม่ใช่ json array ให้ข้าม
                    }
                }
            }

            var categoryIds = catMeta.Keys.Distinct().ToList();
            if (categoryIds.Count == 0)
            {
                return Ok(new ApiResponse<AssignedCategoryDto>
                {
                    Data = new List<AssignedCategoryDto>(),
                    TotalData = 0,
                    //Message = "No assigned categories"
                });
            }

            // 3) โหลดชื่อ category
            var categories = await _context.Category
                .Where(c => c.CategoryId != null && categoryIds.Contains(c.CategoryId.Value))
                .Select(c => new
                {
                    CategoryId = c.CategoryId!.Value,
                    CategoryName = c.CategoryDescription
                })
                .ToListAsync();

            var catNameMap = categories.ToDictionary(x => x.CategoryId, x => x.CategoryName);

            // 4) นับจำนวนข้อสอบต่อ category จาก Questions
            var totalQuestionsMap = await _context.Questions
                .Where(q => q.CategoryId != null && categoryIds.Contains(q.CategoryId.Value))
                .GroupBy(q => q.CategoryId!.Value)
                .Select(g => new { CategoryId = g.Key, Total = g.Count() })
                .ToDictionaryAsync(x => x.CategoryId, x => x.Total);

            // 5) ดึงผลสอบล่าสุดต่อ category จาก Testing
            //    ใช้ CreateDate DESC (ถ้า null เยอะ อาจเปลี่ยนเป็น TestingId DESC)
            var allTesting = await _context.Testing
                .Where(t => t.ManageResumeId == manageResumeId && t.CategoryId != null && categoryIds.Contains(t.CategoryId.Value))
                .OrderByDescending(t => t.CreateDate)
                .ToListAsync();

            var latestTestingMap = allTesting
                .GroupBy(t => t.CategoryId!.Value)
                .ToDictionary(g => g.Key, g => g.First());

            // 6) ประกอบผลลัพธ์
            var result = new List<AssignedCategoryDto>();

            foreach (var cid in categoryIds.OrderBy(x => x))
            {
                catMeta.TryGetValue(cid, out var meta);
                latestTestingMap.TryGetValue(cid, out var latest);
                totalQuestionsMap.TryGetValue(cid, out var totalQ);

                // คำนวณ correct/total จาก answers_json (ถ้ามี)
                int correctCount = latest?.Score.GetValueOrDefault() ?? 0;
                int totalForDisplay = totalQ;

                if (latest != null && !string.IsNullOrWhiteSpace(latest.AnswersJson))
                {
                    try
                    {
                        var items = JsonSerializer.Deserialize<List<AnswerItem>>(latest.AnswersJson,
                            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();

                        // ถ้า totalQ เป็น 0 ให้ fallback เป็นจำนวนข้อใน answersJson
                        if (totalForDisplay <= 0) totalForDisplay = items.Count;

                        correctCount = items.Count(x =>
                            !string.IsNullOrWhiteSpace(x.Selected) &&
                            !string.IsNullOrWhiteSpace(x.Correct) &&
                            string.Equals(x.Selected!.Trim(), x.Correct!.Trim(), StringComparison.OrdinalIgnoreCase)
                        );
                    }
                    catch
                    {
                        // parse ไม่ได้ก็ปล่อย scoreText ว่าง
                    }
                }

                string? scoreText = null;
                int? percent = null;
                if (latest != null && totalForDisplay > 0)
                {
                    scoreText = $"{correctCount}/{totalForDisplay}";
                    percent = (int)Math.Round((latest?.Score.GetValueOrDefault()??0) * 100.0 / totalForDisplay);
                }

                result.Add(new AssignedCategoryDto
                {
                    CategoryId = cid,
                    CategoryName = catNameMap.ContainsKey(cid) ? catNameMap[cid] : null,
                    ManageApplicantTestingId = meta.matId,

                    // ถ้ามีผลสอบล่าสุด ให้ใช้ status จาก Testing ก่อน
                    Status = latest?.Status ?? meta.status,

                    ScoreText = scoreText,
                    ScorePercent = latest?.Score,
                    Score = percent,
                    SpentMinutes = latest?.SpentSeconds != null
                        ? Math.Round(latest.SpentSeconds.Value / 60.0, 2)
                        : (double?)null,
                    LatestTestDate = latest?.CreateDate,
                    Time = latest?.Time
                });
            }

            return Ok(new ApiResponse<AssignedCategoryDto>
            {
                Data = result,
                TotalData = result.Count,
                //Message = "success"
            });
        }

        [HttpPost("update")]
        public async Task<IActionResult> CreateOrUpdateScheduleTiming([FromBody] Testing testing)
        {
            if (testing == null) return BadRequest(new { message = "Invalid Manage Resume data." });

            try
            {
                if (testing.TestingId > 0)
                {
                    var existing = await _context.Testing
                        .FirstOrDefaultAsync(e => e.TestingId == testing.TestingId);
                    if (existing == null) return NotFound(new { message = $"Schedule Timing with ID {testing.ManageResumeId} not found." });

                    existing.UpdateBy = testing.UpdateBy;
                    existing.UpdateDate = DateTime.UtcNow;
                    existing.ManageResumeId = testing.ManageResumeId;
                    existing.CategoryId = testing.CategoryId;
                    existing.AnswersJson = testing.AnswersJson;
                    existing.Score = testing.Score;
                    existing.Time = testing.Time;
                    existing.SpentSeconds = testing.SpentSeconds;
                    existing.Status = testing.Status;

                    _context.Testing.Update(existing);
                }
                else
                {
                    var maxId = await _context.Testing
                                .MaxAsync(e => (int?)e.TestingId);
                    if (maxId == null)
                    {
                        // Handle the case where the table is empty
                        maxId = 1;
                    }
                    else
                    {
                        maxId = maxId + 1;
                    }

                    var newDocument = new Testing
                    {
                        TestingId = (int)maxId,
                        ManageResumeId = testing.ManageResumeId,
                        CategoryId = testing.CategoryId,
                        AnswersJson = testing.AnswersJson,
                        Score = testing.Score,
                        Time = testing.Time,
                        SpentSeconds = testing.SpentSeconds,
                        Status = testing.Status,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = testing.CreateBy
                    };

                    _context.Testing.Add(newDocument);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Schedule Timing save successfully" });
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

        [HttpGet("getLatestResult/{manageResumeId}")]
        public async Task<IActionResult> GetLatestResult(int manageResumeId)
        {
            var result = await _context.Testing
                .Where(x => x.ManageResumeId == manageResumeId)
                .OrderByDescending(x => x.CreateDate)
                .Select(x => new
                {
                    x.TestingId,
                    x.ManageResumeId,
                    x.CategoryId,
                    x.Score,
                    x.Time,
                    x.Status,
                    x.AnswersJson,
                    x.CreateDate
                })
                .FirstOrDefaultAsync();

            if (result == null)
                return NotFound(new { message = "Result not found" });

            return Ok(result);
        }


        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteScheduleTiming(int id)
        {
            // Find the holiday by its ID
            var scheduleTiming = await _context.ScheduleTiming.FindAsync(id);
            if (scheduleTiming == null)
            {
                // If not found, return 404 Not Found
                return NotFound(new { message = "schedule Timing not found" });
            }

            // Remove the holiday from the database
            _context.ScheduleTiming.Remove(scheduleTiming);

            // Save the changes asynchronously
            await _context.SaveChangesAsync();

            // Return a success response
            return Ok(new { message = "schedule Timing deleted successfully" });
        }

        public class TestingSearchDto
        {
            public string? FirstName { get; set; }
            public int? Position { get; set; }   // = PositionId
            public string? Status { get; set; }
        }

        [HttpPost("searchScheduleTime")]
        public async Task<ActionResult<ApiResponse<TestingDto>>> SearchResume(
            [FromBody] TestingSearchDto searchDto)
        {
            // Base query + LEFT JOIN
            var query =
                from j in _context.ManageResume.AsNoTracking()

                    // Location
                join s0 in _context.ScheduleTiming.AsNoTracking()
                    on j.ManageResumeId equals s0.ManageResumeId into mnar
                from s in mnar.DefaultIfEmpty()

                // Position
                join p0 in _context.Designations.AsNoTracking()
                    on j.Position equals p0.DesignationId into pgrp
                from p in pgrp.DefaultIfEmpty()

                join t0 in _context.Title
                    on j.Title equals t0.TitleID into tte
                from t in tte.DefaultIfEmpty()

                select new
                {
                    j,                        // entity หลัก
                    s,
                    PositionName = p.DesignationNameEn,
                    titleName = t.TitleNameEn
                };

            // ---------- Filters ----------
            if (!string.IsNullOrWhiteSpace(searchDto.FirstName))
            {
                query = query.Where(x => x.j.FirstName.Contains(searchDto.FirstName));
            }

            if (searchDto.Position.HasValue)
            {
                // filter ด้วย id ตำแหน่ง
                query = query.Where(x => x.j.Position == searchDto.Position.Value);
            }

            // Search by Skills (JSON string contains)
            if (!string.IsNullOrWhiteSpace(searchDto.Status))
            {
                query = query.Where(x => x.s.Status.Contains(searchDto.Status));
            }

            // ---------- Select ออกเป็น DTO ----------
            var list = await query
                .Select(x => new TestingDto
                {
                    ManageResumeId = x.j.ManageResumeId,
                    Title = x.titleName,
                    FirstName = x.j.FirstName,
                    LastName = x.j.LastName,
                    Email = x.j.Email,
                    Phone = x.j.Phone,
                    Gender = x.j.Gender,
                    Skills = x.j.Skills,
                    StartDate = x.s.StartDate,
                    ExpiredDate = x.s.ExpiredDate,
                    Status = x.s != null ? x.s.Status : null,
                    Experiences = x.j.Experiences,
                    Educations = x.j.Educations,
                    CreateDate = x.j.CreateDate,
                    CreateBy = x.j.CreateBy,
                    UpdateDate = x.j.UpdateDate,
                    UpdateBy = x.j.UpdateBy,

                    // FK + ชื่อที่ join มา
                    PositionId = x.j.Position,
                    LocationId = x.j.Location,
                    TitleId = x.j.Title,
                    PositionName = x.PositionName,
                    TitleName = x.titleName,
                    Position = x.PositionName,
                })
                .ToListAsync();

            var response = new ApiResponse<TestingDto>
            {
                Data = list,
                TotalData = list.Count
            };

            return Ok(response);
        }

        public class QuestionTestingDto
        {
            public int? QuestionsId { get; set; }
            public int? CategoryId { get; set; }
            public int? Position { get; set; }

            public string Questions { get; set; }
            public string OptionA { get; set; }
            public string OptionB { get; set; }
            public string OptionC { get; set; }
            public string OptionD { get; set; }

            // ถ้าไม่อยากให้ client เห็นเฉลย ให้เอาออกได้
            public string CorrectAns { get; set; }

            public string CodeSnippets { get; set; }
            public string AnsExplanation { get; set; }
            public string VideoLink { get; set; }
            public string ImgPath { get; set; }

            // มาจาก ManageApplicantTesting
            public int? ManageApplicantTestingId { get; set; }
            public int? ManageResumeId { get; set; }
            public string Status { get; set; }
        }


        public sealed class TestingDto
        {
            public int? ManageResumeId { get; set; }
            public string? ResumeTitle { get; set; }

            public int? PositionId { get; set; }
            public int? LocationId { get; set; }
            public int? TitleId { get; set; }
            public int? JobTitleId { get; set; }
            public int? ScheduleId { get; set; }
            public int? CategoryId { get; set; }
            public int? ManageApplicantTestingId { get; set; }

            // ชื่อที่ได้จากตารางอ้างอิง (ไว้แสดงผล)
            public string? PositionName { get; set; }
            public string? LocationName { get; set; } 
            public string? TitleName { get; set; }
            public string? JobTitleName { get; set; }
            public string? CategoryName { get; set; }

            // ฟิลด์เดิมอื่น ๆ ที่ต้องการส่งกลับ
            //public string? Department { get; set; } // ถ้ายังมี string เดิมอยู่
            //public string? JobTypeName { get; set; }
            public string? Title { get; set; }
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string? Email { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? ExpiredDate { get; set; }
            public string? JobTitle { get; set; }
            public string? Status { get; set; }
            public string? Phone { get; set; }
            public string? Gender { get; set; }
            public string? Position { get; set; }
            public string? Location { get; set; }
            public string? Skills { get; set; }
            public int? Score { get; set; }
            public DateTime? Time { get; set; }
            public string? Experiences { get; set; }
            public string? Educations { get; set; }
            public DateTime? StartCreateResume { get; set; }
            //public string? Status { get; set; }
            public DateTime? CreateDate { get; set; }
            public string? CreateBy { get; set; }
            public DateTime? UpdateDate { get; set; }
            public string? UpdateBy { get; set; }
           

        }

        // ใช้ parse answers_json ที่ FE ส่ง: [{ questionsId, selected, correct }]
        private class AnswerItem
        {
            public int QuestionsId { get; set; }
            public string? Selected { get; set; }
            public string? Correct { get; set; }
        }

        public class AssignedCategoryDto
        {
            public int CategoryId { get; set; }
            public string? CategoryName { get; set; }

            public int? ManageApplicantTestingId { get; set; }
            public string? Status { get; set; }

            public string? ScoreText { get; set; }     // "20/25"
            public int? ScorePercent { get; set; }     // จาก tb testing.Score (ถ้าเก็บเป็น %)
            public int? Score { get; set; }
            public double? SpentMinutes { get; set; }

            public DateTime? LatestTestDate { get; set; }
            public DateTime? Time { get; set; }        // (ตอนนี้ใน DB เป็น DateTime?) ส่งกลับไปก่อน
        }

        private string GetCurrentUserId()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            return username;
        }

    }
}
