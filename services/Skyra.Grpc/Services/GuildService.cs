using System.Text.Json;
using System.Threading.Tasks;
using Grpc.Core;
using Skyra.Database;
using Skyra.Grpc.Services.Shared;
using Status = Skyra.Grpc.Services.Shared.Status;

namespace Skyra.Grpc.Services
{
	public class GuildService : Guild.GuildBase
	{
		private readonly IDatabase _database;

		public GuildService(IDatabase database)
		{
			_database = database;
		}

		public override async Task<GuildResult> Get(GuildQuery request, ServerCallContext context)
		{
			var result = await _database.GetGuildAsync(request.Id);
			if (!result.Success)
			{
				return new GuildResult {Status = Status.Failed};
			}

			var output = new GuildResult
			{
				Status = Status.Success
			};
			if (result.Value is not null)
			{
				output.Data = JsonSerializer.Serialize(result.Value);
			}

			return output;
		}

		public override async Task<GuildResult> Update(GuildUpdateQuery request, ServerCallContext context)
		{
			var result = await _database.UpdateGuildAsync(request.Id, request.Data);
			if (result.Success)
			{
				return new GuildResult
				{
					Status = Status.Success,
					Data = JsonSerializer.Serialize(result.Value)
				};
			}

			return new GuildResult {Status = Status.Failed};
		}

		public override async Task<Result> Delete(GuildQuery request, ServerCallContext context)
		{
			var result = await _database.DeleteGuildAsync(request.Id);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}
	}
}
