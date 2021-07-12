using System;

namespace Skyra.Shared
{
	public class EnvironmentVariableMissingException : Exception
	{
		public EnvironmentVariableMissingException(string variable) : base($"The environment variable '{variable}' is missing.")
		{
		}
	}
}
