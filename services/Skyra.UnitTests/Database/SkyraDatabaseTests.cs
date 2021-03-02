using System.Threading.Tasks;
using NUnit.Framework;
using Skyra.Database;

namespace Skyra.UnitTests.Database
{
	public class SkyraDatabaseTests
	{
		[Test]
        public async Task MemberService_GetPoints_ShouldReturnSucceedFalse_WhenExceptionOccurs()
        {
			// arrange

			var database = new SkyraDatabase(null); // we pass null here on purpose, as it simulates something going wrong and thus making it throw.

			// act

			var result = await database.GetUserPointsAsync("testing1");

			// assert

			Assert.IsFalse(result.Success);
        }

        [Test]
        public async Task MemberService_AddPoints_ShouldReturnSucceedFalse_WhenExceptionOccurs()
        {
	        // arrange

	        var database = new SkyraDatabase(null); // we pass null here on purpose, as it simulates something going wrong and thus making it throw.

	        // act

	        var result = await database.AddUserPointsAsync("testing1", 100);

	        // assert

	        Assert.IsFalse(result.Success);
        }
	}
}
