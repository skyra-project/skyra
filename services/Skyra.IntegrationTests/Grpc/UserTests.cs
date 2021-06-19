using System.Threading.Tasks;
using NUnit.Framework;
using Skyra.Grpc.Services;
using Skyra.Grpc.Services.Shared;

namespace Skyra.IntegrationTests.Grpc
{
	[TestFixture]
	public class UserTests : BaseGrpcTests
	{
		[Test]
		public async Task UserClient_AddPoints_ToUserThatDoesNotExist_ReturnsSamePoints()
		{
			// arrange
			var amount = Rng.Next();

			var channel = GetChannel();
			var client = new User.UserClient(channel);
			const string id = "1";

			var query = new UserPointsQuery
			{
				Id = id,
				Amount = amount
			};

			// act
			var result = await client.AddPointsAsync(query);

			// assert
			Assert.AreEqual(Status.Success, result.Status, "AddPoints() failed.");
			Assert.AreEqual(amount, result.Amount);
		}

		[Test]
		public async Task UserClient_AddPoints_ToUserThatDoesExist_ReturnsExtraPoints()
		{
			// arrange
			var startingAmount = Rng.Next();
			var additionalAmount = Rng.Next();

			var channel = GetChannel();
			var client = new User.UserClient(channel);
			const string id = "1";

			var createQuery = new UserPointsQuery
			{
				Id = id,
				Amount = startingAmount
			};

			var addQuery = new UserPointsQuery
			{
				Id = id,
				Amount = additionalAmount
			};

			// act
			var createResult = await client.AddPointsAsync(createQuery);
			var addResult = await client.AddPointsAsync(addQuery);

			// assert
			Assert.AreEqual(Status.Success, createResult.Status, "AddPoints() failed.");
			Assert.AreEqual(Status.Success, addResult.Status, "AddPoints() failed.");
			Assert.AreEqual(startingAmount + additionalAmount, addResult.Amount);
		}

		[Test]
		public async Task UserClient_GetPoints_ToUserThatDoesNotExist_ReturnsZero()
		{
			// arrange
			var channel = GetChannel();
			var client = new User.UserClient(channel);

			var getQuery = new UserQuery
			{
				Id = "1"
			};

			// act
			var getResult = await client.GetPointsAsync(getQuery);

			// assert
			Assert.AreEqual(Status.Success, getResult.Status, "GetPoints() failed.");
			Assert.AreEqual(0, getResult.Amount);
		}

		[Test]
		public async Task UserClient_GetPoints_ToUserThatDoesExist_ReturnsPoints()
		{
			// arrange
			var amount = Rng.Next();

			var channel = GetChannel();
			var client = new User.UserClient(channel);
			const string id = "1";

			var addQuery = new UserPointsQuery
			{
				Id = id,
				Amount = amount
			};

			var getQuery = new UserQuery
			{
				Id = id
			};

			// act
			var addResult = await client.AddPointsAsync(addQuery);
			var getResult = await client.GetPointsAsync(getQuery);

			// assert
			Assert.AreEqual(Status.Success, addResult.Status, "AddPoints() failed.");
			Assert.AreEqual(Status.Success, getResult.Status, "GetPoints() failed.");
			Assert.AreEqual(amount, getResult.Amount);
		}

		[Test]
		public async Task UserClient_RemovePoints_ToUserThatDoesNotExist_SetsToZero()
		{
			// arrange
			var channel = GetChannel();
			var client = new User.UserClient(channel);
			const string id = "1";

			var removeQuery = new UserPointsQuery
			{
				Id = id,
				Amount = 100
			};

			var getQuery = new UserQuery
			{
				Id = id
			};

			// act
			var removeResult = await client.RemovePointsAsync(removeQuery);
			var getResult = await client.GetPointsAsync(getQuery);

			// assert
			Assert.AreEqual(Status.Success, removeResult.Status, "RemovePoints() failed.");
			Assert.AreEqual(Status.Success, getResult.Status, "GetPoints() failed.");
			Assert.AreEqual(0, getResult.Amount);
		}

		[Test]
		public async Task UserClient_RemovePoints_ToUserThatHasMoney_WithLessThanQuery_ReturnsZero()
		{
			// arrange
			var channel = GetChannel();
			var client = new User.UserClient(channel);
			const string id = "1";
			const int startingAmount = 50;
			const int removeAmount = 100;

			var addQuery = new UserPointsQuery
			{
				Id = id,
				Amount = startingAmount
			};

			var removeQuery = new UserPointsQuery
			{
				Id = id,
				Amount = removeAmount
			};

			var getQuery = new UserQuery
			{
				Id = id
			};

			// act
			var addResult = await client.AddPointsAsync(addQuery);
			var removeResult = await client.RemovePointsAsync(removeQuery);
			var getResult = await client.GetPointsAsync(getQuery);

			// assert
			Assert.AreEqual(Status.Success, addResult.Status, "AddPoints() failed.");
			Assert.AreEqual(Status.Success, removeResult.Status, "RemovePoints() failed.");
			Assert.AreEqual(Status.Success, getResult.Status, "GetPoints() failed.");
			Assert.AreEqual(0, getResult.Amount);
		}

