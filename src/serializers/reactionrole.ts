import { ReactionRole, Serializer, SerializerUpdateContext } from '#lib/database/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { displayEmoji } from '#utils/util';
import { Awaited, isObject } from '@sapphire/utilities';

export default class UserSerializer extends Serializer<ReactionRole> {
	public parse(_: string, context: SerializerUpdateContext) {
		return this.error(context.language.get(LanguageKeys.Serializers.Unsupported));
	}

	public isValid(value: ReactionRole, context: SerializerUpdateContext): Awaited<boolean> {
		if (
			isObject(value) &&
			Object.keys(value).length === 4 &&
			typeof value.emoji === 'string' &&
			(typeof value.message === 'string' || value.message === null) &&
			typeof value.channel === 'string' &&
			typeof value.role === 'string'
		)
			return true;

		throw context.language.get(LanguageKeys.Serializers.ReactionRoleInvalid);
	}

	public stringify(value: ReactionRole, { language, entity: { guild } }: SerializerUpdateContext) {
		const emoji = displayEmoji(value.emoji);
		const role = guild.roles.cache.get(value.role)?.name ?? language.get(LanguageKeys.Misc.UnknownRole);
		const url = `https://discord.com/channels/${guild.id}/${value.channel}/${value.message}`;
		return `${emoji} | ${url} -> ${role}`;
	}
}
