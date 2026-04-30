using Microsoft.AspNetCore.Mvc;

namespace solutionAPI.Controllers
{
    public class EmployeeProfileController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
