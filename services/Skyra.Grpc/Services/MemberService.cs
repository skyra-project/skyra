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
		private readonly ILogger<MemberService> _logger;
		private readonly SkyraDbContext _context;
		public MemberService(ILogger<MemberService> logger, SkyraDbContext context)
		{
			_logger = logger;
			_context = context;
		}

		public override async Task<Result> AddPoints(Points request, ServerCallContext context)
		{
			var user = await _context.Users.UpsertAsync(request.Id, () => new User { Id = request.Id, Money = 0 });

			user.Money += request.Amount;

			await _context.SaveChangesAsync();

			return new Result
			{
				Success = true,
				Amount = user.Money
			};
		}

		public override async Task<Result> GetPoints(MemberQuery request, ServerCallContext context)
		{
			try
			{
				var user = await _context.Users.FindAsync(request.Id);

				if (user is null)
				{
					return new Result
					{
						Success = true,
						Amount = 0
					};
				}

				return new Result
				{
					Amount = user.Points,
					Success = true
				};
			}
			catch (Exception e)
			{
				return new Result
				{
					Success = false,
					ErrorMessage = e.ToString()
				};
			}
		}
	}
}
