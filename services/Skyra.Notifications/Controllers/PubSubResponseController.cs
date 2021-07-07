using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Xml.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Skyra.Database;
using Skyra.Notifications.Models;

namespace Skyra.Notifications.Controllers
{
	[ApiController]
	[Route("notifications")]
	public class PubSubResponseController : ControllerBase
	{
		private readonly RequestCache _cache;
		private readonly IDatabase _database;
		private readonly ILogger<PubSubResponseController> _logger;
		private readonly ConcurrentQueue<Notification> _notificationQueue;
		private readonly DateTime _startupTime = DateTime.Now;

		public PubSubResponseController(ILogger<PubSubResponseController> logger, RequestCache cache, ConcurrentQueue<Notification> notificationQueue, IDatabase database)
		{
			_logger = logger;
			_cache = cache;
			_notificationQueue = notificationQueue;
			_database = database;
		}

		[HttpGet]
		public async Task Authenticate()
		{
			var topic = Request.Query["hub.topic"];
			var mode = Request.Query["hub.mode"];
			var challenge = Request.Query["hub.challenge"];
			var queryParams = HttpUtility.ParseQueryString(new Uri(topic).Query);

			var channelId = queryParams["channel_id"];
			var isSubscription = mode == "subscribe";
			// TODO: why is this not logging the lease time correctly?
			_logger.LogInformation("Received Authentication request with challenge {Challenge} for topic {Topic} ({Mode})",
				challenge, channelId, mode);

			if (!_cache.GetRequest(channelId, isSubscription))
			{
				_logger.LogCritical("No request found with channel_id {ChannelId} and mode {Mode} from IP: {Ip}", channelId, mode, Request.Host.Host);
				Response.StatusCode = 404;
				return;
			}

			Response.StatusCode = 200;
			await Response.Body.WriteAsync(Encoding.ASCII.GetBytes(challenge));
		}

		[HttpPost]
		public async Task<IActionResult> Notify()
		{
			var elements = await GetElementsAsync();

			var entry = elements.FirstOrDefault(element => element.Name.LocalName == "entry");

			if (entry is null) // it's a delete, they have no 'entry' element, ignore
			{
				var atby = elements.First(element => element.Name.LocalName == "deleted-entry").Elements().First(element => element.Name.LocalName == "by");
				var url = atby.Elements().First(element => element.Name.LocalName == "uri").Value;
				_logger.LogInformation("Ignoring deleted video from channel: {Id}", url);
				return Ok();
			}

			var (published, channelId, title, videoId) = GetMetadata(entry);

			// if it was published more then 10 minutes ago, we ignore it, as youtube likes to send videos from hours ago
			if (published.AddMinutes(10) <= _startupTime)
			{
				_logger.LogInformation("Ignoring uploaded video that was uploaded at {PublishedTime} with ID of {Id}", published, videoId);
			}

			var subscriptionResult = await _database.GetSubscriptionAsync(channelId);

			if (!subscriptionResult.Success || subscriptionResult.Value is null)
			{
				// we don't actually have a subscription, but youtube is sending notifications for that channel anyway
				_logger.LogInformation("Ignoring event with video ID of {VideoId} because it was not found as a subscription in the database", videoId);
				return Ok();
			}

			var ids = subscriptionResult.Value.AlreadySeenIds;

			if (ids.Contains(videoId))
			{
				// we have already posted this video, so let's ignore it, as youtube likes to send duplicates
				_logger.LogInformation("Ignoring event with video ID of {VideoId} because it's already been seen in the database", videoId);
				return Ok();
			}

			// at this point, we can be pretty sure that we've covered all bases.
			// thank you, google, for making me suffer.

			await _database.AddSeenVideoAsync(channelId, videoId);

			var channelName = entry.Elements().First(element => element.Name.LocalName == "author").Elements().First(element => element.Name.LocalName == "name").Value;

			var thumbnailUrl = $"https://img.youtube.com/vi/{videoId}/maxresdefault.jpg";

			_logger.LogInformation("QUEUE");
			_notificationQueue.Enqueue(new Notification
			{
				ChannelId = channelId,
				Title = title,
				VideoId = videoId,
				ThumbnailUrl = thumbnailUrl,
				PublishedAt = published,
				ChannelName = channelName
			});

			return Ok();
		}

		private static (DateTime published, string? channelId, string? title, string? videoId) GetMetadata(XElement? entry)
		{
			var published = DateTime.Parse(entry.Elements().First(element => element.Name.LocalName == "published").Value);
			var channelId = entry.Elements().First(element => element.Name.LocalName == "channelId").Value;
			var title = entry.Elements().First(element => element.Name.LocalName == "title").Value;
			var videoId = entry.Elements().First(element => element.Name.LocalName == "videoId").Value;
			return (published, channelId, title, videoId);
		}

		private async Task<IEnumerable<XElement>?> GetElementsAsync()
		{
			var reader = new StreamReader(Request.Body);
			var text = await reader.ReadToEndAsync();
			var document = XElement.Parse(text);
			var elements = document.Elements();
			return elements;
		}
	}
}
