using System;
using System.Threading.Tasks;
using Grpc.Net.Client;
using NUnit.Framework;
using Skyra.IntegrationTests.Database;

namespace Skyra.IntegrationTests.Grpc
{
	[TestFixture]
	public class BaseGrpcTests
	{
		[OneTimeSetUp]
		public async Task Setup()
		{
			await TearDown();
		}

		[TearDown]
		public async Task TearDown()
		{
			await Utils.WipeDb();
		}

		protected readonly Random Rng = new(DateTime.Now.Millisecond);

		protected static GrpcChannel GetChannel() => GrpcChannel.ForAddress("http://localhost:8291", new GrpcChannelOptions
		{
			HttpHandler = Utils.GetHandler()
		});
	}
}
