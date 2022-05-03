using Dapper;
using FirebirdSql.Data.FirebirdClient;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace ConServAs.Controllers
{
    public static class ModulesHandler
    {
        public static async Task<dynamic> GetModuleForm(FbConnection connection, int moduleid)
        {
            string statement = @"                
                Select a.id, a.name
                from mob_modulos a                
                where a.id=@moduleid
            ";

            var parameters = new Dictionary<string, object>();
            parameters["moduleid"] = moduleid;

            try
            {
                var module = await connection.QueryAsync(statement, parameters);

                if (module.Count() == 0)
                {
                    return null;
                }

                int ModuleId = module.AsList()[0].ID;
                string Name = module.AsList()[0].NAME;

                statement = @"
                    Select campo,valor
                    from MOB_CONFIG_MODULOS
                    where id_modulo=@moduleId
                ";

                var configs = await connection.QueryAsync(statement, parameters);

                Dictionary<string, object> moduleForm = new Dictionary<string, object>();
                moduleForm["moduleId"] = ModuleId;
                moduleForm["name"] = Name;

                foreach (var item in configs.AsList())
                {
                    moduleForm[item.CAMPO] = JsonSerializer.Deserialize<object>(item.VALOR);
                }

                return moduleForm;
            }
            catch (Exception _)
            {
                return null;
            }
        }

        public static async void SaveModuleForm(IDictionary<string, JsonElement> data, FbConnection connection)
        {
            int moduleId = data["moduleId"].GetInt32();

            try
            {
                foreach (string key in data.Keys)
                {
                    if (key == "moduleId" || key == "name")
                        continue;


                    var statement = @"
                        update or insert into MOB_CONFIG_MODULOS(ID_MODULO,CAMPO,VALOR)
                        values (@moduleId,@campo,@valor)
                        matching(ID_MODULO,CAMPO)
                    ";

                    var parameters = new Dictionary<string, object>();
                    parameters["moduleId"] = moduleId;
                    parameters["campo"] = key;
                    parameters["valor"] = data[key].GetRawText();

                    await connection.QueryAsync(statement, parameters);
                }
            }
            catch (Exception _)
            {
            }
        }

        public static async Task<Dictionary<string, object>> GetModuleSettings(IDictionary<string, JsonElement> data, FbConnection connection, System.Data.Common.DbTransaction transaction = null)
        {
            try
            {
                int moduleId = data["moduleId"].GetInt32();

                return await GetModuleSettings(moduleId, connection, transaction);
            }
            catch (Exception _)
            {
                return null;
            }
        }

        public static async Task<Dictionary<string, object>> GetModuleSettings(int moduleId, FbConnection connection, System.Data.Common.DbTransaction transaction = null)
        {
            try
            {
                var statement = @"
                    Select campo,valor
                    from MOB_CONFIG_MODULOS
                    where id_modulo=@moduleId
                ";

                var parameters = new Dictionary<string, object>();
                parameters["moduleId"] = moduleId;

                var configs = await connection.QueryAsync(statement, parameters, transaction);

                Dictionary<string, object> settings = new Dictionary<string, object>();

                foreach (var item in configs.AsList())
                {
                    settings[item.CAMPO] = JsonSerializer.Deserialize<object>(item.VALOR);
                }

                return settings;
            }
            catch (Exception _)
            {
                return null;
            }
        }
    }
}