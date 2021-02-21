using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("migrations")]
	public class Migration
	{
		[Key]
		[Column("id")]
		public int Id { get; set; }

		[Column("timestamp")]
		public long Timestamp { get; set; }

		[Required]
		[Column("name", TypeName = "character varying")]
		public string Name { get; set; }
	}
}
