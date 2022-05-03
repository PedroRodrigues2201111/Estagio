using ControlServerLib.Controllers;
using Dapper;
using FirebirdSql.Data.FirebirdClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace ConServAs.Controllers
{
    public static class RolesHandler
    {
        public static async Task<dynamic> GetRoleForm(FbConnection connection, int roleId)
        {
            string statement = @"                
                Select a.id, a.name, a.descricao,c.id id_permissao, c.name name_permissao, c.descricao descricao_permissao
                from mob_perfis a
                left outer join mob_permissoes_perfis b on (b.roleid=a.id)
                left outer join mob_permissoes c on (c.id=b.permissionid)
                where a.id=@roleid
            ";

            var parameters = new Dictionary<string, object>();
            parameters["roleid"] = roleId;

            try
            {
                var role = await connection.QueryAsync(statement, parameters);
                var permissions = new List<Dictionary<string, object>>();

                if (role.Count() == 0)
                {
                    return null;
                }
                else if (role.Count() > 1 || (role.Count() == 1 && role.AsList()[0].ID_PERMISSAO != null))
                {
                    permissions = role.Select(r => new Dictionary<string, object>
                    {
                        {"ID", r.ID_PERMISSAO },
                        {"NAME", r.NAME_PERMISSAO },
                        {"DESCRICAO", r.DESCRICAO_PERMISSAO }
                    }).ToList();                 
                }

                int RoleId = role.AsList()[0].ID;
                string Name = role.AsList()[0].NAME;
                string Description = role.AsList()[0].DESCRICAO;

                return new
                {
                    RoleId,
                    Name,
                    Description,
                    Permissions = permissions
                };
            }
            catch (Exception _)
            {
                return null;
            }
        }
        public static async void SaveRoleForm(FbConnection connection, IDictionary<string, JsonElement> data)
        {
            int roleId = data["roleId"].GetInt32();
            int permissionCount = data["permissions"].GetArrayLength();
            string permissionIds = "";

            for (var i = 0; i < permissionCount; i++)
            {
                var id = data["permissions"][i].GetProperty("ID").GetInt32();
                permissionIds += id + ",";
            }

            var statement = @"
                update mob_perfis set name=@name,descricao=@descricao
                where id=@roleid
            ";

            var parameters = new Dictionary<string, object>();
            parameters["roleid"] = roleId;
            parameters["name"] = data["name"].GetString();
            parameters["descricao"] = data["description"].GetString();

            await connection.QueryAsync(statement, parameters);

            statement = @"
                execute procedure MOB_ATUALIZA_PERMI_PERFIS(@roleid,@permissions);
            ";
            parameters = new Dictionary<string, object>();
            parameters["roleid"] = roleId;
            parameters["permissions"] = permissionIds;

            await connection.QueryAsync(statement, parameters);
        }

        public static async void CreateRole(string statement, FbConnection connection, IDictionary<string, JsonElement> data)
        {
            var name = data["name"].GetString();
            var descricao = data["description"].GetString();

            try
            {
                string statement = @"
                    insert into mob_perfis(name,descricao)
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
                    throw new Exception("Perfil já existe");
                }                
            }            
        }
    }
}
