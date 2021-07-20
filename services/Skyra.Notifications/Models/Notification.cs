using System;

namespace Skyra.Notifications.Models
{
	public class Notification
	{
		public string VideoId { get; set; } = null!;
		public string ChannelName { get; set; } = null!;
		public string ThumbnailUrl { get; set; } = null!;
		public DateTime PublishedAt { get; set; }
		public string Title { get; set; } = null!;
		public string ChannelId { get; set; } = null!;
	}
}
