using Dapper;
using FirebirdSql.Data.FirebirdClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using IniParser;
using IniParser.Model;
using System.IO;

namespace ConServAs.Controllers
{
    public static class EmpresasHandler
    {
        public static async Task<dynamic> GetEmpresa(FbConnection connection)
        {
            string statement = @"                
                Select cod_empresa,nome
                from empresa
            ";

            try
            {
                var empresa = await connection.QueryAsync(statement);
                if (empresa.Count() == 0)
                {
                    return null;
                }

                return empresa;
            }
            catch (Exception _)
            {
                return null;
            }
        }

        public static async void SaveLicenseInfo(IDictionary<string, JsonElement> data, FbConnection empresa_con)
        {
            if (!data.ContainsKey("licenseFile") || data["licenseFile"].ToString() == "")
                return;

            using(var stream = GenerateStreamFromString(data["licenseFile"].ToString()))
            {
                StreamReader reader = new StreamReader(stream);
                var parser = new FileIniDataParser();
                IniData licenseFile = parser.ReadData(reader);

                var statement = @"                    
                    UPDATE OR INSERT INTO LICENCAS (COD_EMPRESA, APLICACAO, FILIAL, LICENCA, NOME, DATA_INICIO, DATA_FIM, CONTRIBUINTE, NUM_UTILIZADORES, CHAVE, TIPO1, TIPO2, MODULOS) 
                                            VALUES (@cod_empresa, 'SIAMGA', 1, @licenca, @nome, @data_inicio, @data_fim, @contribuinte, @num_utilizadores, @chave, @tipo1, @tipo2, @modulos)
                    MATCHING (COD_EMPRESA, APLICACAO, FILIAL)
                ";

                var parameters = new Dictionary<string, object>();
                parameters["cod_empresa"] = licenseFile["Licença SIA"]["Sigla"];
                parameters["licenca"] = licenseFile["Licença SIA"]["Licença"];
                parameters["nome"] = licenseFile["Licença SIA"]["Empresa"];
                parameters["data_inicio"] = licenseFile["Licença SIA"]["Data Activação"].Replace('-','.');
                parameters["data_fim"] = licenseFile["Licença SIA"]["Cod. Pessoal"].Replace('-', '.');
                parameters["contribuinte"] = licenseFile["Licença SIA"]["Contribuinte"];
                parameters["num_utilizadores"] = licenseFile["Licença SIA"]["N. Utilizadores"];
                parameters["chave"] = licenseFile["Licença SIA"]["Chave"].Replace("-", "");
                parameters["tipo1"] = licenseFile["Licença SIA"]["Tipo1"];
                parameters["tipo2"] = licenseFile["Licença SIA"]["Tipo2"];                
                parameters["modulos"] = licenseFile["Licença SIA"]["Modulos"];

                await empresa_con.QueryAsync(statement, parameters);
            }            
        }
        private static Stream GenerateStreamFromString(string s)
        {
            var stream = new MemoryStream();
            var writer = new StreamWriter(stream);
            writer.Write(s);
            writer.Flush();
            stream.Position = 0;
            return stream;
        }
    }
}
