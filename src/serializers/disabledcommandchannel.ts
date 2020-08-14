import { isObject } from '@klasa/utils';
import type { DisabledCommandChannel } from '@lib/types/settings/GuildSettings';
import { Guild } from 'discord.js';
import { Serializer, SerializerUpdateContext } from 'klasa';

export default class extends Serializer {
	public validate(data: DisabledCommandChannel, { language }: SerializerUpdateContext) {
		if (
			isObject(data) &&
			Object.keys(data).length === 2 &&
			typeof data.channel === 'string' &&
			Array.isArray(data.commands) &&
			data.commands.every((cmd) => typeof cmd === 'string')
		)
			return data;

		throw language.tget('SERIALIZER_DISABLED_COMMAND_CHANNEL_INVALID');
	}

	public stringify(value: DisabledCommandChannel, guild: Guild) {
		return `[${guild.channels.get(value.channel)?.name ?? guild.language.tget('UNKNOWN_CHANNEL')} -> ${value.commands.join(' | ')}]`;
	}
}
