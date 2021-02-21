using System;
using System.Threading.Tasks;
using Grpc.Core;
using Microsoft.Extensions.Logging;
using Skyra.Database;
using Skyra.Database.Extensions;
using Skyra.Database.Models;
using Skyra.Database.Models.Generated;

namespace Skyra.Grpc.Services
{
	public class MemberService : Member.MemberBase
	{
		private readonly IDatabase _database;

		public MemberService(IDatabase database)
		{
			_database = database;
		}

		public override async Task<PointsResult> AddPoints(PointsQuery request, ServerCallContext context)
		{
			var result = await _database.AddUserPointsAsync(request.Id, request.Amount);
			return new PointsResult
			{
				Success = result.Success,
				Amount = result.Points,
				ErrorMessage = result.FailureReason
			};
		}

		public override async Task<PointsResult> GetPoints(MemberQuery request, ServerCallContext context)
		{
			var result = await _database.GetUserPointsAsync(request.Id);
			return new PointsResult
			{
				Success = result.Success,
				Amount = result.Points,
				ErrorMessage = result.FailureReason
			};
		}
	}
}
