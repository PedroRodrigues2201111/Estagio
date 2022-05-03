using ConServAs.Models;
using ConServAs.SignalR;
using ControlServerLib.Controllers;
using ControlServerLib.Models;
using Dapper;
using FirebirdSql.Data.FirebirdClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace ConServAs.Controllers
{
    [ApiController, Route("api/[controller]/[action]")]
    public class PermissionsController : ControllerBase
    {
        private readonly ILogger<PermissionsController> _logger;
        private readonly IHubContext<ControlServerHub> _hub;
        private readonly IConfiguration _configuration;

        public PermissionsController(
            ILogger<PermissionsController> logger,
            IHubContext<ControlServerHub> hub,
            IConfiguration configuration
            )
        {
            _logger = logger;
            _hub = hub;
            _configuration = configuration;
        }
        [HttpPost]
        public async Task<IActionResult> GetPermissionsGrid(Query.Request qr)
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
                    from mob_permissoes c
                ";

                return Ok(await Utils.ProcessSqlRequest(statement, qr, connection));
            }
        }
        [HttpPost]
        public async Task<IActionResult> GetPermissionForm(Form.Request req)
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

                var permissionId = int.Parse(req.Id.ToString());
                var permission = await PermissionsHandler.GetPermissionForm(connection, permissionId);

                return Ok(new { data = permission });
            }
        }
        [HttpPost]
        public async Task<IActionResult> SavePermissionForm(IDictionary<string, JsonElement> data)
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

                PermissionsHandler.SavePermissionForm(connection, data);
            }

            return Ok();
        }
        [HttpPost]
        public async Task<IActionResult> CreatePermission(IDictionary<string, JsonElement> data)
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

                PermissionsHandler.CreatePermission(connection, data);
            }

            return Ok();
        }
        [HttpPost]
        public async Task<IActionResult> DeletePermissions(Query.Selection sel)
        {
            var headers = Request.Headers;
            if (!headers.ContainsKey("mob_token") || !headers.ContainsKey("empresa"))
                return Unauthorized();
            try
            {               
                using (var connection = await Utils.GetFbConnection(headers["empresa"], _configuration))
                {
                    var user = await UsersHandler.GetUserPermissions(connection, headers["mob_token"]);
                    if (user == null)
                    {
                        return Unauthorized();
                    }

                    var ids = sel.List.Select(i => i.GetInt32()).ToList();

                    string statement = @"
                        Select c.id
                        from mob_permissoes c
                    ";

                    var allPermissions = await connection.QueryAsync(statement);
                    var selected = allPermissions.Where(r => ids.Contains(r.ID)).ToList();

                    if (selected.Count() != sel.Length)
                        return BadRequest("errors.grid.list-has-changed");

                    statement = @"delete from mob_permissoes where id=@permissionid";
                    foreach (var s in selected)
                    {
                        var parameters = new Dictionary<string, object>();
                        parameters["permissionid"] = s.ID;

                        await connection.QueryAsync(statement, parameters);
                    }
                }
            }
            catch (Exception e)
            {
                return StatusCode(500, e);
            }
            return Ok("Permissões apagadas com sucesso");
        }
    }
}
