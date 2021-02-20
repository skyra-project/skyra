using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

#nullable disable

namespace Skyra.Database.Models
{
	[Table("migrations")]
	public partial class Migration
	{
		[Key]
		[Column("id")]
		public int Id { get; set; }
		[Column("timestamp")]
		public long Timestamp { get; set; }
		[Required]
		[Column("name", TypeName = "character varying")]
		public string Name { get; set; }
	}
}
