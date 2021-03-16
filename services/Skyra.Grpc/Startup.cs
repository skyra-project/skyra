using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Skyra.Database;
using Skyra.Grpc.Services;

namespace Skyra.Grpc
{
	public class Startup
	{
		// This method gets called by the runtime. Use this method to add services to the container.
		// For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
		public void ConfigureServices(IServiceCollection services)
		{
			services.AddGrpc();
			services.AddScoped<SkyraDbContext>();
			services.AddScoped<IDatabase, SkyraDatabase>();
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
			}

			app.UseRouting();

			app.UseEndpoints(endpoints =>
			{
				endpoints.MapGrpcService<GiveawayService>();
				endpoints.MapGrpcService<GuildService>();
				endpoints.MapGrpcService<MemberService>();
				endpoints.MapGrpcService<ScheduleService>();
				endpoints.MapGrpcService<SocialService>();
				endpoints.MapGrpcService<StarboardService>();
				endpoints.MapGrpcService<UserService>();
				endpoints.MapGrpcService<RunnerService>();

				endpoints.MapGet("/",
					async context =>
					{
						await context.Response.WriteAsync(
							"Communication with gRPC endpoints must be made through a gRPC client. To learn how to create a client, visit: https://go.microsoft.com/fwlink/?linkid=2086909");
					});
			});
		}
	}
}
