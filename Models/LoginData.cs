using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConServAs.Models
{
    public class LoginData
    {
        public string? Empresa { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }
        public bool? RememberMe { get; set; }
    }
}
