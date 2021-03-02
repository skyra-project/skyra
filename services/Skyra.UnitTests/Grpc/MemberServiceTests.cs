using System.Threading.Tasks;
using NUnit.Framework;
using Skyra.Grpc.Services;
using Skyra.UnitTests.Grpc.Stubs;

namespace Skyra.UnitTests.Grpc
{
	[TestFixture]
	public class MemberServiceTests
	{
		[Test]
		public async Task MemberService_AddPoints_ShouldAddPoints_WhenUserExists()
		{
			// arrange

			const int startingPoints = 20;
			const int additionalPoints = 15;
			const string userId = "1";

			var database = new TestDatabase();
			var service = new MemberService(database);

			var query = new PointsQuery
			{
				Id = userId,
				Amount = additionalPoints
			};

			// act

			await database.AddUserPointsAsync(userId, startingPoints);

			var result = await service.AddPoints(query, null!);

			// assert

			Assert.IsTrue(result.Success);
			Assert.AreEqual(startingPoints + additionalPoints, result.Amount);
		}

		[Test]
		public async Task MemberService_AddPoints_ShouldKeepPoints_WhenUserDoesNotExist()
		{
			// arrange

			const int points = 20;
			const string userId = "1";

			var database = new TestDatabase();
			var service = new MemberService(database);

			var query = new PointsQuery
			{
				Id = userId,
				Amount = points
			};

			// act

			var result = await service.AddPoints(query, null!);

			// assert

			Assert.IsTrue(result.Success);
			Assert.AreEqual(points, result.Amount);
		}

		[Test]
		public async Task MemberService_GetPoints_ShouldReturnAmount_WhenUserDoesExist()
		{
			// arrange

			const string userId = "1";
			const int amount = 100;

			var database = new TestDatabase();
			var service = new MemberService(database);

			var query = new MemberQuery
			{
				Id = userId
			};

			// act

			await database.AddUserPointsAsync(userId, amount);
			var result = await service.GetPoints(query, null!);

			// assert

			Assert.IsTrue(result.Success);
			Assert.AreEqual(amount, result.Amount);
		}

		[Test]
		public async Task MemberService_GetPoints_ShouldReturnZero_WhenUserDoesNotExist()
		{
			// arrange

			const string userId = "1";

			var database = new TestDatabase();
			var service = new MemberService(database);

			var query = new MemberQuery
			{
				Id = userId
			};

			// act

			var result = await service.GetPoints(query, null!);

			// assert

			Assert.IsTrue(result.Success);
			Assert.AreEqual(0, result.Amount);
		}
	}
}
