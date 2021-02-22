using System.ComponentModel.DataAnnotations;

namespace Skyra.Tests.UnitTests.Database.Stubs
{
	public class UserStub
	{
		[Key]
		public int Id { get; set; }

		public string Name { get; set; } = null!;
	}
}
