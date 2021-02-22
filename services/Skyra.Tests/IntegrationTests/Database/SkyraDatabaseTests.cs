using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using Skyra.Database;

namespace Skyra.Tests.IntegrationTests.Database
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
            await using var context = GetContext();

            var name = context.Database.GetDbConnection().Database;

            if (name != "test")
            {
                Console.Error.WriteLine($"Exiting tests due to database name not being `test`, database name was {name}");
                Environment.Exit(-1);
            }

            foreach (var user in context.Users)
            {
                context.Users.Remove(user);
            }

            await context.SaveChangesAsync();
        }

        public SkyraDbContext GetContext()
        {
            var optionsBuilder = new DbContextOptionsBuilder<SkyraDbContext>();

            var user = Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "postgres";
            var password = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD") ?? "postgres";
            var host = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
            var port = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
            var name = "test";

            optionsBuilder.UseNpgsql(
                $"User ID={user};Password={password};Server={host};Port={port};Database={name};Pooling=true;",
                options => options.EnableRetryOnFailure()).UseSnakeCaseNamingConvention();

            return new SkyraDbContext(optionsBuilder.Options);
        }

        [Test]
        public async Task SkyraDatabase_GetUserPoints_ShouldReturnZero_WhenUserDoesNotExist()
        {
            // arrange

            using var database = new SkyraDatabase(GetContext());
            const string id = "testing1";

            // act

            var result = await database.GetUserPointsAsync(id);

            // assert

            Assert.IsTrue(result.Success);
            Assert.AreEqual(0, result.Points);
        }

        [TestCase(10)]
        [TestCase(250)]
        [TestCase(6000)]
        [TestCase(42)]
        public async Task SkyraDatabase_GetUserPoints_ShouldReturnPoints_WhenUserDoesExist(int points)
        {
            // arrange

            using var database = new SkyraDatabase(GetContext());
            const string id = "testing1";

            // act

            await database.AddUserPointsAsync(id, points);
            var result = await database.GetUserPointsAsync(id);

            // assert

            Assert.IsTrue(result.Success);
            Assert.AreEqual(points, result.Points);
        }

        [TestCase(45)]
        [TestCase(1)]
        [TestCase(890)]
        [TestCase(1234)]
        public async Task SkyraDatabase_AddUserPoints_ShouldReturnSamePoints_WhenUserDoesNotExist(int points)
        {
            // arrange

            using var database = new SkyraDatabase(GetContext());
            const string id = "testing1";

            // act

            var firstResult = await database.AddUserPointsAsync(id, points);
            var finalResult = await database.GetUserPointsAsync(id);

            // assert

            Assert.IsTrue(firstResult.Success);
            Assert.IsTrue(finalResult.Success);
            Assert.AreEqual(points, finalResult.Points);
        }

        [TestCase(25, 55)]
        [TestCase(123, 22222)]
        [TestCase(10, 23)]
        [TestCase(1, 2)]
        public async Task SkyraDatabase_AddUserPoints_ShouldReturnAdditionalPoints_WhenUserDoesExist(int beginningPoints, int additionalPoints)
        {
            // arrange

            using var database = new SkyraDatabase(GetContext());
            const string id = "testing1";

            // act

            var firstResult = await database.AddUserPointsAsync(id, beginningPoints);
            var secondResult = await database.AddUserPointsAsync(id, additionalPoints);
            var finalResult = await database.GetUserPointsAsync(id);
            // assert

            Assert.IsTrue(firstResult.Success);
            Assert.IsTrue(secondResult.Success);
            Assert.IsTrue(finalResult.Success);
            Assert.AreEqual(beginningPoints + additionalPoints, finalResult.Points);
        }
    }
}
