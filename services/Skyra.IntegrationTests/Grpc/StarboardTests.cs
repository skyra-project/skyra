using System.Threading.Tasks;
using NUnit.Framework;
using Skyra.Grpc.Services;
using Skyra.Grpc.Services.Shared;

namespace Skyra.IntegrationTests.Grpc
{
	[TestFixture]
	public class StarboardTests : BaseGrpcTests
	{
		[Test]
		public async Task StarboardClient_Get_ToEntryThatDoesNotExist_ReturnsNull()
		{
			// arrange
			var channel = GetChannel();
			var client = new Starboard.StarboardClient(channel);
			const string channelId = "1";
			const string messageId = "1";

			var query = new StarboardGetQuery
			{
				ChannelId = channelId,
				MessageId = messageId
			};

			// act
			var result = await client.GetAsync(query);

			// assert
			Assert.AreEqual(Status.Success, result.Status, "GetAsync() failed.");
			Assert.AreEqual(null, result.Entry);
		}

		[Test]
		public async Task StarboardClient_GetRandom_ToEntryThatDoesNotExist_ReturnsNull()
		{
			// arrange
			var channel = GetChannel();
			var client = new Starboard.StarboardClient(channel);
			const string guildId = "1";

			var query = new StarboardGetRandomQuery
			{
				GuildId = guildId
			};

			// act
			var result = await client.GetRandomAsync(query);

			// assert
			Assert.AreEqual(Status.Success, result.Status, "GetRandomAsync() failed.");
			Assert.AreEqual(null, result.Entry);
		}

		[Test]
		public async Task StarboardClient_Add_ToEntryThatDoesNotExist_ReturnsOneStar()
		{
			// arrange
			var channel = GetChannel();
			var client = new Starboard.StarboardClient(channel);
			const string guildId = "1";
			const string channelId = "1";
			const string messageId = "1";
			const string userId = "1";

			var query = new StarboardAddQuery
			{
				GuildId = guildId,
				ChannelId = channelId,
				MessageId = messageId,
				UserId = userId
			};

			// act
			var result = await client.AddAsync(query);

			// assert
			Assert.AreEqual(Status.Success, result.Status, "AddAsync() failed.");
			Assert.AreEqual(1, result.Stars);
			Assert.AreEqual(string.Empty, result.StarMessageId);
		}

		[Test]
		public async Task StarboardClient_Add_ToEntryThatExists_ReturnsOneMoreStar()
		{
			// arrange
			var channel = GetChannel();
			var client = new Starboard.StarboardClient(channel);
			const string guildId = "1";
			const string channelId = "1";
			const string messageId = "1";
			const string userId = "1";

			var query = new StarboardAddQuery
			{
				GuildId = guildId,
				ChannelId = channelId,
				MessageId = messageId,
				UserId = userId
			};

			// act
			var createResult = await client.AddAsync(query);
			var addResult = await client.AddAsync(query);

			// assert
			Assert.AreEqual(Status.Success, createResult.Status, "AddAsync() failed.");
			Assert.AreEqual(1, createResult.Stars);
			Assert.AreEqual(string.Empty, createResult.StarMessageId);
			Assert.AreEqual(Status.Success, addResult.Status, "AddAsync() failed.");
			Assert.AreEqual(2, addResult.Stars);
			Assert.AreEqual(string.Empty, addResult.StarMessageId);
		}

		[Test]
		public async Task StarboardClient_Remove_ToEntryThatDoesNotExist_ReturnsNull()
		{
			// arrange
			var channel = GetChannel();
			var client = new Starboard.StarboardClient(channel);
			const string channelId = "1";
			const string messageId = "1";

			var query = new StarboardRemoveQuery
			{
				ChannelId = channelId,
				MessageId = messageId
			};

			// act
			var result = await client.RemoveAsync(query);

			// assert
			Assert.AreEqual(Status.Success, result.Status, "AddAsync() failed.");
			Assert.AreEqual(string.Empty, result.StarMessageId);
		}
	}
}
