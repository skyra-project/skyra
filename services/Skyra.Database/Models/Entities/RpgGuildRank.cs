using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("rpg_guild_rank")]
	public class RpgGuildRank
	{
		public RpgGuildRank()
		{
			RpgUsers = new HashSet<RpgUser>();
		}

		[Key]
		[Column("id")]
		public int Id { get; set; }

		[Required]
		[Column("name")]
		[StringLength(50)]
		public string Name { get; set; }

		[Column("guild_id")]
		public int? GuildId { get; set; }

		[ForeignKey(nameof(GuildId))]
		[InverseProperty(nameof(RpgGuild.RpgGuildRanks))]
		public virtual RpgGuild Guild { get; set; }

		[InverseProperty(nameof(RpgUser.GuildRank))]
		public virtual ICollection<RpgUser> RpgUsers { get; set; }
	}
}
