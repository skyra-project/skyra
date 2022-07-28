import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { setSnipedMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({ event: Events.GuildMessageDelete })
export class UserListener extends Listener {
	public run(message: GuildMessage) {
		setSnipedMessage(message.channel, message);
	}
}
