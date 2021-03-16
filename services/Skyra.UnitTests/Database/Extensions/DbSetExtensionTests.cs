using System.Threading.Tasks;
using NUnit.Framework;
using Skyra.Database.Extensions;
using Skyra.UnitTests.Database.Stubs;

namespace Skyra.UnitTests.Database.Extensions
{
	[TestFixture]
	public class DbSetExtensionTests
	{
		[Test]
		public async Task Upsert_ShouldNotInsert_WhenEntityIsAlreadyPresent()
		{
			// arrange

			await using var context = new TestDbContext();

			const int id = 1;

			var userToBeInserted = new UserStub
			{
				Id = id,
				Name = "Captain Smeghead"
			};

			var userToBeUpserted = new UserStub
			{
				Id = id,
				Name = "John Wick"
			};

			// act

			context.Add(userToBeInserted);
			await context.SaveChangesAsync();

			var value = await context.Users.UpsertAsync(id, () => userToBeUpserted);

			// assert

			Assert.AreEqual("Captain Smeghead", value.Name);
		}

		[Test]
		public async Task Upsert_ShouldInsert_WhenEntityIsNotPresent_AndKeepData()
		{
			// arrange

			using var context = new TestDbContext();
			const int id = 2;

			var userToBeUpserted = new UserStub
			{
				Id = id,
				Name = "John Wick"
			};

			// act

			var before = await context.Users.FindAsync(id);

			var after = await context.Users.UpsertAsync(id, () => userToBeUpserted);

			// assert

			Assert.IsNull(before);
			Assert.IsNotNull(after);
		}

		[Test]
		public async Task Upsert_ShouldInsert_WhenEntityIsNotPresent()
		{
			// arrange

			using var context = new TestDbContext();
			const int id = 3;

			var userToBeUpserted = new UserStub
			{
				Id = id,
				Name = "John Wick"
			};

			// act

			var before = await context.Users.FindAsync(id);

			var after = await context.Users.UpsertAsync(id, () => userToBeUpserted);

			// assert

			Assert.IsNull(before);
			Assert.IsNotNull(after);
			Assert.AreEqual(id, after.Id);
			Assert.AreEqual("John Wick", after.Name);
		}
	}
}
