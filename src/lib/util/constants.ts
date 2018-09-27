import { ReactionCollectorOptions } from 'discord.js';
import { ModerationTypes } from '../types/skyra';

const BAN: 0        = 0b0000;
const KICK: 1       = 0b0001;
const MUTE: 2       = 0b0010;
const PRUNE: 3      = 0b0011;
const SOFT_BAN: 4   = 0b0100;
const VOICE_KICK: 5 = 0b0101;
const VOICE_MUTE: 6 = 0b0110;
const WARN: 7       = 0b0111;

const ACTION_APPEALED: 16 = (1 << 4) as 16,
	ACTION_TEMPORARY: 32  = (1 << 5) as 32;

const TYPE_KEYS: ConstantsModerationTypeKeys = Object.freeze({
	BAN,
	KICK,
	MUTE,
	PRUNE,
	SOFT_BAN,
	TEMPORARY_BAN        : (BAN        | ACTION_TEMPORARY) as 32,
	TEMPORARY_MUTE       : (MUTE       | ACTION_TEMPORARY) as 34,
	TEMPORARY_VOICE_MUTE : (VOICE_MUTE | ACTION_TEMPORARY) as 38,
	UN_BAN               : (BAN        | ACTION_APPEALED) as 16,
	UN_MUTE              : (MUTE       | ACTION_APPEALED) as 18,
	UN_VOICE_MUTE        : (VOICE_MUTE | ACTION_APPEALED) as 21,
	UN_WARN              : (WARN       | ACTION_APPEALED) as 23,
	VOICE_KICK,
	VOICE_MUTE,
	WARN
});

const TYPE_ASSETS: ConstantsModerationTypeAssets = Object.freeze({
	[TYPE_KEYS.BAN]                  : Object.freeze({ color : 0xD50000, title : 'Ban' }),
	[TYPE_KEYS.KICK]                 : Object.freeze({ color : 0xF57F17, title : 'Kick' }),
	[TYPE_KEYS.MUTE]                 : Object.freeze({ color : 0xF9A825, title : 'Mute' }),
	[TYPE_KEYS.PRUNE]                : Object.freeze({ color : 0xB2FF59, title : 'Message Prune' }),
	[TYPE_KEYS.SOFT_BAN]             : Object.freeze({ color : 0xFF1744, title : 'Softban' }),
	[TYPE_KEYS.VOICE_KICK]           : Object.freeze({ color : 0xFFBB2D, title : 'Voice Kick' }),
	[TYPE_KEYS.VOICE_MUTE]           : Object.freeze({ color : 0xFBC02D, title : 'Voice Mute' }),
	[TYPE_KEYS.WARN]                 : Object.freeze({ color : 0xFFD600, title : 'Warn' }),
	[TYPE_KEYS.UN_BAN]               : Object.freeze({ color : 0x304FFE, title : 'Unban' }),
	[TYPE_KEYS.UN_MUTE]              : Object.freeze({ color : 0x448AFF, title : 'Unmute' }),
	[TYPE_KEYS.UN_VOICE_MUTE]        : Object.freeze({ color : 0xBBDEFB, title : 'Voice Unmute' }),
	[TYPE_KEYS.UN_WARN]              : Object.freeze({ color : 0xFFF494, title : 'Unwarn' }),
	[TYPE_KEYS.TEMPORARY_BAN]        : Object.freeze({ color : 0xC51162, title : 'Temporary Ban' }),
	[TYPE_KEYS.TEMPORARY_MUTE]       : Object.freeze({ color : 0xF50057, title : 'Temporary Mute' }),
	[TYPE_KEYS.TEMPORARY_VOICE_MUTE] : Object.freeze({ color : 0xFF4081, title : 'Temporary Voice Mute' })
});

export const TIME: ConstantsTime = Object.freeze({
	DAY: 1000 * 60 * 60 * 24,
	HOUR: 1000 * 60 * 60,
	MILLISECOND: 1,
	MINUTE: 1000 * 60,
	SECOND: 1000,
	WEEK: 1000 * 60 * 60 * 24 * 7,
	YEAR: 1000 * 60 * 60 * 24 * 365
});

export const EMOJIS: ConstantsEmojis = Object.freeze({
	GREENTICK: '<:greenTick:405073335907647489>',
	REDCROSS: '<:redCross:405073349664833537>',
	SHINY: '<:ShinyYellow:324157128270938113>'
});

export const CONNECT_FOUR: ConstantsConnectFour = Object.freeze({
	EMOJIS: Object.freeze({
		1: '<:PlayerONE:352403997300359169>',
		2: '<:PlayerTWO:352404081974968330>',
		0: '<:Empty:352403997606412289>',
		WINNER_1: '<:PlayerONEWin:352403997761601547>',
		WINNER_2: '<:PlayerTWOWin:352403997958602752>'
	}),
	REACTIONS: Object.freeze('1⃣ 2⃣ 3⃣ 4⃣ 5⃣ 6⃣ 7⃣'.split(' ')),
	REACTION_OPTIONS: Object.freeze({
		max: 1,
		time: 60000
	}),
	RESPONSES: <ConstantsConnectFourResponses> Object.freeze({
		FULL_GAME: 1,
		FULL_LINE: 0,
		TIMEOUT: 2
	})
});

