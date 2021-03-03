using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skyra.Database;

namespace Skyra.IntegrationTests.Database
{
	public static class Utils
	{
		private const string DbName = "skyra-dotnet-test";

		public static async Task WipeDb()
		{
			await using var context = GetContext();

			var name = context.Database.GetDbConnection().Database;

			if (name != DbName)
			{
				Console.Error.WriteLine(
					$"Exiting tests due to database name not being {DbName}, database name was {name}");
				Environment.Exit(-1);
			}

			context.Users.RemoveRange(context.Users);
			context.Members.RemoveRange(context.Members);
			context.Starboards.RemoveRange(context.Starboards);

			await context.SaveChangesAsync();
		}

		public static SkyraDbContext GetContext()
		{
			var optionsBuilder = new DbContextOptionsBuilder<SkyraDbContext>();

			var user = Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "postgres";
			var password = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD") ?? "postgres";
			var host = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
			var port = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
			var name = DbName;

			optionsBuilder.UseNpgsql(
				$"User ID={user};Password={password};Server={host};Port={port};Database={name};Pooling=true;",
				options => options.EnableRetryOnFailure()).UseSnakeCaseNamingConvention();

			return new SkyraDbContext(optionsBuilder.Options);
		}

		public static HttpClientHandler GetHandler() => new()
		{
			ServerCertificateCustomValidationCallback =
				HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
		};
	}
}
