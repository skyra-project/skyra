using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("starboard")]
	public class Starboard
	{
		[Column("enabled")]
		public bool Enabled { get; set; }

		[Required]
		[Column("user_id")]
		[StringLength(19)]
		public string UserId { get; set; }

		[Key]
		[Column("message_id")]
		[StringLength(19)]
		public string MessageId { get; set; }

		[Required]
		[Column("channel_id")]
		[StringLength(19)]
		public string ChannelId { get; set; }

		[Key]
		[Column("guild_id")]
		[StringLength(19)]
		public string GuildId { get; set; }

		[Column("star_message_id")]
		[StringLength(19)]
		public string StarMessageId { get; set; }

		[Column("stars")]
		public int Stars { get; set; }
	}
}
