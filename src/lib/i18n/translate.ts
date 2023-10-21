import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { SkyraArgs } from '#lib/structures';
import { DecoratorIdentifiers } from '@sapphire/decorators';
import { Identifiers } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';

export function translate(identifier: string): string {
	switch (identifier) {
		case Identifiers.ArgumentBooleanError:
		case Identifiers.ArgumentChannelError:
		case Identifiers.ArgumentDateError:
		case Identifiers.ArgumentDateTooEarly:
		case Identifiers.ArgumentDateTooFar:
		case Identifiers.ArgumentDMChannelError:
		case Identifiers.ArgumentFloatError:
		case Identifiers.ArgumentFloatTooLarge:
		case Identifiers.ArgumentFloatTooSmall:
		case Identifiers.ArgumentGuildCategoryChannelError:
		case Identifiers.ArgumentGuildChannelError:
		case Identifiers.ArgumentGuildChannelMissingGuildError:
		case Identifiers.ArgumentGuildNewsChannelError:
		case Identifiers.ArgumentGuildNewsThreadChannelError:
		case Identifiers.ArgumentGuildPrivateThreadChannelError:
		case Identifiers.ArgumentGuildPublicThreadChannelError:
		case Identifiers.ArgumentGuildStageVoiceChannelError:
		case Identifiers.ArgumentGuildTextChannelError:
		case Identifiers.ArgumentGuildThreadChannelError:
		case Identifiers.ArgumentGuildVoiceChannelError:
		case Identifiers.ArgumentHyperlinkError:
		case Identifiers.ArgumentIntegerError:
		case Identifiers.ArgumentIntegerTooLarge:
		case Identifiers.ArgumentIntegerTooSmall:
		case Identifiers.ArgumentMemberError:
		case Identifiers.ArgumentMemberMissingGuild:
		case Identifiers.ArgumentMessageError:
		case Identifiers.ArgumentNumberError:
		case Identifiers.ArgumentNumberTooLarge:
		case Identifiers.ArgumentNumberTooSmall:
		case Identifiers.ArgumentRoleError:
		case Identifiers.ArgumentRoleMissingGuild:
		case Identifiers.ArgumentStringTooLong:
		case Identifiers.ArgumentStringTooShort:
		case Identifiers.ArgumentUserError:
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
			return LanguageKeys.Preconditions.DmOnly;
		case Identifiers.PreconditionGuildNewsOnly:
			return LanguageKeys.Preconditions.GuildNewsOnly;
		case Identifiers.PreconditionGuildNewsThreadOnly:
			return LanguageKeys.Preconditions.GuildNewsThreadOnly;
		case Identifiers.PreconditionGuildOnly:
		case DecoratorIdentifiers.RequiresClientPermissionsGuildOnly:
		case DecoratorIdentifiers.RequiresUserPermissionsGuildOnly:
			return LanguageKeys.Preconditions.GuildOnly;
		case Identifiers.PreconditionGuildPrivateThreadOnly:
			return LanguageKeys.Preconditions.GuildPrivateThreadOnly;
		case Identifiers.PreconditionGuildPublicThreadOnly:
			return LanguageKeys.Preconditions.GuildPublicThreadOnly;
		case Identifiers.PreconditionGuildTextOnly:
			return LanguageKeys.Preconditions.GuildTextOnly;
		case Identifiers.PreconditionNSFW:
			return LanguageKeys.Preconditions.Nsfw;
		case Identifiers.PreconditionClientPermissions:
		case DecoratorIdentifiers.RequiresClientPermissionsMissingPermissions:
			return LanguageKeys.Preconditions.ClientPermissions;
		case Identifiers.PreconditionUserPermissions:
		case DecoratorIdentifiers.RequiresUserPermissionsMissingPermissions:
			return LanguageKeys.Preconditions.UserPermissions;
		case Identifiers.PreconditionThreadOnly:
			return LanguageKeys.Preconditions.ThreadOnly;
		default:
			return identifier;
	}
}

export type TResolvable = SkyraArgs | TFunction;

export function resolveT(t: TResolvable): TFunction {
	return typeof t === 'function' ? t : t.t;
}
