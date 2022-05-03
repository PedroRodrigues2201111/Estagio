using ConServAs.Models;
using ConServAs.SignalR;
using ControlServerLib.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConServAs.Controllers
{
    [ApiController, Route("api/[controller]/[action]")]
    public class MobileController : ControllerBase
    {
        private readonly ILogger<MobileController> _logger;
        private readonly IHubContext<ControlServerHub> _hub;
        private readonly IConfiguration _configuration;

        public MobileController(
            ILogger<MobileController> logger,
            IHubContext<ControlServerHub> hub,
            IConfiguration configuration
            )
        {
            _logger = logger;
            _hub = hub;
            _configuration = configuration;
        }
        [HttpPost]
        public async Task<IActionResult> Login(LoginData loginRequest)
        {
            var headers = Request.Headers;

            var user = await UsersHandler.LoginMobileUser(loginRequest, _configuration);

            if (user == null)
            {
                return BadRequest("Login failed");
            }

            if (headers.ContainsKey("mob_did")) {
                using (var connection = await Utils.GetFbConnection(loginRequest.Empresa, _configuration))
                {
                    await DispositivosHandler.registerDeviceAccess(headers["mob_did"], connection);
                }
            }

            return Ok(user);
        }
        [HttpGet]
        public async Task<IActionResult> Logout()
        {
            var headers = Request.Headers;
            if (!headers.ContainsKey("mob_token") || !headers.ContainsKey("empresa"))
                return Unauthorized();

            using (var connection = await Utils.GetFbConnection(headers["empresa"], _configuration))
            {
                var user = await UsersHandler.GetUserPermissions(connection, headers["mob_token"]);
                if (user == null)
                {
                    return Unauthorized();
                }
                UsersHandler.Logout(headers["mob_token"], connection);
            }
            return NoContent();
        }

        [HttpPost]
        public async Task<IActionResult> MobileUsersSelect(Query.Request qr)
        {
            var headers = Request.Headers;
            if (!headers.ContainsKey("mob_token") || !headers.ContainsKey("empresa"))
                return Unauthorized();


            string statement = @"
                SELECT  
                    id_user, nome
                FROM utilizadores
                WHERE tem_pda = 'S'
            ";

            using (var connection = await Utils.GetFbConnection(headers["empresa"], _configuration))
            {
                return Ok(await Utils.ProcessSqlRequest(statement, qr, connection));
            }
        }
    }    
}
