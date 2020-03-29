/* eslint-disable @typescript-eslint/no-namespace */
import { Colors } from '@lib/types/constants/Constants';
import { DEV } from '@root/config';
import { KlasaClientOptions } from 'klasa';
import { join } from 'path';

export const rootFolder = join(__dirname, '..', '..', '..');
export const assetsFolder = join(rootFolder, 'assets');
export const socialFolder = join(assetsFolder, 'images', 'social');
export const cdnFolder = DEV ? join(assetsFolder, 'public') : join('/var', 'www', 'assets');

export const enum Time {
	Millisecond = 1,
	Second = 1000,
	Minute = 1000 * 60,
	Hour = 1000 * 60 * 60,
	Day = 1000 * 60 * 60 * 24,
	Year = 1000 * 60 * 60 * 24 * 365
}

export const enum Emojis {
	GreenTick = '<:greenTick:637706251253317669>',
	Loading = '<a:sloading:656988867403972629>',
	RedCross = '<:redCross:637706251257511973>',
	Shiny = '<:shiny:612364146792726539>'
}

export namespace ConnectFourConstants {

	export const enum Emojis {
		Empty = '<:Empty:352403997606412289>',
		PlayerOne = '<:PlayerONE:352403997300359169>',
		PlayerTwo = '<:PlayerTWO:352404081974968330>',
		WinnerOne = '<:PlayerONEWin:352403997761601547>',
		WinnerTwo = '<:PlayerTWOWin:352403997958602752>'
	}

	export const Reactions = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣'] as readonly string[];

}

export const enum MessageLogsEnum { Message, NSFWMessage, Image, Moderation, Member, Reaction }

export namespace Moderation {

	/* eslint-disable no-multi-spaces */
	export const enum TypeVariation {
		Ban                  = 0b00000000,
		Kick                 = 0b00000001,
		Mute                 = 0b00000010,
		Prune                = 0b00000011,
		Softban              = 0b00000100,
		VoiceKick            = 0b00000101,
		VoiceMute            = 0b00000110,
		Warning              = 0b00000111,
		RestrictedReaction   = 0b00001000,
		RestrictedEmbed      = 0b00001001,
		RestrictedAttachment = 0b00001010,
		RestrictedVoice      = 0b00001011,
		Nickname             = 0b00001100,
		AddRole              = 0b00001101,
		RemoveRole           = 0b00001110
	}

	export const enum TypeMetadata {
		Appeal               = 0b00010000,
		Temporary            = 0b00100000,
		Fast                 = 0b01000000,
		Invalidated          = 0b10000000
	}

	export const enum TypeBits {
		Variation            = 0b00001111,
		Metadata             = 0b11110000
	}

	export const enum TypeCodes {
		Warn                               = TypeVariation.Warning,
		Mute                               = TypeVariation.Mute,
		Kick                               = TypeVariation.Kick,
		Softban                            = TypeVariation.Softban,
		Ban                                = TypeVariation.Ban,
		VoiceMute                          = TypeVariation.VoiceMute,
		VoiceKick                          = TypeVariation.VoiceKick,
		RestrictionReaction                = TypeVariation.RestrictedReaction,
		RestrictionEmbed                   = TypeVariation.RestrictedEmbed,
		RestrictionAttachment              = TypeVariation.RestrictedAttachment,
		RestrictionVoice                   = TypeVariation.RestrictedVoice,
		UnWarn                             = TypeVariation.Warning              | TypeMetadata.Appeal,
		UnMute                             = TypeVariation.Mute                 | TypeMetadata.Appeal,
		UnBan                              = TypeVariation.Ban                  | TypeMetadata.Appeal,
		UnVoiceMute                        = TypeVariation.VoiceMute            | TypeMetadata.Appeal,
		UnRestrictionReaction              = TypeVariation.RestrictedReaction   | TypeMetadata.Appeal,
		UnRestrictionEmbed                 = TypeVariation.RestrictedEmbed      | TypeMetadata.Appeal,
		UnRestrictionAttachment            = TypeVariation.RestrictedAttachment | TypeMetadata.Appeal,
		UnRestrictionVoice                 = TypeVariation.RestrictedVoice      | TypeMetadata.Appeal,
		TemporaryWarning                   = TypeVariation.Warning              | TypeMetadata.Temporary,
		TemporaryMute                      = TypeVariation.Mute                 | TypeMetadata.Temporary,
		TemporaryBan                       = TypeVariation.Ban                  | TypeMetadata.Temporary,
		TemporaryVoiceMute                 = TypeVariation.VoiceMute            | TypeMetadata.Temporary,
		TemporaryRestrictionReaction       = TypeVariation.RestrictedReaction   | TypeMetadata.Temporary,
		TemporaryRestrictionEmbed          = TypeVariation.RestrictedEmbed      | TypeMetadata.Temporary,
		TemporaryRestrictionAttachment     = TypeVariation.RestrictedAttachment | TypeMetadata.Temporary,
		TemporaryRestrictionVoice          = TypeVariation.RestrictedVoice      | TypeMetadata.Temporary,
		FastTemporaryWarning               = TypeVariation.Warning              | TypeMetadata.Temporary | TypeMetadata.Fast,
		FastTemporaryMute                  = TypeVariation.Mute                 | TypeMetadata.Temporary | TypeMetadata.Fast,
		FastTemporaryBan                   = TypeVariation.Ban                  | TypeMetadata.Temporary | TypeMetadata.Fast,
		FastTemporaryVoiceMute             = TypeVariation.VoiceMute            | TypeMetadata.Temporary | TypeMetadata.Fast,
		FastTemporaryRestrictionReaction   = TypeVariation.RestrictedReaction   | TypeMetadata.Temporary | TypeMetadata.Fast,
		FastTemporaryRestrictionEmbed      = TypeVariation.RestrictedEmbed      | TypeMetadata.Temporary | TypeMetadata.Fast,
		FastTemporaryRestrictionAttachment = TypeVariation.RestrictedAttachment | TypeMetadata.Temporary | TypeMetadata.Fast,
		FastTemporaryRestrictionVoice      = TypeVariation.RestrictedVoice      | TypeMetadata.Temporary | TypeMetadata.Fast,
		Prune                              = TypeVariation.Prune,
		Nickname                           = TypeVariation.Nickname,
		AddRole                            = TypeVariation.AddRole,
		RemoveRole                         = TypeVariation.RemoveRole
	}
	/* eslint-enable no-multi-spaces */

