using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Grpc.Core;
using Microsoft.Extensions.Logging;

namespace Skyra.Database.Networking
{
	public class GreeterService : Greeter.GreeterBase
	{
		private readonly ILogger<GreeterService> _logger;
		public GreeterService(ILogger<GreeterService> logger)
		{
			_logger = logger;
		}

		public override async Task SayHello(IAsyncStreamReader<HelloRequest> requestStream, IServerStreamWriter<HelloReply> responseStream, ServerCallContext context)
		{


			while (context.CancellationToken.IsCancellationRequested && await requestStream.MoveNext())
			{
				var current = requestStream.Current;

				await responseStream.WriteAsync(new HelloReply
				{
					Message = current.Name
				});
			}
		}
	}
}
