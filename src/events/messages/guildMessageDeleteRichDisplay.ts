import { UserRichDisplay } from '#lib/structures/UserRichDisplay';
import { Events } from '#lib/types/Enums';
import { GuildMessage } from '#lib/types/index';
import { ApplyOptions } from '@skyra/decorators';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.GuildMessageDelete })
export default class extends Event {
	public run(message: GuildMessage) {
		UserRichDisplay.messages.get(message.id)?.stop();
	}
}
