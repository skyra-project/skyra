import { SkyraLazyPaginatedMessage, SkyraPaginatedMessage } from '#lib/structures';
import { Events, type GuildMessage } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ event: Events.GuildMessageDelete })
export class UserListener extends Listener {
	public run(message: GuildMessage) {
		SkyraPaginatedMessage.messages.get(message.id)?.collector?.stop();
		SkyraLazyPaginatedMessage.messages.get(message.id)?.collector?.stop();
	}
}
