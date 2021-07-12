using Microsoft.Extensions.Logging.Abstractions;
using NUnit.Framework;
using Skyra.Notifications;

namespace Skyra.UnitTests.Notifications
{
	[TestFixture]
	public class RequestCacheTests
	{
		[Test]
		public void RequestCache_GetRequest_ShouldReturnFalse_WhenNoRequestExists()
		{
			// arrange

			var cache = new RequestCache(new NullLogger<RequestCache>());

			// act

			var result = cache.GetRequest("0", true);

			// assert

			Assert.IsFalse(result);
		}

		[TestCase("0", true)]
		[TestCase("1", false)]
		[TestCase("2", true)]
		[TestCase("2", false)]
		public void RequestCache_AddRequest_AddsRequestToQueue_AndRemoves(string id, bool isSubscription)
		{
			// arrange

			var cache = new RequestCache(new NullLogger<RequestCache>());

			// act

			cache.AddRequest(id, isSubscription);
			var _ = cache.GetRequest(id, isSubscription);
			var result = cache.GetRequest(id, isSubscription);
			// assert

			Assert.IsFalse(result);
		}

		[TestCase("0", true)]
		[TestCase("1", false)]
		[TestCase("2", true)]
		[TestCase("2", false)]
		public void RequestCache_AddRequest_AddsRequestToQueue_AndDoesNotRemove(string id, bool isSubscription)
		{
			// arrange

			var cache = new RequestCache(new NullLogger<RequestCache>());

			// act

			cache.AddRequest(id, isSubscription);
			var _ = cache.GetRequest(id, isSubscription, false);
			var result = cache.GetRequest(id, isSubscription);
			// assert

			Assert.IsTrue(result);
		}
	}
}
