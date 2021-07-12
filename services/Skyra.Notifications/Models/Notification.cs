using System;

namespace Skyra.Notifications.Models
{
	public class Notification
	{
		public string VideoId { get; set; }
		public string ChannelName { get; set; }
		public string ThumbnailUrl { get; set; }
		public DateTime PublishedAt { get; set; }
		public string Title { get; set; }
		public string ChannelId { get; set; }
	}
}
