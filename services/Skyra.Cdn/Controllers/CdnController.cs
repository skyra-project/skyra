using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Skyra.Database;
using Skyra.Database.Models.Entities;

namespace Skyra.Cdn.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class CdnController : ControllerBase
	{
		private readonly IDatabase _database;
		private const int Seconds = 60;
		private const int Minutes = 60;

		public CdnController(IDatabase database)
		{
			_database = database;
		}

		[HttpGet("{id}")]
		[ResponseCache(Duration = Seconds * Minutes, Location = ResponseCacheLocation.Client, NoStore = false)]
		public async Task<IActionResult> Get(string id)
		{
			var headers = Request.GetTypedHeaders();
			headers.Date = DateTimeOffset.Now;

			var result = await _database.GetAssetAsync(id);
			if (!result.Success)
			{
				return NotFound();
			}

			// Get the Asset, it is not null here.
			var asset = result.Value!;

			// RFC 7232 3.3 - If the content was not modified, a 304 "Not Modified" status should be sent.
			if (!WasModified(asset))
			{
				// RFC 7232 4.1 - The server generating a 304 response MUST generate any of the following header fields that
				// would have been sent in a 200 (OK) response to the same request: Cache-Control, Content-Location, Date,
				// ETag, Expires, and Vary.
				return NotModified();
			}

			headers.LastModified = new DateTimeOffset(asset.LastModifiedAt);
			headers.Set("ETag", asset.ETag);
			return File(asset.Data, asset.ContentType);

			bool WasModified(Asset asset)
			{
				var headers = Request.GetTypedHeaders();

				// RFC 7232 3.2 - If-None-Match
				if (headers.IfNoneMatch.Any(entry => entry.Tag.Value == asset.ETag))
				{
					return false;
				}

				// RFC 7232 3.3 - If-Modified-Since
				var ifModifiedSince = headers.IfModifiedSince;
				if (!ifModifiedSince.HasValue)
				{
					return true;
				}

				// The origin server SHOULD NOT perform the requested method if the selected representation's last
				// // modification date is earlier than or equal to the date provided in the field-value
				return ifModifiedSince.Value.DateTime < asset.LastModifiedAt;
			}
		}

		private static IActionResult NotModified() => new StatusCodeResult(StatusCodes.Status304NotModified);
	}
}
