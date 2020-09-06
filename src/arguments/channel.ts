import { validateChannelAccess } from '@utils/util';
import { GuildChannel } from 'discord.js';
import { Argument, KlasaMessage, Possible } from 'klasa';

const CHANNEL_REGEXP = Argument.regex.channel;

export default class extends Argument {
	public run(arg: string, possible: Possible, message: KlasaMessage) {
		if (!message.guild) throw message.language.get('resolverChannelNotInGuild');

		const channelID = CHANNEL_REGEXP.exec(arg);
		const channel = channelID === null ? null : message.guild.channels.cache.get(channelID[1]);
		if (channel) return this.validateAccess(channel, message);

		throw message.language.get('resolverInvalidChannel', { name: possible.name });
	}

	private validateAccess(channel: GuildChannel, message: KlasaMessage) {
		if (validateChannelAccess(channel, message.author) && validateChannelAccess(channel, this.client.user!)) {
			return channel;
		}

		throw message.language.get('systemCannotAccessChannel');
	}
}
