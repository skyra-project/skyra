using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

#nullable disable

namespace Skyra.Database.Models.Entities
{
	[Table("asset")]
	public class Asset
	{
		[Column]
		public long Id { get; set; }

		[Column]
		[MaxLength(50)]
		public string Name { get; set; }

		// RFC 4288 allows Content-Type headers to be a maximum of 127/127 characters, making it 255 total
		[Column]
		[MaxLength(255)]
		public string ContentType { get; set; }

		[Column]
		public byte[] Data { get; set; }

		[Column]
		public DateTime LastModifiedAt { get; set; }

		// MD5 checksums are 128 bytes, so 32 characters in hex
		[Column]
		[MaxLength(32)]
		public string ETag { get; set; }
	}
}
