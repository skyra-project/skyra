using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Skyra.Database;
using Skyra.Grpc.Services;
using Skyra.Grpc.Services.Shared;
using Skyra.Notifications.Models;
using Action = Skyra.Grpc.Services.Action;
using Status = Skyra.Grpc.Services.Shared.Status;
using YoutubeServiceBase = Skyra.Grpc.Services.YoutubeSubscription.YoutubeSubscriptionBase;

namespace Skyra.Notifications.Services
{
	public class YoutubeService : YoutubeServiceBase
	{
		private readonly IDatabase _database;
		private readonly ConcurrentQueue<Notification> _notificationQueue;
		private readonly SubscriptionManager _subscriptionManager;
		private readonly ILogger<YoutubeService> _logger;

		public YoutubeService(IDatabase database, SubscriptionManager subscriptionManager, ConcurrentQueue<Notification> notificationQueue, ILogger<YoutubeService> logger)
		{
			_database = database;
			_subscriptionManager = subscriptionManager;
			_notificationQueue = notificationQueue;
			_logger = logger;
		}

		public override async Task<SubscriptionListResult> GetSubscriptions(GetSubscriptionsQuery request, ServerCallContext _)
		{
			var subscriptions = await _database.GetSubscriptionsAsync(request.GuildId);

			var response = new SubscriptionListResult();

			if (subscriptions.Success)
			{
				foreach (var sub in subscriptions.Value!)
				{
					var subscription = new Subscription
					{
						YoutubeChannelId = sub.Id,
						YoutubeChannelTitle = sub.ChannelTitle
					};
					response.Subscriptions.Add(subscription);
				}
				response.Status = Status.Success;
			}
			else
			{
				response.Status = Status.Failed;
			}

			return response;
		}

		public override Task<Result> ManageSubscription(SubscriptionManageQuery request, ServerCallContext _)
		{
			return request.Type switch
			{
				Action.Subscribe => HandleSubscription(request.YoutubeChannelUrl, request.GuildId, request.NotificationMessage, request.GuildChannelId),
				Action.Unsubscribe => HandleUnsubscription(request.YoutubeChannelUrl, request.GuildId),
				_ => throw new ArgumentOutOfRangeException()
			};
		}

		public override async Task<Result> UpdateSubscriptionSettings(NotificationSettingsUpdateQuery request, ServerCallContext context)
		{
			var updated = await _database.UpdateYoutubeSubscriptionSettingsAsync(request.GuildId, request.Message, request.DiscordChannelId);
			return new Result
			{
				Status = updated.Success ? Status.Success : Status.Failed
			};
		}

		public override async Task<Result> UnsubscribeFromAll(UnsubscribeFromAllQuery request, ServerCallContext context)
		{
			var result = await _subscriptionManager.UnsubscribeAllAsync(request.GuildId);

			return new Result
			{
				Status = result.Success ? Status.Success : Status.Failed
			};
		}

		public override async Task SubscriptionNotifications(Empty request, IServerStreamWriter<SubscriptionNotificationResult> responseStream, ServerCallContext context)
		{
			while (true)
			{
				if (!_notificationQueue.TryDequeue(out var notification))
				{
					continue;
				}

				_logger.LogInformation("Sending notification {@Notification}", notification);

				await using var database = new SkyraDatabase(new SkyraDbContext(), new NullLogger<SkyraDatabase>());

				var notificationSubscription = await database.GetSubscriptionAsync(notification.ChannelId);

				if (!notificationSubscription.Success)
				{
					_logger.LogError("Did not get success status from retrieving database subscriptions");
					continue;
				}

				var channels = new NotificationChannel[notificationSubscription.Value!.GuildIds.Length];

				for (var index = 0; index < notificationSubscription.Value.GuildIds.Length; index++)
				{
					var guildId = notificationSubscription.Value.GuildIds[index];
					var guild = await database.GetGuildAsync(guildId);
					channels[index] = new NotificationChannel
					{
						GuildId = guildId,
						DiscordChannelId = guild.Value!.YoutubeNotificationChannel,
						Content = guild.Value.YoutubeNotificationMessage
					};
				}

				var subscriptionNotification = new SubscriptionNotificationResult
				{
					VideoId = notification.VideoId,
					VideoTitle = notification.Title,
					PublishedAt = notification.PublishedAt.ToUniversalTime().ToTimestamp(),
					YoutubeChannelName = notification.ChannelName,
					ThumbnailUrl = notification.ThumbnailUrl
				};

				subscriptionNotification.Channels.AddRange(channels);

				await responseStream.WriteAsync(subscriptionNotification);

				var guildsToString = string.Join(',', notificationSubscription.Value.GuildIds);
				_logger.LogInformation("Send notification for {VideoTitle} ({VideoId}) to guilds [{GuildIds}]", notification.Title, notification.VideoId, guildsToString);
			}
		}

		private async Task<Result> HandleSubscription(string channelUrl, string guildId, string message, string guildChannelId)
		{
			var isAlreadySubscribed = await _subscriptionManager.IsSubscribedAsync(guildId, channelUrl);

			if (!isAlreadySubscribed.Success)
			{
				return new Result
				{
					Status = Status.Failed
				};
			}

			if (isAlreadySubscribed.Value)
			{
				return new Result
				{
					Status = Status.AlreadySet
				};
			}

			var result = await _subscriptionManager.SubscribeAsync(channelUrl, guildId, message, guildChannelId);

			var resultMessage = result.Success ? "succeeded" : "failed";
			_logger.LogInformation("Subscription to channel {ChannelUrl} from guild {GuildId} {Result}", channelUrl, guildId, resultMessage);

			return new Result
			{
				Status = result.Success ? Status.Success : Status.Failed
			};
		}

		private async Task<Result> HandleUnsubscription(string channelUrl, string guildId)
		{
			var result = await _subscriptionManager.UnsubscribeAsync(channelUrl, guildId);

			var resultMessage = result.Success ? "succeeded" : "failed";
			_logger.LogInformation("Unsubscription to channel {ChannelUrl} from guild {GuildId} {Result}", channelUrl, guildId, resultMessage);

			return new Result
			{
				Status = result.Success ? Status.Success : Status.Failed
			};
		}
	}
}
