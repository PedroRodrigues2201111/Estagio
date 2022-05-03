using Dapper;
using FirebirdSql.Data.FirebirdClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace ConServAs.Controllers
{
    public static class PermissionsHandler
    {
        public static async Task<dynamic> GetPermissionForm(FbConnection connection, int permissionId)
        {
            string statement = @"                
                Select a.id, a.name, a.descricao
                from mob_permissoes a                
                where a.id=@permissionid
            ";

            var parameters = new Dictionary<string, object>();
            parameters["permissionid"] = permissionId;

            try
            {
                var permission = await connection.QueryAsync(statement, parameters);                

                if (permission.Count() == 0)
                {
                    return null;
                }                

                int PermissionId = permission.AsList()[0].ID;
                string Name = permission.AsList()[0].NAME;
                string Description = permission.AsList()[0].DESCRICAO;

                return new
                {
                    PermissionId,
                    Name,
                    Description
                };
            }
            catch (Exception _)
            {
                return null;
            }
        }
        public static async void SavePermissionForm(FbConnection connection, IDictionary<string, JsonElement> data)
        {
            int permissionId = data["permissionId"].GetInt32();            

            var statement = @"
                update mob_permissoes set name=@name,descricao=@descricao
                where id=@permissionId
            ";

            var parameters = new Dictionary<string, object>();
            parameters["permissionId"] = permissionId;
            parameters["name"] = data["name"].GetString();
            parameters["descricao"] = data["description"].GetString();

            await connection.QueryAsync(statement, parameters);
        }

        public static async void CreatePermission(FbConnection connection, IDictionary<string, JsonElement> data)
        {
            var name = data["name"].GetString();
            var descricao = data["description"].GetString();

            try
            {
                string statement = @"
                    insert into mob_permissoes(name,descricao)
                    values(@name,@descricao);
                ";

                var parameters = new Dictionary<string, object>();
                parameters["name"] = name;
                parameters["descricao"] = descricao;

                await connection.QueryAsync(statement, parameters);
            }
            catch (FbException fbex)
            {
                if (fbex.ErrorCode == 335544665)
                {
                    throw new Exception("Permissão já existe");
                }
            }
        }
    }
}
