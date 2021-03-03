using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("rpg_user_item")]
	public class RpgUserItem
	{
		public RpgUserItem()
		{
			RpgBattleChallengedWeapons = new HashSet<RpgBattle>();
			RpgBattleChallengerWeapons = new HashSet<RpgBattle>();
			RpgUsers = new HashSet<RpgUser>();
		}

		[Key]
		[Column("id")]
		public long Id { get; set; }

		[Column("durability")]
		public int Durability { get; set; }

		[Column("item_id")]
		public int? ItemId { get; set; }

		[ForeignKey(nameof(ItemId))]
		[InverseProperty(nameof(RpgItem.RpgUserItems))]
		public virtual RpgItem Item { get; set; }

		[InverseProperty(nameof(RpgBattle.ChallengedWeapon))]
		public virtual ICollection<RpgBattle> RpgBattleChallengedWeapons { get; set; }

		[InverseProperty(nameof(RpgBattle.ChallengerWeapon))]
		public virtual ICollection<RpgBattle> RpgBattleChallengerWeapons { get; set; }

		[InverseProperty(nameof(RpgUser.EquippedItem))]
		public virtual ICollection<RpgUser> RpgUsers { get; set; }
	}
}
