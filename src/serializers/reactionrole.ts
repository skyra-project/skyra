import { isObject } from '@klasa/utils';
import type { ReactionRole } from '@lib/types/settings/GuildSettings';
import { displayEmoji } from '@utils/util';
import { Guild } from 'discord.js';
import { Serializer, SerializerUpdateContext } from 'klasa';

export default class extends Serializer {

	public validate(data: ReactionRole, { language }: SerializerUpdateContext) {
		if (isObject(data)
			&& Object.keys(data).length === 4
			&& typeof data.emoji === 'string'
			&& (typeof data.message === 'string' || data.message === null)
			&& typeof data.channel === 'string'
			&& typeof data.role === 'string') return data;

		throw language.tget('SERIALIZER_REACTION_ROLE_INVALID');
	}

	public stringify(value: ReactionRole, guild: Guild) {
		const emoji = displayEmoji(value.emoji);
		const role = guild.roles.get(value.role)?.name ?? guild.language.tget('UNKNOWN_ROLE');
		const url = `https://discord.com/channels/${guild.id}/${value.channel}/${value.message}`;
		return `${emoji} | ${url} -> ${role}`;
	}

}
