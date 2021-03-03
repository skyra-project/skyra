using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("rpg_battle")]
	[Index(nameof(ChallengedUser), Name = "REL_36e1b3bf944502050aa76aa399", IsUnique = true)]
	[Index(nameof(ChallengerUser), Name = "REL_5230797f292df6a36d1fb5f0f0", IsUnique = true)]
	public class RpgBattle
	{
		[Key]
		[Column("id")]
		public long Id { get; set; }

		[Column("challenger_turn")]
		public bool ChallengerTurn { get; set; }

		[Column("challenger_cooldown")]
		public short ChallengerCooldown { get; set; }

		[Column("challenger_health")]
		public int ChallengerHealth { get; set; }

		[Column("challenger_energy")]
		public int ChallengerEnergy { get; set; }

		[Required]
		[Column("challenger_effects", TypeName = "jsonb")]
		public string ChallengerEffects { get; set; }

		[Column("challenged_cooldown")]
		public short ChallengedCooldown { get; set; }

		[Column("challenged_health")]
		public int ChallengedHealth { get; set; }

		[Column("challenged_energy")]
		public int ChallengedEnergy { get; set; }

		[Required]
		[Column("challenged_effects", TypeName = "jsonb")]
		public string ChallengedEffects { get; set; }

		[Required]
		[Column("challenged_user")]
		[StringLength(19)]
		public string ChallengedUser { get; set; }

		[Column("challenged_weapon_id")]
		public long? ChallengedWeaponId { get; set; }

		[Required]
		[Column("challenger_user")]
		[StringLength(19)]
		public string ChallengerUser { get; set; }

		[Column("challenger_weapon_id")]
		public long? ChallengerWeaponId { get; set; }

		[ForeignKey(nameof(ChallengedUser))]
		[InverseProperty(nameof(RpgUser.RpgBattleChallengedUserNavigation))]
		public virtual RpgUser ChallengedUserNavigation { get; set; }

		[ForeignKey(nameof(ChallengedWeaponId))]
		[InverseProperty(nameof(RpgUserItem.RpgBattleChallengedWeapons))]
		public virtual RpgUserItem ChallengedWeapon { get; set; }

		[ForeignKey(nameof(ChallengerUser))]
		[InverseProperty(nameof(RpgUser.RpgBattleChallengerUserNavigation))]
		public virtual RpgUser ChallengerUserNavigation { get; set; }

		[ForeignKey(nameof(ChallengerWeaponId))]
		[InverseProperty(nameof(RpgUserItem.RpgBattleChallengerWeapons))]
		public virtual RpgUserItem ChallengerWeapon { get; set; }
	}
}