		[Test]
		public async Task UserClient_RemovePoints_ToUserThatHasMoney_ReturnsCorrectAmount()
		{
			// arrange
			var channel = GetChannel();
			var client = new User.UserClient(channel);
			const string id = "1";
			const int startingAmount = 100;
			const int removeAmount = 20;

			var addQuery = new UserPointsQuery
			{
				Id = id,
				Amount = startingAmount
			};

			var removeQuery = new UserPointsQuery
			{
				Id = id,
				Amount = removeAmount
			};

			var getQuery = new UserQuery
			{
				Id = id
			};

			// act
			var addResult = await client.AddPointsAsync(addQuery);
			var removeResult = await client.RemovePointsAsync(removeQuery);
			var getResult = await client.GetPointsAsync(getQuery);

			// assert
			Assert.AreEqual(Status.Success, addResult.Status, "AddPoints() failed.");
			Assert.AreEqual(Status.Success, removeResult.Status, "RemovePoints() failed.");
			Assert.AreEqual(Status.Success, getResult.Status, "GetPoints() failed.");
			Assert.AreEqual(startingAmount - removeAmount, getResult.Amount);
		}

		// Tyler doesn't get we validate in Skyra, not in here.
		// [Test]
		public async Task UserClient_RemovePoints_WithNegativeAmount_ReturnsFailedStatus()
		{
			// arrange
			var channel = GetChannel();
			var client = new User.UserClient(channel);
			const string id = "1";

			var addQuery = new UserPointsQuery
			{
				Id = id,
				Amount = -10
			};

			// act
			var addResult = await client.AddPointsAsync(addQuery);

			// assert
			Assert.AreEqual(Status.Failed, addResult.Status, "AddPoints() did not fail.");
		}

		[Test]
		public async Task UserClient_ResetPoints_ToUserThatExists_RemovesAllPoints()
		{
			// arrange
			var amount = Rng.Next();

			var channel = GetChannel();
			var client = new User.UserClient(channel);
			const string id = "1";

			var addQuery = new UserPointsQuery
			{
				Id = id,
				Amount = amount
			};

			var userQuery = new UserQuery
			{
				Id = id
			};

			// act
			var addResult = await client.AddPointsAsync(addQuery);
			var resetResult = await client.ResetPointsAsync(userQuery);
			var getResult = await client.GetPointsAsync(userQuery);

			// assert
			Assert.AreEqual(Status.Success, addResult.Status, "AddPoints() failed.");
			Assert.AreEqual(Status.Success, resetResult.Status, "ResetPoints() failed.");
			Assert.AreEqual(Status.Success, getResult.Status, "GetPoints() failed.");
			Assert.AreEqual(0, getResult.Amount);
		}

		[Test]
		public async Task UserClient_ResetPoints_ToUserThatDoesNotExist_RemovesAllPoints()
		{
			// arrange
			var amount = Rng.Next();

			var channel = GetChannel();
			var client = new User.UserClient(channel);
			const string id = "1";

			var userQuery = new UserQuery
			{
				Id = id
			};

			// act
			var resetResult = await client.ResetPointsAsync(userQuery);
			var getResult = await client.GetPointsAsync(userQuery);

			// assert
			Assert.AreEqual(Status.Success, resetResult.Status, "ResetPoints() failed.");
			Assert.AreEqual(Status.Success, getResult.Status, "GetPoints() failed.");
			Assert.AreEqual(0, getResult.Amount);
		}

		[Test]
		public async Task UserClient_AddMoney_ToUserThatDoesNotExist_ReturnsSameMoney()
		{
			// arrange
			var amount = Rng.Next();

			var channel = GetChannel();
			var client = new User.UserClient(channel);
			const string id = "1";

			var query = new UserMoneyQuery
			{
				Id = id,
				Amount = amount
			};

			// act
			var result = await client.AddMoneyAsync(query);

			// assert
			Assert.AreEqual(Status.Success, result.Status, "AddMoney() failed.");
			Assert.AreEqual(amount, result.Amount);
		}

		[Test]
		public async Task UserClient_AddMoney_ToUserThatDoesExist_ReturnsExtraMoney()
		{
			// arrange
			var startingAmount = Rng.Next(20);
			var additionalAmount = Rng.Next(20);

			var channel = GetChannel();
			var client = new User.UserClient(channel);
			const string id = "1";

			var createQuery = new UserMoneyQuery
			{
				Id = id,
				Amount = startingAmount
			};

			var addQuery = new UserMoneyQuery
			{
				Id = id,
				Amount = additionalAmount
			};

			// act
			var createResult = await client.AddMoneyAsync(createQuery);
			var addResult = await client.AddMoneyAsync(addQuery);

			// assert
			Assert.AreEqual(Status.Success, createResult.Status, "AddMoney() failed.");
			Assert.AreEqual(Status.Success, addResult.Status, "AddMoney() failed.");
			Assert.AreEqual(startingAmount + additionalAmount, addResult.Amount);
		}

		[Test]
		public async Task UserClient_GetMoney_ToUserThatDoesNotExist_ReturnsZero()
		{
			// arrange
			var channel = GetChannel();
			var client = new User.UserClient(channel);

			var getQuery = new UserQuery
			{
				Id = "1"
			};

			// act
			var getResult = await client.GetMoneyAsync(getQuery);

			// assert
			Assert.AreEqual(Status.Success, getResult.Status, "GetMoney() failed.");
			Assert.AreEqual(0, getResult.Amount);
		}

		[Test]
		public async Task UserClient_GetMoney_ToUserThatDoesExist_ReturnsMoney()
		{
			// arrange
			var amount = Rng.Next();

			var channel = GetChannel();
			var client = new User.UserClient(channel);
			const string id = "1";

			var addQuery = new UserMoneyQuery
			{
				Id = id,
				Amount = amount
			};

			var getQuery = new UserQuery
			{
				Id = id
			};

			// act
			var addResult = await client.AddMoneyAsync(addQuery);
			var getResult = await client.GetMoneyAsync(getQuery);

			// assert
			Assert.AreEqual(Status.Success, addResult.Status, "AddMoney() failed.");
			Assert.AreEqual(Status.Success, getResult.Status, "GetMoney() failed.");
			Assert.AreEqual(amount, getResult.Amount);
		}
	}
}
