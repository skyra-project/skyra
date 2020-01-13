import { APIUserData } from '@lib/types/DiscordAPI';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '@utils/constants';
import { getDisplayAvatar } from '@utils/util';
import { MessageEmbed } from 'discord.js';
import { Event, EventStore } from 'klasa';
import { Colors } from '@lib/types/constants/Constants';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'USER_UPDATE', emitter: store.client.ws });
	}

	public run(data: APIUserData) {
		const user = this.client.users.get(data.id);
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2339
		if (user) user._patch(data);

		this.handleUsernameChange(data);
	}

	private handleUsernameChange(data: APIUserData) {
		const previous = this.client.userTags.get(data.id);
		const next = this.client.userTags.create(data);

		if (typeof previous === 'undefined' || previous.username === next.username) return;

		for (const guild of this.client.guilds.values()) {
			if (!guild.memberTags.has(data.id)) continue;
			if (guild.settings.get(GuildSettings.Events.MemberNicknameUpdate)) {
				this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, guild, () => new MessageEmbed()
					.setColor(Colors.Yellow)
					.setAuthor(`${next.username}#${next.discriminator} (${data.id})`, getDisplayAvatar(data.id, next))
					.setDescription(guild.language.tget('EVENTS_NAME_DIFFERENCE', previous.username, next.username))
					.setFooter(guild.language.tget('EVENTS_NICKNAME_UPDATE'))
					.setTimestamp());
			}
		}

	}

}
