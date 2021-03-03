using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("user_game_integration")]
	public class UserGameIntegration
	{
		[Key]
		[Column("id")]
		public int Id { get; set; }

		[Required]
		[Column("game")]
		[StringLength(35)]
		public string Game { get; set; }

		[Required]
		[Column("extra_data", TypeName = "jsonb")]
		public string ExtraData { get; set; }

		[Column("user_id")]
		[StringLength(19)]
		public string UserId { get; set; }

		[ForeignKey(nameof(UserId))]
		[InverseProperty("UserGameIntegrations")]
		public virtual User User { get; set; }
	}
}
