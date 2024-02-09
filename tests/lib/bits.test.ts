import { toChannelsArray, toPermissionsArray } from '#utils/bits';
import { enumToObject } from '@sapphire/bitfield';
import { GuildSystemChannelFlags, PermissionFlagsBits } from 'discord.js';

describe('Bits', () => {
	describe('Permissions', () => {
		test('GIVEN various permissions THEN returns an array of their names', () => {
			const value = PermissionFlagsBits.AddReactions | PermissionFlagsBits.Connect | PermissionFlagsBits.ManageRoles;
			expect(toPermissionsArray(value)).toStrictEqual(['AddReactions', 'Connect', 'ManageRoles']);
		});

		test('GIVEN all permissions THEN returns an array with all the names', () => {
			const value = Object.values(PermissionFlagsBits).reduce((a, b) => a | b);
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
				'CreateGuildExpressions',
				'CreateEvents',
				'UseExternalSounds',
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
			const value = Object.values(enumToObject(GuildSystemChannelFlags)).reduce((a, b) => a | b);
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
