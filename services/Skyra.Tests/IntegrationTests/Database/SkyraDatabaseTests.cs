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
        [Test]
        public async Task SkyraDatabase_ShouldReturnSamePoints_WhenUserDoesNotExist()
        {
            // arrange

            using var database = new SkyraDatabase(new SkyraDbContext());
            const string id = "1";
            const long points = 250;

            // act

            var result = await database.AddUserPointsAsync(id, points);

            // assert

            Assert.IsTrue(result.Success);
            Assert.AreEqual(points, result.Points);
        }
    }
}
