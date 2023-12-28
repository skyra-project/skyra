import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { SkyraArgs } from '#lib/structures';
import { DecoratorIdentifiers } from '@sapphire/decorators';
import { Identifiers, container } from '@sapphire/framework';
import type { InternationalizationContext, TFunction } from '@sapphire/plugin-i18next';
import type { Nullish } from '@sapphire/utilities';
import type { LocaleString } from 'discord.js';

export function translate(identifier: string): string {
	switch (identifier) {
		case Identifiers.ArgsUnavailable:
			return LanguageKeys.Arguments.Unavailable;
		case Identifiers.ArgsMissing:
			return LanguageKeys.Arguments.Missing;
		case Identifiers.ArgumentBooleanError:
		case Identifiers.ArgumentChannelError:
		case Identifiers.ArgumentDateError:
		case Identifiers.ArgumentDateTooEarly:
		case Identifiers.ArgumentDateTooFar:
		case Identifiers.ArgumentDMChannelError:
		case Identifiers.ArgumentEmojiError:
		case Identifiers.ArgumentFloatError:
		case Identifiers.ArgumentFloatTooLarge:
		case Identifiers.ArgumentFloatTooSmall:
		case Identifiers.ArgumentGuildError:
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
		case Identifiers.ArgumentEnumEmptyError:
		case Identifiers.ArgumentEnumError:
			return `arguments:${identifier}`;

		case Identifiers.CommandDisabled:
			return LanguageKeys.Preconditions.DisabledGlobal;
		case Identifiers.PreconditionCooldown:
			return LanguageKeys.Preconditions.Cooldown;

		case Identifiers.PreconditionNSFW:
			return LanguageKeys.Preconditions.Nsfw;
		case Identifiers.PreconditionClientPermissions:
		case DecoratorIdentifiers.RequiresClientPermissionsMissingPermissions:
			return LanguageKeys.Preconditions.ClientPermissions;
		case Identifiers.PreconditionClientPermissionsNoClient:
			return LanguageKeys.Preconditions.ClientPermissionsNoClient;
		case Identifiers.PreconditionClientPermissionsNoPermissions:
			return LanguageKeys.Preconditions.ClientPermissionsNoPermissions;
		case Identifiers.PreconditionRunIn:
			return LanguageKeys.Preconditions.RunIn;
		case Identifiers.PreconditionUserPermissions:
		case DecoratorIdentifiers.RequiresUserPermissionsMissingPermissions:
			return LanguageKeys.Preconditions.UserPermissions;
		case Identifiers.PreconditionUserPermissionsNoPermissions:
			return LanguageKeys.Preconditions.UserPermissionsNoPermissions;
		case Identifiers.PreconditionUnavailable:
			return LanguageKeys.Preconditions.Unavailable;
		case Identifiers.PreconditionMissingMessageHandler:
			return LanguageKeys.Preconditions.MissingMessageHandler;
		case Identifiers.PreconditionMissingChatInputHandler:
			return LanguageKeys.Preconditions.MissingChatInputHandler;
		case Identifiers.PreconditionMissingContextMenuHandler:
			return LanguageKeys.Preconditions.MissingContextMenuHandler;
		case DecoratorIdentifiers.RequiresClientPermissionsGuildOnly:
		case DecoratorIdentifiers.RequiresUserPermissionsGuildOnly:
			return LanguageKeys.Preconditions.GuildOnly;

		// Sapphire (deprecated)
		case Identifiers.PreconditionDMOnly:
			return LanguageKeys.Preconditions.DmOnly;
		case Identifiers.PreconditionGuildNewsOnly:
			return LanguageKeys.Preconditions.GuildNewsOnly;
		case Identifiers.PreconditionGuildNewsThreadOnly:
			return LanguageKeys.Preconditions.GuildNewsThreadOnly;
		case Identifiers.PreconditionGuildOnly:
			return LanguageKeys.Preconditions.GuildOnly;
		case Identifiers.PreconditionGuildPrivateThreadOnly:
			return LanguageKeys.Preconditions.GuildPrivateThreadOnly;
		case Identifiers.PreconditionGuildPublicThreadOnly:
			return LanguageKeys.Preconditions.GuildPublicThreadOnly;
		case Identifiers.PreconditionGuildTextOnly:
			return LanguageKeys.Preconditions.GuildTextOnly;
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

/**
 * Returns a translation function for the specified locale, or the default 'en-US' if none is provided.
 * @param locale The locale to get the translation function for.
 * @returns The translation function for the specified locale.
 */
export function getT(locale?: LocaleString | Nullish) {
	return container.i18n.getT(locale ?? 'en-US');
}

/**
 * Fetches the language for the given {@link InternationalizationContext}.
 * If the language cannot be fetched, defaults to 'en-US'.
 * @param context The InternationalizationContext to fetch the language for.
 * @returns The fetched language as a {@link LocaleString}.
 */
export async function fetchLanguage(context: InternationalizationContext) {
	return (await container.i18n.fetchLanguage(context))! as LocaleString;
}

/**
 * Fetches the translation function for the given context.
 * @param context The internationalization context.
 * @returns The translation function.
 */
export async function fetchT(context: InternationalizationContext) {
	return getT(await fetchLanguage(context));
}
