using System.Threading.Tasks;
using Skyra.Database;
using Skyra.Database.Models;

namespace Skyra.Tests.UnitTests.Grpc.Stubs
{
	public class TestDatabase : IDatabase
	{
		public Task<PointsQuery> AddUserPointsAsync(string userId, long points)
		{
			throw new System.NotImplementedException();
		}

		public Task<PointsQuery> GetUserPointsAsync(string userId)
		{
			throw new System.NotImplementedException();
		}
	}
}
