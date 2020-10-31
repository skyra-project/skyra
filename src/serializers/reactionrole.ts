import { ReactionRole, Serializer, SerializerUpdateContext } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Awaited, isObject } from '@sapphire/utilities';
import { displayEmoji } from '@utils/util';

export default class UserSerializer extends Serializer<ReactionRole> {
	public parse(): Awaited<ReactionRole> {
		// TODO (kyranet): implement this
		throw new Error('Method not implemented.');
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
