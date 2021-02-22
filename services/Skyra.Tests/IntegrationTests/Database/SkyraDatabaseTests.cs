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
        [SetUp]
        public async Task Setup()
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

        [Test]
        public async Task SkyraDatabase_AddUserPoints_ShouldReturnSamePoints_WhenUserDoesNotExist()
        {
            // arrange

            using var database = new SkyraDatabase(GetContext());
            const string id = "testing1";
            const long points = 250;

            // act

            var result = await database.AddUserPointsAsync(id, points);

            // assert

            Assert.IsTrue(result.Success);
            Assert.AreEqual(points, result.Points);
        }
    }
}
