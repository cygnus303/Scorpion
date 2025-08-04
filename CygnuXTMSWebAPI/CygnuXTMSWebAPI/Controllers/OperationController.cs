using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CygnuXTMSWebAPI.Controllers
{
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    public class OperationController : ControllerBase
    {
        public OperationController()
        {
            // Constructor logic can be added here if needed
        }

        [HttpGet("welcome")]
        public IActionResult GetWelcomeMessage()
        {
            return Ok("Welcome to Cygnux Softtech Pvt Ltd.");
        }
    }
}
