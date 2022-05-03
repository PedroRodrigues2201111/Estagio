using ConServAs.Models;
using ConServAs.SignalR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using ControlServerLib.Controllers;
using FirebirdSql.Data.FirebirdClient;
using ControlServerLib.Models;
using System.Text.Json;
using System.Collections.Generic;

namespace ConServAs.Controllers
{
    [ApiController, Route("api/[controller]/[action]")]
    public class UsersController : ControllerBase
    {

        private readonly ILogger<UsersController> _logger;
        private readonly IHubContext<ControlServerHub> _hub;
        private readonly IConfiguration _configuration;

        public UsersController(
            ILogger<UsersController> logger,
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

            var user = await UsersHandler.LoginUser(loginRequest, _configuration);

            if (user == null)
            {
                return BadRequest("Login failed");
            }

            return Ok(user);
        }
        [HttpPost]
        public async Task<IActionResult> GetUserGrid(Query.Request qr)
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

                string statement = @"
                    Select ic.num_processamento,
                           il.codigo_arm, il.referencia, il.descricao, il.cod_localizacao, il.cor, il.tamanho, il.stock_atual,
                           il.stock_contagem, il.ultimo_custo, il.custo_medio, il.cod_unidade, il.alterado
                    from inventario_cabecalho ic
                    left outer join inventario_linhas il on (il.num_processamento=ic.num_processamento)
                ";

                return Ok(await Utils.ProcessSqlRequest(statement, qr, connection));
            }                                 
        }
        [HttpPost]
        public async Task<IActionResult> GetUserForm(Form.Request req)
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

                var editUserId = int.Parse(req.Id.ToString());
                var editUser = await UsersHandler.GetUserForm(editUserId, connection);

                var userData = new
                {
                    editUser.UserId,
                    editUser.FirstName,
                    editUser.LastName,
                    editUser.Roles
                };

                return Ok(new { data = userData });
            }            
        }
        [HttpPost]
        public async Task<IActionResult> GetUserRoleSelect(Query.Request qr)
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

                string statement = @"
                    Select c.id,c.name,c.descricao
                    from mob_perfis c
                    where c.name<>'Alidata'
                ";
                return Ok(await Utils.ProcessSqlRequest(statement, qr, connection));
            }            
        }
        [HttpPost]
        public async Task<IActionResult> Authenticate(LoginData loginRequest)
        {            
            var headers = Request.Headers;

            if (loginRequest.Username == null)
            {
                if (headers.ContainsKey("mob_token") && headers.ContainsKey("empresa") && headers["empresa"] != "null")
                {
                    var user = await UsersHandler.ValidateToken(headers["mob_token"], headers["empresa"], _configuration);
                    if (user == null)
                    {
                        return Unauthorized();
                    }
                    return Ok(user);
                }
                return Unauthorized();
            }
            else
            {
                var user = await UsersHandler.LoginUser(loginRequest, _configuration);
                if (user == null)
                {
                    return BadRequest("Login failed");
                }
                return Ok(user);
            }            
        }
        [HttpPost]
        public async Task<IActionResult> PostUserForm(IDictionary<string, JsonElement> data)
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

                UsersHandler.SaveUserForm(data, connection);
            }                        
            return Ok();
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
        public async Task<IActionResult> SetUserPortalSettings(Dictionary<string, string> settings)
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

                UsersHandler.SaveUserSettings(connection, user.id_user, settings["settings"]);
            }            
            return Ok();
        }
        [HttpGet]
        public async Task<IActionResult> GetUserSeriesPermissions()
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

                int userId = user.id_user;

                dynamic seriesPermissions = await UsersHandler.GetSeriesPermissions(connection, userId);
                return Ok(new {
                    seriesPermissions
                });
            }
        }
    }    
}
