using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Skyra.Notifications.Models;
using Skyra.Shared.Results;

namespace Skyra.Notifications
{
	public class PubSubClient
	{
		private readonly string PubSubUrl;
		private readonly string CallbackUrl;
		private RequestCache _cache;
		private HttpClient _httpClient;
		private ILogger<PubSubClient> _logger;

		public PubSubClient(RequestCache cache, HttpClient httpClient, ILogger<PubSubClient> logger)
		{
			_cache = cache;
			_httpClient = httpClient;
			_logger = logger;
			PubSubUrl = Environment.GetEnvironmentVariable("PUBSUB_URL") ?? "https://pubsubhubbub.appspot.com/";
			CallbackUrl = Environment.GetEnvironmentVariable("CALLBACK_URL") ?? throw new ArgumentException("The environement variable 'CALLBACK_URL' must be set.");
		}

		public  Task<Result> SubscribeAsync(string channelId)
		{
			return SendRequestAsync(channelId, true);
		}

		public Task<Result> UnsubscribeAsync(string channelId)
		{
			return SendRequestAsync(channelId, false);
		}

		private async Task<Result> SendRequestAsync(string channelId, bool isSubscription)
		{
			var collection = new List<KeyValuePair<string?, string?>>();
			collection.Add(new("hub.callback", CallbackUrl));
			collection.Add(new("hub.mode", isSubscription ? "subscribe" : "unsubscribe"));
			collection.Add(new("hub.topic", $"https://www.youtube.com/xml/feeds/videos.xml?channel_id={channelId}"));

			var options = new FormUrlEncodedContent(collection);
			_cache.AddRequest(channelId, true);

			var status = await _httpClient.PostAsync(PubSubUrl, options);

			if (status.IsSuccessStatusCode)
			{
				return Result.FromSuccess();
			}
			else
			{
				_logger.LogWarning("Subscription request to pubsubhubbub failed: {Error}", await status.Content.ReadAsStringAsync());
				_cache.RemoveRequest(channelId);
				return Result.FromError();
			}
		}
	}
}
