/* eslint-disable @typescript-eslint/no-namespace */
import { KlasaClientOptions } from 'klasa';
import { join } from 'path';
import { DEV } from '../../../config';

export const rootFolder = join(__dirname, '..', '..', '..', '..');
export const assetsFolder = join(rootFolder, 'assets');
export const cdnFolder = DEV ? join(assetsFolder, 'public') : join('/var', 'www', 'assets');

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
	GREENTICK: '<:greenTick:637706251253317669>',
	LOADING: '<a:SkyraLoading:497584859045429250>',
	REDCROSS: '<:redCross:637706251257511973>',
	SHINY: '<:shiny:612364146792726539>'
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

export namespace Moderation {

	/* eslint-disable no-multi-spaces */
	const BAN                   = 0b0000000;
	const KICK                  = 0b0000001;
	const MUTE                  = 0b0000010;
	const PRUNE                 = 0b0000011;
	const SOFT_BAN              = 0b0000100;
	const VOICE_KICK            = 0b0000101;
	const VOICE_MUTE            = 0b0000110;
	const WARN                  = 0b0000111;
	const RESTRICTED_REACTION   = 0b0001000;
	const RESTRICTED_EMBED      = 0b0001001;
	const RESTRICTED_ATTACHMENT = 0b0001010;
	const RESTRICTED_VOICE      = 0b0001011;

	const ACTION_APPEALED       = 0b0010000;
	const ACTION_TEMPORARY      = 0b0100000;
	const ACTION_FAST           = 0b0110000;
	const ACTION_INVALIDATED    = 0b1000000;

	export enum TypeBits {
		Variation = 0b0001111,
		Metadata  = 0b1110000
	}

	export enum TypeCodes {
		Warn                           = WARN,
		Mute                           = MUTE,
		Kick                           = KICK,
		Softban                        = SOFT_BAN,
		Ban                            = BAN,
		VoiceMute                      = VOICE_MUTE,
		VoiceKick                      = VOICE_KICK,
		RestrictionReaction            = RESTRICTED_REACTION,
		RestrictionEmbed               = RESTRICTED_EMBED,
		RestrictionAttachment          = RESTRICTED_ATTACHMENT,
		RestrictionVoice               = RESTRICTED_VOICE,
		UnWarn                         = WARN                  | ACTION_APPEALED,
		UnMute                         = MUTE                  | ACTION_APPEALED,
		UnBan                          = BAN                   | ACTION_APPEALED,
		UnVoiceMute                    = VOICE_MUTE            | ACTION_APPEALED,
		UnRestrictionReaction          = RESTRICTED_REACTION   | ACTION_APPEALED,
		UnRestrictionEmbed             = RESTRICTED_EMBED      | ACTION_APPEALED,
		UnRestrictionAttachment        = RESTRICTED_ATTACHMENT | ACTION_APPEALED,
		UnRestrictionVoice             = RESTRICTED_VOICE      | ACTION_APPEALED,
		TemporaryMute                  = MUTE                  | ACTION_TEMPORARY,
		TemporaryBan                   = BAN                   | ACTION_TEMPORARY,
		TemporaryVoiceMute             = VOICE_MUTE            | ACTION_TEMPORARY,
		TemporaryRestrictionReaction   = RESTRICTED_REACTION   | ACTION_TEMPORARY,
		TemporaryRestrictionEmbed      = RESTRICTED_EMBED      | ACTION_TEMPORARY,
		TemporaryRestrictionAttachment = RESTRICTED_ATTACHMENT | ACTION_TEMPORARY,
		TemporaryRestrictionVoice      = RESTRICTED_VOICE      | ACTION_TEMPORARY,
		Prune                          = PRUNE
	}
	/* eslint-enable no-multi-spaces */

	export enum TypeMetadata {
		Appealed = ACTION_APPEALED,
		Temporary = ACTION_TEMPORARY,
		Fast = ACTION_FAST,
		Invalidated = ACTION_INVALIDATED
	}

