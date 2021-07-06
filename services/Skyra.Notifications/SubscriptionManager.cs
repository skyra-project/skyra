using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Timers;
using AngleSharp;
using AngleSharp.Html.Dom;
using Microsoft.Extensions.Logging;
using Skyra.Database;
using Skyra.Shared.Results;

namespace Skyra.Notifications
{
	public class SubscriptionManager
	{
		private readonly IBrowsingContext _browsingContext;
		private readonly IDatabase _database;

		private readonly ILogger<SubscriptionManager> _logger;
		private readonly PubSubClient _pubSubClient;
		private readonly Timer _resubTimer;
		private HttpClient _httpClient;

		private JsonSerializerOptions _jsonSerializerOptions = new JsonSerializerOptions
		{
			PropertyNamingPolicy = JsonNamingPolicy.CamelCase
		};

		private Dictionary<string, DateTime> _resubscribeTimes;

		public SubscriptionManager(PubSubClient pubSubClient, ILogger<SubscriptionManager> logger, IDatabase database, HttpClient httpClient, IBrowsingContext browsingContext)
		{
			_pubSubClient = pubSubClient;
			_logger = logger;
			_database = database;
			_httpClient = httpClient;
			_browsingContext = browsingContext;

			var timerInterval = int.Parse(Environment.GetEnvironmentVariable("RESUB_TIMER_INTERVAL") ?? "60");

			_resubTimer = new Timer(1000 * timerInterval);
			_resubTimer.Elapsed += ResubTimerOnElapsed;
		}

		private async void ResubTimerOnElapsed(object _, ElapsedEventArgs args)
		{
			var cloned = new Dictionary<string, DateTime>(_resubscribeTimes);
			foreach (var (key, value) in cloned)
			{
				if (DateTime.Now.AddMinutes(-10) >= value)
				{
					_logger.LogInformation("Resubscribing to channel {ChannelId}", key);
					var result = await _pubSubClient.SubscribeAsync(key);
					if (!result.Success)
					{
						_logger.LogInformation("No longer attempting to resubscribe to channel: {Channel}", key);
						_resubscribeTimes.Remove(key);
						return;
					}

					var resubTime = DateTime.Now.AddDays(5);
					_resubscribeTimes[key] = resubTime;
					await _database.UpdateSubscriptionTimerAsync(key, resubTime);
				}
			}
		}

		public async Task StartAsync()
		{
			var currentSubscriptions = await _database.GetSubscriptionsAsync();
			_resubscribeTimes = currentSubscriptions.Value.ToDictionary(sub => sub.Id, sub => sub.ExpiresAt);
			_resubTimer.Start();
		}

		public Task<Result> UpdateSubscriptionSettingsAsync(string guildId, string? channel, string? message)
		{
			return _database.UpdateYoutubeSubscriptionSettingsAsync(guildId, channel, message);
		}

		public async Task<Result> SubscribeAsync(string channelUrl, string guildId, string message, string discordNotificationChannelId)
		{
			var youtubeChannelId = await GetChannelIdAsync(channelUrl);

			if (youtubeChannelId is null)
			{
				return Result.FromError();
			}

			var exists = await _database.SubscriptionExistsAsync(channelUrl);

			if (exists.Value)
			{
				// we already have an active subscription, just need to add this guild to the sub
				await _database.AddYoutubeSubscriptionAsync(youtubeChannelId, guildId);
				await _database.UpdateYoutubeSubscriptionSettingsAsync(guildId, message, youtubeChannelId);
				_logger.LogInformation("Added a subscription to {YoutubeChannelId} for {GuildId}", youtubeChannelId, guildId);
			}
			else
			{
				// we don't have any subscriptions, so let's make a new one
				var subscriptionResult = await _pubSubClient.SubscribeAsync(youtubeChannelId);
				if (subscriptionResult.Success)
				{
					await _database.AddYoutubeSubscriptionAsync(youtubeChannelId, guildId, DateTime.Now.AddDays(5));
					await _database.UpdateYoutubeSubscriptionSettingsAsync(guildId, message, discordNotificationChannelId);
					_resubscribeTimes[youtubeChannelId] = DateTime.Now.AddDays(5);
				}
			}

			return Result.FromSuccess();
		}

		public async Task<Result> UnsubscribeAsync(string channelUrl, string guildId)
		{
			var channelId = await GetChannelIdAsync(channelUrl);

			if (channelId is null)
			{
				_logger.LogWarning("Fetching ID from channel {Url} returned no results", channelUrl);
				return Result.FromError();
			}

			var exists = await _database.SubscriptionExistsAsync(channelUrl);

			if (exists.Value)
			{
				// we already have an active subscription, just need to remove this guild from the sub
				await _database.RemoveSubscriptionAsync(channelId, guildId);
				_logger.LogInformation("removed a subscription to {ChannelId} for {GuildId}", channelId, guildId);
			}
			else
			{
				// we don't have any subscriptions, so let's remove it entirely
				var subscriptionResult = await _pubSubClient.UnsubscribeAsync(channelId);
				if (subscriptionResult.Success)
				{
					await _database.RemoveSubscriptionAsync(channelId, guildId);
					_resubscribeTimes.Remove(channelId);
				}
			}

			return Result.FromSuccess();
		}

		private async Task<string?> GetChannelIdAsync(string channelUrl)
		{
			var document = await _browsingContext.OpenAsync(channelUrl);
			if (document.StatusCode != HttpStatusCode.OK)
			{
				_logger.LogWarning("Did not recieve OK response from youtube for channel url of {Url} - instead received {Status}", channelUrl, document.StatusCode);
				return null;
			}

			var cell = document.QuerySelector("meta[itemprop='channelId']") as IHtmlMetaElement;

			if (cell is null)
			{
				_logger.LogWarning("Could not find <meta> tag for the channel-id for url {Url}", channelUrl);
				return null;
			}

			return cell.Content;
		}
	}
}
