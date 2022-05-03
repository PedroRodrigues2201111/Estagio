using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace ConServAs.SignalR
{
    public class ControlServerHub : Hub
    {
        public async Task Hello()
        {
            await Clients.All.SendAsync("Hi", this.Context.User.Identity.Name);
        }
    }
}
