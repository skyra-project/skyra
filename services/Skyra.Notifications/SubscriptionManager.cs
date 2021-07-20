using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
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

		private Dictionary<string, DateTime> _resubscribeTimes = new Dictionary<string, DateTime>();

		public SubscriptionManager(PubSubClient pubSubClient, ILogger<SubscriptionManager> logger, IDatabase database, IBrowsingContext browsingContext)
		{
			_pubSubClient = pubSubClient;
			_logger = logger;
			_database = database;
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

			if (!currentSubscriptions.Success)
			{
				throw new InvalidOperationException("Could not retrieve current subscriptions from the database.");
			}

			_resubscribeTimes = currentSubscriptions.Value!.ToDictionary(sub => sub.Id, sub => sub.ExpiresAt);
			_resubTimer.Start();
		}

		public Task<Result> UpdateSubscriptionSettingsAsync(string guildId, string? channel, string? message)
		{
			return _database.UpdateYoutubeSubscriptionSettingsAsync(guildId, channel, message);
		}

		public async Task<Result<bool>> IsSubscribedAsync(string guildId, string channelUrl)
		{
			var (id, _) = await GetChannelInfoAsync(channelUrl);

			if (id is null)
			{
				return Result<bool>.FromError();
			}

			return Result<bool>.FromSuccess(await _database.IsSubscribedAsync(guildId, id));
		}

		public async Task<Result> SubscribeAsync(string channelUrl, string guildId, string message, string discordNotificationChannelId)
		{
			var (youtubeChannelId, youtubeChannelName) = await GetChannelInfoAsync(channelUrl);

			if (youtubeChannelId is null || youtubeChannelName is null)
			{
				return Result.FromError();
			}

			var exists = await _database.SubscriptionExistsAsync(youtubeChannelId);

			if (exists.Value)
			{
				// we already have an active subscription, just need to add this guild to the sub
				await _database.AddYoutubeSubscriptionAsync(youtubeChannelId,youtubeChannelName, guildId);
				await _database.UpdateYoutubeSubscriptionSettingsAsync(guildId, message, discordNotificationChannelId);
				_logger.LogInformation("Added a subscription to {YoutubeChannelId} for {GuildId}", youtubeChannelId, guildId);
			}
			else
			{
				// we don't have any subscriptions, so let's make a new one
				var subscriptionResult = await _pubSubClient.SubscribeAsync(youtubeChannelId);
				if (subscriptionResult.Success)
				{
					await _database.AddYoutubeSubscriptionAsync(youtubeChannelId, youtubeChannelName, guildId, DateTime.Now.AddDays(5));
					await _database.UpdateYoutubeSubscriptionSettingsAsync(guildId, message, discordNotificationChannelId);
					_resubscribeTimes[youtubeChannelId] = DateTime.Now.AddDays(5);
				}
			}

			return Result.FromSuccess();
		}

		public async Task<Result> UnsubscribeAsync(string channelUrl, string guildId)
		{
			var (channelId, _) = await GetChannelInfoAsync(channelUrl);

			if (channelId is null)
			{
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

		public Task<Result> UnsubscribeAllAsync(string guildId)
		{
			return _database.UnsubscribeFromAllAsync(guildId);
		}

		private async Task<(string?, string?)> GetChannelInfoAsync(string channelUrl)
		{
			var document = await _browsingContext.OpenAsync(channelUrl);
			if (document.StatusCode != HttpStatusCode.OK)
			{
				_logger.LogError("Did not recieve OK response from youtube for channel url of {Url} - instead received {Status}", channelUrl, document.StatusCode);
				return (null, null);
			}

			var cell = document.QuerySelector("meta[itemprop='channelId']") as IHtmlMetaElement;

			if (cell is null)
			{
				_logger.LogError("Could not find <meta> tag for the channel-id for url {Url}", channelUrl);
				return (null, null);
			}

			var name = document.QuerySelector("meta[property='og:title']").Attributes["content"].Value;

			if (name is null)
			{
				_logger.LogError("Could not find 'og:title' tag for url {Url}", channelUrl);
				return (null, null);
			}

			return (cell.Content, name);
		}
	}
}