	export const metadata = new Map<TypeCodes, ModerationTypeAssets>([
		[TypeCodes.Warn, { color: 0xFFEB3B, title: 'Warning' }],
		[TypeCodes.Mute, { color: 0xFFC107, title: 'Mute' }],
		[TypeCodes.Kick, { color: 0xFF9800, title: 'Kick' }],
		[TypeCodes.Softban, { color: 0xFF5722, title: 'Softban' }],
		[TypeCodes.Ban, { color: 0xF44336, title: 'Ban' }],
		[TypeCodes.VoiceMute, { color: 0xFFC107, title: 'Voice Mute' }],
		[TypeCodes.VoiceKick, { color: 0xFF9800, title: 'Voice Kick' }],
		[TypeCodes.RestrictionReaction, { color: 0xCDDC39, title: 'Reaction Restriction' }],
		[TypeCodes.RestrictionEmbed, { color: 0xCDDC39, title: 'Embed Restriction' }],
		[TypeCodes.RestrictionAttachment, { color: 0xCDDC39, title: 'Attachment Restriction' }],
		[TypeCodes.RestrictionVoice, { color: 0xCDDC39, title: 'Voice Restriction' }],
		[TypeCodes.UnWarn, { color: 0xE57373, title: 'Reverted Warning' }],
		[TypeCodes.UnMute, { color: 0x03A9F4, title: 'Reverted Mute' }],
		[TypeCodes.UnBan, { color: 0x03A9F4, title: 'Reverted Ban' }],
		[TypeCodes.UnVoiceMute, { color: 0x03A9F4, title: 'Reverted Voice Mute' }],
		[TypeCodes.UnRestrictionReaction, { color: 0x03A9F4, title: 'Reverted Reaction Restriction' }],
		[TypeCodes.UnRestrictionEmbed, { color: 0x03A9F4, title: 'Reverted Embed Restriction' }],
		[TypeCodes.UnRestrictionAttachment, { color: 0x03A9F4, title: 'Reverted Attachment Restriction' }],
		[TypeCodes.UnRestrictionVoice, { color: 0x03A9F4, title: 'Reverted Voice Restriction' }],
		[TypeCodes.TemporaryMute, { color: 0xFFD54F, title: 'Temporary Mute' }],
		[TypeCodes.TemporaryBan, { color: 0xE57373, title: 'Temporary Ban' }],
		[TypeCodes.TemporaryVoiceMute, { color: 0xFFD54F, title: 'Temporary Voice Mute' }],
		[TypeCodes.TemporaryRestrictionReaction, { color: 0xDCE775, title: 'Temporary Reaction Restriction' }],
		[TypeCodes.TemporaryRestrictionEmbed, { color: 0xDCE775, title: 'Temporary Embed Restriction' }],
		[TypeCodes.TemporaryRestrictionAttachment, { color: 0xDCE775, title: 'Temporary Attachment Restriction' }],
		[TypeCodes.TemporaryRestrictionVoice, { color: 0xDCE775, title: 'Temporary Voice Restriction' }],
		[TypeCodes.Prune, { color: 0x000000, title: 'Prune' }]
	]) as ReadonlyMap<TypeCodes, ModerationTypeAssets>;

	export enum CommandErrors {
		CaseAppealed = 'CASE_APPEALED',
		CaseNotExists = 'CASE_NOT_EXISTS',
		CaseTypeNotAppeal = 'CASE_TYPE_NOT_APPEAL'
	}

	export enum SchemaKeys {
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

	interface ModerationTypeAssets {
		color: number;
		title: string;
	}

}

export const clientOptions: KlasaClientOptions = {
	nms: {
		everyone: 5,
		role: 2
	}
};

export enum BrandingColors {
	Primary = 0x5C71BD,
	Secondary = 0xFF9D01
}