export const MESSAGE_LOGS: ConstantsMessageLogs = Object.freeze({
	kMember: Symbol('kMember'),
	kMessage: Symbol('kMessage'),
	kModeration: Symbol('kModeration'),
	kNSFWMessage: Symbol('kNSFWMessage')
});

export const MODERATION: ConstantsModeration = Object.freeze({
	ACTIONS: Object.freeze({
		APPEALED: <16> ACTION_APPEALED,
		TEMPORARY: <32> ACTION_TEMPORARY
	}),
	ERRORS: Object.freeze({
		CASE_APPEALED: 'CASE_APPEALED',
		CASE_NOT_EXISTS: 'CASE_NOT_EXISTS',
		CASE_TYPE_NOT_APPEAL: 'CASE_TYPE_NOT_APPEAL'
	}),
	SCHEMA_KEYS: <ConstantsModerationSchemaKeys> Object.freeze({
		CASE: 'caseID',
		CREATED_AT: 'createdAt',
		DURATION: 'duration',
		EXTRA_DATA: 'extraData',
		GUILD: 'guildID',
		MODERATOR: 'moderatorID',
		REASON: 'reason',
		TYPE: 'type',
		USER: 'userID'
	}),
	TYPE_ASSETS,
	TYPE_KEYS,
});

export default {
	CONNECT_FOUR,
	EMOJIS,
	MESSAGE_LOGS,
	MODERATION,
	TIME
};

export type ConstantsTime = Readonly<{
	DAY: number;
	HOUR: number;
	MILLISECOND: number;
	MINUTE: number;
	SECOND: number;
	WEEK: number;
	YEAR: number;
}>;

export type ConstantsEmojis = Readonly<{
	GREENTICK: string;
	REDCROSS: string;
	SHINY: string;
}>;

export type ConstantsConnectFour = Readonly<{
	EMOJIS: ConstantsConnectFourEmojis;
	REACTIONS: ConstantsConnectFourReactions;
	REACTION_OPTIONS: ConstantsConnectFourReactionOptions;
	RESPONSES: ConstantsConnectFourResponses;
}>;

export type ConstantsConnectFourEmojis = Readonly<{
	1: string;
	2: string;
	0: string;
	WINNER_1: string;
	WINNER_2: string;
}>;

export type ConstantsConnectFourReactions = ReadonlyArray<string>;

export type ConstantsConnectFourReactionOptions = Readonly<ReactionCollectorOptions>;

export type ConstantsConnectFourResponses = Readonly<{
	FULL_GAME: 1;
	FULL_LINE: 0;
	TIMEOUT: 2;
}>;

export type ConstantsMessageLogs = Readonly<{
	kMessage: symbol;
	kNSFWMessage: symbol;
	kModeration: symbol;
	kMember: symbol;
}>;

export type ConstantsModeration = Readonly<{
	TYPE_KEYS: ConstantsModerationTypeKeys;
	TYPE_ASSETS: ConstantsModerationTypeAssets;
	SCHEMA_KEYS: ConstantsModerationSchemaKeys;
	ACTIONS: ConstantsModerationActions;
	ERRORS: ConstantsModerationErrors;
}>;

export type ConstantsModerationTypeKeys = Readonly<{
	BAN: 0b0000;
	KICK: 0b0001;
	MUTE: 0b0010;
	PRUNE: 0b0011;
	SOFT_BAN: 0b0100;
	VOICE_KICK: 0b0101;
	VOICE_MUTE: 0b0110;
	WARN: 0b0111;
	UN_BAN: 0b010000;
	UN_MUTE: 0b010010;
	UN_VOICE_MUTE: 0b010101;
	UN_WARN: 0b010111;
	TEMPORARY_BAN: 0b100000;
	TEMPORARY_MUTE: 0b100010;
	TEMPORARY_VOICE_MUTE: 0b100110;
}>;

export type ConstantsModerationTypeAssets = Readonly<Record<ModerationTypes, ConstantsModerationTypeAsset>>;

export type ConstantsModerationTypeAsset = Readonly<{ color: number; title: string }>;

export type ConstantsModerationSchemaKeys = Readonly<{
	CASE: 'caseID';
	DURATION: 'duration';
	EXTRA_DATA: 'extraData';
	GUILD: 'guildID';
	MODERATOR: 'moderatorID';
	REASON: 'reason';
	TYPE: 'type';
	USER: 'userID';
	CREATED_AT: 'createdAt';
}>;

export type ConstantsModerationActions = Readonly<{
	APPEALED: 16;
	TEMPORARY: 32;
}>;

export type ConstantsModerationErrors = Readonly<{
	CASE_APPEALED: string;
	CASE_NOT_EXISTS: string;
	CASE_TYPE_NOT_APPEAL: string;
}>;
