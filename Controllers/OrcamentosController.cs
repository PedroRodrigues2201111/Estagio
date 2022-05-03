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
using System.Text.Json;
using System.Threading.Tasks;

namespace ConServAs.Controllers
{
    [ApiController, Route("api/[controller]/[action]")]
    public class OrcamentosController : Controller
    {
        private readonly ILogger<OrcamentosController> _logger;
        private readonly IHubContext<ControlServerHub> _hub;
        private readonly IConfiguration _configuration;


        public OrcamentosController(
            ILogger<OrcamentosController> logger,
            IHubContext<ControlServerHub> hub,
            IConfiguration configuration
        )
        {
            _logger = logger;
            _hub = hub;
            _configuration = configuration;
        }

        //Função para obter os dados dos Orcamentos
        [HttpPost]
        public async Task<IActionResult> GetOrcamentosGrid(Query.Request qr)
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

        [HttpPost("{*op_id}")]
        public async Task<IActionResult> GetRevOrcamentosGrid(string op_id, Query.Request qr)
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
                    Select cab.diario||'_'||cab.ano||'_'||cab.num_doc diario_ano_numdoc,op.id, op.nome, 
                           cab.poca_conta, cab.poca_enti, cab.enti_dessocial,
                           cab.diario, cab.ano, cab.num_doc, cab.data_doc+cab.hora_doc data_doc, cab.estado, est.descricao,
                           cab.total_iliquido-cab.total_descontos total_liquido
                    from gia_fment cab
                    left outer join crm_oportunidades_sendys op on (op.id=cab.oportunidade_crm)
                    left outer join gia_estados_gerais est on (est.codigo=cab.estado)
                    where cab.estado in @estados_substituidos
                    and op.id=@op_id
                ";

                Dictionary<string, object> settings = await ModulesHandler.GetModuleSettings(JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(@"{ ""moduleId"": 6 }"), connection);                               

                var parameters = new Dictionary<string, object>();
                parameters["estados_substituidos"] = Enum.GetValues(typeof(EstadosSubstituidos));
                parameters["op_id"] = Int32.Parse(op_id);

                return Ok(await Utils.ProcessSqlRequest(statement, qr, connection, parameters));
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetOrcamentoForm(Form.Request fr)
        {
            string orcamentoId = fr.Id.ToString();

            if (string.IsNullOrEmpty(orcamentoId))
                return Ok(new { data = new { } });

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
                                  
                var orcamento = await OrcamentosHandler.GetOrcamentoForm(connection, orcamentoId);

                return Ok(new { data = orcamento });
            }
        }

        //Função para obter os dados dos Clientes no CreateOrcamentosForm
        [HttpPost]
        public async Task<IActionResult> GetClientesSelect(Query.Request qr)
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

                //Sql para aparecer os dados da nossa bd na pesquisa
                string statement = @"
                    Select ic.data_stock, ic.do_arm, ic.ao_arm, ic.da_marca, ic.a_marca, ic.da_referencia, ic.a_referencia, ic.da_gama, ic.a_gama,
                           ic.do_depart, ic.ao_depart, ic.da_versao, ic.a_versao, ic.da_familia, ic.a_familia, ic.do_modelo, ic.ao_modelo,
                           ic.do_grupo, ic.ao_grupo, ic.da_serie, ic.a_serie, ic.da_localizacao, ic.a_localizacao, ic.da_composicao, ic.a_composicao,
                           ic.do_tipo, ic.ao_tipo
                    from inventario_cabecalho ic
                ";

                return Ok(await Utils.ProcessSqlRequest(statement, qr, connection));
            }
        }

        //Função para obter os dados das Oportunidades no CreateOrcamentosForm
        [HttpPost]
        public async Task<IActionResult> GetOportunidadesSelect(Query.Request qr)
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

                //Alterar este sql para aparecer os dados da nossa bd na pesquisa
                string statement = @"
                    Select op.id, op.nome, op.referencia, op.cod_cliente, op.entidade
                    from crm_oportunidades_sendys op
                    where op.activo='S'
                ";

                return Ok(await Utils.ProcessSqlRequest(statement, qr, connection));
            }
        }
        [HttpPost]
        public async Task<IActionResult> GetArtigosGrid(Query.Request qr)
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
                    Select art.codigo_arm||'_'||art.referencia id, art.codigo_arm, art.referencia,
                          art.designacao1, art.preco1, art.comprimento, art.largura, art.altura,
                          art.peso_bruto, art.cod_familia, fam.descricao familia
                    from artigo art
                    left outer join familia fam on (fam.cod_familia=art.cod_familia)
                ";

                return Ok(await Utils.ProcessSqlRequest(statement, qr, connection));
            }
        }
        [HttpPost]
        public async Task<IActionResult> SaveOrcamentoForm(OrcamentoRequest orcamentoReq)
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
                var orcamento = await OrcamentosHandler.SaveOrcamentoForm(orcamentoReq, connection);

                return Ok(new { data = orcamento });
            }            
        }
        [HttpPost]
        public async Task<IActionResult> ChangeOrcamentoEstado(Dictionary<string, string> orcamentoInfo)
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

                await OrcamentosHandler.ChangeOrcamentoEstado(orcamentoInfo, connection);

                return Ok();
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
                    select est.codigo, est.descricao, est.estado_final
                    from gia_estados_gerais est
                    where est.codigo between 100 and 110
                ";
                return Ok(await Utils.ProcessSqlRequest(statement, qr, connection));
            }
        }
        [HttpPost]
        public async Task<IActionResult> GetMotivosAnulacaoSelect(Query.Request qr)
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
                    Select mot.cod_motivo, mot.abreviatura,
                           cast(mot.motivo as blob sub_type text character set WIN1252) motivo
                    from gia_motivo mot
                    where mot.tipo2='S'
                ";
                return Ok(await Utils.ProcessSqlRequest(statement, qr, connection));
            }
        }
        [HttpPost]
        public async Task<IActionResult> AnularRevisao(Dictionary<string, string> anulacaoInfo)
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

                await OrcamentosHandler.AnularRevisao(anulacaoInfo, connection);

                return Ok();
            }
        }
        [HttpPost]
        public async Task<IActionResult> AnularOrcamento(Dictionary<string, string> anulacaoInfo)
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

                await OrcamentosHandler.AnularOrcamento(anulacaoInfo, connection);

                return Ok();
            }
        }
        [HttpPost]
        public async Task<IActionResult> ValidarArtigos(List<Artigo> artigos)
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

                artigos = await OrcamentosHandler.ValidarArtigos(artigos, connection);

                return Ok(artigos);
            }
        }
    }
}
