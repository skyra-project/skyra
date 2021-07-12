using System;

namespace Skyra.Shared.Results
{
	public class Result
	{
		protected Result(ResultStatus status, Exception? exception = null)
		{
			Status = status;
			Exception = exception;
		}

		public ResultStatus Status { get; }
		public bool Success => Status == ResultStatus.Success;

		public Exception? Exception { get; }
		public string? ExceptionMessage => Exception?.Message ?? null;

		public static Result FromSuccess()
		{
			return new Result(ResultStatus.Success);
		}

		public static Result FromError(ResultStatus status = ResultStatus.Error)
		{
			return new Result(status, new Exception($"Error: {status.ToString()}"));
		}

		public static Result FromError(Exception exception, ResultStatus status = ResultStatus.Error)
		{
			return new Result(status, exception);
		}

		public static Result FromError(string message, ResultStatus status = ResultStatus.Error)
		{
			return new Result(status, new Exception(message));
		}
	}
}
