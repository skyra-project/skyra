using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("schedule")]
	public class Schedule
	{
		[Key]
		[Column("id")]
		public int Id { get; set; }

		[Required]
		[Column("task_id", TypeName = "character varying")]
		public string TaskId { get; set; }

		[Column("time")]
		public DateTime Time { get; set; }

		[Column("recurring", TypeName = "character varying")]
		public string Recurring { get; set; }

		[Required]
		[Column("catch_up")]
		public bool CatchUp { get; set; }

		[Required]
		[Column("data", TypeName = "jsonb")]
		public string Data { get; set; }
	}
}
