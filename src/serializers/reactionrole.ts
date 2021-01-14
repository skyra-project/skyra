import { ReactionRole, Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { displayEmoji } from '#utils/util';
import { Awaited, isObject } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<ReactionRole> {
	public parse(_: string, { t }: SerializerUpdateContext) {
		return this.error(t(LanguageKeys.Serializers.Unsupported));
	}

	public isValid(value: ReactionRole, { t }: SerializerUpdateContext): Awaited<boolean> {
		if (
			isObject(value) &&
			Object.keys(value).length === 4 &&
			typeof value.emoji === 'string' &&
			(typeof value.message === 'string' || value.message === null) &&
			typeof value.channel === 'string' &&
			typeof value.role === 'string'
		)
			return true;

		throw t(LanguageKeys.Serializers.ReactionRoleInvalid);
	}

	public stringify(value: ReactionRole, { t, guild }: SerializerUpdateContext) {
		const emoji = displayEmoji(value.emoji);
		const role = guild.roles.cache.get(value.role)?.name ?? t(LanguageKeys.Misc.UnknownRole);
		const url = `https://discord.com/channels/${guild.id}/${value.channel}/${value.message}`;
		return `${emoji} | ${url} -> ${role}`;
	}
}
