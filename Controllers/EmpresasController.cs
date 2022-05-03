using ConServAs.Models;
using ConServAs.SignalR;
using ControlServerLib.Controllers;
using Dapper;
using FirebirdSql.Data.FirebirdClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ConServAs.Controllers
{
    [ApiController, Route("api/[controller]/[action]")]
    public class EmpresasController : ControllerBase
    {
        private readonly ILogger<EmpresasController> _logger;
        private readonly IHubContext<ControlServerHub> _hub;
        private readonly IConfiguration _configuration;

        public EmpresasController(
            ILogger<EmpresasController> logger,
            IHubContext<ControlServerHub> hub,
            IConfiguration configuration
            )
        {
            _logger = logger;
            _hub = hub;
            _configuration = configuration;
        }
        [HttpGet]
        public async Task<IActionResult> GetEmpresas()
        {
            string statement = @"select codigo,nome from empresas order by nome";
            using (var connection = new FbConnection(_configuration.GetConnectionString("DB")))
            {
                var empresas = await connection.QueryAsync(statement);
                if (empresas.Count() == 0)
                {
                    return null;
                }
                return Ok(empresas);
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetLicenseInfo()
        {
            var headers = Request.Headers;
            if (!headers.ContainsKey("empresa"))
                return Unauthorized();

            string statement = @"
                select a.cod_empresa, a.aplicacao, a.filial, a.licenca, a.nome, a.data_inicio, a.data_fim,
                       a.contribuinte, a.num_utilizadores, a.tipo1, a.tipo2, a.modulos
                from licencas a
                where a.aplicacao='SIAMGA' and a.cod_empresa=@empresa
            ";

            var parameters = new Dictionary<string, object>();
            parameters["empresa"] = headers["empresa"];

            using (var connection = new FbConnection(_configuration.GetConnectionString("DB")))
            {
                var license = await connection.QueryAsync(statement, parameters);
                if (license.Count() == 0)
                {
                    return Ok(new
                    {
                        data = new
                        {
                            licenseNum = "",
                            name = "",
                            vatNum = "",
                            numDevices = ""                            
                        }
                    });
                }

                parameters.Clear();
                string modulos = license.AsList()[0].MODULOS;
                modulos = modulos.TrimStart(';').TrimEnd(';');

                StringBuilder statementBuilder = new StringBuilder();
                statementBuilder.Append("Select cod_modulo codigo, descricao from modulos where cod_modulo in (");                                
                for (int i = 0; i < modulos.Split(";").Count(); i++)
                {
                    if (i > 0)
                        statementBuilder.Append(",");
                    statementBuilder.Append("@modulo" + i);

                    parameters["modulo" + i] = modulos.Split(";")[i];
                }
                statementBuilder.Append(")");                

                var modules = await connection.QueryAsync(statementBuilder.ToString(), parameters);

                var licenseData = new
                {
                    licenseNum = license.AsList()[0].LICENCA,
                    name = license.AsList()[0].NOME,
                    vatNum = license.AsList()[0].CONTRIBUINTE,
                    numDevices = license.AsList()[0].NUM_UTILIZADORES,
                    modules = modules,
                    licenseFile = ""
                };

                return Ok(new { data = licenseData });
            }
        }

        

        [HttpGet]
        public async Task<IActionResult> GetModulesSelect()
        {
            string statement = @"select cod_modulo codigo,descricao from modulos";
            using (var connection = new FbConnection(_configuration.GetConnectionString("DB")))
            {
                var modulos = await connection.QueryAsync(statement);
                if (modulos.Count() == 0)
                {
                    return null;
                }
                return Ok(modulos);
            }
        }
        [HttpPost]
        public async Task<IActionResult> PostLicenseInfo(IDictionary<string, JsonElement> data)
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
                using (var empresa_con = new FbConnection(_configuration.GetConnectionString("DB")))
                {
                    EmpresasHandler.SaveLicenseInfo(data, empresa_con);
                }                
            }
            return Ok();
        }
    }
}
