using System;
using Microsoft.EntityFrameworkCore;
using Skyra.Database.Models.Entities;

#nullable disable

namespace Skyra.Database
{
	/// <inheritdoc />
	public class SkyraDbContext : DbContext
	{
		/// <inheritdoc />
		public SkyraDbContext()
		{
		}

		/// <inheritdoc />
		public SkyraDbContext(DbContextOptions<SkyraDbContext> options)
			: base(options)
		{
		}

		public virtual DbSet<Banner> Banners { get; set; }
		public virtual DbSet<Client> Clients { get; set; }
		public virtual DbSet<Giveaway> Giveaways { get; set; }
		public virtual DbSet<Guild> Guilds { get; set; }
		public virtual DbSet<Member> Members { get; set; }
		public virtual DbSet<Migration> Migrations { get; set; }
		public virtual DbSet<Moderation> Moderations { get; set; }
		public virtual DbSet<RpgBattle> RpgBattles { get; set; }
		public virtual DbSet<RpgClass> RpgClasses { get; set; }
		public virtual DbSet<RpgGuild> RpgGuilds { get; set; }
		public virtual DbSet<RpgGuildRank> RpgGuildRanks { get; set; }
		public virtual DbSet<RpgItem> RpgItems { get; set; }
		public virtual DbSet<RpgUser> RpgUsers { get; set; }
		public virtual DbSet<RpgUserItem> RpgUserItems { get; set; }
		public virtual DbSet<Schedule> Schedules { get; set; }
		public virtual DbSet<Starboard> Starboards { get; set; }
		public virtual DbSet<Suggestion> Suggestions { get; set; }
		public virtual DbSet<TwitchStreamSubscription> TwitchStreamSubscriptions { get; set; }
		public virtual DbSet<User> Users { get; set; }
		public virtual DbSet<UserCooldown> UserCooldowns { get; set; }
		public virtual DbSet<UserGameIntegration> UserGameIntegrations { get; set; }
		public virtual DbSet<UserProfile> UserProfiles { get; set; }
		public virtual DbSet<UserSpousesUser> UserSpousesUsers { get; set; }

		protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
		{
			if (optionsBuilder.IsConfigured)
			{
				return;
			}

			var user = Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "postgres";
			var password = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD") ?? "postgres";
			var host = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
			var port = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
			var name = Environment.GetEnvironmentVariable("POSTGRES_DB") ?? "skyra";

			optionsBuilder.UseNpgsql(
				$"User ID={user};Password={password};Server={host};Port={port};Database={name};Pooling=true;",
				options => options.EnableRetryOnFailure()).UseSnakeCaseNamingConvention();
		}

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			modelBuilder.HasPostgresEnum(null, "rpg_item_type_enum",
					new[] {"Weapon", "Shield", "Disposable", "Special"})
				.HasAnnotation("Relational:Collation", "en_US.utf8");

