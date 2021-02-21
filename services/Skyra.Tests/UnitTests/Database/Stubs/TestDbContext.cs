using Microsoft.EntityFrameworkCore;

namespace Skyra.Tests.UnitTests.Database.Stubs
{
	public class TestDbContext : DbContext
	{
		public DbSet<UserStub> Users { get; set; }

		protected override void OnConfiguring(DbContextOptionsBuilder builder)
		{
			builder.UseInMemoryDatabase("database_unit_tests");
		}
	}
}
