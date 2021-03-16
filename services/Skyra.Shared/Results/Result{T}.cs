using System;

namespace Skyra.Shared.Results
{
	public class Result<T> : Result
	{
		private Result(T? value, ResultStatus status, Exception? exception = null) : base(status, exception)
		{
			Value = value;
		}

		public T? Value { get; }

		public new static Result<T> FromSuccess() => new(default, ResultStatus.Success);

		public static Result<T> FromSuccess(T value) => new(value, ResultStatus.Success);

		public static Result<T> FromError(ResultStatus status = ResultStatus.Error, T? value = default)
			=> new(value, status, new Exception($"Error: {status.ToString()}"));

		public static Result<T> FromError(Exception exception, ResultStatus status = ResultStatus.Error,
			T? value = default)
			=> new(value, status, exception);

		public static Result<T> FromError(string message, ResultStatus status = ResultStatus.Error, T? value = default)
			=> new(value, status, new Exception(message));
	}
}
