import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { validateChannelAccess } from '#utils/util';
import { GuildChannel } from 'discord.js';
import { Argument, KlasaMessage, Possible } from 'klasa';

const CHANNEL_REGEXP = Argument.regex.channel;

export default class extends Argument {
	public async run(arg: string, possible: Possible, message: KlasaMessage) {
		if (!message.guild) throw await message.fetchLocale(LanguageKeys.Resolvers.ChannelNotInGuild);

		const channelID = CHANNEL_REGEXP.exec(arg);
		const channel = channelID === null ? null : message.guild.channels.cache.get(channelID[1]);
		if (channel) return this.validateAccess(channel, message);

		throw await message.fetchLocale(LanguageKeys.Resolvers.InvalidChannel, { name: possible.name });
	}

	private async validateAccess(channel: GuildChannel, message: KlasaMessage) {
		if (validateChannelAccess(channel, message.author) && validateChannelAccess(channel, this.client.user!)) {
			return channel;
		}

		throw await message.fetchLocale(LanguageKeys.System.CannotAccessChannel);
	}
}
