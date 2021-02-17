using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

#nullable disable

namespace Skyra.Database.Models
{
    [Table("member")]
    public partial class Member
    {
        [Key]
        [Column("guild_id")]
        [StringLength(19)]
        public string GuildId { get; set; }
        [Key]
        [Column("user_id")]
        [StringLength(19)]
        public string UserId { get; set; }
        [Column("points")]
        public long Points { get; set; }
    }
}
