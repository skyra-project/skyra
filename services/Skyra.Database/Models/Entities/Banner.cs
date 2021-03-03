using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("banner")]
	public class Banner
	{
		[Key]
		[Column("id")]
		[StringLength(6)]
		public string Id { get; set; }

		[Required]
		[Column("group")]
		[StringLength(32)]
		public string Group { get; set; }

		[Required]
		[Column("title")]
		[StringLength(128)]
		public string Title { get; set; }

		[Required]
		[Column("author_id")]
		[StringLength(19)]
		public string AuthorId { get; set; }

		[Column("price")]
		public int Price { get; set; }
	}
}
