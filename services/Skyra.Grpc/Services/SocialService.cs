using System;
using System.Linq;
using System.Threading.Tasks;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Skyra.Database;
using Skyra.Shared.Results;
using Result = Skyra.Grpc.Services.Shared.Result;
using Status = Skyra.Grpc.Services.Shared.Status;

namespace Skyra.Grpc.Services
{
	public class SocialService : Social.SocialBase
	{
		private readonly IDatabase _database;

		public SocialService(IDatabase database)
		{
			_database = database;
		}

		public override async Task<BannerListResult> GetBanners(Empty request,
			ServerCallContext context)
		{
			var result = await _database.GetBannersAsync();
			if (!result.Success)
			{
				return new BannerListResult {Status = Status.Failed};
			}

			var output = new BannerListResult {Status = Status.Success};
			output.Banners.AddRange(result.Value!.Select(banner => new BannerEntry
			{
				Id = banner.Id, Group = banner.Group, Price = banner.Price, Title = banner.Title,
				AuthorId = banner.AuthorId
			}));
			return output;
		}

		public override async Task<Result> AddBanner(AddBannerQuery request, ServerCallContext context)
		{
			var result = await _database.AddBannerAsync("", request.Group, request.Title, request.AuthorId,
				request.Price);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<Result> UpdateBanner(UpdateBannerQuery request, ServerCallContext context)
		{
			var result = await _database.UpdateBannerAsync(request.Id, request.Group, request.Title, request.AuthorId,
				request.Price);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<Result> RemoveBanner(RemoveBannerQuery request, ServerCallContext context)
		{
			var result = await _database.RemoveBannerAsync(request.Id);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<LeaderboardListResult> GetLocalLeaderboard(SocialGuildQuery request,
			ServerCallContext context)
		{
			var result = await _database.GetLocalLeaderboardAsync(request.Id);
			return HandleResult(result);
		}

		public override async Task<LeaderboardListResult> GetGlobalLeaderboard(
			Empty request, ServerCallContext context)
		{
			var result = await _database.GetGlobalLeaderboardAsync();
			return HandleResult(result);
		}

		private static LeaderboardListResult HandleResult(Result<Tuple<long, string>[]> result)
		{
			if (!result.Success)
			{
				return new LeaderboardListResult {Status = Status.Failed};
			}

			var output = new LeaderboardListResult {Status = Status.Success};
			output.Entries.AddRange(result.Value!.Select(entry => new LeaderboardEntry
				{Points = entry.Item1, UserId = entry.Item2}));
			return output;
		}
	}
}
