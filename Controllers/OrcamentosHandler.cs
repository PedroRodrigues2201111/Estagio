using ConServAs.Models;
using Dapper;
using FirebirdSql.Data.FirebirdClient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace ConServAs.Controllers
{
    public static class OrcamentosHandler
    {
        public static async Task<dynamic> GetOrcamentoForm(FbConnection connection, string orcamentoId)
        {
            try
            {
                string statment = @"
                    Select ic.num_processamento,
                           il.codigo_arm, il.referencia, il.descricao, il.cod_localizacao, il.cor, il.tamanho, il.stock_atual,
                           il.stock_contagem, il.ultimo_custo, il.custo_medio, il.cod_unidade, il.alterado,
                    from inventario_cabecalho ic
                    left outer join inventario_linhas il on (il.num_processamento=ic.num_processamento)
                ";

                /*var parameters = new Dictionary<string, object>();
                parameters["diario"] = orcamentoId.Split("_")[0];
                parameters["ano"] = orcamentoId.Split("_")[1];
                parameters["orcamentoId"] = orcamentoId.Split("_")[2];*/

                var cabecalho = await connection.QueryAsync(statment/*, parameters*/);

                if (cabecalho.Count() == 0)
                {
                    return null;
                }
                
                /*string diario_ano_numdoc = cabecalho.AsList()[0].DIARIO_ANO_NUMDOC;
                string clienteId = cabecalho.AsList()[0].COD_CLIENTE;
                int oportunidadeId = cabecalho.AsList()[0].ID_OPORTUNIDADE;
                int estado = cabecalho.AsList()[0].ESTADO;*/

                Dictionary<string, object> orcamentoForm = new Dictionary<string, object>();

                /*orcamentoForm["diario_ano_numdoc"] = diario_ano_numdoc;
                orcamentoForm["cod_cliente"] = clienteId;
                orcamentoForm["id_oportunidade"] = oportunidadeId;
                orcamentoForm["estado"] = estado;*/

                var linhas = new
                {
                    data = new List<Dictionary<string, object>>(),
                    fields = new[] {
                                "Arm.",
                                "Referência",
                                "Descrição",
                                "Cód. Localização",
                                "Cor",
                                "Cód. Tamanho",
                                "Stock Atual",
                                "Contagem Stock",
                                "Último Custo",
                                "Custo médio",
                                "Cód. Unidade",
                                "Alterado"
                    },
                    fieldTypes = new[] { "number", "string", "string", "string", "string", "string", "number", "number", "number", "number", "string", "string" }
                };

                /*statment = @"
                    Select lin.armazem,lin.prod_ref, lin.prod_desc, lin.prod_qtd, lin.prod_qtd_1,
                           lin.prod_qtd_2, lin.prod_qtd_3, lin.prod_qtd_4, lin.prod_preco_rec,
                           lin.peso_unitario, lin.peso_lqd, lin.peso_bruto, lin.cod_familia,
                           fam.descricao familia 
                    from gia_fment cab
                    left outer join gia_fment_linhas lin on (lin.num_doc=cab.num_doc and lin.diario=cab.diario and lin.ano=cab.ano)
                    left outer join familia fam on (fam.cod_familia=lin.cod_familia)
                    where cab.diario=@diario and cab.ano=@ano and cab.num_doc=@orcamentoId
                ";

                parameters.Clear();
                parameters["diario"] = orcamentoId.Split("_")[0];
                parameters["ano"] = orcamentoId.Split("_")[1];
                parameters["orcamentoId"] = orcamentoId.Split("_")[2];*/

                var linhasBD = await connection.QueryAsync(statment/*, parameters*/);

                if (linhasBD.Count() > 0)
                {
                    for (int i = 0; i < linhasBD.Count(); i++)
                    {
                        linhas.data.Add(new Dictionary<string, object>
                        {
                            {"Arm.", linhasBD.AsList()[i].CODIGO_ARM },
                            {"Referência", linhasBD.AsList()[i].REFERENCIA },
                            {"Descrição", linhasBD.AsList()[i].DESCRICAO },
                            {"Cód. Localização", linhasBD.AsList()[i].COD_LOCALIZACAO },
                            {"Cor", linhasBD.AsList()[i].COR },
                            {"Cód. Tamanho", linhasBD.AsList()[i].TAMANHO },
                            {"Stock Atual", linhasBD.AsList()[i].STOCK_ATUAL },
                            {"Contagem Stock", linhasBD.AsList()[i].STOCK_CONTAGEM },
                            {"Último Custo", linhasBD.AsList()[i].ULTIMO_CUSTO },
                            {"Custo médio", linhasBD.AsList()[i].CUSTO_MEDIO },
                            {"Cód. Unidade", linhasBD.AsList()[i].COD_UNIDADE },
                            {"Alterado", linhasBD.AsList()[i].ALTERADO }

                        });
                    }                 
                }

                orcamentoForm["linhas"] = linhas;

                return orcamentoForm;
            }
            catch (Exception)
            {
                return null;
            }                       
        }
        
        private static Mutex mutex = new Mutex();
        public static async Task<dynamic> SaveOrcamentoForm(OrcamentoRequest orcamentoReq, FbConnection connection)
        {
            connection.Open();
            FbTransaction transaction = connection.BeginTransaction();            
            
            int mutexAux = 0;
            Random random = new Random();
            int neg_num_doc = random.Next(-29999, -10000);
            string diario = "";
            string ano = "";
            int new_num_doc = 0;

            try
            {                                
                Dictionary<string, object> settings = await ModulesHandler.GetModuleSettings(JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(@"{ ""moduleId"": 6 }"), connection, transaction);
                Config diarioOrcamento = JsonSerializer.Deserialize<Config>(settings["diarioOrcamento"].ToString());                

                diario = diarioOrcamento.CODIGO.ToString();

                var parameters = new Dictionary<string, object>();
                parameters["diario"] = diario;

                string statement = "";

                Estados estado = Estados.Em_Curso;

                if (!string.IsNullOrEmpty(orcamentoReq.diario_ano_numdoc))
                {
                    statement = "select estado from gia_fment where diario=@diario and ano=@ano and num_doc=@num_doc";
                    parameters.Clear();
                    parameters["diario"] = orcamentoReq.diario_ano_numdoc.Split("_")[0];
                    parameters["ano"] = orcamentoReq.diario_ano_numdoc.Split("_")[1];
                    parameters["num_doc"] = orcamentoReq.diario_ano_numdoc.Split("_")[2];

                    var doc_anterior = await connection.QueryAsync(statement, parameters, transaction);
                    if (doc_anterior.Count() > 0)
                    {
                        if ((Estados)doc_anterior.AsList()[0].ESTADO == Estados.Revisao || (Estados)doc_anterior.AsList()[0].ESTADO == Estados.Adjudicado)
                            estado = Estados.Revisao;
                    }
                }

                string poca_conta = orcamentoReq.poca_conta;
                int poca_enti = orcamentoReq.poca_enti;
                int id_oportunidade = Int32.Parse(orcamentoReq.id_oportunidade);

                statement = @"Select * from CRIAR_DOC_HEADER_API(@diario,@poca_conta,@poca_enti,null,@neg_num_doc,null,current_date,null,null,null,null,null,null,null,null,null,null,null,null,null,null,@estado,null,null,null,null,null,null,null,null,null,null,null,@id_oportunidade)";

                parameters.Clear();
                parameters["diario"] = diario;
                parameters["poca_conta"] = poca_conta;
                parameters["poca_enti"] = poca_enti;
                parameters["neg_num_doc"] = neg_num_doc;
                parameters["estado"] = estado;
                parameters["id_oportunidade"] = id_oportunidade;                

                var cabDoc = await connection.QueryAsync(statement, parameters, transaction);

                if (cabDoc.Count() == 0 || cabDoc.AsList()[0].ERRO == "S")
                {
                    transaction.Rollback();
                    return null;
                }

                ano = cabDoc.AsList()[0].ANO;
                int num_doc = cabDoc.AsList()[0].NUM_DOC;

                List<LinhaOrcamento> linhas = orcamentoReq.linhas.reais;

                statement = @" Select * from CRIAR_DOC_DETAIL_API(@diario,@ano,@num_doc,@armazem,@referencia,@descricao,@qtd,null,null,@preco,null,null,null,null,null,null,null,null,null,null,null,null,null,null)";

                foreach (LinhaOrcamento linha in linhas)
                {
                    parameters.Clear();
                    parameters["diario"] = diario;
                    parameters["ano"] = ano;
                    parameters["num_doc"] = num_doc;
                    parameters["armazem"] = linha.armazem;
                    parameters["referencia"] = linha.referencia;
                    parameters["descricao"] = linha.designacao;
                    parameters["qtd"] = Decimal.Parse(linha.qtd.Replace(".", ","));
                    parameters["preco"] = Decimal.Parse(linha.preco_unit.Replace(".",","));

                    var linhaDB = await connection.QueryAsync(statement, parameters, transaction);

                    if (linhaDB.Count() == 0 || linhaDB.AsList()[0].ERRO == "S")
                    {
                        transaction.Rollback();
                        return null;
                    }
                }

                mutex.WaitOne();
                mutexAux = 1;                

                statement = @"select * from FINALIZA_DOC_API (@neg_num_doc,@diario,@ano)";
                parameters.Clear();
                parameters["diario"] = diario;
                parameters["ano"] = ano;
                parameters["neg_num_doc"] = neg_num_doc;

                cabDoc = await connection.QueryAsync(statement, parameters, transaction);

                new_num_doc = cabDoc.AsList()[0].NEW_NDOC;

                statement = @"UPDATE GIA_FMENT E SET E.NUM_DOC=@new_num_doc, e.LOCK_USER='' WHERE E.NUM_DOC=@num_doc AND E.DIARIO=@diario AND E.ANO=@ano ";
                parameters.Clear();
                parameters["diario"] = diario;
                parameters["ano"] = ano;
                parameters["new_num_doc"] = new_num_doc;
                parameters["num_doc"] = num_doc;

                await connection.QueryAsync(statement, parameters, transaction);

                if (!string.IsNullOrEmpty(orcamentoReq.diario_ano_numdoc))
                {
                    statement = @"UPDATE GIA_FMENT E SET E.ESTADO=E.ESTADO+1 WHERE E.NUM_DOC=@num_doc AND E.DIARIO=@diario AND E.ANO=@ano ";
                    parameters.Clear();
                    parameters["diario"] = orcamentoReq.diario_ano_numdoc.Split("_")[0];
                    parameters["ano"] = orcamentoReq.diario_ano_numdoc.Split("_")[1];
                    parameters["num_doc"] = orcamentoReq.diario_ano_numdoc.Split("_")[2];

                    await connection.QueryAsync(statement, parameters, transaction);
                }
            }
            catch (Exception ex)
            {
                transaction.Rollback();
            }
            finally
            {
                if (mutexAux == 1)
                {
                    transaction.Commit();
                    mutex.ReleaseMutex();
                }
            }
            return new { diario, ano, num_doc = new_num_doc };
        }

        public static async Task ChangeOrcamentoEstado(Dictionary<string, string> orcamentoInfo, FbConnection connection)
        {
            string statement = "select estado from gia_fment where diario=@diario and ano=@ano and num_doc=@num_doc";

            var parameters = new Dictionary<string, object>();
            parameters["diario"] = orcamentoInfo["diario"].ToString();
            parameters["ano"] = orcamentoInfo["ano"].ToString();
            parameters["num_doc"] = Int32.Parse(orcamentoInfo["num_doc"].ToString());

            var doc_anterior = await connection.QueryAsync(statement, parameters);
            if (doc_anterior.Count() > 0)
            {
                if (((Estados)doc_anterior.AsList()[0].ESTADO == Estados.Em_Curso && orcamentoInfo["senguinteouanterior"].ToString()=="A")
                    || ((Estados)doc_anterior.AsList()[0].ESTADO == Estados.Fase_Projecto && orcamentoInfo["senguinteouanterior"].ToString() == "S"))
                    return;
            }

            statement = @"
                update gia_fment cab
                set cab.estado=case when @senguinteouanterior='S' then cab.estado+2 else cab.estado-2 end
                where cab.diario=@diario
                and cab.ano=@ano
                and cab.num_doc=@num_doc
            ";

            parameters.Clear();
            parameters["senguinteouanterior"] = orcamentoInfo["senguinteouanterior"].ToString();
            parameters["diario"] = orcamentoInfo["diario"].ToString();
            parameters["ano"] = orcamentoInfo["ano"].ToString();
            parameters["num_doc"] = Int32.Parse(orcamentoInfo["num_doc"].ToString());            

            await connection.QueryAsync(statement, parameters);
        }

        public static async Task AnularRevisao(Dictionary<string, string> anulacaoInfo, FbConnection connection)
        {
            string statement = @"
                update gia_fment cab set cab.doc_anulado='S',
                                         cab.cod_motivo_anulacao=@cod_motivo,
                                         cab.obs_anulacao=@motivo,
                                         cab.data_anulacao=current_date+current_time,
                                         cab.operador_anulacao=@username,
                                         cab.lock_user='ANULADO',
                                         cab.bloqueado='N',
                                         cab.exportado_at='N'
                where cab.diario=@diario
                and cab.num_doc=@num_doc
                and cab.ano=@ano
            ";

            var parameters = new Dictionary<string, object>();
            parameters["cod_motivo"] = anulacaoInfo["cod_motivo"].ToString();
            parameters["motivo"] = anulacaoInfo["motivo"].ToString();
            parameters["username"] = anulacaoInfo["username"].ToString();
            parameters["diario"] = anulacaoInfo["diario"].ToString();
            parameters["ano"] = anulacaoInfo["ano"].ToString();
            parameters["num_doc"] = Int32.Parse(anulacaoInfo["num_doc"].ToString());

            //TODO - Se passar-se a usar esta API falta alterar o estado do documento anterior ao documento que estamos a anular

            await connection.QueryAsync(statement, parameters);
        }        

        public static async Task AnularOrcamento(Dictionary<string, string> anulacaoInfo, FbConnection connection)
        {
            string statement = @"
                update gia_fment cab set cab.doc_anulado='S',
                                         cab.cod_motivo_anulacao=@cod_motivo,
                                         cab.obs_anulacao=@motivo,
                                         cab.data_anulacao=current_date+current_time,
                                         cab.operador_anulacao=@username,
                                         cab.lock_user='ANULADO',
                                         cab.bloqueado='N',
                                         cab.exportado_at='N'
                where cab.diario=@diario
                and cab.oportunidade_crm=@id_oportunidade
            ";

            var parameters = new Dictionary<string, object>();
            parameters["cod_motivo"] = anulacaoInfo["cod_motivo"].ToString();
            parameters["motivo"] = anulacaoInfo["motivo"].ToString();
            parameters["username"] = anulacaoInfo["username"].ToString();
            parameters["diario"] = anulacaoInfo["diario"].ToString();
            parameters["id_oportunidade"] = Int32.Parse(anulacaoInfo["id_oportunidade"].ToString());

            await connection.QueryAsync(statement, parameters);            
        }

        public static async Task<List<Artigo>> ValidarArtigos(List<Artigo> artigos, FbConnection connection)
        {
            string statement = @"Select art.codigo_arm||'_'||art.referencia id, art.codigo_arm, art.referencia,
                                        art.designacao1, art.preco1, art.comprimento, art.largura, art.altura,
                                        art.peso_bruto, art.cod_familia, fam.descricao familia
                                 from artigo art
                                 left outer join familia fam on (fam.cod_familia=art.cod_familia)
                                 where art.codigo_arm=@codigo_arm and art.referencia=@referencia
            ";
            
            var parameters = new Dictionary<string, object>();

            for (int i = 0; i < artigos.Count; i++)
            {
                parameters.Clear();
                parameters["codigo_arm"] = artigos[i].ARMAZEM;
                parameters["referencia"] = artigos[i].REFERENCIA;

                var artigoDB = await connection.QueryAsync(statement, parameters);

                if (artigoDB.Count() > 0)
                {
                    artigos[i].DESIGNACAO1 = artigoDB.AsList()[0].DESIGNACAO1;
                    artigos[i].PRECO1 = artigoDB.AsList()[0].PRECO1;
                    artigos[i].COMPRIMENTO = long.Parse(artigoDB.AsList()[0].COMPRIMENTO.ToString());
                    artigos[i].LARGURA = Int32.Parse(artigoDB.AsList()[0].LARGURA.ToString());
                    artigos[i].ALTURA = long.Parse(artigoDB.AsList()[0].ALTURA.ToString());
                    artigos[i].PESO_BRUTO = long.Parse(artigoDB.AsList()[0].PESO_BRUTO.ToString());
                    artigos[i].COD_FAMILIA = artigoDB.AsList()[0].COD_FAMILIA;
                    artigos[i].FAMILIA = artigoDB.AsList()[0].FAMILIA;
                }
                else
                    artigos[i] = null;
            }

            return artigos;
        }
    }
}