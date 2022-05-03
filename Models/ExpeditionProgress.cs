using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConServAs.Models
{
    public class ExpeditionProgress
    {
        public string num_doc { get; set; }
        public List<Picagem> picagens { get; set; }
        public string[] linhas { get; set; }
    }
}
