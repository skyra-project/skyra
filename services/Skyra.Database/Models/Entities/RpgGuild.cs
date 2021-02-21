using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("rpg_guild")]
	public class RpgGuild
	{
		public RpgGuild()
		{
			RpgGuildRanks = new HashSet<RpgGuildRank>();
			RpgUsers = new HashSet<RpgUser>();
		}

		[Key]
		[Column("id")]
		public int Id { get; set; }

		[Required]
		[Column("name")]
		[StringLength(50)]
		public string Name { get; set; }

		[Column("description")]
		[StringLength(200)]
		public string Description { get; set; }

		[Column("member_limit")]
		public short MemberLimit { get; set; }

		[Column("win_count")]
		public long WinCount { get; set; }

		[Column("lose_count")]
		public long LoseCount { get; set; }

		[Column("money_count")]
		public long MoneyCount { get; set; }

		[Column("bank_limit")]
		public long BankLimit { get; set; }

		[Column("upgrade")]
		public short Upgrade { get; set; }

		[InverseProperty(nameof(RpgGuildRank.Guild))]
		public virtual ICollection<RpgGuildRank> RpgGuildRanks { get; set; }

		[InverseProperty(nameof(RpgUser.Guild))]
		public virtual ICollection<RpgUser> RpgUsers { get; set; }
	}
}
