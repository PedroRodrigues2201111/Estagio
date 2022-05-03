using ConServAs.Models;
using ConServAs.SignalR;
using ControlServerLib.Controllers;
using ControlServerLib.Models;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using ZXing;

namespace ConServAs.Controllers
{
    [ApiController, Route("api/[controller]/[action]")]
    public class DispositivosController : Controller
    {
        private readonly ILogger<DispositivosController> _logger;
        private readonly IHubContext<ControlServerHub> _hub;
        private readonly IConfiguration _configuration;


        public DispositivosController(
            ILogger<DispositivosController> logger,
            IHubContext<ControlServerHub> hub,
            IConfiguration configuration
        )
        {
            _logger = logger;
            _hub = hub;
            _configuration = configuration;
        }

        [HttpPost]
        public async Task<IActionResult> getDispositivoGrid(Query.Request qr)
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
                    Select 
                        dis.OID,
                        dis.DESCRICAO ,
                        dis.UUID,
                        dis.USER_ATIVACAO,
                        dis.DATA_ATIVACAO
                    from MOB_DISPOSITIVOS dis
                ";

                return Ok(await Utils.ProcessSqlRequest(statement, qr, connection));
            }
        }


        [HttpPost]
        public async Task<IActionResult> DeleteDispositivos(Query.Selection sel)
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

                    var ids = sel.List.Select(i => i.GetString()).ToList();

                    string statement = @"
                        Select dis.oid
                        from MOB_DISPOSITIVOS dis
                    ";

                    var allDispositivos = await connection.QueryAsync(statement);
                    var selected = allDispositivos.Where(r => ids.Contains(r.OID)).ToList();

                    if (selected.Count() != sel.Length)
                        return BadRequest("errors.grid.list-has-changed");

                    statement = @"delete from MOB_DISPOSITIVOS where oid=@oid";
                    foreach (var s in selected)
                    {
                        var parameters = new Dictionary<string, object>();
                        parameters["oid"] = s.OID;

                        await connection.QueryAsync(statement, parameters);
                    }
                }
            }
            catch (Exception e)
            {
                return StatusCode(500, e);
            }
            return Ok("Dispositivos apagadas com sucesso");
        }

        [HttpPost]
        public async Task<IActionResult> GetDispositivoForm(Form.Request req)
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

                var oid = req.Id.ToString();
                var dispositivo = await DispositivosHandler.GetDispositivoForm(connection, oid);

                return Ok(new { data = dispositivo });
            }
        }

        [HttpPost]
        public async Task<IActionResult> SaveDispositivoForm(IDictionary<string, JsonElement> data)
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

                DispositivosHandler.SaveDispositivoForm(connection, data);
            }

            return Ok();
        }



        [HttpGet]
        public async Task<IActionResult> GetQrCode()
        {

            var barcodeData = new NewDeviceQRCode
            {
                licenceToken = "123",
                serverAddress = "192.168.69.38:7012",
                empresa = "002"
            };



            byte[] bytes;
            using (var ms = new MemoryStream())
            {
                var writer = new BarcodeWriter { Format = BarcodeFormat.QR_CODE };
                var barcode = writer.Write(JsonSerializer.Serialize(barcodeData));
                barcode.Save(ms, ImageFormat.Png);
                bytes = ms.ToArray();
            }
            return File(bytes, "image/png");

        }


        [HttpPost]
        public async Task<IActionResult> MakeQrCode(Dictionary<string, JsonElement> data)
        {
            var headers = Request.Headers;
            if (!headers.ContainsKey("mob_token") || !headers.ContainsKey("empresa"))
                return Unauthorized();
            // generate token

            var oid = Guid.NewGuid();
            var token = Guid.NewGuid();
            var descricao = data["DESCRICAO"].GetString();
            int? preUser = null;
            if (data["Utilizador"].ValueKind != JsonValueKind.Null) {
                preUser = data["Utilizador"].GetProperty("ID_USER").GetInt32();
            }
            var licencaMOBREC = data["LicencaMOBREC"].ValueKind == JsonValueKind.Null ? null : data["LicencaMOBREC"].GetProperty("OID").GetString();
            var licencaMOBEXP = data["LicencaMOBEXP"].ValueKind == JsonValueKind.Null ? null : data["LicencaMOBEXP"].GetProperty("OID").GetString();
            var licencaMOBTRA = data["LicencaMOBTRA"].ValueKind == JsonValueKind.Null ? null : data["LicencaMOBTRA"].GetProperty("OID").GetString();
            var licencaMOBINV = data["LicencaMOBINV"].ValueKind == JsonValueKind.Null ? null : data["LicencaMOBINV"].GetProperty("OID").GetString();
            var licencas = new[] {licencaMOBREC, licencaMOBEXP, licencaMOBTRA, licencaMOBINV}.Where(s => s != null).ToList();


            using (var connection = await Utils.GetFbConnection(headers["empresa"], _configuration))
            {
                var user = await UsersHandler.GetUserPermissions(connection, headers["mob_token"]);
                if (user == null)
                {
                    return Unauthorized();
                }

                var sqlInsert = @"
                    INSERT INTO mob_dispositivos_tokens_reg (
                        oid, token, descricao, utilizador_pre_configurado, data_criacao, data_limite, usado, criado_por
                    ) VALUES (
                        @oid, @token, @descricao, @utilizador_pre_configurado, @data_criacao, @data_limite, @usado, @criado_por
                    )
                ";

                var parameters = new Dictionary<string, object>();
                parameters["oid"] = oid;
                parameters["token"] = token;
                parameters["descricao"] = descricao;
                parameters["utilizador_pre_configurado"] = preUser;
                parameters["data_criacao"] = DateTime.Now;
                parameters["data_limite"] = DateTime.Now.AddHours(1);
                parameters["usado"] = 0;
                parameters["criado_por"] = user.id_user;

                await connection.QueryAsync(sqlInsert, parameters);

                var sqlInsertLicense = @"
                    INSERT INTO mob_licencas_tokens_reg (
                        oid, oid_token, oid_licenca
                    ) VALUES (
                        @oid, @oid_token, @oid_licenca
                    )
                ";

                foreach (var lic in licencas) {
                    var parametersLicense = new Dictionary<string, object>();
                    parametersLicense["oid"] = Guid.NewGuid();
                    parametersLicense["oid_token"] = oid;
                    parametersLicense["oid_licenca"] = lic;

                    await connection.QueryAsync(sqlInsertLicense, parametersLicense);
                }


                var serverAddress = Startup.StaticConfig.GetSection("ServerAddress").Value;
                var barcodeData = new 
                {
                    licenceToken = token,
                    serverAddress,
                    empresa = headers["empresa"].FirstOrDefault()
                };



                byte[] bytes;
                using (var ms = new MemoryStream())
                {
                    var writer = new BarcodeWriter { 
                        Format = BarcodeFormat.QR_CODE,
                        Options = new ZXing.Common.EncodingOptions { 
                            Width = 300,
                            Height = 300
                        }
                        
                    };
                    var barcode = writer.Write(JsonSerializer.Serialize(barcodeData));
                    barcode.Save(ms, ImageFormat.Png);
                    bytes = ms.ToArray();
                }
                return File(bytes, "image/png");
            }

            return Ok();
        }

        public class NewDeviceQRCode {
            public string licenceToken { get; set; }
            public string serverAddress { get; set; }
            public string empresa { get; set; }
        }
    }
}
