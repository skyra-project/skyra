using System.Threading.Tasks;
using NUnit.Framework;
using Skyra.Grpc.Services;
using Skyra.Grpc.Services.Shared;

namespace Skyra.IntegrationTests.Grpc
{
	[TestFixture]
	public class MemberTests : BaseGrpcTests
	{
		[Test]
		public async Task MemberClient_GetPoints_ToUserThatDoesNotExist_ReturnsZero()
		{
			// arrange
			var channel = GetChannel();
			var client = new Member.MemberClient(channel);
			const string guildId = "1";
			const string userId = "1";

			var query = new MemberQuery
			{
				GuildId = guildId,
				UserId = userId
			};

			// act
			var result = await client.GetPointsAsync(query);

			// assert
			Assert.AreEqual(Status.Success, result.Status, "GetPointsAsync() failed.");
			Assert.AreEqual(0, result.Experience);
		}

		[Test]
		public async Task MemberClient_GetPoints_ToUserThatExists_ReturnsSamePoints()
		{
			// arrange
			var amount = Rng.Next();

			var channel = GetChannel();
			var client = new Member.MemberClient(channel);
			const string guildId = "1";
			const string userId = "1";

			var getQuery = new MemberQuery
			{
				GuildId = guildId,
				UserId = userId
			};

			var addQuery = new MemberQueryWithPoints
			{
				GuildId = guildId,
				UserId = userId,
				Amount = amount
			};

			// act
			var addResult = await client.AddPointsAsync(addQuery);
			var getResult = await client.GetPointsAsync(getQuery);

			// assert
			Assert.AreEqual(Status.Success, addResult.Status, "AddPointsAsync() failed.");
			Assert.AreEqual(amount, addResult.Experience);
			Assert.AreEqual(Status.Success, getResult.Status, "GetPointsAsync() failed.");
			Assert.AreEqual(amount, getResult.Experience);
		}

		[Test]
		public async Task MemberClient_AddPoints_ToUserThatDoesNotExist_ReturnsSamePoints()
		{
			// arrange
			var amount = Rng.Next();

			var channel = GetChannel();
			var client = new Member.MemberClient(channel);
			const string guildId = "1";
			const string userId = "1";

			var query = new MemberQueryWithPoints
			{
				GuildId = guildId,
				UserId = userId,
				Amount = amount
			};

			// act
			var result = await client.AddPointsAsync(query);

			// assert
			Assert.AreEqual(Status.Success, result.Status, "AddPointsAsync() failed.");
			Assert.AreEqual(amount, result.Experience);
		}

		[Test]
		public async Task MemberClient_RemovePoints_ToUserThatDoesNotExist_ReturnsZero()
		{
			// arrange
			var amount = Rng.Next();

			var channel = GetChannel();
			var client = new Member.MemberClient(channel);
			const string guildId = "1";
			const string userId = "1";

			var query = new MemberQueryWithPoints
			{
				GuildId = guildId,
				UserId = userId,
				Amount = amount
			};

			// act
			var result = await client.RemovePointsAsync(query);

			// assert
			Assert.AreEqual(Status.Success, result.Status, "RemovePointsAsync() failed.");
			Assert.AreEqual(0, result.Experience);
		}

		[Test]
		public async Task MemberClient_RemovePoints_ToUserThatExistsWithRemaining_ReturnsCorrectAmount()
		{
			// arrange
			var addAmount = 5;
			var removeAmount = 2;

			var channel = GetChannel();
			var client = new Member.MemberClient(channel);
			const string guildId = "1";
			const string userId = "1";

			var addQuery = new MemberQueryWithPoints
			{
				GuildId = guildId,
				UserId = userId,
				Amount = addAmount
			};
			var removeQuery = new MemberQueryWithPoints
			{
				GuildId = guildId,
				UserId = userId,
				Amount = removeAmount
			};

			// act
			var addResult = await client.AddPointsAsync(addQuery);
			var removeResult = await client.RemovePointsAsync(removeQuery);

			// assert
			Assert.AreEqual(Status.Success, addResult.Status, "AddPointsAsync() failed.");
			Assert.AreEqual(addAmount, addResult.Experience);
			Assert.AreEqual(Status.Success, removeResult.Status, "RemovePointsAsync() failed.");
			Assert.AreEqual(addAmount - removeAmount, removeResult.Experience);
		}

