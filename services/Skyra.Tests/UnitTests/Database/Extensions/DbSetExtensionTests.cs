using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using Skyra.Database.Extensions;
using Skyra.Tests.UnitTests.Database.Stubs;

namespace Skyra.Tests.UnitTests.Database.Extensions
{
	[TestFixture]
	public class DbSetExtensionTests
	{
		[Test]
		public async Task Upsert_ShouldNotInsert_WhenEntityIsAlreadyPresent()
		{
			// arrange

			using var context = new TestDbContext();

			var userToBeInserted = new UserStub
			{
				Id = 1,
				Name = "Captain Smeghead"
			};

			var userToBeUpserted = new UserStub
			{
				Id = 1,
				Name = "John Wick"
			};

			// act

			context.Add(userToBeInserted);
			await context.SaveChangesAsync();

			var value = await context.Users.UpsertAsync(1, () => userToBeUpserted);

			// assert

			Assert.AreEqual("Captain Smeghead", value.Name);
		}

		[Test]
		public async Task Upsert_ShouldInsert_WhenEntityIsNotPresent_AndKeepData()
		{
			// arrange

			using var context = new TestDbContext();

			var userToBeUpserted = new UserStub
			{
				Id = 1,
				Name = "John Wick"
			};

			// act

			var before = await context.Users.FindAsync(1);

			var after = await context.Users.UpsertAsync(1, () => userToBeUpserted);

			// assert

			Assert.IsNull(before);
			Assert.IsNotNull(after);
		}

		[Test]
		public async Task Upsert_ShouldInsert_WhenEntityIsNotPresent()
		{
			// arrange

			using var context = new TestDbContext();

			var userToBeUpserted = new UserStub
			{
				Id = 1,
				Name = "John Wick"
			};

			// act

			var before = await context.Users.FindAsync(1);

			var after = await context.Users.UpsertAsync(1, () => userToBeUpserted);

			// assert

			Assert.IsNull(before);
			Assert.IsNotNull(after);
			Assert.AreEqual(1, after.Id);
			Assert.AreEqual("John Wick", after.Name);
		}

	}
}
