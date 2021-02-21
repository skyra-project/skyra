using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("rpg_user")]
	public class RpgUser
	{
		[Required]
		[Column("name")]
		[StringLength(32)]
		public string Name { get; set; }

		[Column("win_count")]
		public long WinCount { get; set; }

		[Column("death_count")]
		public long DeathCount { get; set; }

		[Column("crate_common_count")]
		public int CrateCommonCount { get; set; }

		[Column("crate_uncommon_count")]
		public int CrateUncommonCount { get; set; }

		[Column("crate_rare_count")]
		public int CrateRareCount { get; set; }

		[Column("crate_legendary_count")]
		public int CrateLegendaryCount { get; set; }

		[Column("attack")]
		public int Attack { get; set; }

		[Column("health")]
		public int Health { get; set; }

		[Column("agility")]
		public int Agility { get; set; }

		[Column("energy")]
		public int Energy { get; set; }

		[Column("luck")]
		public int Luck { get; set; }

		[Column("class_id")]
		public int? ClassId { get; set; }

		[Column("equipped_item_id")]
		public long? EquippedItemId { get; set; }

		[Column("guild_id")]
		public int? GuildId { get; set; }

		[Column("guild_rank_id")]
		public int? GuildRankId { get; set; }

		[Key]
		[Column("user_id")]
		[StringLength(19)]
		public string UserId { get; set; }

		[ForeignKey(nameof(ClassId))]
		[InverseProperty(nameof(RpgClass.RpgUsers))]
		public virtual RpgClass Class { get; set; }

		[ForeignKey(nameof(EquippedItemId))]
		[InverseProperty(nameof(RpgUserItem.RpgUsers))]
		public virtual RpgUserItem EquippedItem { get; set; }

		[ForeignKey(nameof(GuildId))]
		[InverseProperty(nameof(RpgGuild.RpgUsers))]
		public virtual RpgGuild Guild { get; set; }

		[ForeignKey(nameof(GuildRankId))]
		[InverseProperty(nameof(RpgGuildRank.RpgUsers))]
		public virtual RpgGuildRank GuildRank { get; set; }

		[ForeignKey(nameof(UserId))]
		[InverseProperty("RpgUser")]
		public virtual User User { get; set; }

		[InverseProperty(nameof(RpgBattle.ChallengedUserNavigation))]
		public virtual RpgBattle RpgBattleChallengedUserNavigation { get; set; }

		[InverseProperty(nameof(RpgBattle.ChallengerUserNavigation))]
		public virtual RpgBattle RpgBattleChallengerUserNavigation { get; set; }
	}
}