	export const metadata = new Map<TypeCodes, ModerationTypeAssets>([
		[TypeCodes.Warn, { color: Colors.Yellow, title: 'Warning' }],
		[TypeCodes.Mute, { color: Colors.Amber, title: 'Mute' }],
		[TypeCodes.Kick, { color: Colors.Orange, title: 'Kick' }],
		[TypeCodes.Softban, { color: Colors.DeepOrange, title: 'Softban' }],
		[TypeCodes.Ban, { color: Colors.Red, title: 'Ban' }],
		[TypeCodes.VoiceMute, { color: Colors.Amber, title: 'Voice Mute' }],
		[TypeCodes.VoiceKick, { color: Colors.Orange, title: 'Voice Kick' }],
		[TypeCodes.RestrictionReaction, { color: Colors.Lime, title: 'Reaction Restriction' }],
		[TypeCodes.RestrictionEmbed, { color: Colors.Lime, title: 'Embed Restriction' }],
		[TypeCodes.RestrictionAttachment, { color: Colors.Lime, title: 'Attachment Restriction' }],
		[TypeCodes.RestrictionVoice, { color: Colors.Lime, title: 'Voice Restriction' }],
		[TypeCodes.UnWarn, { color: Colors.LightBlue, title: 'Reverted Warning' }],
		[TypeCodes.UnMute, { color: Colors.LightBlue, title: 'Reverted Mute' }],
		[TypeCodes.UnBan, { color: Colors.LightBlue, title: 'Reverted Ban' }],
		[TypeCodes.UnVoiceMute, { color: Colors.LightBlue, title: 'Reverted Voice Mute' }],
		[TypeCodes.UnRestrictionReaction, { color: Colors.LightBlue, title: 'Reverted Reaction Restriction' }],
		[TypeCodes.UnRestrictionEmbed, { color: Colors.LightBlue, title: 'Reverted Embed Restriction' }],
		[TypeCodes.UnRestrictionAttachment, { color: Colors.LightBlue, title: 'Reverted Attachment Restriction' }],
		[TypeCodes.UnRestrictionVoice, { color: Colors.LightBlue, title: 'Reverted Voice Restriction' }],
		[TypeCodes.TemporaryWarning, { color: Colors.Yellow300, title: 'Temporary Warning' }],
		[TypeCodes.TemporaryMute, { color: Colors.Amber300, title: 'Temporary Mute' }],
		[TypeCodes.TemporaryBan, { color: Colors.Red300, title: 'Temporary Ban' }],
		[TypeCodes.TemporaryVoiceMute, { color: Colors.Amber300, title: 'Temporary Voice Mute' }],
		[TypeCodes.TemporaryRestrictionReaction, { color: Colors.Lime300, title: 'Temporary Reaction Restriction' }],
		[TypeCodes.TemporaryRestrictionEmbed, { color: Colors.Lime300, title: 'Temporary Embed Restriction' }],
		[TypeCodes.TemporaryRestrictionAttachment, { color: Colors.Lime300, title: 'Temporary Attachment Restriction' }],
		[TypeCodes.TemporaryRestrictionVoice, { color: Colors.Lime300, title: 'Temporary Voice Restriction' }],
		[TypeCodes.FastTemporaryWarning, { color: Colors.Yellow300, title: 'Temporary Warning' }],
		[TypeCodes.FastTemporaryMute, { color: Colors.Amber300, title: 'Temporary Mute' }],
		[TypeCodes.FastTemporaryBan, { color: Colors.Red300, title: 'Temporary Ban' }],
		[TypeCodes.FastTemporaryVoiceMute, { color: Colors.Amber300, title: 'Temporary Voice Mute' }],
		[TypeCodes.FastTemporaryRestrictionReaction, { color: Colors.Lime300, title: 'Temporary Reaction Restriction' }],
		[TypeCodes.FastTemporaryRestrictionEmbed, { color: Colors.Lime300, title: 'Temporary Embed Restriction' }],
		[TypeCodes.FastTemporaryRestrictionAttachment, { color: Colors.Lime300, title: 'Temporary Attachment Restriction' }],
		[TypeCodes.FastTemporaryRestrictionVoice, { color: Colors.Lime300, title: 'Temporary Voice Restriction' }],
		[TypeCodes.Prune, { color: Colors.Brown, title: 'Prune' }],
		[TypeCodes.Nickname, { color: Colors.Lime, title: 'Set Nickname' }],
		[TypeCodes.AddRole, { color: Colors.Lime, title: 'Added Role' }],
		[TypeCodes.RemoveRole, { color: Colors.Lime, title: 'Removed Role' }]
	]) as ReadonlyMap<TypeCodes, ModerationTypeAssets>;

