using System.Collections.Generic;
using Microsoft.Extensions.Logging;

namespace Skyra.Notifications
{
	public class RequestCache
	{
		private readonly ILogger<RequestCache> _logger;
		private readonly Dictionary<string, bool> _requests = new Dictionary<string, bool>();

		public RequestCache(ILogger<RequestCache> logger)
		{
			_logger = logger;
		}

		public bool GetRequest(string channelId, bool isSubscription, bool remove = true)
		{
			var isCorrect = _requests.TryGetValue(channelId, out var subscription) && subscription == isSubscription;

			if (remove)
			{
				RemoveRequest(channelId);
			}

			if (!isCorrect)
			{
				_logger.LogCritical("request with channel-id {Id} was not found in the request cache", channelId);
			}

			return isCorrect;
		}

		public void AddRequest(string channelId, bool isSubscription)
		{
			_requests[channelId] = isSubscription;
		}

		public void RemoveRequest(string channelId)
		{
			_requests.Remove(channelId);
		}
	}
}
