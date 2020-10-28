import { DisabledCommandChannel, Serializer, SerializerUpdateContext } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { isObject } from '@sapphire/utilities';
import { Guild } from 'discord.js';

export default class extends Serializer<DisabledCommandChannel> {
	public parse(value: string, context: SerializerUpdateContext): DisabledCommandChannel | Promise<DisabledCommandChannel> {
		throw new Error('Method not implemented.');
	}

	public isValid(value: DisabledCommandChannel, context: SerializerUpdateContext): boolean {
		throw new Error('Method not implemented.');
	}

	public validate(data: DisabledCommandChannel, { language }: SerializerUpdateContext) {
		if (
			isObject(data) &&
			Object.keys(data).length === 2 &&
			typeof data.channel === 'string' &&
			Array.isArray(data.commands) &&
			data.commands.every((cmd) => typeof cmd === 'string')
		)
			return data;

		throw language.get(LanguageKeys.Serializers.DisabledCommandChannelInvalid);
	}

	public stringify(value: DisabledCommandChannel, guild: Guild) {
		return `[${guild.channels.cache.get(value.channel)?.name ?? guild.language.get(LanguageKeys.Misc.UnknownChannel)} -> ${value.commands.join(
			' | '
		)}]`;
	}
}
