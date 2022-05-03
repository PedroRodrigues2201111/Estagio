using ControlServerLib.Controllers;
using Dapper;
using FirebirdSql.Data.FirebirdClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace ConServAs.Models
{
    public class Utils
    {
        /// <summary>
        ///   Processes a Query.Request using an SQL statement as a data source.
        /// </summary>
        /// <returns>
        ///   A Query.Response.
        /// </returns>
        /// <exception cref="System.ArgumentException"> 
        ///   Thrown if there are invalid Field names.
        /// </exception>
        /// <param name="statement">
        ///     The SQL base statement to use as a data source.
        /// </param>
        /// <param name="qr">
        ///     Query.Request object.
        /// </param>
        /// <param name="connection">
        ///     Firebird connection.
        /// </param>
        public static Task<Query.Response> ProcessSqlRequest(string statement, Query.Request qr, FbConnection connection, Dictionary<string, object> parameters = null)
        {
            return ProcessSqlRequest(statement, statement, qr, connection, parameters);
        }

        /// <summary>
        ///   Processes a Query.Request using an SQL statement as a data source.
        /// </summary>
        /// <returns>
        ///   A Query.Response.
        /// </returns>
        /// <exception cref="System.ArgumentException"> 
        ///   Thrown if there are invalid Field names.
        /// </exception>
        /// <param name="statement">
        ///     The SQL base statement to use as a data source.
        /// </param>
        /// <param name="countStatement">
        ///     A lightweight SQL base statement to use for counts.
        /// </param>
        /// <param name="qr">
        ///     Query.Request object.
        /// </param>
        /// <param name="connection">
        ///     Firebird connection.
        /// </param>
        /// <param name="parameters">
        ///     Optional parameters argument.
        /// </param>
        public static async Task<Query.Response> ProcessSqlRequest(string statement, string countStatement, Query.Request qr, FbConnection connection, Dictionary<string, object> parameters = null)
        {
            var queryStatement = Query.HandleSqlRequest(statement, countStatement, qr, parameters);
            Dapper.SqlMapper.AddTypeMap(typeof(string), System.Data.DbType.AnsiString);


            connection.Open();

            int totalCount = 0;
            int filteredCount = 0;
            dynamic result;

            try
            {
                var totalCountQuery = connection.QueryAsync<dynamic>(queryStatement.TotalCount, queryStatement.Parameters);
                var filteredCountQuery = connection.QueryAsync<dynamic>(queryStatement.FilteredCount, queryStatement.Parameters);
                var resultQuery = connection.QueryAsync<dynamic>(queryStatement.Query, queryStatement.Parameters);

                totalCount = (await totalCountQuery).Select(x => x.COUNT).FirstOrDefault();
                filteredCount = (await filteredCountQuery).Select(x => x.COUNT).FirstOrDefault();
                result = await resultQuery;

                return new Query.Response
                {
                    Draw = qr.Draw,
                    Data = result,
                    RecordsFiltered = filteredCount,
                    RecordsTotal = totalCount
                };

            }
            catch (Exception e)
            {
                result = "errore";

                throw e;
            }
        }

        public static async Task<FbConnection> GetFbConnection(string cod_empresa, IConfiguration _configuration)
        {
            string statement = @"Select caminho_gdb from empresas where codigo=@cod_empresa";

            var parameters = new Dictionary<string, object>();
            parameters["cod_empresa"] = cod_empresa;

            using (var connection = new FbConnection(_configuration.GetConnectionString("DB")))
            {
                var empresa = await connection.QueryAsync(statement, parameters);
                if (empresa.Count() == 0)
                {
                    return null;
                }

                string caminho = empresa.AsList()[0].CAMINHO_GDB;

                FbConnectionStringBuilder conStr = new FbConnectionStringBuilder(_configuration.GetConnectionString("DB"));               
                conStr.DataSource = caminho.Split(":", 2)?[0];
                conStr.Database = caminho.Split(":", 2)?[1];
                return new FbConnection(conStr.ConnectionString);                
            }
        }



        public static dynamic Combine(dynamic item1, dynamic item2, string prefix = "")
        {
            var dictionary1 = (IDictionary<string, object>)item1;
            var dictionary2 = (IDictionary<string, object>)item2;
            var result = new ExpandoObject();
            var d = result as IDictionary<string, object>;

            foreach (var pair in dictionary1)
            {
                d[pair.Key] = pair.Value;
            }

            foreach (var pair in dictionary2)
            {
                d[prefix + pair.Key] = pair.Value;
            }

            return result;
        }
        public static dynamic AddProp(dynamic item, object prop, string propName)
        {
            var dictionary = (IDictionary<string, object>)item;
            var result = new ExpandoObject();
            var d = result as IDictionary<string, object>;

            foreach (var pair in dictionary)
            {
                d[pair.Key] = pair.Value;
            }

            d[propName] = prop;

            return result;
        }
    }
}
