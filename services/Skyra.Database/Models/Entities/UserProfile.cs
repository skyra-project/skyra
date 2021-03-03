using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("user_profile")]
	public class UserProfile
	{
		[Required]
		[Column("banners", TypeName = "character varying[]")]
		public string[] Banners { get; set; }

		[Required]
		[Column("public_badges", TypeName = "character varying[]")]
		public string[] PublicBadges { get; set; }

		[Required]
		[Column("badges", TypeName = "character varying[]")]
		public string[] Badges { get; set; }

		[Column("color")]
		public int Color { get; set; }

		[Column("vault")]
		public long Vault { get; set; }

		[Required]
		[Column("banner_level")]
		[StringLength(6)]
		public string BannerLevel { get; set; }

		[Required]
		[Column("banner_profile")]
		[StringLength(6)]
		public string BannerProfile { get; set; }

		[Column("dark_theme")]
		public bool DarkTheme { get; set; }

		[Key]
		[Column("user_id")]
		[StringLength(19)]
		public string UserId { get; set; }

		[ForeignKey(nameof(UserId))]
		[InverseProperty("UserProfile")]
		public virtual User User { get; set; }
	}
}
