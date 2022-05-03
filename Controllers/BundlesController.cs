using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ConServAs.Controllers
{
    [ApiController, Route("api/[controller]/[action]")]
    public class BundlesController : ControllerBase
    {

        private readonly ILogger<BundlesController> _logger;

        public BundlesController(
            ILogger<BundlesController> logger
            )
        {
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Components()
        {
            return File(System.IO.File.OpenRead("SPA/build/mvc/components.json"), "application/json");
        }

        [HttpGet]
        public IActionResult Views()
        {
            return File(System.IO.File.OpenRead("SPA/build/mvc/views.json"), "application/json");
        }

        [HttpGet]
        public IActionResult Views_JS()
        {
            return File(System.IO.File.OpenRead("SPA/build/mvc/views.js"), "text/javascript");
        }
    }
}