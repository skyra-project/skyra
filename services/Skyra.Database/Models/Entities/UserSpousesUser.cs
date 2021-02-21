using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("user_spouses_user")]
	[Index(nameof(UserId2), Name = "IDX_039ee960316593d0e8102ae6c5")]
	[Index(nameof(UserId1), Name = "IDX_6bbc6de75851eb64e17c07a6a9")]
	public class UserSpousesUser
	{
		[Key]
		[Column("user_id_1")]
		[StringLength(19)]
		public string UserId1 { get; set; }

		[Key]
		[Column("user_id_2")]
		[StringLength(19)]
		public string UserId2 { get; set; }

		[ForeignKey(nameof(UserId1))]
		[InverseProperty(nameof(User.UserSpousesUserUserId1Navigations))]
		public virtual User UserId1Navigation { get; set; }

		[ForeignKey(nameof(UserId2))]
		[InverseProperty(nameof(User.UserSpousesUserUserId2Navigations))]
		public virtual User UserId2Navigation { get; set; }
	}
}
