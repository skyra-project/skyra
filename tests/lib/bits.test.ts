import { toChannelsArray, toPermissionsArray } from '#utils/bits';
import { GuildSystemChannelFlags, PermissionFlagsBits } from 'discord-api-types/v10';

describe('Bits', () => {
	describe('Permissions', () => {
		test('GIVEN various permissions THEN returns an array of their names', () => {
			const value = PermissionFlagsBits.AddReactions | PermissionFlagsBits.Connect | PermissionFlagsBits.ManageRoles;
			expect(toPermissionsArray(value)).toStrictEqual(['AddReactions', 'Connect', 'ManageRoles']);
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
				PermissionFlagsBits.ManageGuildExpressions |
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
				PermissionFlagsBits.ViewCreatorMonetizationAnalytics |
				PermissionFlagsBits.UseSoundboard |
				PermissionFlagsBits.SendVoiceMessages;
			expect(toPermissionsArray(value)).toStrictEqual([
				'CreateInstantInvite',
				'KickMembers',
				'BanMembers',
				'Administrator',
				'ManageChannels',
				'ManageGuild',
				'AddReactions',
				'ViewAuditLog',
				'PrioritySpeaker',
				'Stream',
				'ViewChannel',
				'SendMessages',
				'SendTTSMessages',
				'ManageMessages',
				'EmbedLinks',
				'AttachFiles',
				'ReadMessageHistory',
				'MentionEveryone',
				'UseExternalEmojis',
				'ViewGuildInsights',
				'Connect',
				'Speak',
				'MuteMembers',
				'DeafenMembers',
				'MoveMembers',
				'UseVAD',
				'ChangeNickname',
				'ManageNicknames',
				'ManageRoles',
				'ManageWebhooks',
				'ManageEmojisAndStickers',
				'ManageGuildExpressions',
				'UseApplicationCommands',
				'RequestToSpeak',
				'ManageEvents',
				'ManageThreads',
				'CreatePublicThreads',
				'CreatePrivateThreads',
				'UseExternalStickers',
				'SendMessagesInThreads',
				'UseEmbeddedActivities',
				'ModerateMembers',
				'ViewCreatorMonetizationAnalytics',
				'UseSoundboard',
				'SendVoiceMessages'
			]);
		});
	});

	describe('Channel', () => {
		test('GIVEN various flags THEN returns an array of their flags', () => {
			const value = GuildSystemChannelFlags.SuppressJoinNotifications | GuildSystemChannelFlags.SuppressPremiumSubscriptions;
			expect(toChannelsArray(value)).toStrictEqual(['SuppressJoinNotifications', 'SuppressPremiumSubscriptions']);
		});

		test('GIVEN all flags THEN returns an array with all the flags', () => {
			const value =
				GuildSystemChannelFlags.SuppressJoinNotifications |
				GuildSystemChannelFlags.SuppressJoinNotificationReplies |
				GuildSystemChannelFlags.SuppressPremiumSubscriptions |
				GuildSystemChannelFlags.SuppressGuildReminderNotifications |
				GuildSystemChannelFlags.SuppressRoleSubscriptionPurchaseNotifications |
				GuildSystemChannelFlags.SuppressRoleSubscriptionPurchaseNotificationReplies;
			expect(toChannelsArray(value)).toStrictEqual([
				'SuppressJoinNotifications',
				'SuppressPremiumSubscriptions',
				'SuppressGuildReminderNotifications',
				'SuppressJoinNotificationReplies',
				'SuppressRoleSubscriptionPurchaseNotifications',
				'SuppressRoleSubscriptionPurchaseNotificationReplies'
			]);
		});
	});
});