			modelBuilder.Entity<Client>(entity =>
			{
				entity.Property(e => e.Id).HasDefaultValueSql("'365184854914236416'::character varying");

				entity.Property(e => e.GuildBlocklist).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.GuildBoost).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.UserBlocklist).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.UserBoost).HasDefaultValueSql("ARRAY[]::character varying[]");
			});

			modelBuilder.Entity<Giveaway>(entity =>
			{
				entity.HasKey(e => new {e.GuildId, e.MessageId})
					.HasName("PK_e73020907ca2a4b1ae14fce6e74");

				entity.Property(e => e.Minimum).HasDefaultValueSql("1");

				entity.Property(e => e.MinimumWinners).HasDefaultValueSql("1");

				entity.Property(e => e.AllowedRoles).HasDefaultValueSql("ARRAY[]::character varying[]");
			});

			modelBuilder.Entity<Guild>(entity =>
			{
				entity.Property(e => e.AfkPrefixForce).HasDefaultValueSql("false");

				entity.Property(e => e.ChannelsIgnoreAll).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.ChannelsIgnoreMessageDelete).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.ChannelsIgnoreMessageEdit).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.ChannelsIgnoreReactionAdd).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.CommandAutodelete).HasDefaultValueSql("'[]'::jsonb");

				entity.Property(e => e.CustomCommands).HasDefaultValueSql("'[]'::jsonb");

				entity.Property(e => e.DisabledChannels).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.DisableNaturalPrefix).HasDefaultValueSql("false");

				entity.Property(e => e.DisabledCommands).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.DisabledCommandsChannels).HasDefaultValueSql("'[]'::jsonb");

				entity.Property(e => e.EventsBanAdd).HasDefaultValueSql("false");

				entity.Property(e => e.EventsBanRemove).HasDefaultValueSql("false");

				entity.Property(e => e.EventsTwemojiReactions).HasDefaultValueSql("false");

				entity.Property(e => e.EventsMemberUsernameUpdate).HasDefaultValueSql("false");

				entity.Property(e => e.Language).HasDefaultValueSql("'en-US'::character varying");

				entity.Property(e => e.MessagesIgnoreChannels).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.MessagesAnnouncementEmbed).HasDefaultValueSql("false");

				entity.Property(e => e.MessagesModerationDm).HasDefaultValueSql("false");

				entity.Property(e => e.MessagesModerationMessageDisplay).HasDefaultValueSql("true");

				entity.Property(e => e.MessagesModerationAutoDelete).HasDefaultValueSql("false");

				entity.Property(e => e.MessagesModerationReasonDisplay).HasDefaultValueSql("true");

				entity.Property(e => e.MessagesModeratorNameDisplay).HasDefaultValueSql("true");

				entity.Property(e => e.MessagesAutoDeleteIgnoredAll).HasDefaultValueSql("false");

				entity.Property(e => e.MessagesAutoDeleteIgnoredRoles).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.MessagesAutoDeleteIgnoredChannels).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.MessagesAutoDeleteIgnoredCommands).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.MusicAllowStreams).HasDefaultValueSql("true");

				entity.Property(e => e.MusicDefaultVolume).HasDefaultValueSql("100");

				entity.Property(e => e.MusicMaximumDuration).HasDefaultValueSql("7200000");

				entity.Property(e => e.MusicMaximumEntriesPerUser).HasDefaultValueSql("100");

				entity.Property(e => e.NotificationsStreamsTwitchStreamers).HasDefaultValueSql("'[]'::jsonb");

				entity.Property(e => e.PermissionsRoles).HasDefaultValueSql("'[]'::jsonb");

				entity.Property(e => e.PermissionsUsers).HasDefaultValueSql("'[]'::jsonb");

				entity.Property(e => e.Prefix).HasDefaultValueSql("'sd!'::character varying");

				entity.Property(e => e.ReactionRoles).HasDefaultValueSql("'[]'::jsonb");

				entity.Property(e => e.RolesAdmin).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.RolesAuto).HasDefaultValueSql("'[]'::jsonb");

				entity.Property(e => e.RolesDj).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.RolesModerator).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.RolesPublic).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.RolesUniqueRoleSets).HasDefaultValueSql("'[]'::jsonb");

				entity.Property(e => e.RolesRemoveInitial).HasDefaultValueSql("false");

				entity.Property(e => e.SelfmodAttachmentsEnabled).HasDefaultValueSql("false");

				entity.Property(e => e.SelfmodAttachmentsSoftAction).HasDefaultValueSql("0");

				entity.Property(e => e.SelfmodAttachmentsHardAction).HasDefaultValueSql("0");

				entity.Property(e => e.SelfmodAttachmentsIgnoredChannels)
					.HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodAttachmentsIgnoredRoles)
					.HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodAttachmentsThresholdDuration).HasDefaultValueSql("60000");

				entity.Property(e => e.SelfmodAttachmentsThresholdMaximum).HasDefaultValueSql("10");

				entity.Property(e => e.SelfmodCapitalsEnabled).HasDefaultValueSql("false");

				entity.Property(e => e.SelfmodCapitalsIgnoredChannels)
					.HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodCapitalsIgnoredRoles).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodCapitalsMinimum).HasDefaultValueSql("15");

				entity.Property(e => e.SelfmodCapitalsMaximum).HasDefaultValueSql("50");

				entity.Property(e => e.SelfmodCapitalsSoftAction).HasDefaultValueSql("0");

				entity.Property(e => e.SelfmodCapitalsHardAction).HasDefaultValueSql("0");

				entity.Property(e => e.SelfmodCapitalsThresholdDuration).HasDefaultValueSql("60000");

				entity.Property(e => e.SelfmodCapitalsThresholdMaximum).HasDefaultValueSql("10");

				entity.Property(e => e.SelfmodFilterEnabled).HasDefaultValueSql("false");

				entity.Property(e => e.SelfmodFilterSoftAction).HasDefaultValueSql("0");

				entity.Property(e => e.SelfmodFilterHardAction).HasDefaultValueSql("0");

				entity.Property(e => e.SelfmodFilterIgnoredChannels).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodFilterIgnoredRoles).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodFilterRaw).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodFilterThresholdDuration).HasDefaultValueSql("60000");

				entity.Property(e => e.SelfmodFilterThresholdMaximum).HasDefaultValueSql("10");

				entity.Property(e => e.SelfmodIgnoreChannels).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodInvitesEnabled).HasDefaultValue("false");

				entity.Property(e => e.SelfmodInvitesSoftAction).HasDefaultValue("0");

				entity.Property(e => e.SelfmodInvitesHardAction).HasDefaultValue("0");

				entity.Property(e => e.SelfmodInvitesIgnoredChannels)
					.HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodInvitesIgnoredCodes).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodInvitesIgnoredGuilds).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodInvitesIgnoredRoles).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodInvitesThresholdDuration).HasDefaultValueSql("60000");

				entity.Property(e => e.SelfmodInvitesThresholdMaximum).HasDefaultValueSql("10");

				entity.Property(e => e.SelfmodLinksIgnoredChannels).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodLinksEnabled).HasDefaultValueSql("false");

				entity.Property(e => e.SelfmodLinksSoftAction).HasDefaultValueSql("0");

				entity.Property(e => e.SelfmodLinksHardAction).HasDefaultValueSql("0");

				entity.Property(e => e.SelfmodLinksIgnoredRoles).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodLinksThresholdDuration).HasDefaultValueSql("60000");

				entity.Property(e => e.SelfmodLinksThresholdMaximum).HasDefaultValueSql("10");

				entity.Property(e => e.SelfmodLinksAllowed).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodMessagesEnabled).HasDefaultValueSql("false");

				entity.Property(e => e.SelfmodMessagesIgnoredChannels)
					.HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodMessagesIgnoredRoles).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodMessagesMaximum).HasDefaultValueSql("5");

				entity.Property(e => e.SelfmodMessagesQueueSize).HasDefaultValueSql("50");

				entity.Property(e => e.SelfmodMessagesThresholdDuration).HasDefaultValueSql("60000");

				entity.Property(e => e.SelfmodMessagesThresholdMaximum).HasDefaultValueSql("10");

				entity.Property(e => e.SelfmodMessagesSoftAction).HasDefaultValueSql("0");

				entity.Property(e => e.SelfmodMessagesHardAction).HasDefaultValueSql("0");

				entity.Property(e => e.SelfmodNewlinesEnabled).HasDefaultValueSql("false");

				entity.Property(e => e.SelfmodNewlinesIgnoredChannels)
					.HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodNewlinesIgnoredRoles).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodNewlinesMaximum).HasDefaultValueSql("20");

				entity.Property(e => e.SelfmodNewlinesSoftAction).HasDefaultValueSql("0");

				entity.Property(e => e.SelfmodNewlinesHardAction).HasDefaultValueSql("0");

				entity.Property(e => e.SelfmodNewlinesThresholdDuration).HasDefaultValueSql("60000");

				entity.Property(e => e.SelfmodNewlinesThresholdMaximum).HasDefaultValueSql("10");

				entity.Property(e => e.SelfmodReactionsEnabled).HasDefaultValueSql("false");

				entity.Property(e => e.SelfmodReactionsBlocked).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodReactionsIgnoredChannels)
					.HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodReactionsIgnoredRoles).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodReactionsMaximum).HasDefaultValueSql("10");

				entity.Property(e => e.SelfmodReactionsThresholdDuration).HasDefaultValueSql("60000");

				entity.Property(e => e.SelfmodReactionsThresholdMaximum).HasDefaultValueSql("10");

				entity.Property(e => e.SelfmodReactionsAllowed).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SelfmodReactionsSoftAction).HasDefaultValueSql("0");

				entity.Property(e => e.SelfmodReactionsHardAction).HasDefaultValueSql("0");

				entity.Property(e => e.SocialEnabled).HasDefaultValueSql("true");

				entity.Property(e => e.SocialAchieveMultiple).HasDefaultValueSql("1");

				entity.Property(e => e.SocialIgnoredChannels).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SocialIgnoredRoles).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.SocialMultiplier)
					.HasPrecision(53)
					.HasDefaultValueSql("1");

				entity.Property(e => e.StarboardEmoji).HasDefaultValueSql("'%E2%AD%90'::character varying");

				entity.Property(e => e.StarboardIgnoreChannels).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.StarboardMinimum).HasDefaultValueSql("1");

				entity.Property(e => e.StarboardSelfStar).HasDefaultValueSql("false");

				entity.Property(e => e.MusicAllowedVoiceChannels).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.MusicAllowedRoles).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.StickyRoles).HasDefaultValueSql("'[]'::jsonb");

				entity.Property(e => e.SuggestionsEmojisDownvote)
					.HasDefaultValueSql("':ArrowB:694594285269680179'::character varying");

				entity.Property(e => e.SuggestionsEmojisUpvote)
					.HasDefaultValueSql("':ArrowT:694594285487652954'::character varying");

				entity.Property(e => e.SuggestionsOnActionDm).HasDefaultValueSql("false");

				entity.Property(e => e.SuggestionsOnActionRepost).HasDefaultValueSql("false");

				entity.Property(e => e.SuggestionsOnActionHideAuthor).HasDefaultValueSql("false");

				entity.Property(e => e.TriggerAlias).HasDefaultValueSql("'[]'::jsonb");

				entity.Property(e => e.TriggerIncludes).HasDefaultValueSql("'[]'::jsonb");

				entity.Property(e => e.NoMentionSpamEnabled).HasDefaultValueSql("false");

				entity.Property(e => e.NoMentionSpamAlerts).HasDefaultValueSql("false");

				entity.Property(e => e.NoMentionSpamMentionsAllowed).HasDefaultValueSql("20");

				entity.Property(e => e.NoMentionSpamTimePeriod).HasDefaultValueSql("8");
			});

			modelBuilder.Entity<Member>(entity =>
			{
				entity.HasKey(e => new {e.GuildId, e.UserId})
					.HasName("PK_923cd70108499f5f72ae286417c");

				entity.Property(e => e.Points).HasDefaultValueSql("0");
			});

			modelBuilder.Entity<Moderation>(entity =>
			{
				entity.HasKey(e => new {e.CaseId, e.GuildId})
					.HasName("PK_e9ec6c684894a7067a45b7ae4f6");

				entity.Property(e => e.ImageUrl).HasDefaultValueSql("NULL::character varying");

				entity.Property(e => e.ModeratorId).HasDefaultValueSql("'365184854914236416'::character varying");

				entity.Property(e => e.Reason).HasDefaultValueSql("NULL::character varying");

				entity.Property(e => e.UserId).HasDefaultValueSql("NULL::character varying");
			});

			modelBuilder.Entity<RpgBattle>(entity =>
			{
				entity.HasOne(d => d.ChallengedUserNavigation)
					.WithOne(p => p.RpgBattleChallengedUserNavigation)
					.HasForeignKey<RpgBattle>(d => d.ChallengedUser)
					.HasConstraintName("FK_36e1b3bf944502050aa76aa399a");

				entity.HasOne(d => d.ChallengedWeapon)
					.WithMany(p => p.RpgBattleChallengedWeapons)
					.HasForeignKey(d => d.ChallengedWeaponId)
					.OnDelete(DeleteBehavior.SetNull)
					.HasConstraintName("FK_44cf95cf9e6634b2f87f8159477");

				entity.HasOne(d => d.ChallengerUserNavigation)
					.WithOne(p => p.RpgBattleChallengerUserNavigation)
					.HasForeignKey<RpgBattle>(d => d.ChallengerUser)
					.HasConstraintName("FK_5230797f292df6a36d1fb5f0f09");

				entity.HasOne(d => d.ChallengerWeapon)
					.WithMany(p => p.RpgBattleChallengerWeapons)
					.HasForeignKey(d => d.ChallengerWeaponId)
					.OnDelete(DeleteBehavior.SetNull)
					.HasConstraintName("FK_e3997bc3dd2ed9164b7a1a85f02");
			});

			modelBuilder.Entity<RpgClass>(entity =>
			{
				entity.Property(e => e.AgilityMultiplier).HasDefaultValueSql("1");

				entity.Property(e => e.AttackMultiplier).HasDefaultValueSql("1");

				entity.Property(e => e.DefenseMultiplier).HasDefaultValueSql("1");

				entity.Property(e => e.EnergyMultiplier).HasDefaultValueSql("1");

				entity.Property(e => e.LuckMultiplier).HasDefaultValueSql("1");
			});

			modelBuilder.Entity<RpgGuild>(entity =>
			{
				entity.Property(e => e.BankLimit).HasDefaultValueSql("50000");

				entity.Property(e => e.MemberLimit).HasDefaultValueSql("5");
			});

			modelBuilder.Entity<RpgGuildRank>(entity =>
			{
				entity.HasOne(d => d.Guild)
					.WithMany(p => p.RpgGuildRanks)
					.HasForeignKey(d => d.GuildId)
					.OnDelete(DeleteBehavior.Cascade)
					.HasConstraintName("FK_ddc84b6edbf93fd59d9cc819bd0");
			});

			modelBuilder.Entity<RpgItem>(entity =>
			{
				entity.Property(e => e.Effects).HasDefaultValueSql("'{}'::jsonb");
			});

			modelBuilder.Entity<RpgUser>(entity =>
			{
				entity.HasKey(e => e.UserId)
					.HasName("PK_719f657879066b0981260ccc7b2");

				entity.HasOne(d => d.Class)
					.WithMany(p => p.RpgUsers)
					.HasForeignKey(d => d.ClassId)
					.OnDelete(DeleteBehavior.SetNull)
					.HasConstraintName("FK_a925752b2be93dab947e57f17b2");

				entity.HasOne(d => d.EquippedItem)
					.WithMany(p => p.RpgUsers)
					.HasForeignKey(d => d.EquippedItemId)
					.OnDelete(DeleteBehavior.SetNull)
					.HasConstraintName("FK_fdd476ddaed81357d7ddbdca883");

				entity.HasOne(d => d.Guild)
					.WithMany(p => p.RpgUsers)
					.HasForeignKey(d => d.GuildId)
					.OnDelete(DeleteBehavior.SetNull)
					.HasConstraintName("FK_776e8e9d0df635e6be8b40c3507");

				entity.HasOne(d => d.GuildRank)
					.WithMany(p => p.RpgUsers)
					.HasForeignKey(d => d.GuildRankId)
					.OnDelete(DeleteBehavior.SetNull)
					.HasConstraintName("FK_6fd419cf9dad38d6b37c244b172");

				entity.HasOne(d => d.User)
					.WithOne(p => p.RpgUser)
					.HasForeignKey<RpgUser>(d => d.UserId)
					.HasConstraintName("FK_719f657879066b0981260ccc7b2");
			});

			modelBuilder.Entity<RpgUserItem>(entity =>
			{
				entity.HasOne(d => d.Item)
					.WithMany(p => p.RpgUserItems)
					.HasForeignKey(d => d.ItemId)
					.OnDelete(DeleteBehavior.Cascade)
					.HasConstraintName("FK_0babac6e86746fb7ab492f6d948");
			});

			modelBuilder.Entity<Schedule>(entity => { entity.Property(e => e.CatchUp).HasDefaultValueSql("true"); });

			modelBuilder.Entity<Starboard>(entity =>
			{
				entity.HasKey(e => new {e.MessageId, e.GuildId})
					.HasName("PK_4bd6406cf1cf6cff7e9de1fafd2");
			});

			modelBuilder.Entity<Suggestion>(entity =>
			{
				entity.HasKey(e => new {e.Id, e.GuildId})
					.HasName("PK_5a7d999d79058230627a279853a");
			});

			modelBuilder.Entity<TwitchStreamSubscription>(entity =>
			{
				entity.Property(e => e.GuildIds).HasDefaultValueSql("ARRAY[]::character varying[]");
			});

			modelBuilder.Entity<User>(entity =>
			{
				entity.Property(e => e.ModerationDm).HasDefaultValueSql("true");
				entity.Property(e => e.Points).HasDefaultValueSql("0");
				entity.Property(e => e.Reputations).HasDefaultValueSql("0");
				entity.Property(e => e.Money).HasDefaultValueSql("0");
			});

			modelBuilder.Entity<UserCooldown>(entity =>
			{
				entity.HasKey(e => e.UserId)
					.HasName("PK_1950d1f438c5dfe9bc6b8cc3531");

				entity.HasOne(d => d.User)
					.WithOne(p => p.UserCooldown)
					.HasForeignKey<UserCooldown>(d => d.UserId)
					.HasConstraintName("FK_1950d1f438c5dfe9bc6b8cc3531");
			});

			modelBuilder.Entity<UserGameIntegration>(entity =>
			{
				entity.HasOne(d => d.User)
					.WithMany(p => p.UserGameIntegrations)
					.HasForeignKey(d => d.UserId)
					.OnDelete(DeleteBehavior.Cascade)
					.HasConstraintName("FK_06e1223a9d5945e11f022e6a1c6");
			});

			modelBuilder.Entity<UserProfile>(entity =>
			{
				entity.HasKey(e => e.UserId)
					.HasName("PK_0468eeca19838d4337cb8f1ec93");

				entity.Property(e => e.Badges).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.BannerLevel).HasDefaultValueSql("'1001'::character varying");

				entity.Property(e => e.BannerProfile).HasDefaultValueSql("'0001'::character varying");

				entity.Property(e => e.Banners).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.PublicBadges).HasDefaultValueSql("ARRAY[]::character varying[]");

				entity.Property(e => e.Color).HasDefaultValueSql("0");

				entity.Property(e => e.Vault).HasDefaultValueSql("0");

				entity.Property(e => e.DarkTheme).HasDefaultValueSql("false");

				entity.HasOne(d => d.User)
					.WithOne(p => p.UserProfile)
					.HasForeignKey<UserProfile>(d => d.UserId)
					.HasConstraintName("FK_0468eeca19838d4337cb8f1ec93");
			});

			modelBuilder.Entity<UserSpousesUser>(entity =>
			{
				entity.HasKey(e => new {e.UserId1, e.UserId2})
					.HasName("PK_d03519ca87f9a551e7623625f17");

				entity.HasOne(d => d.UserId1Navigation)
					.WithMany(p => p.UserSpousesUserUserId1Navigations)
					.HasForeignKey(d => d.UserId1)
					.HasConstraintName("FK_6bbc6de75851eb64e17c07a6a94");

				entity.HasOne(d => d.UserId2Navigation)
					.WithMany(p => p.UserSpousesUserUserId2Navigations)
					.HasForeignKey(d => d.UserId2)
					.HasConstraintName("FK_039ee960316593d0e8102ae6c51");
			});
		}
	}
}
