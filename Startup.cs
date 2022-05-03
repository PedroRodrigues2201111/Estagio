using ConServAs.Models;
using ConServAs.SignalR;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Serialization;

namespace ConServAs
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
            StaticConfig = configuration;
        }

        public IConfiguration Configuration { get; }
        public static IConfiguration StaticConfig { get; private set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSignalR();            

            services.AddResponseCompression();
            services.AddDirectoryBrowser();
           // services.AddControllers(); 
            services.AddControllers(x => x.AllowEmptyInputInBodyModelBinding = true);

        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILogger<Startup> logger)
        {
            Dapper.SqlMapper.AddTypeMap(typeof(string), System.Data.DbType.AnsiString);
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

            app.UseResponseCompression();

            app.UseDefaultFiles(new DefaultFilesOptions
            {
                FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "SPA", "build", "pwa")),
                RequestPath = ""
            });

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "SPA", "build", "pwa")),
                RequestPath = "",
                HttpsCompression = Microsoft.AspNetCore.Http.Features.HttpsCompressionMode.Compress
            });


            logger.LogInformation("Initializing app middlewares");

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDirectoryBrowser();
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthentication();            

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<ControlServerHub>("/ControlServerHub");
            });
        }        
    }
}
