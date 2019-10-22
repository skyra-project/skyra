import { KlasaClientOptions } from 'klasa';
import { join } from 'path';
import { DEV } from '../../../config';

export const rootFolder = join(__dirname, '..', '..', '..', '..');
export const assetsFolder = join(rootFolder, 'assets');
export const cdnFolder = DEV ? join(assetsFolder, 'public') : join('/var', 'www', 'assets');

const BAN = 0b0000;
const KICK = 0b0001;
const MUTE = 0b0010;
const PRUNE = 0b0011;
const SOFT_BAN = 0b0100;
const VOICE_KICK = 0b0101;
const VOICE_MUTE = 0b0110;
const WARN = 0b0111;

const ACTION_APPEALED = 1 << 4;
const ACTION_TEMPORARY = 1 << 5;

export const TIME = Object.freeze({
	DAY: 1000 * 60 * 60 * 24,
	HOUR: 1000 * 60 * 60,
	MILLISECOND: 1,
	MINUTE: 1000 * 60,
	SECOND: 1000,
	WEEK: 1000 * 60 * 60 * 24 * 7,
	YEAR: 1000 * 60 * 60 * 24 * 365
});

export const EMOJIS = Object.freeze({
	GREENTICK: '<:greenTick:405073335907647489>',
	LOADING: '<a:SkyraLoading:497584859045429250>',
	REDCROSS: '<:redCross:405073349664833537>',
	SHINY: '<:ShinyYellow:324157128270938113>'
});

export const CONNECT_FOUR = Object.freeze({
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
	RESPONSES: Object.freeze({
		FULL_GAME: 1,
		FULL_LINE: 0,
		TIMEOUT: 2
	})
});

export enum MessageLogsEnum { Message, NSFWMessage, Image, Moderation, Member }

export enum ModerationTypeKeys {
	Ban = BAN,
	Kick = KICK,
	Mute = MUTE,
	Prune = PRUNE,
	Softban = SOFT_BAN,
	TemporaryBan = BAN | ACTION_TEMPORARY,
	TemporaryMute = MUTE | ACTION_TEMPORARY,
	TemporaryVoiceMute = VOICE_MUTE | ACTION_TEMPORARY,
	UnBan = BAN | ACTION_APPEALED,
	UnMute = MUTE | ACTION_APPEALED,
	UnVoiceMute = VOICE_MUTE | ACTION_APPEALED,
	UnWarn = WARN | ACTION_APPEALED,
	VoiceKick = VOICE_KICK,
	VoiceMute = VOICE_MUTE,
	Warn = WARN
}

export const TYPE_ASSETS: Readonly<Record<ModerationTypeKeys, ModerationTypeAssets>> = Object.freeze({
	[ModerationTypeKeys.Ban]: Object.freeze({ color: 0xD50000, title: 'Ban' }),
	[ModerationTypeKeys.Kick]: Object.freeze({ color: 0xF57F17, title: 'Kick' }),
	[ModerationTypeKeys.Mute]: Object.freeze({ color: 0xF9A825, title: 'Mute' }),
	[ModerationTypeKeys.Prune]: Object.freeze({ color: 0xB2FF59, title: 'Message Prune' }),
	[ModerationTypeKeys.Softban]: Object.freeze({ color: 0xFF1744, title: 'Softban' }),
	[ModerationTypeKeys.VoiceKick]: Object.freeze({ color: 0xFFBB2D, title: 'Voice Kick' }),
	[ModerationTypeKeys.VoiceMute]: Object.freeze({ color: 0xFBC02D, title: 'Voice Mute' }),
	[ModerationTypeKeys.Warn]: Object.freeze({ color: 0xFFD600, title: 'Warn' }),
	[ModerationTypeKeys.UnBan]: Object.freeze({ color: 0x304FFE, title: 'Unban' }),
	[ModerationTypeKeys.UnMute]: Object.freeze({ color: 0x448AFF, title: 'Unmute' }),
	[ModerationTypeKeys.UnVoiceMute]: Object.freeze({ color: 0xBBDEFB, title: 'Voice Unmute' }),
	[ModerationTypeKeys.UnWarn]: Object.freeze({ color: 0xFFF494, title: 'Unwarn' }),
	[ModerationTypeKeys.TemporaryBan]: Object.freeze({ color: 0xC51162, title: 'Temporary Ban' }),
	[ModerationTypeKeys.TemporaryMute]: Object.freeze({ color: 0xF50057, title: 'Temporary Mute' }),
	[ModerationTypeKeys.TemporaryVoiceMute]: Object.freeze({ color: 0xFF4081, title: 'Temporary Voice Mute' })
});

export interface ModerationTypeAssets {
	color: number;
	title: string;
}

export enum ModerationActions {
	Appealed = ACTION_APPEALED,
	Temporary = ACTION_TEMPORARY
}

export enum ModerationErrors {
	CaseAppealed = 'CASE_APPEALED',
	CaseNotExists = 'CASE_NOT_EXISTS',
	CaseTypeNotAppeal = 'CASE_TYPE_NOT_APPEAL'
}

export enum ModerationSchemaKeys {
	Case = 'caseID',
	CreatedAt = 'createdAt',
	Duration = 'duration',
	ExtraData = 'extraData',
	Guild = 'guildID',
	Moderator = 'moderatorID',
	Reason = 'reason',
	Type = 'type',
	User = 'userID'
}

export const clientOptions: KlasaClientOptions = {
	nms: {
		everyone: 5,
		role: 2
	}
};
