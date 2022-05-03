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
    public class RolesController : ControllerBase
    {
        private readonly ILogger<RolesController> _logger;
        private readonly IHubContext<ControlServerHub> _hub;
        private readonly IConfiguration _configuration;

        public RolesController(
            ILogger<RolesController> logger,
            IHubContext<ControlServerHub> hub,
            IConfiguration configuration
            )
        {
            _logger = logger;
            _hub = hub;
            _configuration = configuration;
        }
        [HttpPost]
        public async Task<IActionResult> GetRolesGrid(Query.Request qr)
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

                //Sql para ir buscar os dados da nossa bd
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
        public async Task<IActionResult> GetRoleForm(Form.Request req)
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

                var roleId = int.Parse(req.Id.ToString());
                var role = await RolesHandler.GetRoleForm(connection , roleId);                

                return Ok(new { data = role });
            }                       
        }
        [HttpPost]
        public async Task<IActionResult> GetRolePermissionSelect(Query.Request qr)
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
                    Select id,name,descricao
                    from mob_permissoes
                ";

                return Ok(await Utils.ProcessSqlRequest(statement, qr, connection));                
            }                
        }


        [HttpPost]
        public async Task<IActionResult> SaveRoleForm(IDictionary<string, JsonElement> data)
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

                RolesHandler.SaveRoleForm(connection, data);
            }

            return Ok();
        }


        [HttpPost]
        public async Task<IActionResult> CreateRole(IDictionary<string, JsonElement> data)
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

                RolesHandler.CreateRole(connection, data);
            }

            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> DeleteRoles(Query.Selection sel)
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
                        from mob_perfis c
                        where c.name<>'Alidata'
                    ";

                    var allRoles = await connection.QueryAsync(statement);
                    var selected = allRoles.Where(r => ids.Contains(r.ID)).ToList();

                    if (selected.Count() != sel.Length)
                        return BadRequest("errors.grid.list-has-changed");

                    statement = @"delete from mob_perfis where id=@roleid";
                    foreach (var s in selected)
                    {
                        var parameters = new Dictionary<string, object>();
                        parameters["roleid"] = s.ID;

                        await connection.QueryAsync(statement, parameters);                        
                    }                    
                }
            }
            catch (Exception e)
            {
                return StatusCode(500, e);
            }           
            return Ok("Perfil apagado com sucesso");
        }
    }
}
