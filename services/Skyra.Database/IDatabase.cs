using System.Threading.Tasks;
using Skyra.Database.Models;

namespace Skyra.Database
{
	public interface IDatabase
	{
		Task<PointsQuery> AddUserPointsAsync(string userId, long points);
		Task<PointsQuery> GetUserPointsAsync(string userId);
	}
}
