using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Skyra.Database.Extensions;
using Skyra.Database.Models;
using Skyra.Database.Models.Entities;
using Skyra.Shared.Results;

namespace Skyra.Database
{
	public class SkyraDatabase : IDatabase, IDisposable, IAsyncDisposable
	{
		private readonly SkyraDbContext _context;
		private readonly ILogger<SkyraDatabase> _logger;
		private readonly Random _random = new();

		public SkyraDatabase(SkyraDbContext context, ILogger<SkyraDatabase> logger)
		{
			_context = context;
			_logger = logger;
		}

		/// <inheritdoc />
		public async ValueTask DisposeAsync()
		{
			await _context.DisposeAsync();
		}

		public async Task<Result> AddGiveawayAsync(string title, DateTime endsAt, string guildId, string channelId,
			string messageId, int minimum, int minimumWinners)
		{
			try
			{
				await _context.Giveaways.AddAsync(new Giveaway
				{
					Title = title,
					EndsAt = endsAt,
					GuildId = guildId,
					ChannelId = channelId,
					MessageId = messageId,
					Minimum = minimum,
					MinimumWinners = minimumWinners
				});

				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result<Giveaway[]>> GetGiveawaysAsync(string guildId)
		{
			try
			{
				var giveaways = await _context.Giveaways.Where(giveaway => giveaway.GuildId == guildId).ToArrayAsync();
				return Result<Giveaway[]>.FromSuccess(giveaways);
			}
			catch (Exception e)
			{
				return HandleException<Giveaway[]>(e);
			}
		}

		public async Task<Result> DeleteGiveawayAsync(string channelId, string messageId)
		{
			try
			{
				var giveaway = await _context.Giveaways.FirstOrDefaultAsync(entry =>
					entry.ChannelId == channelId && entry.MessageId == messageId);

				if (giveaway is null)
				{
					return Result.FromSuccess();
				}

				_context.Giveaways.Remove(giveaway);
				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result> DeleteGiveawaysAsync(string channelId, string[] messageIds)
		{
			try
			{
				var giveaways = await _context.Giveaways.Where(giveaway =>
					giveaway.ChannelId == channelId && messageIds.Contains(giveaway.MessageId)).ToArrayAsync();
				if (giveaways is null)
				{
					return Result.FromSuccess();
				}

				_context.Giveaways.RemoveRange(giveaways);
				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result> DeleteGiveawaysAsync(string channelId)
		{
			try
			{
				var giveaways = await _context.Giveaways.Where(giveaway => giveaway.ChannelId == channelId)
					.ToArrayAsync();

				if (giveaways is null)
				{
					return Result.FromSuccess();
				}

				_context.Giveaways.RemoveRange(giveaways);
				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result<Guild?>> GetGuildAsync(string guildId)
		{
			try
			{
				var guild = await _context.Guilds.FindAsync(guildId);
				return Result<Guild?>.FromSuccess(guild);
			}
			catch (Exception e)
			{
				return HandleException<Guild?>(e);
			}
		}

		public async Task<Result<Guild?>> UpdateGuildAsync(string guildId, string data)
		{
			try
			{
				var guild = await _context.Guilds.UpsertAsync(guildId, () => new Guild {Id = guildId});
				// TODO: Do funny stuff deserializing JSON properties into rich data

				await _context.SaveChangesAsync();
				return Result<Guild?>.FromSuccess(guild);
			}
			catch (Exception e)
			{
				return HandleException<Guild?>(e);
			}
		}

		public async Task<Result> DeleteGuildAsync(string guildId)
		{
			try
			{
				var guild = await _context.Guilds.FindAsync(guildId);
				if (guild is null)
				{
					return Result.FromSuccess();
				}

				_context.Guilds.Remove(guild);
				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result<long>> GetMemberPointsAsync(string guildId, string userId)
		{
			try
			{
				var member = await _context.Members.FindAsync(guildId, userId);
				return Result<long>.FromSuccess(member?.Points ?? 0);
			}
			catch (Exception e)
			{
				return HandleException<long>(e);
			}
		}

		public async Task<Result<long>> AddMemberPointsAsync(string guildId, string userId, long experience)
		{
			try
			{
				var member = await _context.Members.FindAsync(guildId, userId);
				if (member is null)
				{
					member = new Member {GuildId = guildId, UserId = userId, Points = experience};
					await _context.Members.AddAsync(member);
				}
				else
				{
					member.Points += experience;
				}

				await _context.SaveChangesAsync();
				return Result<long>.FromSuccess(member.Points);
			}
			catch (Exception e)
			{
				return HandleException<long>(e);
			}
		}

		public async Task<Result<long>> RemoveMemberPointsAsync(string guildId, string userId, long experience)
		{
			try
			{
				var member = await _context.Members.FindAsync(guildId, userId);
				if (member is null)
				{
					return Result<long>.FromSuccess(0);
				}

				member.Points = Math.Max(member.Points - experience, 0);

				await _context.SaveChangesAsync();
				return Result<long>.FromSuccess(member.Points);
			}
			catch (Exception e)
			{
				return HandleException<long>(e);
			}
		}

		public async Task<Result> SetMemberPointsAsync(string guildId, string userId, long experience)
		{
			try
			{
				var member = await _context.Members.FindAsync(guildId, userId);
				if (member is null)
				{
					member = new Member {GuildId = guildId, UserId = userId, Points = experience};
					await _context.Members.AddAsync(member);
				}
				else
				{
					member.Points = experience;
				}

				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result> ResetMemberPointsAsync(string guildId, string userId)
		{
			try
			{
				var member = await _context.Members.FindAsync(guildId, userId);
				if (member is null)
				{
					return Result.FromSuccess();
				}

				_context.Members.Remove(member);
				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result<int>> AddUserPointsAsync(string userId, int points)
		{
			try
			{
				var user = await _context.Users.UpsertAsync(userId, () => new User {Id = userId, Points = 0});

				user.Points += points;

				await _context.SaveChangesAsync();

				return Result<int>.FromSuccess(user.Points);
			}
			catch (Exception e)
			{
				return HandleException<int>(e);
			}
		}

		public async Task<Result<int>> RemoveUserPointsAsync(string userId, int points)
		{
			try
			{
				var user = await _context.Users.FindAsync(userId);
				if (user is null || user.Points == 0)
				{
					return Result<int>.FromSuccess(0);
				}

				user.Points = Math.Max(user.Points - points, 0);
				await _context.SaveChangesAsync();

				return Result<int>.FromSuccess(user.Points);
			}
			catch (Exception e)
			{
				return HandleException<int>(e);
			}
		}

		public async Task<Result> ResetUserPointsAsync(string userId)
		{
			try
			{
				var user = await _context.Users.FindAsync(userId);
				if (user is null || user.Points == 0)
				{
					return Result.FromSuccess();
				}

				user.Points = 0;
				await _context.SaveChangesAsync();

				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result<long>> AddUserMoneyAsync(string userId, long money)
		{
			try
			{
				var user = await _context.Users.UpsertAsync(userId, () => new User {Id = userId, Money = 0});
				user.Money += money;

				await _context.SaveChangesAsync();

				return Result<long>.FromSuccess(user.Money);
			}
			catch (Exception e)
			{
				return HandleException<long>(e);
			}
		}

		public async Task<Result<long>> RemoveUserMoneyAsync(string userId, long money)
		{
			try
			{
				var user = await _context.Users.FindAsync(userId);
				if (user is null || user.Money == 0)
				{
					return Result<long>.FromSuccess(0);
				}

				user.Money = Math.Max(user.Money - money, 0);
				await _context.SaveChangesAsync();

				return Result<long>.FromSuccess(user.Money);
			}
			catch (Exception e)
			{
				return HandleException<long>(e);
			}
		}

		public async Task<Result<long>> GetUserMoneyAsync(string userId)
		{
			try
			{
				var user = await _context.Users.FindAsync(userId);
				return Result<long>.FromSuccess(user?.Money ?? 0);
			}
			catch (Exception e)
			{
				return HandleException<long>(e);
			}
		}

		public async Task<Result> ResetUserMoneyAsync(string userId)
		{
			try
			{
				var user = await _context.Users.FindAsync(userId);
				if (user is null || user.Money == 0)
				{
					return Result.FromSuccess();
				}

				user.Money = 0;
				await _context.SaveChangesAsync();

				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result<(long, long)>> GiveUserMoneyAsync(string userId, string targetId, long money)
		{
			try
			{
				var author = await _context.Users.FindAsync(userId);
				if (author is null || author.Money < money)
				{
					return Result<(long, long)>.FromError(ResultStatus.NotEnoughResources, (author?.Money ?? 0, 0));
				}

				var target = await _context.Users.UpsertAsync(userId, () => new User {Id = targetId, Money = 0});

				author.Money -= money;
				target.Money += money;
				await _context.SaveChangesAsync();

				return Result<(long, long)>.FromSuccess((author.Money, target.Money));
			}
			catch (Exception e)
			{
				return HandleException<(long, long)>(e);
			}
		}

		public async Task<Result<TimeSpan>> ClaimUserDailyAsync(string userId, bool force)
		{
			try
			{
				var user = await _context.Users.FindAsync(userId);

				// UserCooldown has a dependency to User, therefore, if the User does not exist, a UserCooldown will not
				// exist.
				var cooldown = user is null ? null : await _context.UserCooldowns.FindAsync(userId);

				// If the UserCooldown does not exist, we will ensure it.
				if (cooldown is null)
				{
					// If the User does not exist, we will ensure it **before** the UserCooldown.
					if (user is null)
					{
						user = new User {Id = userId, Money = 0};
						await _context.Users.AddAsync(user);
					}

					cooldown = new UserCooldown {User = user};
					await _context.UserCooldowns.AddAsync(cooldown);
				}

				// Calculate the remaining amount of time, if the Daily was null, it means it is the UserCooldown's
				// first daily, and therefore, no cooldowns apply.
				// We will also set Daily as a non-null value.
				TimeSpan remaining;
				if (cooldown.Daily is null)
				{
					remaining = TimeSpan.Zero;
					cooldown.Daily = DateTime.Now;
				}
				else
				{
					remaining = (TimeSpan) (DateTime.Now - cooldown.Daily);

					// If the cooldown is less or equal than zero, it has reached full completion, at this point, no
					// cooldowns apply, and the remaining is truncated to zero.
					if (remaining <= TimeSpan.Zero)
					{
						remaining = TimeSpan.Zero;
					}
					else
					{
						// In this path, remaining is higher than 0. If force is false, or the remaining is higher than
						// 1h, this should raise an error result.
						if (!force || remaining > TimeSpan.FromHours(1))
						{
							return Result<TimeSpan>.FromError(ResultStatus.NotEnoughResources, remaining);
						}
					}
				}

				remaining += TimeSpan.FromHours(12);

				// Add the remaining amount of time to the Daily field plus the refresh time, then save all the changes.
				user!.Money += 200;
				cooldown.Daily = DateTime.Now + remaining;
				await _context.SaveChangesAsync();

				return Result<TimeSpan>.FromSuccess(remaining);
			}
			catch (Exception e)
			{
				return HandleException<TimeSpan>(e);
			}
		}

		public async Task<Result<TimeSpan>> GiveUserReputationAsync(string userId, string targetId)
		{
			try
			{
				var author = await _context.Users.FindAsync(userId);

				// UserCooldown has a dependency to User, therefore, if the User does not exist, a UserCooldown will not
				// exist.
				var cooldown = author is null ? null : await _context.UserCooldowns.FindAsync(userId);

				// If the UserCooldown does not exist, we will ensure it.
				if (cooldown is null)
				{
					// If the User does not exist, we will ensure it **before** the UserCooldown.
					if (author is null)
					{
						author = new User {Id = userId};
						await _context.Users.AddAsync(author);
					}

					cooldown = new UserCooldown {User = author};
					await _context.UserCooldowns.AddAsync(cooldown);
				}

				// Calculate the remaining amount of time, if the Daily was null, it means it is the UserCooldown's
				// first daily, and therefore, no cooldowns apply.
				// We will also set Daily as a non-null value.
				TimeSpan remaining;
				if (cooldown.Reputation is null)
				{
					remaining = TimeSpan.Zero;
					cooldown.Reputation = DateTime.Now;
				}
				else
				{
					remaining = (TimeSpan) (DateTime.Now - cooldown.Reputation);

					// If the cooldown is less or equal than zero, it has reached full completion, at this point, no
					// cooldowns apply, and the remaining is truncated to zero.
					if (remaining <= TimeSpan.Zero)
					{
						remaining = TimeSpan.Zero;
					}
					else
						// In this path, remaining is higher than 0. This should always raise an error result.
					{
						return Result<TimeSpan>.FromError(ResultStatus.NotEnoughResources, remaining);
					}
				}

				var target =
					await _context.Users.UpsertAsync(targetId, () => new User {Id = targetId, Reputations = 0});

				remaining += TimeSpan.FromHours(24);

				// Add the remaining amount of time to the Daily field plus the refresh time, then save all the changes.
				++target.Reputations;
				cooldown.Reputation = DateTime.Now + remaining;
				await _context.SaveChangesAsync();

				return Result<TimeSpan>.FromSuccess(remaining);
			}
			catch (Exception e)
			{
				return HandleException<TimeSpan>(e);
			}
		}

		public async Task<Result<string>> GetUserLargeBannerAsync(string userId)
		{
			try
			{
				var user = await _context.UserProfiles.FindAsync(userId);
				return Result<string>.FromSuccess(user?.BannerProfile ?? "0001");
			}
			catch (Exception e)
			{
				return HandleException<string>(e);
			}
		}

		public async Task<Result<string[]>> GetUserLargeBannersAsync(string userId)
		{
			try
			{
				var user = await _context.UserProfiles.FindAsync(userId);
				return Result<string[]>.FromSuccess(user?.Banners ?? Array.Empty<string>());
			}
			catch (Exception e)
			{
				return HandleException<string[]>(e);
			}
		}

		public async Task<Result> SetUserLargeBannerAsync(string userId, string bannerId)
		{
			try
			{
				var user = await _context.UserProfiles.UpsertAsync(userId, () => new UserProfile {UserId = userId});
				user.BannerProfile = bannerId;

				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result<string>> GetUserSmallBannerAsync(string userId)
		{
			try
			{
				var user = await _context.UserProfiles.FindAsync(userId);
				return Result<string>.FromSuccess(user?.BannerLevel ?? "0001");
			}
			catch (Exception e)
			{
				return HandleException<string>(e);
			}
		}

		public Task<Result<string[]>> GetUserSmallBannersAsync(string userId)
		{
			try
			{
				return Task.FromResult(Result<string[]>.FromSuccess(new[] {"0001"}));
			}
			catch (Exception e)
			{
				return Task.FromResult(HandleException<string[]>(e));
			}
		}

		public async Task<Result> SetUserSmallBannerAsync(string userId, string bannerId)
		{
			try
			{
				var user = await _context.UserProfiles.UpsertAsync(userId, () => new UserProfile {UserId = userId});
				user.BannerLevel = bannerId;

				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result<string[]>> GetUserBadgesAsync(string userId)
		{
			try
			{
				var user = await _context.UserProfiles.FindAsync(userId);
				return Result<string[]>.FromSuccess(user?.Badges ?? Array.Empty<string>());
			}
			catch (Exception e)
			{
				return HandleException<string[]>(e);
			}
		}

		public async Task<Result<string[]>> GetUserPublicBadgesAsync(string userId)
		{
			try
			{
				var user = await _context.UserProfiles.FindAsync(userId);
				return Result<string[]>.FromSuccess(user?.PublicBadges ?? Array.Empty<string>());
			}
			catch (Exception e)
			{
				return HandleException<string[]>(e);
			}
		}

		public async Task<Result> SetUserBadgesAsync(string userId, string[] badgeIds)
		{
			try
			{
				var user = await _context.UserProfiles.UpsertAsync(userId,
					() => new UserProfile {UserId = userId, Badges = Array.Empty<string>()});
				user.Badges = badgeIds;

				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result<int>> GetUserColorAsync(string userId)
		{
			try
			{
				var user = await _context.UserProfiles.FindAsync(userId);
				return Result<int>.FromSuccess(user?.Color ?? 0x00_00_00_00);
			}
			catch (Exception e)
			{
				return HandleException<int>(e);
			}
		}

		public async Task<Result<UserProfileData>> GetUserProfileAsync(string userId)
		{
			try
			{
				var user = await _context.Users.FindAsync(userId);
				var profile = await _context.UserProfiles.FindAsync(userId);

				return Result<UserProfileData>.FromSuccess(new UserProfileData
				{
					Color = profile?.Color ?? 0x00_00_00_00,
					Money = user?.Money ?? 0,
					Points = user?.Points ?? 0,
					Reputations = user?.Reputations ?? 0,
					Vault = profile?.Vault ?? 0,
					BadgeIds = profile?.Badges ?? Array.Empty<string>(),
					BannerId = profile?.BannerProfile ?? "1001"
				});
			}
			catch (Exception e)
			{
				return HandleException<UserProfileData>(e);
			}
		}

		public async Task<Result<string[]>> GetUserSpousesAsync(string userId)
		{
			try
			{
				var entries = await _context.UserSpousesUsers
					.Where(user => user.UserId1 == userId || user.UserId2 == userId)
					.Select(user => user.UserId1 == userId ? user.UserId2 : user.UserId1).ToArrayAsync();
				return Result<string[]>.FromSuccess(entries);
			}
			catch (Exception e)
			{
				return HandleException<string[]>(e);
			}
		}

		public async Task<Result> AddUserSpouseAsync(string userId, string targetId)
		{
			try
			{
				await _context.UserSpousesUsers.AddAsync(new UserSpousesUser
				{
					UserId1 = userId,
					UserId2 = targetId
				});
				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result> RemoveUserSpouseAsync(string userId, string targetId)
		{
			try
			{
				var entry = await _context.UserSpousesUsers.FirstOrDefaultAsync(user =>
					user.UserId1 == userId
						? user.UserId2 == targetId
						: user.UserId1 == targetId && user.UserId2 == userId);
				if (entry is null)
				{
					return Result.FromError("User is not Married");
				}

				_context.UserSpousesUsers.Remove(entry);
				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result<string?>> GetUserGameIntegrationAsync(string userId, string game)
		{
			try
			{
				var entry = await _context.UserGameIntegrations.FirstOrDefaultAsync(user =>
					user.UserId == userId && user.Game == game);
				return entry is null ? Result<string?>.FromSuccess(null) : Result<string?>.FromSuccess(entry.ExtraData);
			}
			catch (Exception e)
			{
				return HandleException<string?>(e);
			}
		}

		public async Task<Result> AddUserGameIntegrationAsync(string userId, string game, string data)
		{
			try
			{
				await _context.UserGameIntegrations.AddAsync(new UserGameIntegration
				{
					UserId = userId,
					Game = game,
					ExtraData = data
				});
				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result> RemoveUserGameIntegrationAsync(string userId, string game)
		{
			try
			{
				var entry = await _context.UserGameIntegrations.FirstOrDefaultAsync(user =>
					user.UserId == userId && user.Game == game);
				if (entry is null)
				{
					return Result.FromError(ResultStatus.NoEntries);
				}

				_context.UserGameIntegrations.Remove(entry);
				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException<string?>(e);
			}
		}

		public async Task<Result<Schedule?>> AddScheduleEntryAsync(Schedule entry)
		{
			try
			{
				await _context.Schedules.AddAsync(entry);
				await _context.SaveChangesAsync();
				return Result<Schedule?>.FromSuccess(entry);
			}
			catch (Exception e)
			{
				return HandleException<Schedule?>(e);
			}
		}

		public async Task<Result<Schedule?>> GetScheduleEntryAsync(long taskId)
		{
			try
			{
				var entry = await _context.Schedules.FindAsync(taskId);
				return Result<Schedule?>.FromSuccess(entry);
			}
			catch (Exception e)
			{
				return HandleException<Schedule?>(e);
			}
		}

		public async Task<Result<Schedule[]?>> GetAllScheduleEntriesAsync()
		{
			try
			{
				var entry = await _context.Schedules.ToArrayAsync();
				return Result<Schedule[]?>.FromSuccess(entry);
			}
			catch (Exception e)
			{
				return HandleException<Schedule[]?>(e);
			}
		}

		public async Task<Result> UpdateScheduleEntryAsync(Schedule entry)
		{
			try
			{
				var value = await _context.Schedules.FindAsync(entry.Id);
				if (value is null)
				{
					await _context.Schedules.AddAsync(entry);
				}
				else
				{
					value.Data = entry.Data;
					value.Recurring = entry.Recurring;
					value.Time = entry.Time;
					value.CatchUp = entry.CatchUp;
					value.TaskId = entry.TaskId;
				}

				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result> UpdateScheduleEntriesAsync(IEnumerable<Schedule> entries)
		{
			try
			{
				var ids = entries.ToDictionary(entry => entry.Id);
				var values = await _context.Schedules.Where(entry => ids.ContainsKey(entry.Id)).ToArrayAsync();
				foreach (var value in values)
				{
					var entry = ids[value.Id];
					value.Data = entry.Data;
					value.Recurring = entry.Recurring;
					value.Time = entry.Time;
					value.CatchUp = entry.CatchUp;
					value.TaskId = entry.TaskId;
				}

				await _context.SaveChangesAsync();

				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result> RemoveScheduleEntryAsync(int taskId)
		{
			try
			{
				var value = await _context.Schedules.FindAsync(taskId);
				if (value is null)
				{
					return Result.FromSuccess();
				}

				_context.Schedules.Remove(value);
				await _context.SaveChangesAsync();

				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result> RemoveScheduleEntriesAsync(IEnumerable<int> taskIds)
		{
			try
			{
				var ids = taskIds.ToArray();
				var values = await _context.Schedules.Where(value => ids.Contains(value.Id)).ToArrayAsync();
				if (values is null)
				{
					return Result.FromSuccess();
				}

				_context.Schedules.RemoveRange(values);
				await _context.SaveChangesAsync();

				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result<Starboard?>> GetStarboardAsync(string channelId, string messageId)
		{
			try
			{
				var entry = await _context.Starboards.FirstOrDefaultAsync(star =>
					star.ChannelId == channelId && star.MessageId == messageId);
				return Result<Starboard?>.FromSuccess(entry);
			}
			catch (Exception e)
			{
				return HandleException<Starboard?>(e);
			}
		}

		public async Task<Result<Starboard?>> GetStarboardAsync(string guildId, string? userId, DateTime? dateTime)
		{
			try
			{
				var query = _context.Starboards.Where(star =>
					star.Enabled && star.StarMessageId != null && star.GuildId == guildId);
				if (userId is not null)
				{
					query = query.Where(star => star.UserId == userId);
				}

				var entries = await query.ToArrayAsync();
				var entry = entries.Length == 0 ? null : entries[_random.Next(0, entries.Length)];
				return Result<Starboard?>.FromSuccess(entry);
			}
			catch (Exception e)
			{
				return HandleException<Starboard?>(e);
			}
		}

		public async Task<Result<Starboard?>> AddStarboardAsync(string guildId, string channelId, string messageId,
			string userId, string? starMessageId)
		{
			try
			{
				var entry = await _context.Starboards.FirstOrDefaultAsync(
					star => star.ChannelId == channelId && star.MessageId == messageId);
				if (entry is null)
				{
					entry = new Starboard
					{
						Enabled = true,
						Stars = 1,
						ChannelId = channelId,
						GuildId = guildId,
						MessageId = messageId,
						UserId = userId,
						StarMessageId = starMessageId
					};
					await _context.Starboards.AddAsync(entry);
				}
				else
				{
					entry.Stars++;
				}

				await _context.SaveChangesAsync();
				return Result<Starboard?>.FromSuccess(entry);
			}
			catch (Exception e)
			{
				return HandleException<Starboard?>(e);
			}
		}

		public async Task<Result<string?>> RemoveStarboardAsync(string channelId, string messageId)
		{
			try
			{
				var entry = await _context.Starboards.FirstOrDefaultAsync(
					star => star.ChannelId == channelId && star.MessageId == messageId);
				if (entry is null)
				{
					return Result<string?>.FromSuccess();
				}

				_context.Starboards.Remove(entry);
				await _context.SaveChangesAsync();
				return Result<string?>.FromSuccess(entry.StarMessageId);
			}
			catch (Exception e)
			{
				return HandleException<string?>(e);
			}
		}

		public async Task<Result<string[]>> RemoveStarboardsAsync(string channelId, string[] messageIds)
		{
			try
			{
				var entries = await _context.Starboards.Where(
					star => star.ChannelId == channelId && messageIds.Contains(star.MessageId)).ToArrayAsync();
				if (entries is null)
				{
					return Result<string[]>.FromError("Not Found");
				}

				_context.Starboards.RemoveRange(entries);
				await _context.SaveChangesAsync();
				return Result<string[]>.FromSuccess(entries.Select(entry => entry.StarMessageId)
					.Where(entry => entry is not null).ToArray());
			}
			catch (Exception e)
			{
				return HandleException<string[]>(e);
			}
		}

		public async Task<Result<string[]>> RemoveStarboardsAsync(string channelId)
		{
			try
			{
				var entries = await _context.Starboards.Where(
					star => star.ChannelId == channelId).ToArrayAsync();
				if (entries is null)
				{
					return Result<string[]>.FromSuccess();
				}

				_context.Starboards.RemoveRange(entries);
				await _context.SaveChangesAsync();
				return Result<string[]>.FromSuccess(entries.Select(entry => entry.StarMessageId)
					.Where(entry => entry is not null).ToArray());
			}
			catch (Exception e)
			{
				return HandleException<string[]>(e);
			}
		}

		public async Task<Result<int>> GetUserPointsAsync(string userId)
		{
			try
			{
				var user = await _context.Users.FindAsync(userId);
				return Result<int>.FromSuccess(user?.Points ?? 0);
			}
			catch (Exception e)
			{
				return HandleException<int>(e);
			}
		}

		public async Task<Result> RemoveUserAsync(string id)
		{
			try
			{
				var user = await _context.Users.FindAsync(id);
				if (user is not null)
				{
					_context.Users.Remove(user);
				}

				var profile = await _context.UserProfiles.FindAsync(id);
				if (profile is not null)
				{
					_context.UserProfiles.Remove(profile);
				}

				var cooldowns = await _context.UserCooldowns.FindAsync(id);
				if (cooldowns is not null)
				{
					_context.UserCooldowns.Remove(cooldowns);
				}

				var spouses = await _context.UserSpousesUsers
					.Where(spouse => spouse.UserId1 == id || spouse.UserId2 == id).ToArrayAsync();
				if (spouses is not null)
				{
					_context.UserSpousesUsers.RemoveRange(spouses);
				}

				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result<Banner[]>> GetBannersAsync()
		{
			try
			{
				var banners = await _context.Banners.ToArrayAsync();
				return Result<Banner[]>.FromSuccess(banners);
			}
			catch (Exception e)
			{
				return HandleException<Banner[]>(e);
			}
		}

		public async Task<Result> AddBannerAsync(string id, string group, string title, string authorId, int price)
		{
			try
			{
				await _context.Banners.AddAsync(new Banner
				{
					Id = id,
					Group = group,
					Price = price,
					Title = title,
					AuthorId = authorId
				});

				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result> UpdateBannerAsync(string id, string group, string title, string authorId, int price)
		{
			try
			{
				var banner = await _context.Banners.FindAsync(id);
				if (banner is null)
				{
					return Result.FromError(ResultStatus.NotFound);
				}

				banner.Group = group;
				banner.Price = price;
				banner.Title = title;
				banner.AuthorId = authorId;
				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result> RemoveBannerAsync(string id)
		{
			try
			{
				var banner = await _context.Banners.FindAsync(id);
				if (banner is null)
				{
					return Result.FromError(ResultStatus.NotFound);
				}

				_context.Banners.Remove(banner);
				await _context.SaveChangesAsync();
				return Result.FromSuccess();
			}
			catch (Exception e)
			{
				return HandleException(e);
			}
		}

		public async Task<Result<Tuple<long, string>[]>> GetLocalLeaderboardAsync(string id)
		{
			try
			{
				var users = await _context.Members.Where(member => member.GuildId == id && member.Points >= 25)
					.OrderBy(member => member.Points).Take(10000)
					.Select(member => new Tuple<long, string>(member.Points, member.UserId)).ToArrayAsync();

				return users is null
					? Result<Tuple<long, string>[]>.FromError(ResultStatus.NoEntries)
					: Result<Tuple<long, string>[]>.FromSuccess(users);
			}
			catch (Exception e)
			{
				return HandleException<Tuple<long, string>[]>(e);
			}
		}

		public async Task<Result<Tuple<long, string>[]>> GetGlobalLeaderboardAsync()
		{
			try
			{
				var users = await _context.Users.Where(user => user.Points >= 25)
					.OrderBy(user => user.Points).Take(2500)
					.Select(user => new Tuple<long, string>(user.Points, user.Id)).ToArrayAsync();

				return users is null
					? Result<Tuple<long, string>[]>.FromError(ResultStatus.NoEntries)
					: Result<Tuple<long, string>[]>.FromSuccess(users);
			}
			catch (Exception e)
			{
				return HandleException<Tuple<long, string>[]>(e);
			}
		}

		public async Task<Result<(string, string)[]>> ExecuteSqlAsync(string query)
		{
			await using var command = _context.Database.GetDbConnection().CreateCommand();
			command.CommandText = query;

			await _context.Database.OpenConnectionAsync();

			await using var result = await command.ExecuteReaderAsync();

			var results = new List<(string, string)>();
			while (await result.ReadAsync())
			{
				for (var i = 0; i < result.VisibleFieldCount; i++)
				{
					results.Add((result.GetName(i), result.GetValue(i).ToString()!));
				}
			}

			return Result<(string, string)[]>.FromSuccess(results.ToArray());
		}

		/// <inheritdoc />
		public void Dispose()
		{
			_context.Dispose();
		}

		private void PrintException(Exception exception)
		{
			_logger.LogCritical("Received Error: {Error}", exception);
		}

		private Result HandleException(Exception exception)
		{
			PrintException(exception);
			return Result.FromError(exception);
		}

		private Result<T> HandleException<T>(Exception exception)
		{
			PrintException(exception);
			return Result<T>.FromError(exception);
		}
	}
}
