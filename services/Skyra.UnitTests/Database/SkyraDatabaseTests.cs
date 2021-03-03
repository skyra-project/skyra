using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using NUnit.Framework;
using Skyra.Database;

namespace Skyra.UnitTests.Database
{
	public class SkyraDatabaseTests
	{
		[Test]
		public async Task MemberService_GetPoints_ShouldReturnSucceedFalse_WhenExceptionOccurs()
		{
			// arrange

			var database = new SkyraDatabase(GetSubstitute(), new NullLogger<SkyraDatabase>());

			// act

			var result = await database.GetUserPointsAsync("testing1");

			// assert

			Assert.IsFalse(result.Success);
		}

		[Test]
		public async Task MemberService_AddPoints_ShouldReturnSucceedFalse_WhenExceptionOccurs()
		{
			// arrange

			var database = new SkyraDatabase(GetSubstitute(), new NullLogger<SkyraDatabase>());

			// act

			var result = await database.AddUserPointsAsync("testing1", 100);

			// assert

			Assert.IsFalse(result.Success);
		}

		private SkyraDbContext GetSubstitute()
		{
			var substitute = Substitute.For<SkyraDbContext>();
			substitute.Users.ReturnsForAnyArgs(_ => { throw new Exception(); });
			return substitute;
		}
	}
}
