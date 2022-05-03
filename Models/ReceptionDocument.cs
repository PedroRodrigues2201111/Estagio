using System;
using System.Collections.Generic;

namespace ConServAs.Models
{
    public class ReceptionDocument
    {
        public List<string> selected_picks { get; set; }
        public string num_req { get; set; }
        public DateTime data_doc { get; set; }
    }
}