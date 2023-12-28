import { Serializer, type ReactionRole } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { getEmojiTextFormat, isValidSerializedEmoji } from '#utils/functions';
import { isObject, type Awaitable } from '@sapphire/utilities';

export class UserSerializer extends Serializer<ReactionRole> {
	public parse(_: Serializer.Args, { t }: Serializer.UpdateContext) {
		return this.error(t(LanguageKeys.Serializers.Unsupported));
	}

	public isValid(value: ReactionRole, { t }: Serializer.UpdateContext): Awaitable<boolean> {
		if (
			isObject(value) &&
			Object.keys(value).length === 4 &&
			typeof value.emoji === 'string' &&
			isValidSerializedEmoji(value.emoji) &&
			(typeof value.message === 'string' || value.message === null) &&
			typeof value.channel === 'string' &&
			typeof value.role === 'string'
		)
			return true;

		throw t(LanguageKeys.Serializers.ReactionRoleInvalid);
	}

	public override stringify(value: ReactionRole, { t, guild }: Serializer.UpdateContext) {
		const emoji = getEmojiTextFormat(value.emoji);
		const role = guild.roles.cache.get(value.role)?.name ?? t(LanguageKeys.Serializers.UnknownRole);
		const url = `https://discord.com/channels/${guild.id}/${value.channel}/${value.message}`;
		return `${emoji} | ${url} -> ${role}`;
	}
}
