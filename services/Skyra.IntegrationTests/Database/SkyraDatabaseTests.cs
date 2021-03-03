using System.Threading.Tasks;
using Microsoft.Extensions.Logging.Abstractions;
using NUnit.Framework;
using Skyra.Database;

namespace Skyra.IntegrationTests.Database
{
	[TestFixture]
	public class SkyraDatabaseTests
	{
		[OneTimeSetUp]
		public async Task Setup()
		{
			await TearDown();
		}

		[TearDown]
		public async Task TearDown()
		{
			await Utils.WipeDb();
		}

		[Test]
		public async Task SkyraDatabase_GetUserPoints_ShouldReturnZero_WhenUserDoesNotExist()
		{
			// arrange
			await using var database = new SkyraDatabase(Utils.GetContext(), new NullLogger<SkyraDatabase>());
			const string id = "testing1";

			// act

			var result = await database.GetUserPointsAsync(id);

			// assert

			Assert.IsTrue(result.Success);
			Assert.AreEqual(0, result.Value);
		}

		[TestCase(10)]
		[TestCase(250)]
		[TestCase(6000)]
		[TestCase(42)]
		public async Task SkyraDatabase_GetUserPoints_ShouldReturnPoints_WhenUserDoesExist(int points)
		{
			// arrange
			await using var database = new SkyraDatabase(Utils.GetContext(), new NullLogger<SkyraDatabase>());
			const string id = "testing1";

			// act

			await database.AddUserPointsAsync(id, points);
			var result = await database.GetUserPointsAsync(id);

			// assert

			Assert.IsTrue(result.Success);
			Assert.AreEqual(points, result.Value);
		}

		[TestCase(45)]
		[TestCase(1)]
		[TestCase(890)]
		[TestCase(1234)]
		public async Task SkyraDatabase_AddUserPoints_ShouldReturnSamePoints_WhenUserDoesNotExist(int points)
		{
			// arrange
			await using var database = new SkyraDatabase(Utils.GetContext(), new NullLogger<SkyraDatabase>());
			const string id = "testing1";

			// act

			var firstResult = await database.AddUserPointsAsync(id, points);
			var finalResult = await database.GetUserPointsAsync(id);

			// assert

			Assert.IsTrue(firstResult.Success);
			Assert.IsTrue(finalResult.Success);
			Assert.AreEqual(points, finalResult.Value);
		}

		[TestCase(25, 55)]
		[TestCase(123, 22222)]
		[TestCase(10, 23)]
		[TestCase(1, 2)]
		public async Task SkyraDatabase_AddUserPoints_ShouldReturnAdditionalPoints_WhenUserDoesExist(
			int beginningPoints, int additionalPoints)
		{
			// arrange
			await using var database = new SkyraDatabase(Utils.GetContext(), new NullLogger<SkyraDatabase>());
			const string id = "testing1";

			// act

			var firstResult = await database.AddUserPointsAsync(id, beginningPoints);
			var secondResult = await database.AddUserPointsAsync(id, additionalPoints);
			var finalResult = await database.GetUserPointsAsync(id);
			// assert

			Assert.IsTrue(firstResult.Success);
			Assert.IsTrue(secondResult.Success);
			Assert.IsTrue(finalResult.Success);
			Assert.AreEqual(beginningPoints + additionalPoints, finalResult.Value);
		}
	}
}