	export const enum TypeVariationAppealNames {
		Warning = 'moderationEndWarning',
		Mute = 'moderationEndMute',
		Ban = 'moderationEndBan',
		VoiceMute = 'moderationEndVoiceMute',
		RestrictedReaction = 'moderationEndRestrictionReaction',
		RestrictedEmbed = 'moderationEndRestrictionEmbed',
		RestrictedAttachment = 'moderationEndRestrictionAttachment',
		RestrictedVoice = 'moderationEndRestrictionVoice'
	}

	export const enum SchemaKeys {
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

	export interface ModerationTypeAssets {
		color: number;
		title: string;
	}

}

export namespace Mime {

	export const enum Types {
		ApplicationJson = 'application/json',
		ApplicationTwitchV5Json = 'application/vnd.twitchtv.v5+json',
		ApplicationFormUrlEncoded = 'application/x-www-form-urlencoded',
		TextPlain = 'text/plain'
	}

}

export const enum APIErrors {
	UnknownAccount = 10001,
	UnknownApplication = 10002,
	UnknownChannel = 10003,
	UnknownGuild = 10004,
	UnknownIntegration = 10005,
	UnknownInvite = 10006,
	UnknownMember = 10007,
	UnknownMessage = 10008,
	UnknownOverwrite = 10009,
	UnknownProvider = 10010,
	UnknownRole = 10011,
	UnknownToken = 10012,
	UnknownUser = 10013,
	UnknownEmoji = 10014,
	UnknownWebhook = 10015,
	UnknownBan = 10026,
	BotProhibitedEndpoint = 20001,
	BotOnlyEndpoint = 20002,
	MaximumGuilds = 30001,
	MaximumFriends = 30002,
	MaximumPins = 30003,
	MaximumRoles = 30005,
	MaximumReactions = 30010,
	MaximumChannels = 30013,
	MaximumInvites = 30016,
	Unauthorized = 40001,
	UserBanned = 40007,
	MissingAccess = 50001,
	InvalidAccountType = 50002,
	CannotExecuteOnDM = 50003,
	EmbedDisabled = 50004,
	CannotEditMessageByOther = 50005,
	CannotSendEmptyMessage = 50006,
	CannotMessageUser = 50007,
	CannotSendMessagesInVoiceChannel = 50008,
	ChannelVerificationLevelTooHigh = 50009,
	Oauth2ApplicationBotAbsent = 50010,
	MaximumOauth2Applications = 50011,
	InvalidOauthState = 50012,
	MissingPermissions = 50013,
	InvalidAuthenticationToken = 50014,
	NoteTooLong = 50015,
	InvalidBulkDeleteQuantity = 50016,
	CannotPinMessageInOtherChannel = 50019,
	InvalidOrTakenInviteCode = 50020,
	CannotExecuteOnSystemMessage = 50021,
	InvalidOauthToken = 50025,
	BulkDeleteMessageTooOld = 50034,
	InvalidFormBody = 50035,
	InviteAcceptedToGuildNotContainingBot = 50036,
	InvalidApiVersion = 50041,
	ReactionBlocked = 90001,
	ResourceOverloaded = 130000
}

export const clientOptions: KlasaClientOptions = {
	nms: {
		everyone: 5,
		role: 2
	}
};

export const enum BrandingColors {
	Primary = 0x5C71BD,
	Secondary = 0xFF9D01
}
