using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

#nullable disable

namespace Skyra.Database.Models
{
    [Table("moderation")]
    public partial class Moderation
    {
        [Key]
        [Column("case_id")]
        public int CaseId { get; set; }
        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }
        [Column("duration")]
        public int? Duration { get; set; }
        [Column("extra_data", TypeName = "json")]
        public string ExtraData { get; set; }
        [Key]
        [Column("guild_id")]
        [StringLength(19)]
        public string GuildId { get; set; }
        [Required]
        [Column("moderator_id")]
        [StringLength(19)]
        public string ModeratorId { get; set; }
        [Column("reason")]
        [StringLength(2000)]
        public string Reason { get; set; }
        [Column("image_url")]
        [StringLength(2000)]
        public string ImageUrl { get; set; }
        [Column("user_id")]
        [StringLength(19)]
        public string UserId { get; set; }
        [Column("type")]
        public short Type { get; set; }
    }
}
