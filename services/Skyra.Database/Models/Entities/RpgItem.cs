using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("rpg_item")]
	[Index(nameof(Name), nameof(Rarity), Name = "IDX_a10f6fa9678ea762b217fd77ba", IsUnique = true)]
	public class RpgItem
	{
		public RpgItem()
		{
			RpgUserItems = new HashSet<RpgUserItem>();
		}

		[Key]
		[Column("id")]
		public int Id { get; set; }

		[Required]
		[Column("name")]
		[StringLength(50)]
		public string Name { get; set; }

		[Column("maximum_durability")]
		public int MaximumDurability { get; set; }

		[Column("maximum_cooldown")]
		public short MaximumCooldown { get; set; }

		[Column("attack")]
		public double Attack { get; set; }

		[Column("defense")]
		public double Defense { get; set; }

		[Column("health")]
		public double Health { get; set; }

		[Column("required_energy")]
		public double RequiredEnergy { get; set; }

		[Column("rarity")]
		public int Rarity { get; set; }

		[Column("accuracy")]
		public short Accuracy { get; set; }

		[Required]
		[Column("effects", TypeName = "jsonb")]
		public string Effects { get; set; }

		[InverseProperty(nameof(RpgUserItem.Item))]
		public virtual ICollection<RpgUserItem> RpgUserItems { get; set; }
	}
}
