using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

#nullable disable

namespace Skyra.Database.Models
{
	[Table("banner")]
	public partial class Banner
	{
		[Key]
		[Column("id")]
		[StringLength(6)]
		public string Id { get; set; }
		[Required]
		[Column("group")]
		[StringLength(32)]
		public string Group { get; set; }
		[Required]
		[Column("title")]
		[StringLength(128)]
		public string Title { get; set; }
		[Required]
		[Column("author_id")]
		[StringLength(19)]
		public string AuthorId { get; set; }
		[Column("price")]
		public int Price { get; set; }
	}
}
