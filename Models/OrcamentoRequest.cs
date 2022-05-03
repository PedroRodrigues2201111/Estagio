using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace ConServAs.Models
{
    public class OrcamentoRequest
    {
        public string diario_ano_numdoc { get; set; }
        public string cod_cliente { get; set; }
        public string id_oportunidade { get; set; }
        public string poca_conta { get; set; }
        public int poca_enti { get; set; }
        public string enti_ncont { get; set; }
        public string enti_tel1 { get; set; }
        public string enti_telm1 { get; set; }
        public string enti_mail { get; set; }
        public LinhasOrcamento linhas { get; set; }
    }

    public class LinhasOrcamento
    {
        [JsonPropertyName("new")]
        public List<LinhaOrcamento> novas { get; set; }
        [JsonPropertyName("deleted")]
        public List<LinhaOrcamento> apagadas { get; set; }
        [JsonPropertyName("fullData")]
        public List<LinhaOrcamento> reais { get; set; }
    }
    public class LinhaOrcamento
    {
        [JsonPropertyName("Armazém")]
        public string armazem { get; set; }
        [JsonPropertyName("Referência")]
        public string referencia { get; set; }
        [JsonPropertyName("Designação")]
        public string designacao { get; set; }
        [JsonPropertyName("Quantidade")]
        public string qtd { get; set; }
        [JsonPropertyName("Comprimento")]
        public string comprimento { get; set; }
        [JsonPropertyName("Largura")]
        public string largura { get; set; }
        [JsonPropertyName("Altura")]
        public string altura { get; set; }
        [JsonPropertyName("Preço Unit.")]
        public string preco_unit { get; set; }
        [JsonPropertyName("Peso Unit.")]
        public string peso_unit { get; set; }
    }
}
