using System.Threading.Tasks;
using Skyra.Database.Models;

namespace Skyra.Database
{
	public interface IDatabase
	{
		Task<PointsQuery> AddUserPointsAsync(string userId, int points);
		Task<PointsQuery> GetUserPointsAsync(string userId);
	}
}
