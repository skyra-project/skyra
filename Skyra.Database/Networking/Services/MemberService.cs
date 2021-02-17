using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Grpc.Core;
using Microsoft.Extensions.Logging;

namespace Skyra.Database.Networking
{
	public class MemberService : Member.MemberBase
	{
		private readonly ILogger<MemberService> _logger;
		public MemberService(ILogger<MemberService> logger)
		{
			_logger = logger;
		}

		public override async Task<Result> AddPoints(Points request, ServerCallContext context)
		{
			await using var ctx = new SkyraDbContext();
			var user = await ctx.Users.FindAsync(request.Id);

			// Upsert
			if (user is null)
			{
				user = new Models.User { Id = request.Id, Money = request.Amount };
				await ctx.Users.AddAsync(user);
			}
			else user.Money += request.Amount;

			await ctx.SaveChangesAsync();

			return new Result
			{
				Success = true,
				NewAmount = user.Money
			};
		}
	}
}
