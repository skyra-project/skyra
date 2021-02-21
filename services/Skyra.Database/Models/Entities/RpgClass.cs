using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("rpg_class")]
	[Index(nameof(Name), Name = "UQ_c21506119f763eff259ec4a91cd", IsUnique = true)]
	public class RpgClass
	{
		public RpgClass()
		{
			RpgUsers = new HashSet<RpgUser>();
		}

		[Key]
		[Column("id")]
		public int Id { get; set; }

		[Required]
		[Column("name")]
		[StringLength(20)]
		public string Name { get; set; }

		[Column("attack_multiplier")]
		public double AttackMultiplier { get; set; }

		[Column("defense_multiplier")]
		public double DefenseMultiplier { get; set; }

		[Column("agility_multiplier")]
		public double AgilityMultiplier { get; set; }

		[Column("energy_multiplier")]
		public double EnergyMultiplier { get; set; }

		[Column("luck_multiplier")]
		public double LuckMultiplier { get; set; }

		[InverseProperty(nameof(RpgUser.Class))]
		public virtual ICollection<RpgUser> RpgUsers { get; set; }
	}
}
