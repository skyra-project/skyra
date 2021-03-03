using System;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Grpc.Core;
using Microsoft.Extensions.Logging;
using Skyra.Database;
using Status = Skyra.Grpc.Services.Shared.Status;

namespace Skyra.Grpc.Services
{
	public class RunnerService : Runner.RunnerBase
	{
		private readonly IDatabase _database;
		private readonly ILogger<RunnerService> _logger;

		public RunnerService(IDatabase database, ILogger<RunnerService> logger)
		{
			_database = database;
			_logger = logger;
		}

		public override async Task<RunnerRunResult> Run(RunnerRunQuery request, ServerCallContext context)
		{
			try
			{
				var result = await _database.ExecuteSqlAsync(request.Query);
				if (!result.Success)
				{
					_logger.LogError("Received Error: {Error}", result.ExceptionMessage);
					return new RunnerRunResult {Status = Status.Failed};
				}

				var pairs = result.Value!;

				await using var stream = new MemoryStream();
				await using var jsonWriter = new Utf8JsonWriter(stream);

				jsonWriter.WriteStartObject();

				foreach (var (name, value) in pairs)
				{
					jsonWriter.WriteString(name, value);
				}

				jsonWriter.WriteEndObject();
				await jsonWriter.FlushAsync();

				var finalJson = Encoding.UTF8.GetString(stream.ToArray());

				return new RunnerRunResult
				{
					Status = Status.Success,
					Result = finalJson
				};
			}
			catch (Exception e)
			{
				_logger.LogCritical("Received Error: {Error}", e.ToString());
				return new RunnerRunResult {Status = Status.Failed};
			}
		}
	}
}
