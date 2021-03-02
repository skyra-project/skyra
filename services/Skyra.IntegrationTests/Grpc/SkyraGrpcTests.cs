using System;
using System.Threading.Tasks;
using Grpc.Net.Client;
using NUnit.Framework;
using Skyra.Grpc.Services;
using Skyra.IntegrationTests.Database;

namespace Skyra.IntegrationTests.Grpc
{
	[TestFixture]
	public class SkyraGrpcTests
	{
		private Random _rng = new Random(DateTime.Now.Millisecond);

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
		public async Task GrpcClient_AddPoints_ToMemberThatDoesNotExist_ReturnsSamePoints()
		{
			// arrange

			var amount = _rng.Next();

			var channel = GrpcChannel.ForAddress("https://localhost:5001");
			var client = new Member.MemberClient(channel);
			var query = new PointsQuery
			{
				Id = "1",
				Amount = amount
			};

			// act

			var result = await client.AddPointsAsync(query);

			// assert

			Assert.True(result.Success);
			Assert.AreEqual(amount, result.Amount);
		}

		[Test]
		public async Task GrpcClient_AddPoints_ToMemberThatDoesExist_ReturnsExtraPoints()
		{
			// arrange

			var startingAmount = _rng.Next();
			var additionalAmount = _rng.Next();

			var channel = GrpcChannel.ForAddress("https://localhost:5001");
			var client = new Member.MemberClient(channel);
			var createQuery = new PointsQuery
			{
				Id = "1",
				Amount = startingAmount
			};

			var addQuery = new PointsQuery
			{
				Id = "1",
				Amount = additionalAmount
			};

			// act

			var createResult = await client.AddPointsAsync(createQuery);
			var addResult = await client.AddPointsAsync(addQuery);
			// assert

			Assert.True(createResult.Success);
			Assert.True(addResult.Success);
			Assert.AreEqual(startingAmount + additionalAmount, addResult.Amount);
		}

		[Test]
		public async Task GrpcClient_GetPoints_ToMemberThatDoesNotExist_ReturnsZero()
		{
			// arrange

			var channel = GrpcChannel.ForAddress("https://localhost:5001");
			var client = new Member.MemberClient(channel);

			var getQuery = new MemberQuery
			{
				Id = "1"
			};

			// act

			var getResult = await client.GetPointsAsync(getQuery);
			// assert

			Assert.True(getResult.Success);
			Assert.AreEqual(0, getResult.Amount);
		}

		[Test]
		public async Task GrpcClient_GetPoints_ToMemberThatDoesExist_ReturnsPoints()
		{
			// arrange

			var amount = _rng.Next();

			var channel = GrpcChannel.ForAddress("https://localhost:5001");
			var client = new Member.MemberClient(channel);
			var createQuery = new PointsQuery
			{
				Id = "1",
				Amount = amount
			};

			var getQuery = new MemberQuery
			{
				Id = "1"
			};

			// act

			var createResult = await client.AddPointsAsync(createQuery);
			var getResult = await client.GetPointsAsync(getQuery);
			// assert

			Assert.True(createResult.Success);
			Assert.True(getResult.Success);
			Assert.AreEqual(amount, getResult.Amount);
		}
	}
}
