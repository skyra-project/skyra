using System;
using System.Threading.Tasks;
using Grpc.Core;
using Microsoft.Extensions.Logging;
using Skyra.Database;
using Skyra.Database.Extensions;
using Skyra.Database.Models;

namespace Skyra.Grpc.Services
{
	public class MemberService : Member.MemberBase
	{
		private readonly SkyraDbContext _context;
		private readonly ILogger<MemberService> _logger;

		public MemberService(ILogger<MemberService> logger, SkyraDbContext context)
		{
			_logger = logger;
			_context = context;
		}

		public override async Task<PointsResult> AddPoints(PointsQuery request, ServerCallContext context)
		{
			var user = await _context.Users.UpsertAsync(request.Id, () => new User {Id = request.Id, Money = 0});

			user.Money += request.Amount;

			await _context.SaveChangesAsync();

			return new PointsResult
			{
				Success = true,
				Amount = user.Money
			};
		}

		public override async Task<PointsResult> GetPoints(MemberQuery request, ServerCallContext context)
		{
			try
			{
				var user = await _context.Users.FindAsync(request.Id);
				return new PointsResult
				{
					Amount = user?.Points ?? 0,
					Success = true
				};
			}
			catch (Exception e)
			{
				return new PointsResult
				{
					Success = false,
					ErrorMessage = e.ToString()
				};
			}
		}
	}
}
