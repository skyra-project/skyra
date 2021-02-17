using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

#nullable disable

namespace Skyra.Database.Models
{
    [Table("twitch_stream_subscription")]
    public partial class TwitchStreamSubscription
    {
        [Key]
        [Column("id")]
        [StringLength(16)]
        public string Id { get; set; }
        [Column("is_streaming")]
        public bool IsStreaming { get; set; }
        [Column("expires_at")]
        public DateTime ExpiresAt { get; set; }
        [Required]
        [Column("guild_ids", TypeName = "character varying(19)[]")]
        public string[] GuildIds { get; set; }
    }
}
