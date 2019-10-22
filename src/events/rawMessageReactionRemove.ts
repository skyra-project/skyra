import { TextChannel } from 'discord.js';
import { Event, EventOptions } from 'klasa';
import { WSMessageReactionRemove } from '../lib/types/DiscordAPI';
import { Events } from '../lib/types/Enums';
import { ApplyOptions } from '../lib/util/util';

@ApplyOptions<EventOptions>({
	name: 'MESSAGE_REACTION_REMOVE',
	emitter: 'ws'
})
export default class extends Event {

	public run(data: WSMessageReactionRemove) {
		const channel = this.client.channels.get(data.channel_id) as TextChannel;
		if (!channel || !channel.readable) return;
		this.client.emit(Events.RoleReactionRemove, channel, data);
	}

}
