using Microsoft.EntityFrameworkCore;

namespace Skyra.UnitTests.Database.Stubs
{
	public class TestDbContext : DbContext
	{
		public DbSet<UserStub> Users { get; set; } = null!;

		protected override void OnConfiguring(DbContextOptionsBuilder builder)
		{
			builder.UseInMemoryDatabase("database_unit_tests");
		}
	}
}
