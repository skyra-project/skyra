import { channelFlags, channelOffset, permissionsFlags, permissionsOffset, toChannelsArray, toPermissionsArray } from '#utils/bits';
import { GuildSystemChannelFlags, PermissionFlagsBits } from 'discord-api-types/v9';
import { Permissions, SystemChannelFlags } from 'discord.js';

describe('Bits', () => {
	describe('Permissions', () => {
		test('GIVEN permissionsFlags.size THEN returns 44', () => {
			expect(permissionsFlags.size).toBe(44);
		});

		test('GIVEN permissionsOffset THEN returns 47', () => {
			expect(Number(permissionsOffset)).toBe(47);
		});

		test('GIVEN various permissions THEN returns an array of their names', () => {
			const value = PermissionFlagsBits.AddReactions | PermissionFlagsBits.Connect | PermissionFlagsBits.ManageRoles;
			expect(toPermissionsArray(value)).toStrictEqual(['ADD_REACTIONS', 'CONNECT', 'MANAGE_ROLES']);
		});

		test('GIVEN all permissions THEN returns an array with all the names', () => {
			const value =
				PermissionFlagsBits.CreateInstantInvite |
				PermissionFlagsBits.KickMembers |
				PermissionFlagsBits.BanMembers |
				PermissionFlagsBits.Administrator |
				PermissionFlagsBits.ManageChannels |
				PermissionFlagsBits.ManageGuild |
				PermissionFlagsBits.AddReactions |
				PermissionFlagsBits.ViewAuditLog |
				PermissionFlagsBits.PrioritySpeaker |
				PermissionFlagsBits.Stream |
				PermissionFlagsBits.ViewChannel |
				PermissionFlagsBits.SendMessages |
				PermissionFlagsBits.SendTTSMessages |
				PermissionFlagsBits.ManageMessages |
				PermissionFlagsBits.EmbedLinks |
				PermissionFlagsBits.AttachFiles |
				PermissionFlagsBits.ReadMessageHistory |
				PermissionFlagsBits.MentionEveryone |
				PermissionFlagsBits.UseExternalEmojis |
				PermissionFlagsBits.ViewGuildInsights |
				PermissionFlagsBits.Connect |
				PermissionFlagsBits.Speak |
				PermissionFlagsBits.MuteMembers |
				PermissionFlagsBits.DeafenMembers |
				PermissionFlagsBits.MoveMembers |
				PermissionFlagsBits.UseVAD |
				PermissionFlagsBits.ChangeNickname |
				PermissionFlagsBits.ManageNicknames |
				PermissionFlagsBits.ManageRoles |
				PermissionFlagsBits.ManageWebhooks |
				PermissionFlagsBits.ManageEmojisAndStickers |
				PermissionFlagsBits.UseApplicationCommands |
				PermissionFlagsBits.RequestToSpeak |
				PermissionFlagsBits.ManageEvents |
				PermissionFlagsBits.ManageThreads |
				PermissionFlagsBits.CreatePublicThreads |
				PermissionFlagsBits.CreatePrivateThreads |
				PermissionFlagsBits.UseExternalStickers |
				PermissionFlagsBits.SendMessagesInThreads |
				PermissionFlagsBits.UseEmbeddedActivities |
				PermissionFlagsBits.ModerateMembers |
				Permissions.FLAGS.VIEW_CREATOR_MONETIZATION_ANALYTICS |
				Permissions.FLAGS.USE_SOUNDBOARD |
				Permissions.FLAGS.SEND_VOICE_MESSAGES;
			expect(toPermissionsArray(value)).toStrictEqual([
				'CREATE_INSTANT_INVITE',
				'KICK_MEMBERS',
				'BAN_MEMBERS',
				'ADMINISTRATOR',
				'MANAGE_CHANNELS',
				'MANAGE_GUILD',
				'ADD_REACTIONS',
				'VIEW_AUDIT_LOG',
				'PRIORITY_SPEAKER',
				'STREAM',
				'VIEW_CHANNEL',
				'SEND_MESSAGES',
				'SEND_TTS_MESSAGES',
				'MANAGE_MESSAGES',
				'EMBED_LINKS',
				'ATTACH_FILES',
				'READ_MESSAGE_HISTORY',
				'MENTION_EVERYONE',
				'USE_EXTERNAL_EMOJIS',
				'VIEW_GUILD_INSIGHTS',
				'CONNECT',
				'SPEAK',
				'MUTE_MEMBERS',
				'DEAFEN_MEMBERS',
				'MOVE_MEMBERS',
				'USE_VAD',
				'CHANGE_NICKNAME',
				'MANAGE_NICKNAMES',
				'MANAGE_ROLES',
				'MANAGE_WEBHOOKS',
				'MANAGE_EMOJIS_AND_STICKERS',
				'USE_APPLICATION_COMMANDS',
				'REQUEST_TO_SPEAK',
				'MANAGE_EVENTS',
				'MANAGE_THREADS',
				'CREATE_PUBLIC_THREADS',
				'CREATE_PRIVATE_THREADS',
				'USE_EXTERNAL_STICKERS',
				'SEND_MESSAGES_IN_THREADS',
				'START_EMBEDDED_ACTIVITIES',
				'MODERATE_MEMBERS',
				'VIEW_CREATOR_MONETIZATION_ANALYTICS',
				'USE_SOUNDBOARD',
				'SEND_VOICE_MESSAGES'
			]);
		});
	});

	describe('Channel', () => {
		test('GIVEN channelFlags.size THEN returns 6', () => {
			expect(channelFlags.size).toBe(6);
		});

		test('GIVEN channelOffset THEN returns 6', () => {
			expect(channelOffset).toBe(6);
		});

		test('GIVEN various flags THEN returns an array of their flags', () => {
			const value = GuildSystemChannelFlags.SuppressJoinNotifications | GuildSystemChannelFlags.SuppressPremiumSubscriptions;
			expect(toChannelsArray(value)).toStrictEqual(['SUPPRESS_JOIN_NOTIFICATIONS', 'SUPPRESS_PREMIUM_SUBSCRIPTIONS']);
		});

		test('GIVEN all flags THEN returns an array with all the flags', () => {
			const value =
				GuildSystemChannelFlags.SuppressJoinNotifications |
				GuildSystemChannelFlags.SuppressJoinNotificationReplies |
				GuildSystemChannelFlags.SuppressPremiumSubscriptions |
				GuildSystemChannelFlags.SuppressGuildReminderNotifications |
				SystemChannelFlags.FLAGS.SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATIONS |
				SystemChannelFlags.FLAGS.SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATION_REPLIES;
			expect(toChannelsArray(value)).toStrictEqual([
				'SUPPRESS_JOIN_NOTIFICATIONS',
				'SUPPRESS_PREMIUM_SUBSCRIPTIONS',
				'SUPPRESS_GUILD_REMINDER_NOTIFICATIONS',
				'SUPPRESS_JOIN_NOTIFICATION_REPLIES',
				'SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATIONS',
				'SUPPRESS_ROLE_SUBSCRIPTION_PURCHASE_NOTIFICATION_REPLIES'
			]);
		});
	});
});
