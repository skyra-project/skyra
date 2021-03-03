using System.Linq;
using System.Threading.Tasks;
using Grpc.Core;
using Skyra.Database;
using Skyra.Shared.Results;
using Status = Skyra.Grpc.Services.Shared.Status;

namespace Skyra.Grpc.Services
{
	public class StarboardService : Starboard.StarboardBase
	{
		private readonly IDatabase _database;

		public StarboardService(IDatabase database)
		{
			_database = database;
		}

		public override async Task<StarboardGetResult> Get(StarboardGetQuery request, ServerCallContext context)
		{
			var result = await _database.GetStarboardAsync(request.ChannelId, request.MessageId);
			return HandleResult(result);
		}

		public override async Task<StarboardGetResult> GetRandom(StarboardGetRandomQuery request,
			ServerCallContext context)
		{
			var result = await _database.GetStarboardAsync(request.GuildId,
				string.IsNullOrEmpty(request.UserId) ? null : request.UserId, request.Time?.ToDateTime());
			return HandleResult(result);
		}

		public override async Task<StarboardAddResult> Add(StarboardAddQuery request, ServerCallContext context)
		{
			var result = await _database.AddStarboardAsync(request.GuildId, request.ChannelId,
				request.MessageId,
				request.UserId, request.StarMessageId);
			if (!result.Success)
			{
				return new StarboardAddResult {Status = Status.Failed};
			}

			var output = new StarboardAddResult {Status = Status.Success};
			var entry = result.Value;
			if (entry is null)
			{
				return output;
			}

			output.Stars = entry.Stars;
			output.StarMessageId = entry.StarMessageId;
			return output;
		}

		public override async Task<StarboardRemoveResult> Remove(StarboardRemoveQuery request,
			ServerCallContext context)
		{
			var result = await _database.RemoveStarboardAsync(request.ChannelId, request.MessageId);
			return result.Success
				? new StarboardRemoveResult {Status = Status.Success, StarMessageId = result.Value ?? string.Empty}
				: new StarboardRemoveResult {Status = Status.Failed};
		}

		public override async Task<StarboardBulkDeleteResult> BulkDelete(StarboardBulkDeleteQuery request,
			ServerCallContext context)
		{
			var result =
				await _database.RemoveStarboardsAsync(request.ChannelId, request.MessageId.ToArray());
			if (!result.Success)
			{
				return new StarboardBulkDeleteResult {Status = Status.Failed};
			}

			var output = new StarboardBulkDeleteResult {Status = Status.Success};
			output.StarMessageId.AddRange(result.Value);
			return output;
		}

		public override async Task<StarboardChannelDeleteResult> ChannelDelete(StarboardChannelDeleteQuery request,
			ServerCallContext context)
		{
			var result = await _database.RemoveStarboardsAsync(request.ChannelId);
			if (!result.Success)
			{
				return new StarboardChannelDeleteResult {Status = Status.Failed};
			}

			var output = new StarboardChannelDeleteResult {Status = Status.Success};
			output.StarMessageId.AddRange(result.Value);
			return output;
		}

		private static StarboardGetResult HandleResult(Result<Database.Models.Entities.Starboard?> result)
		{
			if (!result.Success)
			{
				return new StarboardGetResult {Status = Status.Failed};
			}

			var output = new StarboardGetResult {Status = Status.Success};
			var starboard = result.Value;
			if (starboard is null)
			{
				return output;
			}

			output.Entry = new StarboardEntry
			{
				Enabled = starboard.Enabled,
				Stars = starboard.Stars,
				ChannelId = starboard.ChannelId,
				GuildId = starboard.GuildId,
				MessageId = starboard.MessageId,
				UserId = starboard.UserId,
				StarMessageId = starboard.StarMessageId
			};
			return output;
		}
	}
}
