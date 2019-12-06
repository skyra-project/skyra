import { Channel, Permissions, TextChannel } from 'discord.js';
import { Argument, KlasaMessage, Possible } from 'klasa';

const CHANNEL_REGEXP = /^(?:<#)?(\d{17,19})>?$/;
const USER_REGEXP = /^(?:<@!?)?(\d{17,19})>?$/;

export default class extends Argument {

	public async run(arg: string, possible: Possible, message: KlasaMessage) {
		// Regular Channel support
		const channel = CHANNEL_REGEXP.test(arg) ? await this.client.channels.fetch(CHANNEL_REGEXP.exec(arg)![1]).catch(() => null) : null;
		if (channel) return this.validateAccess(channel, message);

		// DM Channel support
		const user = USER_REGEXP.test(arg) ? await this.client.users.fetch(USER_REGEXP.exec(arg)![1]).catch(() => null) : null;
		if (user) return user.createDM();
		throw message.language.tget('RESOLVER_INVALID_CHANNEL', possible.name);
	}

	private validateAccess(channel: Channel, message: KlasaMessage) {
		if (channel instanceof TextChannel && channel.permissionsFor(message.author)?.has(Permissions.FLAGS.VIEW_CHANNEL)) {
			return channel;
		}

		throw message.language.tget('SYSTEM_CANNOT_ACCESS_CHANNEL');
	}

}
