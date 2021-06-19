using System.Linq;
using System.Threading.Tasks;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Skyra.Database;
using Skyra.Grpc.Services.Shared;
using Status = Skyra.Grpc.Services.Shared.Status;

namespace Skyra.Grpc.Services
{
	public class UserService : User.UserBase
	{
		private readonly IDatabase _database;

		public UserService(IDatabase database)
		{
			_database = database;
		}

		public override async Task<UserPointsResult> AddPoints(UserPointsQuery request, ServerCallContext context)
		{
			var result = await _database.AddUserPointsAsync(request.Id, request.Amount);
			return new UserPointsResult
			{
				Status = result.Success ? Status.Success : Status.Failed,
				Amount = result.Value
			};
		}

		public override async Task<UserPointsResult> GetPoints(UserQuery request, ServerCallContext context)
		{
			var result = await _database.GetUserPointsAsync(request.Id);
			return result.Success
				? new UserPointsResult {Status = Status.Success, Amount = result.Value}
				: new UserPointsResult {Status = Status.Failed};
		}

		public override async Task<UserPointsResult> RemovePoints(UserPointsQuery request, ServerCallContext context)
		{
			var result = await _database.RemoveUserPointsAsync(request.Id, request.Amount);
			return result.Success
				? new UserPointsResult {Status = Status.Success, Amount = result.Value}
				: new UserPointsResult {Status = Status.Failed};
		}

