using System.Linq;
using System.Threading.Tasks;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using Skyra.Database;
using Skyra.Grpc.Services.Shared;
using Status = Skyra.Grpc.Services.Shared.Status;

namespace Skyra.Grpc.Services
{
	public class ScheduleService : Schedule.ScheduleBase
	{
		private readonly IDatabase _database;

		public ScheduleService(IDatabase database)
		{
			_database = database;
		}

		public override async Task<TaskAddResult> Add(TaskAddQuery request, ServerCallContext context)
		{
			var result = await _database.AddScheduleEntryAsync(new Database.Models.Entities.Schedule
			{
				Time = request.Time.ToDateTime(),
				CatchUp = request.CatchUp,
				TaskId = request.TaskId,
				Recurring = request.Recurring,
				Data = request.Data
			});
			if (!result.Success)
			{
				return new TaskAddResult {Status = Status.Failed};
			}

			var data = result.Value;
			if (data is null)
			{
				return new TaskAddResult {Status = Status.NotFound};
			}

			return new TaskAddResult
			{
				Status = Status.Success,
				Entry =
				{
					Id = data.Id, CatchUp = data.CatchUp, Time = data.Time.ToTimestamp(), Data = data.Data,
					Recurring = data.Recurring, TaskId = data.TaskId
				}
			};
		}

		public override async Task<TaskGetResult> Get(TaskGetQuery request, ServerCallContext context)
		{
			var result = await _database.GetScheduleEntryAsync(request.Id);
			if (!result.Success)
			{
				return new TaskGetResult {Status = Status.Failed};
			}

			var data = result.Value;
			if (data is null)
			{
				return new TaskGetResult {Status = Status.NotFound};
			}

			return new TaskGetResult
			{
				Status = Status.Success,
				Entry =
				{
					Id = data.Id, CatchUp = data.CatchUp, Time = data.Time.ToTimestamp(), Data = data.Data,
					Recurring = data.Recurring, TaskId = data.TaskId
				}
			};
		}

		public override async Task<TaskGetAllResult> GetAll(Empty request,
			ServerCallContext context)
		{
			var result = await _database.GetAllScheduleEntriesAsync();
			if (!result.Success)
			{
				return new TaskGetAllResult {Status = Status.Failed};
			}

			var data = result.Value;
			if (data is null)
			{
				return new TaskGetAllResult {Status = Status.NotFound};
			}

			var output = new TaskGetAllResult {Status = Status.Success};
			output.Entries.AddRange(data.Select(entry => new TaskEntry
			{
				Id = entry.Id, CatchUp = entry.CatchUp, Time = entry.Time.ToTimestamp(), Data = entry.Data,
				Recurring = entry.Recurring, TaskId = entry.TaskId
			}));
			return output;
		}

		public override async Task<Result> Update(TaskUpdateQuery request, ServerCallContext context)
		{
			var result = await _database.UpdateScheduleEntryAsync(new Database.Models.Entities.Schedule
			{
				Id = request.Entry.Id,
				Time = request.Entry.Time.ToDateTime(),
				CatchUp = request.Entry.CatchUp,
				TaskId = request.Entry.TaskId,
				Recurring = request.Entry.Recurring,
				Data = request.Entry.Data
			});
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<Result> BulkUpdate(TaskBulkUpdateQuery request, ServerCallContext context)
		{
			var result = await _database.UpdateScheduleEntriesAsync(request.Entries.Select(entry =>
				new Database.Models.Entities.Schedule
				{
					Id = entry.Id,
					Time = entry.Time.ToDateTime(),
					CatchUp = entry.CatchUp,
					TaskId = entry.TaskId,
					Recurring = entry.Recurring,
					Data = entry.Data
				}));
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<Result> Remove(TaskRemoveQuery request, ServerCallContext context)
		{
			var result = await _database.RemoveScheduleEntryAsync(request.Id);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}

		public override async Task<Result> BulkRemove(TaskBulkRemoveQuery request, ServerCallContext context)
		{
			var result = await _database.RemoveScheduleEntriesAsync(request.Ids);
			return new Result {Status = result.Success ? Status.Success : Status.Failed};
		}
	}
}
