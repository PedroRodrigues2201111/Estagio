using ConServAs.Models;
using Dapper;
using FirebirdSql.Data.FirebirdClient;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace ConServAs.Controllers
{
    public class DispositivosHandler : Controller
    {



        public static async Task<string> registerDeviceAccess(string uuid, FbConnection connection, string token = null)
        {
            string sql = @"
                SELECT * FROM mob_atualiza_acesso_dispositivo(@uuid, @token)
            ";

            var parameters = new Dictionary<string, object>();
            parameters["uuid"] = uuid;
            parameters["token"] = token;

            var res = (await connection.QueryAsync(sql, parameters)).FirstOrDefault();

            return res?.OID_DISPOSITIVO;
        }
        public static async Task<dynamic> registerNewDevice(string uuid, FbConnection connection, string token = null)
        {
            var oid_dispositivo = await registerDeviceAccess(uuid, connection, token);

            if (token != null)
            {
                // select info from token
                dynamic tokenInfo = await GetRegTokenInfo(connection, token);

                // TODO: check token consumido

                if (tokenInfo == null)
                    return null;

                // add licences
                foreach (string lic in tokenInfo.licences)
                {
                    setLicencaDispositivo(connection, oid_dispositivo, lic);
                }

                // add user
                // return user token
                if (tokenInfo.tokenInfo.UTILIZADOR_PRE_CONFIGURADO != null) {
                    return await UsersHandler.LoginMobileUserWithToken(tokenInfo.tokenInfo.OID, connection);
                }

            }

            return null;
        }

        private static async Task<dynamic> GetRegTokenInfo(FbConnection connection, string token)
        {
            var sql = @"
                SELECT * FROM mob_dispositivos_tokens_reg
                WHERE token = @token
            ";
            var sqlLicences = @"
                SELECT * FROM mob_licencas_tokens_reg
                WHERE oid_token = @oid_token
            ";

            var parameters = new Dictionary<string, object>();
            parameters["token"] = token;

            var tokenInfo = (await connection.QueryAsync(sql, parameters)).FirstOrDefault();

            if (tokenInfo == null)
                return null;

            if ((DateTime)tokenInfo.DATA_LIMITE < DateTime.Now)
                return null;

            parameters["oid_token"] = tokenInfo.OID;
            var licenceData = (await connection.QueryAsync(sqlLicences, parameters));
            var licences = licenceData.Select(x => (string)x.OID_LICENCA).ToArray();
            return new { tokenInfo, licences };
        }

        public static async Task<Device> getDeviceInfo(string token, FbConnection connection)
        {
            await registerDeviceAccess(token, connection);

            string sql = @"
                
            ";

            return null;
        }

        public static async Task<dynamic> GetDispositivoForm(FbConnection connection, string oid)
        {
            string statement = @"                
                Select dis.oid, dis.uuid, dis.descricao
                from mob_dispositivos dis                
                where dis.oid=@OID
            ";

            var parameters = new Dictionary<string, object>();
            parameters["OID"] = oid;

            try
            {
                var dispositivo = (await connection.QueryAsync(statement, parameters)).FirstOrDefault();

                // get licencas
                var sql = @"
                    SELECT codigo
                    FROM mob_modulos
                ";
                List<string> modulos = (await connection.QueryAsync(sql)).Select(m => (string)m.CODIGO).ToList();

                var sqlModulo = @"
                    SELECT  
                        ml.oid, ml.num_dispositivos num_dispositivos, ml.modulo, ml.licenca,
                        ml.data_ativacao data, count(mld.oid) NUM_EM_USO
                    FROM mob_licencas ml
                    LEFT JOIN mob_licencas_dispositivos mld
                        ON mld.oid_licenca = ml.oid
                            AND mld.ativado = 'S'
                    WHERE ml.modulo = @modulo
                        AND mld.oid_dispositivo = @oid_dispositivo
                    GROUP BY 1, 2, 3, 4, 5
                ";
                var parametersModulo = new Dictionary<string, object>();
                foreach (var modulo in modulos) {
                    parametersModulo["modulo"] = modulo;
                    parametersModulo["oid_dispositivo"] = oid;
                    var mod = (await connection.QueryAsync(sqlModulo, parametersModulo)).FirstOrDefault();
                    dispositivo = Utils.AddProp(dispositivo, mod, "Licenca"+modulo);
                }

                return dispositivo;
            }
            catch (Exception _)
            {
                return null;
            }
        }

        public static async void SaveDispositivoForm(FbConnection connection, IDictionary<string, JsonElement> data)
        {
 
            var statement = @"
                update mob_dispositivos set 
                    descricao=@descricao
                where oid=@oid
            ";

            var parameters = new Dictionary<string, object>();
            parameters["oid"] = data["OID"].GetString();
            parameters["descricao"] = data["DESCRICAO"].GetString();

            await connection.QueryAsync(statement, parameters);

            
            setLicencaDispositivo(connection, data["OID"].GetString(), data["LicencaMOBREC"].ValueKind == JsonValueKind.Null ? null : data["LicencaMOBREC"].GetProperty("OID").GetString(), "MOBREC");
            setLicencaDispositivo(connection, data["OID"].GetString(), data["LicencaMOBEXP"].ValueKind == JsonValueKind.Null ? null : data["LicencaMOBEXP"].GetProperty("OID").GetString(), "MOBEXP");
            setLicencaDispositivo(connection, data["OID"].GetString(), data["LicencaMOBTRA"].ValueKind == JsonValueKind.Null ? null : data["LicencaMOBTRA"].GetProperty("OID").GetString(), "MOBTRA");
            setLicencaDispositivo(connection, data["OID"].GetString(), data["LicencaMOBINV"].ValueKind == JsonValueKind.Null ? null : data["LicencaMOBINV"].GetProperty("OID").GetString(), "MOBINV");
        }

        public static async void setLicencaDispositivo(FbConnection connection, string oid_dispositivo, string oid_licenca, string modulo = null)
        {
            // check if already set
            //   if yes do nothing
            if (modulo == null) {
                // get modulo from licenca
                var sql = @"
                    SELECT modulo 
                    FROM mob_licencas
                    WHERE oid = @oid_licenca
                ";
                var parameters = new Dictionary<string, object>();
                parameters["oid_licenca"] = oid_licenca;
                modulo = (await connection.QueryAsync(sql, parameters)).FirstOrDefault().MODULO;
            }


            var licencaAtual = await GetLicencaDispositivoModulo(connection, modulo, oid_dispositivo);

            if (licencaAtual != null && licencaAtual.OID_LICENCA == oid_licenca)
            {
                return;
            }


            dynamic licenca = oid_licenca == null ? null : await GetLicencaByOid(connection, oid_licenca);

            if (licenca != null && licenca.NUM_EM_USO >= licenca.NUM_DISPOSITIVOS) {
                return;
            }

            if (licencaAtual != null)
            {
                var sqlDelete = @"
                    DELETE FROM mob_licencas_dispositivos
                    WHERE oid = @oid
                ";

                var parametersDelete = new Dictionary<string, object>();
                parametersDelete["oid"] = licencaAtual.OID;
                await connection.QueryAsync(sqlDelete, parametersDelete);
            }

            if( licenca != null) { 
                var sqlInsert = @"
                    INSERT INTO mob_licencas_dispositivos (
                        oid, oid_dispositivo, oid_licenca, data_ativacao_licenciamento, ativado                
                    ) VALUES (
                        @oid, @oid_dispositivo, @oid_licenca, current_timestamp, 'S'      
                    )
                ";

                var parametersInsert = new Dictionary<string, object>();
                parametersInsert["oid"] = Guid.NewGuid();
                parametersInsert["oid_dispositivo"] = oid_dispositivo;
                parametersInsert["oid_licenca"] = oid_licenca;
                await connection.QueryAsync(sqlInsert, parametersInsert);
            }
        }

        private static async Task<dynamic> GetLicencaByOid(FbConnection connection, string oid_licenca)
        {
            string sql = @"
                SELECT  
                    ml.oid, ml.num_dispositivos num_dispositivos, ml.modulo, ml.licenca,
                    ml.data_ativacao data, count(mld.oid) NUM_EM_USO
                FROM mob_licencas ml
                LEFT JOIN mob_licencas_dispositivos mld
                    ON mld.oid_licenca = ml.oid
                        AND mld.ativado = 'S'
                WHERE ml.oid = @oid_licenca
                GROUP BY 1, 2, 3, 4, 5
            ";

            var parameters = new Dictionary<string, object>();
            parameters["oid_licenca"] = oid_licenca;
            var licenca = (await connection.QueryAsync(sql, parameters)).FirstOrDefault();
            return licenca;
        }

        private static async Task<dynamic> GetLicencaDispositivoModulo(FbConnection connection, string modulo, string oid_dispositivo)
        {
            string sql = @"
                SELECT mld.oid_licenca, mld.oid
                FROM mob_licencas_dispositivos mld
                LEFT JOIN mob_licencas ml
                    ON mld.oid_licenca = ml.oid
                WHERE modulo = @modulo
                    AND oid_dispositivo = @oid_dispositivo
            ";

            var parameters = new Dictionary<string, object>();
            parameters["modulo"] = modulo;
            parameters["oid_dispositivo"] = oid_dispositivo;

            var licencaAtual = await connection.QueryAsync(sql, parameters);
            return licencaAtual.FirstOrDefault();
        }
    }

    public class Device
    {
        public string UUID { get; set; }
        public List<Module> Modules { get; set; }
    }
    public class Module
    {
        public string ID { get; set; }
        public string Name { get; set; }
    }
}
