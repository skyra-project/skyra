import { Identifiers } from '@sapphire/framework';
import { LanguageKeys } from './languageKeys';

export function translate(identifier: string): string {
	switch (identifier) {
		case Identifiers.ArgumentBoolean:
		case Identifiers.ArgumentCategoryChannel:
		case Identifiers.ArgumentChannel:
		case Identifiers.ArgumentDate:
		case Identifiers.ArgumentDateTooSmall:
		case Identifiers.ArgumentDateTooBig:
		case Identifiers.ArgumentDMChannel:
		case Identifiers.ArgumentFloat:
		case Identifiers.ArgumentFloatTooSmall:
		case Identifiers.ArgumentFloatTooBig:
		case Identifiers.ArgumentGuildChannel:
		case Identifiers.ArgumentGuildChannelMissingGuild:
		case Identifiers.ArgumentHyperlink:
		case Identifiers.ArgumentInteger:
		case Identifiers.ArgumentIntegerTooSmall:
		case Identifiers.ArgumentIntegerTooBig:
		case Identifiers.ArgumentMember:
		case Identifiers.ArgumentMemberMissingGuild:
		case Identifiers.ArgumentMessage:
		case Identifiers.ArgumentNewsChannel:
		case Identifiers.ArgumentNumber:
		case Identifiers.ArgumentNumberTooSmall:
		case Identifiers.ArgumentNumberTooBig:
		case Identifiers.ArgumentRole:
		case Identifiers.ArgumentRoleMissingGuild:
		case Identifiers.ArgumentStringTooShort:
		case Identifiers.ArgumentStringTooLong:
		case Identifiers.ArgumentTextChannel:
		case Identifiers.ArgumentUser:
		case Identifiers.ArgumentVoiceChannel:
			return `arguments:${identifier}`;
		case Identifiers.ArgsUnavailable:
			return LanguageKeys.Arguments.Unavailable;
		case Identifiers.ArgsMissing:
			return LanguageKeys.Arguments.Missing;
		case Identifiers.CommandDisabled:
			return LanguageKeys.Preconditions.DisabledGlobal;
		case Identifiers.PreconditionCooldown:
			return LanguageKeys.Preconditions.Cooldown;
		case Identifiers.PreconditionDMOnly:
			return LanguageKeys.Preconditions.DMOnly;
		case Identifiers.PreconditionGuildOnly:
			return LanguageKeys.Preconditions.GuildOnly;
		case Identifiers.PreconditionNSFW:
			return LanguageKeys.Preconditions.NSFW;
		case Identifiers.PreconditionPermissions:
			return LanguageKeys.Preconditions.Permissions;
		default:
			return identifier;
	}
}
