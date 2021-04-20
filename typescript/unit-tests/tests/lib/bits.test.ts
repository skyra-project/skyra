import { channelFlags, channelOffset, permissionsFlags, permissionsOffset, toChannelsArray, toPermissionsArray } from '#utils/bits';
import { GuildSystemChannelFlags, PermissionFlagsBits } from 'discord-api-types/v8';

describe('Bits', () => {
	describe('Permissions', () => {
		test('GIVEN permissionsFlags.size THEN returns 31', () => {
			expect(permissionsFlags.size).toBe(31);
		});

		test('GIVEN permissionsOffset THEN returns 31', () => {
			expect(permissionsOffset).toBe(31);
		});

		test('GIVEN various permissions THEN returns an array of their names', () => {
			const value = Number(PermissionFlagsBits.ADD_REACTIONS | PermissionFlagsBits.CONNECT | PermissionFlagsBits.MANAGE_ROLES);
			expect(toPermissionsArray(value)).toStrictEqual(['ADD_REACTIONS', 'CONNECT', 'MANAGE_ROLES']);
		});

		test('GIVEN all permissions THEN returns an array with all the names', () => {
			const value = Number(
				PermissionFlagsBits.CREATE_INSTANT_INVITE |
					PermissionFlagsBits.KICK_MEMBERS |
					PermissionFlagsBits.BAN_MEMBERS |
					PermissionFlagsBits.ADMINISTRATOR |
					PermissionFlagsBits.MANAGE_CHANNELS |
					PermissionFlagsBits.MANAGE_GUILD |
					PermissionFlagsBits.ADD_REACTIONS |
					PermissionFlagsBits.VIEW_AUDIT_LOG |
					PermissionFlagsBits.PRIORITY_SPEAKER |
					PermissionFlagsBits.STREAM |
					PermissionFlagsBits.VIEW_CHANNEL |
					PermissionFlagsBits.SEND_MESSAGES |
					PermissionFlagsBits.SEND_TTS_MESSAGES |
					PermissionFlagsBits.MANAGE_MESSAGES |
					PermissionFlagsBits.EMBED_LINKS |
					PermissionFlagsBits.ATTACH_FILES |
					PermissionFlagsBits.READ_MESSAGE_HISTORY |
					PermissionFlagsBits.MENTION_EVERYONE |
					PermissionFlagsBits.USE_EXTERNAL_EMOJIS |
					PermissionFlagsBits.VIEW_GUILD_INSIGHTS |
					PermissionFlagsBits.CONNECT |
					PermissionFlagsBits.SPEAK |
					PermissionFlagsBits.MUTE_MEMBERS |
					PermissionFlagsBits.DEAFEN_MEMBERS |
					PermissionFlagsBits.MOVE_MEMBERS |
					PermissionFlagsBits.USE_VAD |
					PermissionFlagsBits.CHANGE_NICKNAME |
					PermissionFlagsBits.MANAGE_NICKNAMES |
					PermissionFlagsBits.MANAGE_ROLES |
					PermissionFlagsBits.MANAGE_WEBHOOKS |
					PermissionFlagsBits.MANAGE_EMOJIS
			);
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
				'MANAGE_EMOJIS'
			]);
		});
	});

	describe('Channel', () => {
		test('GIVEN channelFlags.size THEN returns 3', () => {
			expect(channelFlags.size).toBe(3);
		});

		test('GIVEN channelOffset THEN returns 3', () => {
			expect(channelOffset).toBe(3);
		});

		test('GIVEN various flags THEN returns an array of their flags', () => {
			const value = Number(GuildSystemChannelFlags.SUPPRESS_JOIN_NOTIFICATIONS | GuildSystemChannelFlags.SUPPRESS_PREMIUM_SUBSCRIPTIONS);
			expect(toChannelsArray(value)).toStrictEqual(['WELCOME_MESSAGE_DISABLED', 'BOOST_MESSAGE_DISABLED']);
		});

		test('GIVEN all flags THEN returns an array with all the flags', () => {
			const value = Number(
				GuildSystemChannelFlags.SUPPRESS_JOIN_NOTIFICATIONS |
					GuildSystemChannelFlags.SUPPRESS_PREMIUM_SUBSCRIPTIONS |
					GuildSystemChannelFlags.SUPPRESS_GUILD_REMINDER_NOTIFICATIONS
			);
			expect(toChannelsArray(value)).toStrictEqual(['WELCOME_MESSAGE_DISABLED', 'BOOST_MESSAGE_DISABLED', 'REMINDER_MESSAGE_DISABLED']);
		});
	});
});
