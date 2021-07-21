import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { setSnipedMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';

@ApplyOptions<EventOptions>({ event: Events.GuildMessageDelete })
export class UserEvent extends Event {
	public run(message: GuildMessage) {
		setSnipedMessage(message.channel, message);
	}
}
