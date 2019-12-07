import { Channel, TextChannel } from 'discord.js';
import { Argument, KlasaMessage, Possible } from 'klasa';
import { validateChannelAccess } from '../lib/util/util';

const CHANNEL_REGEXP = Argument.regex.channel;

export default class extends Argument {

	public run(arg: string, possible: Possible, message: KlasaMessage) {
		const channel = CHANNEL_REGEXP.test(arg) ? message.guild!.channels.get(arg) : null;
		if (channel) return this.validateAccess(channel, message);

		throw message.language.tget('RESOLVER_INVALID_CHANNEL', possible.name);
	}

	private validateAccess(channel: Channel, message: KlasaMessage) {
		if (channel instanceof TextChannel && validateChannelAccess(channel, message.author) && validateChannelAccess(channel, this.client.user!)) {
			return channel;
		}

		throw message.language.tget('SYSTEM_CANNOT_ACCESS_CHANNEL');
	}

}
