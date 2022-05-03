using System;
using System.Collections.Generic;

namespace ConServAs.Models
{
    public class Produto
    {
        public string armazem { get; set; }
        public string referencia { get; set; }
        public double? quantidade { get; set; }
        public double? quantidade2 { get; set; }
        public DateTime? validade { get; set; }
        public string[] numerosSeries { get; set; }
        public string lote { get; set; }
        public string localizacao { get; set; }
        public string codTamanho { get; set; }
        public double? tamanho1 { get; set; }
        public double? tamanho2 { get; set; }
        public string codCor { get; set; }
        public string[] caracteristicas { get; set; }


    }
}