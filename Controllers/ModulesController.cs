using ConServAs.Models;
using ConServAs.SignalR;
using ControlServerLib.Controllers;
using ControlServerLib.Models;
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
    public class ModulesController : ControllerBase
    {
        private readonly ILogger<ModulesController> _logger;
        private readonly IHubContext<ControlServerHub> _hub;
        private readonly IConfiguration _configuration;

        public ModulesController(
            ILogger<ModulesController> logger,
            IHubContext<ControlServerHub> hub,
            IConfiguration configuration
            )
        {
            _logger = logger;
            _hub = hub;
            _configuration = configuration;
        }
        [HttpPost]
        public async Task<IActionResult> GetModuleGrid(Query.Request qr)
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
        public async Task<IActionResult> GetModuleForm(Form.Request req)
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

                var editModuleId = int.Parse(req.Id.ToString());
                var module = await ModulesHandler.GetModuleForm(connection, editModuleId);                

                return Ok(new { data = module });
            }
        }
        [HttpPost]
        public async Task<IActionResult> GetGiaTfactSelect(Query.Request qr)
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
                    Select a.campo_chave codigo,a.descricao
                    from giatfact a
                    order by a.campo_chave
                ";
                return Ok(await Utils.ProcessSqlRequest(statement, qr, connection));
            }
        }

        [HttpPost]
        public async Task<IActionResult> PostModuleForm(IDictionary<string, JsonElement> data)
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
                ModulesHandler.SaveModuleForm(data, connection);
            }
            return Ok();
        }

        [HttpPost]
        public async Task<IActionResult> GetModuleSettings(IDictionary<string, JsonElement> data)
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
                dynamic settings = await ModulesHandler.GetModuleSettings(data, connection);
                return Ok(new { settings });
            }           
        }
        [HttpPost]
        public async Task<IActionResult> GetDiarioMrecapSelect(Query.Request qr)
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
                    Select a.diario codigo,a.descricao
                    from diario_mrecap a
                    order by a.diario
                ";
                return Ok(await Utils.ProcessSqlRequest(statement, qr, connection));
            }
        }
        [HttpPost]
        public async Task<IActionResult> GetEstadosGeraisSelect(Query.Request qr)
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
                    Select est.codigo, est.descricao
                    from gia_estados_gerais est
                    order by est.codigo
                ";
                return Ok(await Utils.ProcessSqlRequest(statement, qr, connection));
            }
        }
    }
}
