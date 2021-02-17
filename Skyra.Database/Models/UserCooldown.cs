using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

#nullable disable

namespace Skyra.Database.Models
{
    [Table("user_cooldown")]
    public partial class UserCooldown
    {
        [Column("daily")]
        public DateTime? Daily { get; set; }
        [Column("reputation")]
        public DateTime? Reputation { get; set; }
        [Key]
        [Column("user_id")]
        [StringLength(19)]
        public string UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        [InverseProperty("UserCooldown")]
        public virtual User User { get; set; }
    }
}
