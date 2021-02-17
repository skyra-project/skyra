using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

#nullable disable

namespace Skyra.Database.Models
{
    [Table("client")]
    public partial class Client
    {
        [Key]
        [Column("id")]
        [StringLength(19)]
        public string Id { get; set; }
        [Required]
        [Column("user_blocklist", TypeName = "character varying[]")]
        public string[] UserBlocklist { get; set; }
        [Required]
        [Column("user_boost", TypeName = "character varying[]")]
        public string[] UserBoost { get; set; }
        [Required]
        [Column("guild_blocklist", TypeName = "character varying[]")]
        public string[] GuildBlocklist { get; set; }
        [Required]
        [Column("guild_boost", TypeName = "character varying[]")]
        public string[] GuildBoost { get; set; }
    }
}
