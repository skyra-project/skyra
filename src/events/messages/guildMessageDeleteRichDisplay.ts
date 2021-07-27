import { SkyraLazyPaginatedMessage, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';

@ApplyOptions<EventOptions>({ event: Events.GuildMessageDelete })
export class UserEvent extends Event {
	public run(message: GuildMessage) {
		SkyraPaginatedMessage.messages.get(message.id)?.collector?.stop();
		SkyraLazyPaginatedMessage.messages.get(message.id)?.collector?.stop();
	}
}
