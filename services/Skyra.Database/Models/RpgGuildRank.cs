using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

#nullable disable

namespace Skyra.Database.Models
{
	[Table("rpg_guild_rank")]
	public partial class RpgGuildRank
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
