using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using AngleSharp;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Skyra.Database;
using Skyra.Grpc.Services;
using Skyra.Notifications.Models;
using Skyra.Notifications.Services;
using YoutubeSubscription = Skyra.Database.Models.Entities.YoutubeSubscription;

namespace Skyra.Notifications
{
	public class Startup
	{
		// This method gets called by the runtime. Use this method to add services to the container.
		// For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
		public void ConfigureServices(IServiceCollection services)
		{
			services.AddSingleton(new ConcurrentQueue<Notification>());
			services.AddSingleton<IDatabase, SkyraDatabase>();
			services.AddSingleton<PubSubClient>();
			services.AddSingleton<SubscriptionManager>();
			services.AddSingleton<RequestCache>();
			services.AddSingleton<HttpClient>();
			services.AddSingleton<SkyraDbContext>();
			services.AddSingleton<IBrowsingContext>(BrowsingContext.New(Configuration.Default.WithDefaultLoader()));

			services.AddGrpc();

			services.AddControllers();

			services.AddLogging(options =>
			{
				options.AddSimpleConsole(console =>
				{
					console.TimestampFormat = "[yyyy-MM-dd HH:mm:ss] ";
				});
			});
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{

			app.UseRouting();

			app.UseEndpoints(endpoints =>
			{
				endpoints.MapControllers();
				endpoints.MapGrpcService<YoutubeService>();
			});
		}
	}
}
