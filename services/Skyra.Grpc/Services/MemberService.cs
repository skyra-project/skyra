using System.Threading.Tasks;
using Grpc.Core;
using Skyra.Database;
using Skyra.Grpc.Services.Shared;
using Status = Skyra.Grpc.Services.Shared.Status;

namespace Skyra.Grpc.Services
{
	public class MemberService : Member.MemberBase
	{
		private readonly IDatabase _database;

		public MemberService(IDatabase database)
		{
			_database = database;
		}

		public override async Task<ExperienceResult> GetPoints(MemberQuery request, ServerCallContext context)
		{
			var result = await _database.GetMemberPointsAsync(request.GuildId, request.UserId);
			return result.Success
				? new ExperienceResult {Status = Status.Success, Experience = result.Value}
				: new ExperienceResult {Status = Status.Failed};
		}

		public override async Task<ExperienceResult> AddPoints(MemberQueryWithPoints request, ServerCallContext context)
		{
			var result = await _database.AddMemberPointsAsync(request.GuildId, request.UserId, request.Amount);
			return result.Success
				? new ExperienceResult {Status = Status.Success, Experience = result.Value}
				: new ExperienceResult {Status = Status.Failed};
		}

		public override async Task<ExperienceResult> RemovePoints(MemberQueryWithPoints request,
			ServerCallContext context)
		{
			var result =
				await _database.RemoveMemberPointsAsync(request.GuildId, request.UserId, request.Amount);
			return result.Success
				? new ExperienceResult {Status = Status.Success, Experience = result.Value}
				: new ExperienceResult {Status = Status.Failed};
		}

		public override async Task<Result> SetPoints(MemberQueryWithPoints request, ServerCallContext context)
		{
			var result = await _database.SetMemberPointsAsync(request.GuildId, request.UserId, request.Amount);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<Result> ResetPoints(MemberQuery request, ServerCallContext context)
		{
			var result = await _database.ResetMemberPointsAsync(request.GuildId, request.UserId);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}
	}
}
