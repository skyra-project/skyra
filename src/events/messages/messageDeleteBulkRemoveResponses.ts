import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { Collection, Message, Snowflake } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.MessageDeleteBulk })
export default class extends Event {
	public async run(messages: Collection<Snowflake, Message>) {
		for (const message of messages.values()) {
			for (const response of message.responses) {
				await response.nuke();
			}
		}
	}
}
