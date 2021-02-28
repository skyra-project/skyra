using System.Threading.Tasks;

namespace Skyra.Moderation.Filters
{
    public interface IFilter
    {
        Task<int> RunAsync();
    }
}
