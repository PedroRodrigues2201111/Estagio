using ConServAs.Models;
using ControlServerLib.Controllers;
using ControlServerLib.Models;
using Dapper;
using FirebirdSql.Data.FirebirdClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Primitives;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ConServAs.Controllers
{
    public static class UsersHandler
    {
        public static async Task<object> LoginUser(
            LoginData loginRequest,
            IConfiguration _configuration
        )
        {
            var statement = @"SELECT * FROM MOB_LOGIN(@username,@senha,@remember)";

            var parameters = new Dictionary<string, object>();
            parameters["username"] = loginRequest.Username.ToUpper();
            using (MD5 md5 = MD5.Create())
            {
                byte[] hash = md5.ComputeHash(Encoding.Default.GetBytes(loginRequest.Username.ToUpper() + loginRequest.Password));

                StringBuilder strBuilder = new StringBuilder();
                for (int i = 0; i < hash.Length; i++)
                {
                    strBuilder.Append(hash[i].ToString("x2"));
                }

                parameters["senha"] = strBuilder.ToString().ToUpper();
            }
            parameters["remember"] = (loginRequest.RememberMe ?? false) ?  "S" : "N";

            using (var connection = await Utils.GetFbConnection(loginRequest.Empresa, _configuration))
            {
                try
                {
                    var user = await connection.QueryAsync(statement, parameters);
                    if (user.Count() == 0)
                    {
                        return null;
                    }

                    int id_user = user.AsList()[0].ID_USER;
                    string username = user.AsList()[0].USERNAME;
                    string token = user.AsList()[0].TOKEN;

                    if (string.IsNullOrEmpty(token))
                    {
                        return null;
                    }

                    return await GetUserData(connection, id_user, username, token, loginRequest.Empresa);
                }
                catch (Exception _)
                {
                    return null;
                }
            }
        }

        public static async Task<object> LoginMobileUser(LoginData loginRequest, IConfiguration _configuration)
        {
            var statement = @"SELECT * FROM MOB_LOGIN_MOBILE(@username,@senha)";

            var parameters = new Dictionary<string, object>();
            parameters["username"] = loginRequest.Username.ToUpper();
            using (MD5 md5 = MD5.Create())
            {
                byte[] hash = md5.ComputeHash(Encoding.Default.GetBytes(loginRequest.Username.ToUpper() + loginRequest.Password));

                StringBuilder strBuilder = new StringBuilder();
                for (int i = 0; i < hash.Length; i++)
                {
                    strBuilder.Append(hash[i].ToString("x2"));
                }

                parameters["senha"] = strBuilder.ToString().ToUpper();
            }

            using (var connection = await Utils.GetFbConnection(loginRequest.Empresa, _configuration))
            {
                try
                {
                    var user = await connection.QueryAsync(statement, parameters);
                    if (user.Count() == 0)
                    {
                        return null;
                    }

                    string token = user.AsList()[0].TOKEN;
                    int id_user = user.AsList()[0].ID_USER;
                    string username = user.AsList()[0].USERNAME;

                    if (string.IsNullOrEmpty(token))
                    {
                        return null;
                    }

                    return new
                    {
                        token,
                        id_user,
                        username
                    };
                }
                catch (Exception _)
                {
                    return null;
                }
            }
        }

        public static async Task<object> LoginMobileUserWithToken(string token, FbConnection connection)
        {
            var statement = @"SELECT * FROM MOB_LOGIN_MOBILE(null ,@token)";

            var parameters = new Dictionary<string, object>();
            parameters["token"] = token;

            try
            {
                var user = await connection.QueryAsync(statement, parameters);
                if (user.Count() == 0)
                {
                    return null;
                }

                string mob_token = user.AsList()[0].TOKEN;
                int id_user = user.AsList()[0].ID_USER;
                string username = user.AsList()[0].USERNAME;

                if (string.IsNullOrEmpty(mob_token))
                {
                    return null;
                }

                return new
                {
                    token = mob_token,
                    id_user,
                    username
                };
            }
            catch (Exception _)
            {
                return null;
            }
        }

        public static async Task<object> ValidateToken(string token, string cod_empresa, IConfiguration _configuration) 
        {
            string statement = @"                
                Select a.id_user,b.nome username
                from mob_sessoes a
                left outer join utilizadores b on (b.id_user=a.id_user)
                where a.disabled=0
                and a.data_expiracao>=current_date
                and a.token=@token
            ";

            var parameters = new Dictionary<string, object>();
            parameters["token"] = token;

            using (var connection = await Utils.GetFbConnection(cod_empresa, _configuration))
            {
                try
                {
                    var user = await connection.QueryAsync(statement, parameters);
                    if (user.Count() == 0)
                    {
                        return null;
                    }

                    int id_user = user.AsList()[0].ID_USER;
                    string username = user.AsList()[0].USERNAME;

                    return await GetUserData(connection, id_user, username, token, cod_empresa);
                }
                catch (Exception _)
                {
                    return null;
                }
            }
        }
        public static async Task<object> GetUserData(FbConnection connection, int id_user, string username, string token, string cod_empresa)
        {
            var menu = await GetMenu(id_user, connection);
            var permissions = await GetPermissions(id_user, connection);
            var empresa = await EmpresasHandler.GetEmpresa(connection);
            string settings = await GetSettings(id_user, connection);

            return new
            {
                menu,
                userData = new
                {
                    cod_empresa,
                    empresa,
                    username,
                    token,
                    settings,
                    permissions
                }
            };
        }

        public static async Task<string> GetSettings(int id_user, FbConnection connection)
        {
            var statement = @"                
                select settings 
                from mob_utilizadores_settings
                where id_user=@id_user                
            ";

            var parameters = new Dictionary<string, object>();            
            parameters["id_user"] = id_user;

            var settings = await connection.QueryAsync(statement, parameters);
            if (settings.Count() == 0)
            {
                return null;
            }
            return settings.AsList()[0].SETTINGS;
        }

        public static async Task<dynamic> GetUserPermissions(FbConnection connection, string token)
        {
            string statement = @"                
                Select a.id_user,b.nome username
                from mob_sessoes a
                left outer join utilizadores b on (b.id_user=a.id_user)
                where a.disabled=0
                and a.data_expiracao>=current_date
                and a.token=@token
            ";

            var parameters = new Dictionary<string, object>();
            parameters["token"] = token;

            try
            {
                var user = await connection.QueryAsync(statement, parameters);
                if (user.Count() == 0)
                {
                    return null;
                }

                int id_user = user.AsList()[0].ID_USER;
                string username = user.AsList()[0].USERNAME;

                var permissions = await GetPermissions(id_user, connection);

                return new
                {
                    id_user,
                    username,
                    permissions
                };
            }
            catch (Exception _)
            {
                return null;
            }            
        }
        public static async Task<dynamic> GetUserForm(int userId, FbConnection connection)
        {
            string statement = @"                
                Select a.id_user, a.pri_nome FIRSTNAME, a.ult_nome LASTNAME, c.id, c.name, 
                       c.descricao, b.roleorder
                from utilizadores a
                left outer join mob_perfis_utilizadores b on (b.userid=a.id_user)
                left outer join mob_perfis c on (c.id=b.roleid and c.name<>'Alidata')
                where a.id_user=@id_user
            ";

            var parameters = new Dictionary<string, object>();
            parameters["id_user"] = userId;

            try
            {
                var user = await connection.QueryAsync(statement, parameters);
                var roles = new List<Dictionary<string, object>>();

                if (user.Count() == 0)
                {
                    return null;
                }               
                else if (user.Count() > 1 || (user.Count() == 1 && user.AsList()[0].ID != null))
                {
                    roles = user.Where(w => w.ID != null).OrderBy(ur => ur.ROLEORDER).Select(r => new Dictionary<string, object>
                    {
                        {"ID", r.ID },
                        {"NAME", r.NAME },
                        {"DESCRICAO", r.DESCRICAO }
                    }).ToList();
                }

                int UserId = user.AsList()[0].ID_USER;
                string FirstName = user.AsList()[0].FIRSTNAME;
                string LastName = user.AsList()[0].LASTNAME;

                return new
                {
                    UserId,
                    FirstName,
                    LastName,
                    Roles = roles
                };
            }
            catch (Exception _)
            {
                return null;
            }         
        }

        public static async Task<dynamic> GetSeriesPermissions(FbConnection connection, int userId)
        {
            string statement = @"                
                Select b.diario, b.documento, b.inserir, b.visualizar, b.alterar, b.eliminar,
                       b.marcar, b.desmarcar, b.bloquear_tesouraria, b.pede_password,
                       b.anexos_ver, b.anexos_ins, b.anexos_alt, b.anexos_del
                from utilizadores a
                left outer join gia_series_utiliz b on (b.utilizador=a.nome)
                where a.id_user=@id_user
            ";

            var parameters = new Dictionary<string, object>();
            parameters["id_user"] = userId;

            return await connection.QueryAsync(statement, parameters);
        }

        public static async void Logout(StringValues token, FbConnection connection)
        {
            var statement = @"
                delete from mob_sessoes where token=@token
            ";

            var parameters = new Dictionary<string, object>();
            parameters["token"] = token;

            await connection.QueryAsync(statement, parameters);
        }

        public static async void SaveUserSettings(FbConnection connection, dynamic id_user, string settings)
        {
            var statement = @"                
                update or insert into mob_utilizadores_settings(id_user, settings)
                values(@id_user, @settings)
                matching(id_user)                
            ";

            var parameters = new Dictionary<string, object>();
            parameters["settings"] = settings;
            parameters["id_user"] = id_user;

            await connection.QueryAsync(statement, parameters);
        }

        public static async void SaveUserForm(IDictionary<string, JsonElement> data, FbConnection connection)
        {
            int userId = data["userId"].GetInt32();
            int roleCount = data["roles"].GetArrayLength();            

            string roles = "";

            for (var i = 0; i < roleCount; i++)
            {
                var id = data["roles"][i].GetProperty("ID").GetInt32();                
                roles += id + ",";
            }

            /*
            var statement = @"
                update utilizadores set pri_nome=@firstname,ult_nome=@lastname
                where id_user=@userid
            ";

            var parameters = new Dictionary<string, object>();
            parameters["userid"] = userId;
            parameters["firstname"] = data["firstName"].GetString();
            parameters["lastname"] = data["lastName"].GetString();

            await connection.QueryAsync(statement, parameters);
            */

            var statement = @"
                execute procedure MOB_ATUALIZA_PERFIS_UTILIZ(@userid,@roles);
            ";
            var parameters = new Dictionary<string, object>();
            parameters["userid"] = userId;
            parameters["roles"] = roles;

            await connection.QueryAsync(statement, parameters);
        }

        public class MenuItem
        {
            public int Id { get; set; }
            public string Value { get; set; }
            public int? ParentId { get; set; }
        }
        public static async Task<IEnumerable<ClassUtils.TreeItem<MenuItem>>> GetMenu(int id_user, FbConnection connection)
        {
            var permissions = await GetPermissions(id_user, connection);

            var statement = @"
                Select a.id, a.""VALUE"", a.permissionid, a.parentid, a.rootid, a.""ORDER"", pe.name
                from mob_csmenus a
                left outer join mob_permissoes pe on (pe.id=a.permissionid)
                where a.""VALUE"" = 'Admin'
                and a.rootid is null
            ";

            var menuRoot = await connection.QueryAsync(statement);

            if (menuRoot.Count() == 0)
            {
                return null;
            }

            statement = @"
                Select a.id, a.""VALUE"", a.permissionid, a.parentid, a.rootid, a.""ORDER"", pe.name
                from mob_csmenus a
                left outer join mob_permissoes pe on(pe.id = a.permissionid)
                where a.rootid = @rootid
            ";

            var parameters = new Dictionary<string, object>();
            parameters["rootid"] = menuRoot.AsList()[0].ID;

            List<dynamic> menuTree = new List<dynamic> { 
                menuRoot.AsList()[0]
            };
            menuTree.AddRange(await connection.QueryAsync(statement, parameters));

            var tList = menuTree
                .Where(t => permissions.Any(p => p == t.NAME))
                .OrderBy(t => t.ORDER)
                .Select(t => new MenuItem
                {
                    Id = t.ID,
                    Value = t.VALUE,
                    ParentId = t.PARENTID
                });

            var tree = ClassUtils.GenerateTree(
                tList,
                x => x.Id,
                x => x.ParentId
            );

            return tree.First().Children;
        }
        public static async Task<List<string>> GetPermissions(int id_user, FbConnection connection)
        {
            var statement = @"
                Select p.Name RoleName, pe.name Permission, pep.revokepermission
                from mob_perfis_utilizadores u
                left outer join mob_perfis p on (p.id=u.roleid)
                left outer join mob_permissoes_perfis pep on (pep.roleid=p.id)
                left outer join mob_permissoes pe on (pe.id=pep.permissionid)
                where u.userid=@id_user
                order by u.roleorder
            ";

            var parameters = new Dictionary<string, object>();
            parameters["id_user"] = id_user;

            var userPermissions = await connection.QueryAsync(statement, parameters);

            var permissions = new List<string>();

            foreach (var rp in userPermissions)
            {
                if (rp.ROLENAME == "Alidata")
                {
                    statement = @"Select pe.name Permission from mob_permissoes pe";
                    return (await connection.QueryAsync(statement)).Select(r => (string)r.PERMISSION).ToList();
                }
                if (rp.REVOKEPERMISSION == 1)
                {
                    permissions.Remove(rp.PERMISSION);
                }
                else if (!permissions.Contains(rp.PERMISSION))
                {
                    permissions.Add(rp.PERMISSION);
                }
            }

            return permissions;
        }
    }    
}
