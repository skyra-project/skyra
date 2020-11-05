import { GuildMessage } from '@lib/types';
import { Events } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { TextChannel } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.GuildMessageUpdate })
export default class extends Event {
	public run(message: GuildMessage) {
		if (message.channel instanceof TextChannel) message.channel.sniped = message;
	}
}
