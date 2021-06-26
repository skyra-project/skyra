using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Skyra.Database;
using Skyra.Grpc.Services;
using Skyra.Notifications.Models;
using Action = Skyra.Grpc.Services.Action;
using Result = Skyra.Grpc.Services.Shared.Result;
using Status = Skyra.Grpc.Services.Shared.Status;
using YoutubeServiceBase = Skyra.Grpc.Services.YoutubeSubscription.YoutubeSubscriptionBase;
using YoutubeSubscription = Skyra.Database.Models.Entities.YoutubeSubscription;

namespace Skyra.Notifications.Services
{
	public class YoutubeService : YoutubeServiceBase
	{
		private readonly IDatabase _database;
		private SubscriptionManager _subscriptionManager;
		private readonly ConcurrentQueue<Notification> _notificationQueue;
		private readonly ILogger<YoutubeService> _logger;

		public YoutubeService(IDatabase database, SubscriptionManager subscriptionManager, ConcurrentQueue<Notification> notificationQueue, ILogger<YoutubeService> logger)
		{
			_database = database;
			_subscriptionManager = subscriptionManager;
			_notificationQueue = notificationQueue;
			_logger = logger;
		}

		public override async Task<SubscriptionResponse> GetSubscriptions(Empty request, ServerCallContext _)
		{
			var subscriptions = await _database.GetSubscriptionsAsync();

			// lord I hate google sometimes

			var response = new SubscriptionResponse();
			foreach (var sub in subscriptions.Value)
			{
				var subscription = new Subscription
				{
					ChannelId = sub.Id
				};


				subscription.GuildIds.AddRange(sub.GuildIds);

				response.Subscriptions.Add(subscription);
			}

			return response;
		}

		public override Task<Result> ManageSubscription(SubscriptionManageRequest request, ServerCallContext _)
		{
			return request.Type switch
			{
				Action.Subscribe => HandleSubscription(request.ChannelUrl, request.GuildId, request.NotificationMessage, request.GuildChannelId),
				Action.Unsubscribe => HandleUnsubscription(request.ChannelUrl, request.GuildId),
				_ => throw new ArgumentOutOfRangeException()
			};
		}

		public override async Task SubscriptionNotifications(Empty request, IServerStreamWriter<SubscriptionNotification> responseStream, ServerCallContext context)
		{
			while (true)
			{
				if (!_notificationQueue.TryDequeue(out var notification)) continue;

				_logger.LogInformation("DEQUEUE");
				await using var database = new SkyraDatabase(new SkyraDbContext(), new NullLogger<SkyraDatabase>());

				var notificationSubscription = await database.GetSubscriptionAsync(notification.ChannelId);

				var channels = new NotificationChannel[notificationSubscription.Value.GuildIds.Length];

				for (var index = 0; index < notificationSubscription.Value.GuildIds.Length; index++)
				{
					var guildId = notificationSubscription.Value.GuildIds[index];
					var guild = await database.GetGuildAsync(guildId);
					channels[index] = new NotificationChannel
					{
						GuildId = guildId,
						ChannelId = guild.Value.YoutubeNotificationChannel,
						Message = guild.Value.YoutubeNotificationMessage
					};
				}

				var subscriptionNotification = new SubscriptionNotification
				{
					VideoId = notification.VideoId,
					VideoTitle = notification.Title,
					PublishedAt = notification.PublishedAt.ToUniversalTime().ToTimestamp(),
					ChannelName = notification.ChannelName,
					ThumbnailUrl = notification.ThumbnailUrl
				};

				subscriptionNotification.Channels.AddRange(channels);

				await responseStream.WriteAsync(subscriptionNotification);
			}
		}

		private async Task<Result> HandleSubscription(string channelUrl, string guildId, string message, string youtubeChannelId)
		{
			var result = await _subscriptionManager.SubscribeAsync(channelUrl, guildId, message, youtubeChannelId);
			return new Result
			{
				Status = result.Success ? Status.Success : Status.Failed
			};
		}

		private async Task<Result> HandleUnsubscription(string channelName, string guildId)
		{
			var result = await _subscriptionManager.UnsubscribeAsync(channelName, guildId);
			return new Result
			{
				Status = result.Success ? Status.Success : Status.Failed
			};
		}
	}
}