		[Test]
		public async Task MemberClient_RemovePoints_ToUserThatExistsWithNegativeSubstractionResult_ReturnsZero()
		{
			// arrange
			const int addAmount = 5;
			const int removeAmount = 8;

			var channel = GetChannel();
			var client = new Member.MemberClient(channel);
			const string guildId = "1";
			const string userId = "1";

			var addQuery = new MemberQueryWithPoints
			{
				GuildId = guildId,
				UserId = userId,
				Amount = addAmount
			};
			var removeQuery = new MemberQueryWithPoints
			{
				GuildId = guildId,
				UserId = userId,
				Amount = removeAmount
			};

			// act
			var addResult = await client.AddPointsAsync(addQuery);
			var removeResult = await client.RemovePointsAsync(removeQuery);

			// assert
			Assert.AreEqual(Status.Success, addResult.Status, "AddPointsAsync() failed.");
			Assert.AreEqual(addAmount, addResult.Experience);
			Assert.AreEqual(Status.Success, removeResult.Status, "RemovePointsAsync() failed.");
			Assert.AreEqual(0, removeResult.Experience);
		}

		[Test]
		public async Task MemberClient_SetPoints_ToUserThatDoesNotExist_ReturnsSamePoints()
		{
			// arrange
			var amount = Rng.Next();

			var channel = GetChannel();
			var client = new Member.MemberClient(channel);
			const string guildId = "1";
			const string userId = "1";

			var getQuery = new MemberQuery
			{
				GuildId = guildId,
				UserId = userId
			};
			var setQuery = new MemberQueryWithPoints
			{
				GuildId = guildId,
				UserId = userId,
				Amount = amount
			};

			// act
			var setResult = await client.SetPointsAsync(setQuery);
			var getResult = await client.GetPointsAsync(getQuery);

			// assert
			Assert.AreEqual(Status.Success, setResult.Status, "SetPointsAsync() failed.");
			Assert.AreEqual(Status.Success, getResult.Status, "GetPointsAsync() failed.");
			Assert.AreEqual(amount, getResult.Experience);
		}

		[Test]
		public async Task MemberClient_ResetPoints_ToUserThatDoesNotExist_ReturnsZero()
		{
			// arrange
			var channel = GetChannel();
			var client = new Member.MemberClient(channel);
			const string guildId = "1";
			const string userId = "1";

			var getQuery = new MemberQuery
			{
				GuildId = guildId,
				UserId = userId
			};
			var resetQuery = new MemberQuery
			{
				GuildId = guildId,
				UserId = userId
			};

			// act
			var resetResult = await client.ResetPointsAsync(resetQuery);
			var getResult = await client.GetPointsAsync(getQuery);

			// assert
			Assert.AreEqual(Status.Success, resetResult.Status, "ResetPointsAsync() failed.");
			Assert.AreEqual(Status.Success, getResult.Status, "GetPointsAsync() failed.");
			Assert.AreEqual(0, getResult.Experience);
		}

		[Test]
		public async Task MemberClient_ResetPoints_ToUserThatExists_ReturnsZero()
		{
			// arrange
			var amount = Rng.Next();

			var channel = GetChannel();
			var client = new Member.MemberClient(channel);
			const string guildId = "1";
			const string userId = "1";

			var addQuery = new MemberQueryWithPoints
			{
				GuildId = guildId,
				UserId = userId,
				Amount = amount
			};
			var getQuery = new MemberQuery
			{
				GuildId = guildId,
				UserId = userId
			};
			var resetQuery = new MemberQuery
			{
				GuildId = guildId,
				UserId = userId
			};

			// act
			var addResult = await client.AddPointsAsync(addQuery);
			var resetResult = await client.ResetPointsAsync(resetQuery);
			var getResult = await client.GetPointsAsync(getQuery);

			// assert
			Assert.AreEqual(Status.Success, addResult.Status, "AddPointsAsync() failed.");
			Assert.AreEqual(amount, addResult.Experience);
			Assert.AreEqual(Status.Success, resetResult.Status, "ResetPointsAsync() failed.");
			Assert.AreEqual(Status.Success, getResult.Status, "GetPointsAsync() failed.");
			Assert.AreEqual(0, getResult.Experience);
		}
	}
}
