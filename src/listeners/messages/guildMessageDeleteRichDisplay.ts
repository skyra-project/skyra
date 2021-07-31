import { SkyraLazyPaginatedMessage, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({ event: Events.GuildMessageDelete })
export class UserListener extends Listener {
	public run(message: GuildMessage) {
		SkyraPaginatedMessage.messages.get(message.id)?.collector?.stop();
		SkyraLazyPaginatedMessage.messages.get(message.id)?.collector?.stop();
	}
}
