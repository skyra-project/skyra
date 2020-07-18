import { isObject } from '@klasa/utils';
import { StickyRole } from '@lib/types/settings/GuildSettings';
import { Guild } from 'discord.js';
import { Serializer, SerializerUpdateContext } from 'klasa';

export default class extends Serializer {

	public validate(data: StickyRole, { language, guild }: SerializerUpdateContext) {
		if (isObject(data)
			&& Object.keys(data).length === 2
			&& typeof data.user === 'string'
			&& Array.isArray(data.roles)
			&& data.roles.every(role => typeof role === 'string')) {

			// TODO: Resolve this to a better solution (i.e. using `guild.roles.sticky.add`)
			// see https://discordapp.com/channels/541738403230777351/541740581832097792/734011404750684220
			Reflect.set(data, 'roles', [...new Set(data.roles)].filter((r => guild!.roles.has(r))));
			return data;

		}

		throw language.tget('SERIALIZER_STICKY_ROLE_INVALID');
	}

	public stringify(value: StickyRole, guild: Guild) {
		const username = this.client.userTags.get(value.user)?.username ?? guild.language.tget('UNKNOWN_USER');
		const roles = value.roles.map(role => guild.roles.get(role)?.name ?? guild.language.tget('UNKNOWN_ROLE'));
		return `[${username} -> ${roles}]`;
	}

}
