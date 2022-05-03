using System;

namespace ConServAs.Models
{
    public class Picagem
    {
        public string id { get; set; }
        public string id_linha { get; set; }
        public string pick_id { get; set; }
        public string tipo_ajuste { get; set; }
        public Produto produto { get; set; }
        public LocalDestino localDestino { get; set; }
        public DateTime data_hora { get; set; }   
    }
    

    public class LocalDestino
    {
        public string armazem { get; set; }
        public string localizacao { get; set; }
    }
}