		public override async Task<Result> ResetPoints(UserQuery request, ServerCallContext context)
		{
			var result = await _database.ResetUserPointsAsync(request.Id);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<UserMoneyResult> AddMoney(UserMoneyQuery request, ServerCallContext context)
		{
			var result = await _database.AddUserMoneyAsync(request.Id, request.Amount);
			return result.Success
				? new UserMoneyResult {Status = Status.Success, Amount = result.Value}
				: new UserMoneyResult {Status = Status.Failed};
		}

		public override async Task<UserMoneyResult> RemoveMoney(UserMoneyQuery request, ServerCallContext context)
		{
			var result = await _database.RemoveUserMoneyAsync(request.Id, request.Amount);
			return result.Success
				? new UserMoneyResult {Status = Status.Success, Amount = result.Value}
				: new UserMoneyResult {Status = Status.Failed};
		}

		public override async Task<UserMoneyResult> GetMoney(UserQuery request, ServerCallContext context)
		{
			var result = await _database.GetUserMoneyAsync(request.Id);
			return result.Success
				? new UserMoneyResult {Status = Status.Success, Amount = result.Value}
				: new UserMoneyResult {Status = Status.Failed};
		}

		public override async Task<Result> ResetMoney(UserQuery request, ServerCallContext context)
		{
			var result = await _database.ResetUserMoneyAsync(request.Id);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<UserMoneyTransferResult> GiveMoney(UserMoneyTransferQuery request,
			ServerCallContext context)
		{
			var result = await _database.GiveUserMoneyAsync(request.AuthorId, request.TargetId, request.Amount);
			if (result.Success)
			{
				return new UserMoneyTransferResult
					{Status = Status.Success, AuthorMoney = result.Value.Item1, TargetMoney = result.Value.Item2};
			}

			return new UserMoneyTransferResult {Status = Status.Failed};
		}

		public override async Task<UserRemainingResult> ClaimDaily(UserDailyQuery request, ServerCallContext context)
		{
			var result = await _database.ClaimUserDailyAsync(request.AuthorId, request.Force);
			return result.Success
				? new UserRemainingResult {Status = Status.Success, Remaining = result.Value.ToDuration()}
				: new UserRemainingResult {Status = Status.Failed};
		}

		public override async Task<UserRemainingResult> GiveReputation(UserTargetQuery request,
			ServerCallContext context)
		{
			var result = await _database.GiveUserReputationAsync(request.AuthorId, request.TargetId);
			return result.Success
				? new UserRemainingResult {Status = Status.Success, Remaining = result.Value.ToDuration()}
				: new UserRemainingResult {Status = Status.Failed};
		}

		public override async Task<UserBannerResult> GetLargeBanner(UserQuery request, ServerCallContext context)
		{
			var result = await _database.GetUserLargeBannerAsync(request.Id);
			return result.Success
				? new UserBannerResult {Status = Status.Success, Id = result.Value}
				: new UserBannerResult {Status = Status.Failed};
		}

		public override async Task<UserBannersResult> GetLargeBanners(UserQuery request, ServerCallContext context)
		{
			var result = await _database.GetUserLargeBannersAsync(request.Id);
			if (!result.Success)
			{
				return new UserBannersResult {Status = Status.Failed};
			}

			var output = new UserBannersResult {Status = Status.Success};
			output.Ids.AddRange(result.Value);
			return output;
		}

		public override async Task<Result> SetLargeBanner(UserSetBannerQuery request, ServerCallContext context)
		{
			var result = await _database.SetUserLargeBannerAsync(request.Id, request.BannerId);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<UserBannerResult> GetSmallBanner(UserQuery request, ServerCallContext context)
		{
			var result = await _database.GetUserSmallBannerAsync(request.Id);
			return result.Success
				? new UserBannerResult {Status = Status.Success, Id = result.Value}
				: new UserBannerResult {Status = Status.Failed};
		}

		public override async Task<UserBannersResult> GetSmallBanners(UserQuery request, ServerCallContext context)
		{
			var result = await _database.GetUserSmallBannersAsync(request.Id);
			if (!result.Success)
			{
				return new UserBannersResult {Status = Status.Failed};
			}

			var output = new UserBannersResult {Status = Status.Success};
			output.Ids.AddRange(result.Value);
			return output;
		}

		public override async Task<Result> SetSmallBanner(UserSetBannerQuery request, ServerCallContext context)
		{
			var result = await _database.SetUserSmallBannerAsync(request.Id, request.BannerId);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<UserBadgesResult> GetBadges(UserQuery request, ServerCallContext context)
		{
			var result = await _database.GetUserBadgesAsync(request.Id);
			if (!result.Success)
			{
				return new UserBadgesResult {Status = Status.Failed};
			}

			var output = new UserBadgesResult {Status = Status.Success};
			output.Ids.AddRange(result.Value);
			return output;
		}

		public override async Task<Result> SetBadges(UserSetBadgesQuery request, ServerCallContext context)
		{
			var result = await _database.SetUserBadgesAsync(request.Id, request.BadgeIds.ToArray());
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<UserColorResult> GetColor(UserQuery request, ServerCallContext context)
		{
			var result = await _database.GetUserColorAsync(request.Id);
			return result.Success
				? new UserColorResult {Status = Status.Success, Color = result.Value}
				: new UserColorResult {Status = Status.Failed};
		}

		public override async Task<UserProfileResult> GetProfile(UserQuery request, ServerCallContext context)
		{
			var result = await _database.GetUserProfileAsync(request.Id);
			if (!result.Success)
			{
				return new UserProfileResult {Status = Status.Failed};
			}

			var output = new UserProfileResult
			{
				Status = Status.Success, Color = result.Value.Color, Money = result.Value.Money,
				Points = result.Value.Points, Reputations = result.Value.Reputations, Vault = result.Value.Vault,
				BannerId = result.Value.BannerId
			};
			output.BadgeIds.AddRange(result.Value.BadgeIds);
			return output;
		}

		public override async Task<UserSpousesResult> GetSpouses(UserQuery request, ServerCallContext context)
		{
			var result = await _database.GetUserSpousesAsync(request.Id);
			if (!result.Success)
			{
				return new UserSpousesResult {Status = Status.Failed};
			}

			var output = new UserSpousesResult {Status = Status.Success};
			output.UserIds.AddRange(result.Value);
			return output;
		}

		public override async Task<Result> AddSpouse(UserTargetQuery request, ServerCallContext context)
		{
			var result = await _database.AddUserSpouseAsync(request.AuthorId, request.TargetId);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<Result> RemoveSpouse(UserTargetQuery request, ServerCallContext context)
		{
			var result = await _database.RemoveUserSpouseAsync(request.AuthorId, request.TargetId);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<UserGameIntegrationResult> GetGameIntegration(UserGameIntegrationQuery request,
			ServerCallContext context)
		{
			var result = await _database.GetUserGameIntegrationAsync(request.Id, request.Game);
			return result.Success
				? new UserGameIntegrationResult {Status = Status.Success, Result = result.Value}
				: new UserGameIntegrationResult {Status = Status.Failed};
		}

		public override async Task<Result> AddGameIntegration(UserAddGameIntegrationQuery request,
			ServerCallContext context)
		{
			var result = await _database.AddUserGameIntegrationAsync(request.Id, request.Game, request.Data);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<Result> RemoveGameIntegration(UserGameIntegrationQuery request,
			ServerCallContext context)
		{
			var result = await _database.RemoveUserGameIntegrationAsync(request.Id, request.Game);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<Result> Delete(UserQuery request, ServerCallContext context)
		{
			var result = await _database.RemoveUserAsync(request.Id);

			return result.Success ? new Result {Status = Status.Success} : new Result {Status = Status.Failed};
		}
	}
}
