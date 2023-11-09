import { Events, type GuildMessage } from '#lib/types';
import { setSnipedMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ event: Events.GuildMessageDelete })
export class UserListener extends Listener {
	public run(message: GuildMessage) {
		setSnipedMessage(message.channel, message);
	}
}
