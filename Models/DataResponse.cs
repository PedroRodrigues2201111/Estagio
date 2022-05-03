using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace ConServAs.Models
{
    public class DataResponse
    {
        public List<Linha> linhas { get; set; }
        public List<Referencia> referencias { get; set; }
        public List<Artigo> artigos { get; set; }
        public List<Lote> lotes { get; set; }
        public List<Localizacao> localizacoes { get; set; }
        public List<Stock> stocks { get; set; }
        public List<Tamanho> tamanhos { get; set; }
        public List<Cor> cores { get; set; }
        public List<Caracteristica> caracteristicas { get; set; }
        public List<ValorCaracteristica> caractValor { get; set; }
        public List<Picagem> picagens { get; set; }

    }

    public class Linha
    {

        [JsonPropertyName("ABATE_VENDA")]
        public string ABATE_VENDA { get; set; }

        [JsonPropertyName("ANO")]
        public string ANO { get; set; }

        [JsonPropertyName("ARMAZEM")]
        public string ARMAZEM { get; set; }

        [JsonPropertyName("CARACT01")]
        public string CARACT01 { get; set; }

        [JsonPropertyName("CARACT02")]
        public string CARACT02 { get; set; }

        [JsonPropertyName("CARACT03")]
        public string CARACT03 { get; set; }

        [JsonPropertyName("CARACT04")]
        public string CARACT04 { get; set; }

        [JsonPropertyName("CARACT05")]
        public string CARACT05 { get; set; }

        [JsonPropertyName("CARACT06")]
        public string CARACT06 { get; set; }

        [JsonPropertyName("CARACT07")]
        public string CARACT07 { get; set; }

        [JsonPropertyName("CARACT08")]
        public string CARACT08 { get; set; }

        [JsonPropertyName("CARACT09")]
        public string CARACT09 { get; set; }

        [JsonPropertyName("CARACT10")]
        public string CARACT10 { get; set; }

        [JsonPropertyName("COMPOSTO_TIPO")]
        public string COMPOSTO_TIPO { get; set; }

        [JsonPropertyName("COR")]
        public string COR { get; set; }

        [JsonPropertyName("CTRL_CARACT")]
        public string CTRL_CARACT { get; set; }

        [JsonPropertyName("CTRL_CORES")]
        public string CTRL_CORES { get; set; }

        [JsonPropertyName("CTRL_LOCALIZACAO")]
        public string CTRL_LOCALIZACAO { get; set; }

        [JsonPropertyName("CTRL_LOTE")]
        public string CTRL_LOTE { get; set; }

        [JsonPropertyName("CTRL_NSERIE")]
        public string CTRL_NSERIE { get; set; }

        [JsonPropertyName("CTRL_TAMANHOS")]
        public string CTRL_TAMANHOS { get; set; }

        [JsonPropertyName("DATA_ENTREGA")]
        public string DATA_ENTREGA { get; set; }

        [JsonPropertyName("DESCRICAO")]
        public string DESCRICAO { get; set; }

        [JsonPropertyName("DIARIO")]
        public string DIARIO { get; set; }

        [JsonPropertyName("ENCOMENDA")]
        public string ENCOMENDA { get; set; }

        [JsonPropertyName("E_COMPOSTO")]
        public string E_COMPOSTO { get; set; }

        [JsonPropertyName("ID")]
        public string ID { get; set; }

        [JsonPropertyName("ID_ARTIGO")]
        public string ID_ARTIGO { get; set; }

        [JsonPropertyName("LINHA_PARENT")]
        public long? LINHA_PARENT { get; set; }

        [JsonPropertyName("LOCALIZACAO")]
        public string LOCALIZACAO { get; set; }

        [JsonPropertyName("LOTE")]
        public string LOTE { get; set; }

        [JsonPropertyName("MOV_STOCK")]
        public string MOV_STOCK { get; set; }

        [JsonPropertyName("NUM_DOC")]
        public long? NUM_DOC { get; set; }

        [JsonPropertyName("N_LINHA")]
        public long? N_LINHA { get; set; }

        [JsonPropertyName("PROD_CUNIT")]
        public long? PROD_CUNIT { get; set; }

        [JsonPropertyName("PROD_QTD")]
        public long? PROD_QTD { get; set; }

        [JsonPropertyName("PROD_QTD_EMB")]
        public long? PROD_QTD_EMB { get; set; }

        [JsonPropertyName("PROD_QTD_LIQ")]
        public long? PROD_QTD_LIQ { get; set; }

        [JsonPropertyName("REFERENCIA")]
        public string REFERENCIA { get; set; }

        [JsonPropertyName("TAMANHO")]
        public string TAMANHO { get; set; }

        [JsonPropertyName("TAMANHO1")]
        public long? TAMANHO1 { get; set; }

        [JsonPropertyName("TAMANHO2")]
        public long? TAMANHO2 { get; set; }

        [JsonPropertyName("UNID_MD")]
        public string UNID_MD { get; set; }
    }

    public class LinhaInventario: Linha
    {
        [JsonPropertyName("STOCK_ACTUAL")]
        public double STOCK_ACTUAL { get; set; }
        [JsonPropertyName("STOCK_ACTUAL2")]
        public double STOCK_ACTUAL2 { get; set; }
    }

    public class Referencia
    {

        [JsonPropertyName("ARMAZEM")]
        public string ARMAZEM { get; set; }

        [JsonPropertyName("CARACT01")]
        public string CARACT01 { get; set; }

        [JsonPropertyName("CARACT02")]
        public string CARACT02 { get; set; }

        [JsonPropertyName("CARACT03")]
        public string CARACT03 { get; set; }

        [JsonPropertyName("CARACT04")]
        public string CARACT04 { get; set; }

        [JsonPropertyName("CARACT05")]
        public string CARACT05 { get; set; }

        [JsonPropertyName("CARACT06")]
        public string CARACT06 { get; set; }

        [JsonPropertyName("CARACT07")]
        public string CARACT07 { get; set; }

        [JsonPropertyName("CARACT08")]
        public string CARACT08 { get; set; }

        [JsonPropertyName("CARACT09")]
        public string CARACT09 { get; set; }

        [JsonPropertyName("CARACT10")]
        public string CARACT10 { get; set; }

        [JsonPropertyName("COD")]
        public string COD { get; set; }

        [JsonPropertyName("COD_COR")]
        public string COD_COR { get; set; }

        [JsonPropertyName("COD_TAMANHO")]
        public string COD_TAMANHO { get; set; }

        [JsonPropertyName("DESCRICAO_EQUIVALENTE")]
        public string DESCRICAO_EQUIVALENTE { get; set; }

        [JsonPropertyName("ID_ARTIGO")]
        public string ID_ARTIGO { get; set; }

        [JsonPropertyName("QTD")]
        public long? QTD { get; set; }

        [JsonPropertyName("REFERENCIA")]
        public string REFERENCIA { get; set; }
    }

    public class Artigo
    {

        [JsonPropertyName("ABATE_VENDA")]
        public string ABATE_VENDA { get; set; }

        [JsonPropertyName("ABSOLETO")]
        public string ABSOLETO { get; set; }

        [JsonPropertyName("ALTURA")]
        public long? ALTURA { get; set; }

        [JsonPropertyName("ARMAZEM")]
        public string ARMAZEM { get; set; }

        [JsonPropertyName("CAMPO_USER1")]
        public string CAMPO_USER1 { get; set; }

        [JsonPropertyName("CAMPO_USER2")]
        public string CAMPO_USER2 { get; set; }

        [JsonPropertyName("CAMPO_USER3")]
        public string CAMPO_USER3 { get; set; }

        [JsonPropertyName("CAMPO_USER4")]
        public string CAMPO_USER4 { get; set; }

        [JsonPropertyName("CAMPO_USER5")]
        public string CAMPO_USER5 { get; set; }

        [JsonPropertyName("CAMPO_USER6")]
        public string CAMPO_USER6 { get; set; }

        [JsonPropertyName("CAMPO_USER7")]
        public string CAMPO_USER7 { get; set; }

        [JsonPropertyName("CAMPO_USER8")]
        public string CAMPO_USER8 { get; set; }

        [JsonPropertyName("CAMPO_USER9")]
        public string CAMPO_USER9 { get; set; }

        [JsonPropertyName("CAMPO_USER10")]
        public string CAMPO_USER10 { get; set; }

        [JsonPropertyName("CAMPO_USER11")]
        public string CAMPO_USER11 { get; set; }

        [JsonPropertyName("CAMPO_USER12")]
        public string CAMPO_USER12 { get; set; }

        [JsonPropertyName("CAMPO_USER13")]
        public string CAMPO_USER13 { get; set; }

        [JsonPropertyName("CAMPO_USER14")]
        public string CAMPO_USER14 { get; set; }

        [JsonPropertyName("CAMPO_USER15")]
        public string CAMPO_USER15 { get; set; }

        [JsonPropertyName("CAMPO_USER16")]
        public string CAMPO_USER16 { get; set; }

        [JsonPropertyName("CAMPO_USER17")]
        public string CAMPO_USER17 { get; set; }

        [JsonPropertyName("CAMPO_USER18")]
        public string CAMPO_USER18 { get; set; }

        [JsonPropertyName("CAMPO_USER19")]
        public string CAMPO_USER19 { get; set; }

        [JsonPropertyName("CAMPO_USER20")]
        public string CAMPO_USER20 { get; set; }

        [JsonPropertyName("CAMPO_USER21")]
        public string CAMPO_USER21 { get; set; }

        [JsonPropertyName("CAMPO_USER22")]
        public string CAMPO_USER22 { get; set; }

        [JsonPropertyName("CAMPO_USER23")]
        public string CAMPO_USER23 { get; set; }

        [JsonPropertyName("COD_UNIDADE")]
        public string COD_UNIDADE { get; set; }

        [JsonPropertyName("COMPRIMENTO")]
        public long? COMPRIMENTO { get; set; }

        [JsonPropertyName("CONTROLA_LOC")]
        public string CONTROLA_LOC { get; set; }

        [JsonPropertyName("CTRL_CARACT")]
        public string CTRL_CARACT { get; set; }

        [JsonPropertyName("CTRL_COR")]
        public string CTRL_COR { get; set; }

        [JsonPropertyName("CTRL_TAMANHOS")]
        public string CTRL_TAMANHOS { get; set; }

        [JsonPropertyName("DESIGNACAO1")]
        public string DESIGNACAO1 { get; set; }

        [JsonPropertyName("DESIGNACAO2")]
        public string DESIGNACAO2 { get; set; }

        [JsonPropertyName("DESIGNACAO3")]
        public string DESIGNACAO3 { get; set; }

        [JsonPropertyName("DESIGNACAO4")]
        public string DESIGNACAO4 { get; set; }

        [JsonPropertyName("DESIGNACAO5")]
        public string DESIGNACAO5 { get; set; }

        [JsonPropertyName("DESIGNACAO6")]
        public string DESIGNACAO6 { get; set; }

        [JsonPropertyName("D_VALIDADE")]
        public string D_VALIDADE { get; set; }

        [JsonPropertyName("E_COMPONENTE")]
        public string E_COMPONENTE { get; set; }

        [JsonPropertyName("E_COMPOSTO")]
        public string E_COMPOSTO { get; set; }

        [JsonPropertyName("ID_ARTIGO")]
        public string ID_ARTIGO { get; set; }

        [JsonPropertyName("LARGURA")]
        public int? LARGURA { get; set; }

        [JsonPropertyName("MONO")]
        public string MONO { get; set; }

        [JsonPropertyName("MOV_STOCKS")]
        public string MOV_STOCKS { get; set; }

        [JsonPropertyName("NVOLUMES")]
        public long? NVOLUMES { get; set; }

        [JsonPropertyName("PESO_BRUTO")]
        public long? PESO_BRUTO { get; set; }

        [JsonPropertyName("PESO_LQD")]
        public long? PESO_LQD { get; set; }

        [JsonPropertyName("QTD_CAIXA")]
        public long? QTD_CAIXA { get; set; }

        [JsonPropertyName("QTD_EMBAL")]
        public long? QTD_EMBAL { get; set; }

        [JsonPropertyName("QTD_LOTE")]
        public long? QTD_LOTE { get; set; }

        [JsonPropertyName("QTD_PALETE")]
        public long? QTD_PALETE { get; set; }

        [JsonPropertyName("QTD_UNIDADE")]
        public long? QTD_UNIDADE { get; set; }

        [JsonPropertyName("QUANT_EMBAL")]
        public long? QUANT_EMBAL { get; set; }

        [JsonPropertyName("REFERENCIA")]
        public string REFERENCIA { get; set; }

        [JsonPropertyName("SERIES_MATRICULAS")]
        public string SERIES_MATRICULAS { get; set; }

        [JsonPropertyName("STOCK_ACTUAL")]
        public long? STOCK_ACTUAL { get; set; }

        [JsonPropertyName("STOCK_MAXIMO")]
        public long? STOCK_MAXIMO { get; set; }

        [JsonPropertyName("STOCK_MINIMO")]
        public long? STOCK_MINIMO { get; set; }

        [JsonPropertyName("ST_CAIXA")]
        public string ST_CAIXA { get; set; }

        [JsonPropertyName("ST_EMBAL")]
        public string ST_EMBAL { get; set; }

        [JsonPropertyName("ST_LOTE")]
        public string ST_LOTE { get; set; }

        [JsonPropertyName("ST_PALETE")]
        public string ST_PALETE { get; set; }

        [JsonPropertyName("ST_UNIDADE")]
        public string ST_UNIDADE { get; set; }

        [JsonPropertyName("SUBSTITUIDA")]
        public string SUBSTITUIDA { get; set; }

        [JsonPropertyName("SUSPENSA")]
        public string SUSPENSA { get; set; }

        [JsonPropertyName("VOLUME")]
        public long? VOLUME { get; set; }

        [JsonPropertyName("PRECO1")]
        public decimal? PRECO1 { get; set; }

        [JsonPropertyName("COD_FAMILIA")]
        public string COD_FAMILIA { get; set; }

        [JsonPropertyName("FAMILIA")]
        public string FAMILIA { get; set; }
    }

    public class Lote
    {

        [JsonPropertyName("OUT_ARMAZEM")]
        public string OUT_ARMAZEM { get; set; }

        [JsonPropertyName("OUT_COD_LOTE")]
        public string OUT_COD_LOTE { get; set; }

        [JsonPropertyName("OUT_DATA_VALIDADE")]
        public DateTime OUT_DATA_VALIDADE { get; set; }

        [JsonPropertyName("OUT_DESC_LOTE")]
        public string OUT_DESC_LOTE { get; set; }

        [JsonPropertyName("OUT_ID_ARTIGO")]
        public string OUT_ID_ARTIGO { get; set; }

        [JsonPropertyName("OUT_QTD_LOTE")]
        public long? OUT_QTD_LOTE { get; set; }

        [JsonPropertyName("OUT_QTD_LOTE2")]
        public long? OUT_QTD_LOTE2 { get; set; }

        [JsonPropertyName("OUT_REFERENCIA")]
        public string OUT_REFERENCIA { get; set; }
    }

    public class Localizacao
    {

        [JsonPropertyName("OUT_ARMAZEM")]
        public string OUT_ARMAZEM { get; set; }

        [JsonPropertyName("OUT_ID_ARTIGO")]
        public string OUT_ID_ARTIGO { get; set; }

        [JsonPropertyName("OUT_REFERENCIA")]
        public string OUT_REFERENCIA { get; set; }

        [JsonPropertyName("OUT_DESC_LOCALIZACAO")]
        public string OUT_DESC_LOCALIZACAO { get; set; }

        [JsonPropertyName("OUT_QTD")]
        public long? OUT_QTD { get; set; }

        [JsonPropertyName("OUT_QTD2")]
        public long? OUT_QTD2 { get; set; }

        [JsonPropertyName("OUT_COD_LOCALIZACAO")]
        public string OUT_COD_LOCALIZACAO { get; set; }
    }

    public class Stock
    {

        [JsonPropertyName("CARACT01")]
        public string CARACT01 { get; set; }

        [JsonPropertyName("CARACT02")]
        public string CARACT02 { get; set; }

        [JsonPropertyName("CARACT03")]
        public string CARACT03 { get; set; }

        [JsonPropertyName("CARACT04")]
        public string CARACT04 { get; set; }

        [JsonPropertyName("CARACT05")]
        public string CARACT05 { get; set; }

        [JsonPropertyName("CARACT06")]
        public string CARACT06 { get; set; }

        [JsonPropertyName("CARACT07")]
        public string CARACT07 { get; set; }

        [JsonPropertyName("CARACT08")]
        public string CARACT08 { get; set; }

        [JsonPropertyName("CARACT09")]
        public string CARACT09 { get; set; }

        [JsonPropertyName("CARACT10")]
        public string CARACT10 { get; set; }

        [JsonPropertyName("CODIGO_ARM")]
        public string CODIGO_ARM { get; set; }

        [JsonPropertyName("COD_COR")]
        public string COD_COR { get; set; }

        [JsonPropertyName("COD_LOCALIZACAO")]
        public string COD_LOCALIZACAO { get; set; }

        [JsonPropertyName("COD_LOTE")]
        public string COD_LOTE { get; set; }

        [JsonPropertyName("COD_TAMANHO")]
        public string COD_TAMANHO { get; set; }

        [JsonPropertyName("CONSIGNACOES")]
        public long? CONSIGNACOES { get; set; }

        [JsonPropertyName("CONSIGNACOES2")]
        public long? CONSIGNACOES2 { get; set; }

        [JsonPropertyName("CONSIGNACOES2_FOR")]
        public long? CONSIGNACOES2_FOR { get; set; }

        [JsonPropertyName("CONSIGNACOES_FOR")]
        public long? CONSIGNACOES_FOR { get; set; }

        [JsonPropertyName("ID_STOCK")]
        public string ID_STOCK { get; set; }

        [JsonPropertyName("MERCADORIAS_TRANSITO")]
        public long? MERCADORIAS_TRANSITO { get; set; }

        [JsonPropertyName("MERCADORIAS_TRANSITO2")]
        public long? MERCADORIAS_TRANSITO2 { get; set; }

        [JsonPropertyName("MERCADORIAS_TRANSITO2_FOR")]
        public long? MERCADORIAS_TRANSITO2_FOR { get; set; }

        [JsonPropertyName("MERCADORIAS_TRANSITO_FOR")]
        public long? MERCADORIAS_TRANSITO_FOR { get; set; }

        [JsonPropertyName("NECESSIDADES")]
        public long? NECESSIDADES { get; set; }

        [JsonPropertyName("NECESSIDADES2")]
        public long? NECESSIDADES2 { get; set; }

        [JsonPropertyName("OBRAS_EM_CURSO")]
        public long? OBRAS_EM_CURSO { get; set; }

        [JsonPropertyName("OBRAS_EM_CURSO2")]
        public long? OBRAS_EM_CURSO2 { get; set; }

        [JsonPropertyName("QTD_ENC_CLIENTE")]
        public long? QTD_ENC_CLIENTE { get; set; }

        [JsonPropertyName("QTD_ENC_CLIENTE2")]
        public long? QTD_ENC_CLIENTE2 { get; set; }

        [JsonPropertyName("QTD_ENC_FORN")]
        public long? QTD_ENC_FORN { get; set; }

        [JsonPropertyName("QTD_ENC_FORN2")]
        public long? QTD_ENC_FORN2 { get; set; }

        [JsonPropertyName("REFERENCIA")]
        public string REFERENCIA { get; set; }

        [JsonPropertyName("STOCK_ACTUAL")]
        public long? STOCK_ACTUAL { get; set; }

        [JsonPropertyName("STOCK_ACTUAL2")]
        public long? STOCK_ACTUAL2 { get; set; }

        [JsonPropertyName("TRANSPORTE_ACTIVOS")]
        public long? TRANSPORTE_ACTIVOS { get; set; }

        [JsonPropertyName("TRANSPORTE_ACTIVOS2")]
        public long? TRANSPORTE_ACTIVOS2 { get; set; }

    }

    public class Tamanho
    {

        [JsonPropertyName("ARMAZEM")]
        public string ARMAZEM { get; set; }

        [JsonPropertyName("COD_TAMANHO")]
        public string COD_TAMANHO { get; set; }

        [JsonPropertyName("DESCRICAO_TAMANHO")]
        public string DESCRICAO_TAMANHO { get; set; }

        [JsonPropertyName("ID_ARTIGO")]
        public string ID_ARTIGO { get; set; }

        [JsonPropertyName("REFERENCIA")]
        public string REFERENCIA { get; set; }

        [JsonPropertyName("TAMANHO1")]
        public long? TAMANHO1 { get; set; }

        [JsonPropertyName("TAMANHO2")]
        public long? TAMANHO2 { get; set; }

        [JsonPropertyName("TIPO")]
        public string TIPO { get; set; }

        [JsonPropertyName("TOLERANCIA")]
        public long? TOLERANCIA { get; set; }

        [JsonPropertyName("TOLERANCIA2")]
        public long? TOLERANCIA2 { get; set; }

    }


    public class Cor
    {


        [JsonPropertyName("ARMAZEM")]
        public string ARMAZEM { get; set; }

        [JsonPropertyName("COD_COR")]
        public string COD_COR { get; set; }

        [JsonPropertyName("DESCRICAO_COR")]
        public string DESCRICAO_COR { get; set; }

        [JsonPropertyName("ID_ARTIGO")]
        public string ID_ARTIGO { get; set; }

        [JsonPropertyName("REFERENCIA")]
        public string REFERENCIA { get; set; }
    }

    public class Caracteristica
    {
        public string[] GetCaracteristicas()
        {
            return new string[] {
                COD_CARACT01,
                COD_CARACT02,
                COD_CARACT03,
                COD_CARACT04,
                COD_CARACT05,
                COD_CARACT06,
                COD_CARACT07,
                COD_CARACT08,
                COD_CARACT09,
                COD_CARACT10
            };
        }

        [JsonPropertyName("ARMAZEM")]
        public string ARMAZEM { get; set; }

        [JsonPropertyName("COD_CARACT01")]
        public string COD_CARACT01 { get; set; }

        [JsonPropertyName("COD_CARACT02")]
        public string COD_CARACT02 { get; set; }

        [JsonPropertyName("COD_CARACT03")]
        public string COD_CARACT03 { get; set; }

        [JsonPropertyName("COD_CARACT04")]
        public string COD_CARACT04 { get; set; }

        [JsonPropertyName("COD_CARACT05")]
        public string COD_CARACT05 { get; set; }

        [JsonPropertyName("COD_CARACT06")]
        public string COD_CARACT06 { get; set; }

        [JsonPropertyName("COD_CARACT07")]
        public string COD_CARACT07 { get; set; }

        [JsonPropertyName("COD_CARACT08")]
        public string COD_CARACT08 { get; set; }

        [JsonPropertyName("COD_CARACT09")]
        public string COD_CARACT09 { get; set; }

        [JsonPropertyName("COD_CARACT10")]
        public string COD_CARACT10 { get; set; }

        [JsonPropertyName("DESCRICAO_CARACT01")]
        public string DESCRICAO_CARACT01 { get; set; }

        [JsonPropertyName("DESCRICAO_CARACT02")]
        public string DESCRICAO_CARACT02 { get; set; }

        [JsonPropertyName("DESCRICAO_CARACT03")]
        public string DESCRICAO_CARACT03 { get; set; }

        [JsonPropertyName("DESCRICAO_CARACT04")]
        public string DESCRICAO_CARACT04 { get; set; }

        [JsonPropertyName("DESCRICAO_CARACT05")]
        public string DESCRICAO_CARACT05 { get; set; }

        [JsonPropertyName("DESCRICAO_CARACT06")]
        public string DESCRICAO_CARACT06 { get; set; }

        [JsonPropertyName("DESCRICAO_CARACT07")]
        public string DESCRICAO_CARACT07 { get; set; }

        [JsonPropertyName("DESCRICAO_CARACT08")]
        public string DESCRICAO_CARACT08 { get; set; }

        [JsonPropertyName("DESCRICAO_CARACT09")]
        public string DESCRICAO_CARACT09 { get; set; }

        [JsonPropertyName("DESCRICAO_CARACT10")]
        public string DESCRICAO_CARACT10 { get; set; }

        [JsonPropertyName("ID_ARTIGO")]
        public string ID_ARTIGO { get; set; }

        [JsonPropertyName("REFERENCIA")]
        public string REFERENCIA { get; set; }

    }

    public class ValorCaracteristica
    {

        [JsonPropertyName("CODIGO")]
        public string CODIGO { get; set; }

        [JsonPropertyName("CODIGO_LINHA")]
        public string CODIGO_LINHA { get; set; }

        [JsonPropertyName("DESCRICAO")]
        public string DESCRICAO { get; set; }

    }

    public class Armazem
    {
        [JsonPropertyName("CODIGO_ARM")]
        public string CODIGO_ARM { get; set; }

        [JsonPropertyName("NOME")]
        public string NOME { get; set; }
    }
}