using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("giveaway")]
	public class Giveaway
	{
		[Required]
		[Column("title")]
		[StringLength(256)]
		public string Title { get; set; }

		[Column("ends_at")]
		public DateTime EndsAt { get; set; }

		[Key]
		[Column("guild_id")]
		[StringLength(19)]
		public string GuildId { get; set; }

		[Required]
		[Column("channel_id")]
		[StringLength(19)]
		public string ChannelId { get; set; }

		[Key]
		[Column("message_id")]
		[StringLength(19)]
		public string MessageId { get; set; }

		[Column("minimum")]
		public int Minimum { get; set; }

		[Column("minimum_winners")]
		public int MinimumWinners { get; set; }

		[Required]
		[Column("allowed_roles", TypeName = "character varying(19)[]")]
		public string[] AllowedRoles { get; set; }
	}
}
