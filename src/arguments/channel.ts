import { LanguageKeys } from '#lib/i18n/languageKeys';
import { validateChannelAccess } from '#utils/util';
import { GuildChannel, Message } from 'discord.js';
import { Argument, Possible } from 'klasa';

const CHANNEL_REGEXP = Argument.regex.channel;

export default class extends Argument {
	public async run(arg: string, possible: Possible, message: Message) {
		if (!message.guild) throw await message.resolveKey(LanguageKeys.Resolvers.ChannelNotInGuild);

		const channelID = CHANNEL_REGEXP.exec(arg);
		const channel = channelID === null ? null : message.guild.channels.cache.get(channelID[1]);
		if (channel) return this.validateAccess(channel, message);

		throw await message.resolveKey(LanguageKeys.Resolvers.InvalidChannel, { name: possible.name });
	}

	private async validateAccess(channel: GuildChannel, message: Message) {
		if (validateChannelAccess(channel, message.author) && validateChannelAccess(channel, this.client.user!)) {
			return channel;
		}

		throw await message.resolveKey(LanguageKeys.System.CannotAccessChannel);
	}
}
