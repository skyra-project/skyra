using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Skyra.Database.Models;
using Skyra.Database.Models.Entities;
using Skyra.Shared.Results;

namespace Skyra.Database
{
	public interface IDatabase
	{
		Task<Result> AddGiveawayAsync(string title, DateTime endsAt, string guildId, string channelId,
			string messageId,
			int minimum, int minimumWinners);

		Task<Result<Giveaway[]>> GetGiveawaysAsync(string guildId);
		Task<Result> DeleteGiveawayAsync(string channelId, string messageId);
		Task<Result> DeleteGiveawaysAsync(string channelId, string[] messageIds);
		Task<Result> DeleteGiveawaysAsync(string channelId);
		Task<Result<Guild?>> GetGuildAsync(string guildId);
		Task<Result<Guild?>> UpdateGuildAsync(string guildId, string data);
		Task<Result> DeleteGuildAsync(string guildId);
		Task<Result<long>> GetMemberPointsAsync(string guildId, string userId);
		Task<Result<long>> AddMemberPointsAsync(string guildId, string userId, long experience);
		Task<Result<long>> RemoveMemberPointsAsync(string guildId, string userId, long experience);
		Task<Result> SetMemberPointsAsync(string guildId, string userId, long experience);
		Task<Result> ResetMemberPointsAsync(string guildId, string userId);
		Task<Result<int>> AddUserPointsAsync(string userId, int points);
		Task<Result<int>> RemoveUserPointsAsync(string userId, int points);
		Task<Result> ResetUserPointsAsync(string userId);
		Task<Result<long>> AddUserMoneyAsync(string userId, long money);
		Task<Result<long>> RemoveUserMoneyAsync(string userId, long money);
		Task<Result<long>> GetUserMoneyAsync(string userId);
		Task<Result> ResetUserMoneyAsync(string userId);
		Task<Result<(long, long)>> GiveUserMoneyAsync(string userId, string targetId, long money);
		Task<Result<TimeSpan>> ClaimUserDailyAsync(string userId, bool force);
		Task<Result<TimeSpan>> GiveUserReputationAsync(string userId, string targetId);
		Task<Result<string>> GetUserLargeBannerAsync(string userId);
		Task<Result<string[]>> GetUserLargeBannersAsync(string userId);
		Task<Result> SetUserLargeBannerAsync(string userId, string bannerId);
		Task<Result<string>> GetUserSmallBannerAsync(string userId);
		Task<Result<string[]>> GetUserSmallBannersAsync(string userId);
		Task<Result> SetUserSmallBannerAsync(string userId, string bannerId);
		Task<Result<string[]>> GetUserBadgesAsync(string userId);
		Task<Result<string[]>> GetUserPublicBadgesAsync(string userId);
		Task<Result> SetUserBadgesAsync(string userId, string[] badgeIds);
		Task<Result<int>> GetUserColorAsync(string userId);
		Task<Result<UserProfileData>> GetUserProfileAsync(string userId);
		Task<Result<string[]>> GetUserSpousesAsync(string userId);
		Task<Result> AddUserSpouseAsync(string userId, string targetId);
		Task<Result> RemoveUserSpouseAsync(string userId, string targetId);
		Task<Result<string?>> GetUserGameIntegrationAsync(string userId, string game);
		Task<Result> AddUserGameIntegrationAsync(string userId, string game, string data);
		Task<Result> RemoveUserGameIntegrationAsync(string userId, string game);
		Task<Result<Schedule?>> AddScheduleEntryAsync(Schedule entry);
		Task<Result<Schedule?>> GetScheduleEntryAsync(long taskId);
		Task<Result<Schedule[]?>> GetAllScheduleEntriesAsync();
		Task<Result> UpdateScheduleEntryAsync(Schedule entry);
		Task<Result> UpdateScheduleEntriesAsync(IEnumerable<Schedule> entries);
		Task<Result> RemoveScheduleEntryAsync(int taskId);
		Task<Result> RemoveScheduleEntriesAsync(IEnumerable<int> taskIds);
		Task<Result<Starboard?>> GetStarboardAsync(string channelId, string messageId);
		Task<Result<Starboard?>> GetStarboardAsync(string guildId, string? userId, DateTime? dateTime);

		Task<Result<Starboard?>> AddStarboardAsync(string guildId, string channelId, string messageId, string userId,
			string? starMessageId);

		Task<Result<string?>> RemoveStarboardAsync(string channelId, string messageId);
		Task<Result<string[]>> RemoveStarboardsAsync(string channelId, string[] messageIds);
		Task<Result<string[]>> RemoveStarboardsAsync(string channelId);
		Task<Result<int>> GetUserPointsAsync(string userId);
		Task<Result> RemoveUserAsync(string userId);
		Task<Result<Banner[]>> GetBannersAsync();
		Task<Result> AddBannerAsync(string id, string group, string title, string authorId, int price);
		Task<Result> UpdateBannerAsync(string id, string group, string title, string authorId, int price);
		Task<Result> RemoveBannerAsync(string id);
		Task<Result<Tuple<long, string>[]>> GetLocalLeaderboardAsync(string id);
		Task<Result<Tuple<long, string>[]>> GetGlobalLeaderboardAsync();
		Task<Result<(string, string)[]>> ExecuteSqlAsync(string query);
	}
}
