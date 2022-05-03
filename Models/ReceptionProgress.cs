using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConServAs.Models
{
    public class ReceptionProgress
    {
        public List<Picagem> picagens { get; set; } 
        
        public string[] linhas { get; set; }
    }
}
