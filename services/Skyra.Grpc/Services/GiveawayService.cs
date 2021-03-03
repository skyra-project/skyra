using System.Linq;
using System.Threading.Tasks;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Skyra.Database;
using Skyra.Grpc.Services.Shared;
using Status = Skyra.Grpc.Services.Shared.Status;

namespace Skyra.Grpc.Services
{
	public class GiveawayService : Giveaway.GiveawayBase
	{
		private readonly IDatabase _database;

		public GiveawayService(IDatabase database)
		{
			_database = database;
		}

		public override async Task<Result> Add(GiveawayAddQuery request, ServerCallContext context)
		{
			var result = await _database.AddGiveawayAsync(request.Entry.Title, request.Entry.EndsAt.ToDateTime(),
				request.Entry.GuildId, request.Entry.ChannelId, request.Entry.MessageId, request.Entry.Minimum,
				request.Entry.MinimumWinners);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<GiveawayGetAllResult> GetAll(GiveawayGetAllQuery request, ServerCallContext context)
		{
			var result = await _database.GetGiveawaysAsync(request.GuildId);
			if (!result.Success)
			{
				return new GiveawayGetAllResult {Status = Status.Failed};
			}

			var output = new GiveawayGetAllResult {Status = Status.Success};
			output.Entries.AddRange(result.Value!.Select(entry => new GiveawayEntry
			{
				Title = entry.Title, EndsAt = entry.EndsAt.ToTimestamp(), GuildId = entry.GuildId,
				ChannelId = entry.ChannelId, MessageId = entry.MessageId, Minimum = entry.Minimum,
				MinimumWinners = entry.MinimumWinners
			}));
			return output;
		}

		public override async Task<Result> Delete(GiveawayDeleteQuery request, ServerCallContext context)
		{
			var result = await _database.DeleteGiveawayAsync(request.ChannelId, request.MessageId);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<Result> BulkDelete(GiveawayBulkDeleteQuery request, ServerCallContext context)
		{
			var result = await _database.DeleteGiveawaysAsync(request.ChannelId, request.MessageId.ToArray());
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<Result> ChannelDelete(GiveawayChannelDeleteQuery request, ServerCallContext context)
		{
			var result = await _database.DeleteGiveawaysAsync(request.ChannelId);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}
	}
}
